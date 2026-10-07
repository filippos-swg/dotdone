// Local daily reminders — one per task, opt-in, never about a done thing.
//
// Model: each reminder-enabled task normally holds ONE repeating daily trigger.
// When a dot for that task has already been made today and the time has not
// passed yet, the daily trigger is replaced by a short run of one-off triggers
// starting tomorrow, so today stays silent. Every sync recomputes this from
// storage, so the fallback run is refreshed whenever the app is opened or a dot
// is made or deleted. Nothing here is remote; nothing repeats within a day.

import * as Notifications from 'expo-notifications';
import { getAllTasks } from '../storage/tasks';
import { getAllEntries } from '../storage/entries';
import { todayString, addDays, parseDate } from './dateUtils';

export const DEFAULT_REMINDER_TIME = '08:00';

// iOS keeps at most 64 pending local notifications per app.
const IOS_PENDING_LIMIT = 64;
const FALLBACK_DAYS_MAX = 14;

// ─── Time helpers ─────────────────────────────────────────────────────────────

export function parseReminderTime(t?: string): { hour: number; minute: number } | null {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export function dateToReminderTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function reminderTimeToDate(t: string): Date {
  const parsed = parseReminderTime(t) ?? parseReminderTime(DEFAULT_REMINDER_TIME)!;
  const d = new Date();
  d.setHours(parsed.hour, parsed.minute, 0, 0);
  return d;
}

/** "08:00" → "08.00", matching the calendar's time convention. */
export function formatReminderTime(t?: string): string {
  const parsed = parseReminderTime(t) ?? parseReminderTime(DEFAULT_REMINDER_TIME)!;
  return `${String(parsed.hour).padStart(2, '0')}.${String(parsed.minute).padStart(2, '0')}`;
}

// ─── Permission ───────────────────────────────────────────────────────────────

/**
 * Asks for notification permission the first time it is needed.
 * Returns false on denial or error; callers stay silent about it.
 */
export async function requestReminderPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const result = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    return result.granted;
  } catch {
    return false;
  }
}

async function hasPermission(): Promise<boolean> {
  try {
    return (await Notifications.getPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

// ─── Sync ─────────────────────────────────────────────────────────────────────

type Desired = {
  title: string;
  taskId: string;
  trigger: Notifications.SchedulableNotificationTriggerInput;
};

function hhmm(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}${String(minute).padStart(2, '0')}`;
}

async function computeDesired(): Promise<Map<string, Desired>> {
  const desired = new Map<string, Desired>();
  const tasks = await getAllTasks();
  const enabled = tasks
    .map(t => ({ task: t, time: parseReminderTime(t.reminderTime) }))
    .filter(x => x.task.reminderEnabled === true && x.time !== null);
  if (enabled.length === 0) return desired;

  const entries = await getAllEntries();
  const today = todayString();
  const now = new Date();
  const fallbackDays = Math.max(
    1,
    Math.min(FALLBACK_DAYS_MAX, Math.floor((IOS_PENDING_LIMIT - 4) / enabled.length))
  );

  for (const { task, time } of enabled) {
    const { hour, minute } = time!;
    const title = `${task.name}?`;
    const timeToday = new Date();
    timeToday.setHours(hour, minute, 0, 0);
    const doneToday = entries.some(e => e.taskId === task.id && e.date === today);
    const suppressToday = doneToday && now.getTime() < timeToday.getTime();

    if (!suppressToday) {
      desired.set(`dd-${task.id}-daily-${hhmm(hour, minute)}`, {
        title,
        taskId: task.id,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
      });
      continue;
    }

    for (let d = 1; d <= fallbackDays; d++) {
      const dayStr = addDays(today, d);
      const date = parseDate(dayStr);
      date.setHours(hour, minute, 0, 0);
      desired.set(`dd-${task.id}-${dayStr}-${hhmm(hour, minute)}`, {
        title,
        taskId: task.id,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      });
    }
  }
  return desired;
}

async function reconcile(): Promise<void> {
  const desired = await computeDesired();

  if (desired.size === 0) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }
  if (!(await hasPermission())) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }

  const existing = await Notifications.getAllScheduledNotificationsAsync();
  const kept = new Set<string>();
  for (const n of existing) {
    const want = desired.get(n.identifier);
    if (want && n.content.title === want.title) {
      kept.add(n.identifier);
    } else {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  for (const [identifier, want] of desired) {
    if (kept.has(identifier)) continue;
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: { title: want.title, data: { taskId: want.taskId } },
      trigger: want.trigger,
    });
  }
}

let inFlight: Promise<void> | null = null;
let rerun = false;

/**
 * Brings scheduled notifications in line with storage. Safe to call often;
 * concurrent calls collapse into one follow-up run. Never throws.
 */
export function syncReminders(): Promise<void> {
  if (inFlight) {
    rerun = true;
    return inFlight;
  }
  inFlight = (async () => {
    do {
      rerun = false;
      try {
        await reconcile();
      } catch {
        // Reminders are best-effort; storage is the truth and must never be blocked.
      }
    } while (rerun);
  })().finally(() => {
    inFlight = null;
  });
  return inFlight;
}
