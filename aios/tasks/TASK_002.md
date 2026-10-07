# TASK 002 — Opt-in Daily Reminders (Dot It v2)

**Status:** Implemented on feature/dot-it-v2; device verification pending
**Owner:** AI (Claude session) with Filippos review
**Reviewer:** Filippos
**Branch:** feature/dot-it-v2
**Last updated:** 2026-10-07

**Release interaction to verify:** A widget tap writes a dot without opening the app. The JavaScript reminder sync runs on app foreground, so a scheduled reminder may still fire after a widget tap until the app next opens. Resolve or explicitly redesign this interaction before release.

---

## Goal

Per-task opt-in daily reminder: one toggle and one time per task. At the chosen time, a single local notification fires with the task name ("MEDICINE?"). Tapping it opens the app.

## Context

The core use case is medication. A log you forget to open doesn't close the memory gap — the reminder is what makes the log complete. This is the highest-value addition for the app's stated purpose.

## Instructions

1. Read: `aios/STATE.md` first, then `aios/CANON.md`
2. Use expo-notifications, local scheduled notifications only — no push, no server
3. Add toggle + time picker inside the existing task edit form in TasksScreen — no new screens
4. Notification copy is the task name + "?" — nothing motivational, no emoji, no streak language
5. Request notification permission only when the user first enables a reminder, never on launch
6. If a dot for that task was already logged today, cancel that day's notification (the app should never nag about a done thing)

## Output

- Reminder fields on DotTask (`reminderEnabled`, `reminderTime`) — schema must read old JSON gracefully
- Scheduling logic in storage/tasks or a new `src/utils/notifications.ts`
- TasksScreen form: toggle + time row

## Constraints

- One notification per task per day, maximum
- No notification settings screen — everything lives in the task form
- No badges, no repeat nagging, no "you missed yesterday"
- Canon check: calm, not motivational

## Done When

- [x] Reminder can be enabled per task with a time
- [ ] Notification fires at the set time with correct task name
- [x] Logging a dot for the task before the set time suppresses that day's notification (code path; device test pending)
- [x] Permission requested lazily, denial handled silently (code path; device test pending)
- [ ] Tested on device
- [ ] Decision or change entry written in `aios/LOG.md`; `aios/STATE.md` regenerated at close
- [ ] Human review complete
