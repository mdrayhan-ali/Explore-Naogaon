/** Talks to the shared "maps downloaded" counter (api/downloads.ts). Every failure is silent: the site works without it. */
const ENDPOINT = '/api/downloads'

export function parseCount(body: unknown): number | null {
  if (typeof body !== 'object' || body === null) return null
  const count = (body as { count?: unknown }).count
  return typeof count === 'number' && Number.isSafeInteger(count) && count >= 0 ? count : null
}

async function call(method: 'GET' | 'POST', signal?: AbortSignal): Promise<number | null> {
  try {
    const response = await fetch(ENDPOINT, { method, signal, headers: { Accept: 'application/json' } })
    if (!response.ok) return null
    return parseCount(await response.json())
  } catch {
    return null
  }
}

export const fetchDownloadCount = (signal?: AbortSignal) => call('GET', signal)
export const recordDownload = () => call('POST')

/** The number is hidden until it is big enough to be worth showing. */
export function shouldShowCount(count: number | null, minToShow: number): count is number {
  return count !== null && count >= minToShow
}
