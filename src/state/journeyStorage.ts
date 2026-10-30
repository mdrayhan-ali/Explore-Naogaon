export type StorageReader = Pick<Storage, 'getItem'>
export type StorageWriter = Pick<Storage, 'setItem'>

export function parseVisitedIds(raw: string | null, validIds: ReadonlySet<string>): string[] {
  if (!raw) return []
  if (raw === 'true') return validIds.has('somapura-mahavihara') ? ['somapura-mahavihara'] : []

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  return [...new Set(parsed.filter((id): id is string => typeof id === 'string' && validIds.has(id)))]
}

export function readVisitedIds(
  storage: StorageReader,
  key: string,
  validIds: ReadonlySet<string>,
): string[] {
  return parseVisitedIds(storage.getItem(key), validIds)
}

export function writeVisitedIds(storage: StorageWriter, key: string, visitedIds: Iterable<string>) {
  storage.setItem(key, JSON.stringify([...new Set(visitedIds)]))
}
