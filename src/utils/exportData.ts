// JSON export through the iOS share sheet. Read-only: nothing here writes to
// the storage files. The format is versioned from day one; there is no import.

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { DotTask, DotEntry } from '../types';
import { getAllTasks } from '../storage/tasks';
import { getAllEntries } from '../storage/entries';
import { todayString } from './dateUtils';

export const EXPORT_VERSION = 1 as const;

export type DotDoneExport = {
  version: typeof EXPORT_VERSION;
  exportedAt: string; // ISO timestamp
  tasks: DotTask[];
  entries: DotEntry[];
};

export async function buildExport(): Promise<DotDoneExport> {
  const [tasks, entries] = await Promise.all([getAllTasks(), getAllEntries()]);
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    tasks,
    entries,
  };
}

export type ExportResult = 'shared' | 'unavailable';

/**
 * Writes the export to a temp file and hands it to the share sheet.
 * Resolves 'unavailable' when the platform offers no share sheet.
 * Throws on a file-system failure so the caller can show it.
 */
export async function exportData(): Promise<ExportResult> {
  if (!(await Sharing.isAvailableAsync())) return 'unavailable';

  const payload = await buildExport();
  const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  const uri = `${dir}dotdone-${todayString()}.json`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload, null, 2));

  await Sharing.shareAsync(uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Dot It export',
  });
  return 'shared';
}
