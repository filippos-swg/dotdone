import type { DotEntry } from '../types';

/** The same task added twice in quick succession needs an explicit confirmation. */
export function hasRecentDot(
  entries: DotEntry[],
  date: string,
  taskId: string | undefined,
  now: number,
  thresholdMs: number
): boolean {
  return entries.some(entry => {
    const elapsed = now - Date.parse(entry.timestamp);
    return entry.date === date &&
      entry.taskId === taskId &&
      elapsed >= 0 &&
      elapsed < thresholdMs;
  });
}
