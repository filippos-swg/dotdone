// App Group files are visible to the WidgetKit extension in a native build.
// Expo Go has no App Group entitlement and keeps using the original app files.
import { Directory, File, Paths } from 'expo-file-system';
import { ExtensionStorage } from '@bacons/apple-targets';
import { mergeEntryHistories } from './entryMerge';

export const APP_GROUP = 'group.se.southnorth.dotdone';
const ENTRIES_NAME = 'dotdone_entries.json';
const TASKS_NAME = 'dotdone_widget_tasks.json';
const MIGRATED_NAME = 'dotdone_entries_migrated';
const PENDING_NAME = 'dotdone_widget_pending';

function sharedFile(name: string): File | null {
  const directory = Paths.appleSharedContainers[APP_GROUP];
  return directory ? new File(directory, name) : null;
}

function pendingDirectory(): Directory | null {
  const container = Paths.appleSharedContainers[APP_GROUP];
  return container ? new Directory(container, PENDING_NAME) : null;
}

async function readArray<T>(file: File): Promise<T[] | null> {
  if (!file.exists) return null;
  const value: unknown = JSON.parse(await file.text());
  if (!Array.isArray(value)) throw new Error(`Invalid shared data: ${file.uri}`);
  return value as T[];
}

export async function getSharedEntries<T extends { id: string }>(
  readLegacy: () => Promise<T[]>
): Promise<T[] | null> {
  const primary = sharedFile(ENTRIES_NAME);
  const backup = sharedFile(`${ENTRIES_NAME}.backup`);
  const marker = sharedFile(MIGRATED_NAME);
  if (!primary || !backup || !marker) return null;

  const primaryExisted = primary.exists;
  let entries: T[] | null;
  try {
    entries = await readArray<T>(primary);
  } catch {
    entries = null;
  }
  if (!entries && backup.exists) {
    entries = await readArray<T>(backup);
    if (!entries) throw new Error('Shared dot history could not be read');
    primary.write(JSON.stringify(entries));
  }
  if (!entries && primaryExisted) {
    // Never replace an unreadable widget file with an empty array.
    throw new Error('Shared dot history could not be recovered');
  }

  if (!marker.exists) {
    // A widget may have been tapped before the upgraded app's first launch.
    // Merge by ID so both its new dot and all historical dots survive.
    const legacy = await readLegacy();
    entries = mergeEntryHistories(legacy, entries ?? []);
    backup.write(JSON.stringify(entries));
    primary.write(JSON.stringify(entries));
    marker.write('1');
  }

  if (!entries) {
    // A missing primary after migration is an error, never an empty history.
    throw new Error('Shared dot history is missing');
  }
  const pending = pendingDirectory();
  if (pending?.exists) {
    const files = pending.list().filter(
      (item): item is File => item instanceof File && item.uri.endsWith('.json')
    );
    if (files.length > 0) {
      const widgetEntries = await Promise.all(files.map(async file => {
        const value: unknown = JSON.parse(await file.text());
        if (!value || typeof value !== 'object' || typeof (value as T).id !== 'string') {
          throw new Error('Invalid widget dot awaiting import');
        }
        return value as T;
      }));
      entries = mergeEntryHistories(entries, widgetEntries);
      await writeSharedEntries(entries);
      // Leave each file until the merged history is safely written.
      for (const file of files) file.delete();
    }
  }
  return entries;
}

export async function writeSharedEntries<T>(entries: T[]): Promise<boolean> {
  const primary = sharedFile(ENTRIES_NAME);
  const backup = sharedFile(`${ENTRIES_NAME}.backup`);
  if (!primary || !backup) return false;
  // The prior JSON remains recoverable if the second write is interrupted.
  if (primary.exists) backup.write(await primary.text());
  else backup.write(JSON.stringify(entries));
  primary.write(JSON.stringify(entries));
  ExtensionStorage.reloadWidget();
  return true;
}

export function publishTasksToWidget<T>(tasks: T[]): void {
  const file = sharedFile(TASKS_NAME);
  if (!file) return;
  try {
    const contents = JSON.stringify(tasks);
    if (file.exists && file.textSync() === contents) return;
    file.write(contents);
    ExtensionStorage.reloadWidget();
  } catch {
    // Widget availability must never prevent task edits in the main app.
  }
}
