import * as FileSystem from 'expo-file-system/legacy';
import { DotEntry } from '../types';

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

export async function getAllEntries(): Promise<DotEntry[]> {
  return readJSON<DotEntry[]>(ENTRIES_FILE, []);
}

export async function addEntry(entry: DotEntry): Promise<void> {
  const all = await getAllEntries();
  all.push(entry);
  await writeJSON(ENTRIES_FILE, all);
}

export async function deleteEntry(id: string): Promise<void> {
  const all = await getAllEntries();
  const updated = all.filter(e => e.id !== id);
  await writeJSON(ENTRIES_FILE, updated);
}

export async function hasDeleteHintBeenSeen(): Promise<boolean> {
  return readJSON<boolean>(HINT_FILE, false);
}

export async function markDeleteHintSeen(): Promise<void> {
  await writeJSON(HINT_FILE, true);
}
