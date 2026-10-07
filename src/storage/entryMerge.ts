/** Preserve old history and any widget dots saved before the upgraded app opens. */
export function mergeEntryHistories<T extends { id: string }>(
  legacy: T[],
  shared: T[]
): T[] {
  const byId = new Map<string, T>();
  for (const entry of legacy) byId.set(entry.id, entry);
  for (const entry of shared) byId.set(entry.id, entry);
  return [...byId.values()];
}
