import * as FileSystem from 'expo-file-system/legacy';
import { DotEntry } from '../types';
import { getSharedEntries, writeSharedEntries } from './widgetShared';

const ENTRIES_FILE = FileSystem.documentDirectory + 'dotdone_entries.json';
const HINT_FILE = FileSystem.documentDirectory + 'dotdone_hint.json';

async function readJSON<T>(path: string, fallback: T): Promise<T> {
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return fallback;
    const raw = await FileSystem.readAsStringAsync(path);
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON(path: string, data: unknown): Promise<void> {
  await FileSystem.writeAsStringAsync(path, JSON.stringify(data));
}

async function readLegacyEntries(): Promise<DotEntry[]> {
  const info = await FileSystem.getInfoAsync(ENTRIES_FILE);
  if (!info.exists) return [];
  const value: unknown = JSON.parse(await FileSystem.readAsStringAsync(ENTRIES_FILE));
  if (!Array.isArray(value)) throw new Error('Existing dot history is not an array');
  return value as DotEntry[];
}

async function readEntriesUnlocked(): Promise<DotEntry[]> {
  return (await getSharedEntries<DotEntry>(readLegacyEntries)) ?? readLegacyEntries();
}

let pendingAccess: Promise<void> = Promise.resolve();

function synchronized<T>(operation: () => Promise<T>): Promise<T> {
  const result = pendingAccess.then(operation, operation);
  pendingAccess = result.then(() => undefined, () => undefined);
  return result;
}

export function getAllEntries(): Promise<DotEntry[]> {
  return synchronized(readEntriesUnlocked);
}

function mutateEntries(change: (entries: DotEntry[]) => DotEntry[]): Promise<void> {
  return synchronized(async () => {
    const updated = change(await readEntriesUnlocked());
    if (!(await writeSharedEntries(updated))) await writeJSON(ENTRIES_FILE, updated);
  });
}

export async function addEntry(entry: DotEntry): Promise<void> {
  return mutateEntries(all => [...all, entry]);
}

export async function deleteEntry(id: string): Promise<void> {
  return mutateEntries(all => all.filter(entry => entry.id !== id));
}

export async function hasDeleteHintBeenSeen(): Promise<boolean> {
  return readJSON<boolean>(HINT_FILE, false);
}

export async function markDeleteHintSeen(): Promise<void> {
  await writeJSON(HINT_FILE, true);
}
