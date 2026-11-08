import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from '../api/downloads'
import { parseCount, shouldShowCount } from '../src/lib/downloadCounter'

/** A tiny in-memory stand-in for Upstash's REST API. */
function fakeRedis() {
  const store = new Map<string, string>()
  const calls: string[][] = []
  const handler = vi.fn(async (_url: string, init: RequestInit) => {
    const command = JSON.parse(String(init.body)) as string[]
    calls.push(command)
    const [name, key, , flag] = command
    let result: unknown = null
    if (name === 'GET') result = store.get(key) ?? null
    if (name === 'INCR') { store.set(key, String(Number(store.get(key) ?? 0) + 1)); result = Number(store.get(key)) }
    if (name === 'SET') {
      if (flag === 'NX' && store.has(key)) result = null
      else { store.set(key, command[2]); result = 'OK' }
    }
    return new Response(JSON.stringify({ result }), { status: 200 })
  })
  return { handler, store, calls }
}

const post = (headers: Record<string, string> = {}) =>
  new Request('https://explore.test/api/downloads', {
    method: 'POST',
    headers: { origin: 'https://explore.test', host: 'explore.test', 'x-forwarded-for': '1.2.3.4', ...headers },
  })

describe('downloads API', () => {
  let redis: ReturnType<typeof fakeRedis>
  beforeEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.test'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'secret-token'
    redis = fakeRedis()
    vi.stubGlobal('fetch', redis.handler)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.UPSTASH_REDIS_REST_TOKEN })

  it('starts at zero and counts a download once per visitor window', async () => {
    expect(await (await GET()).json()).toEqual({ count: 0 })
    expect(await (await POST(post())).json()).toEqual({ count: 1 })
    expect(await (await POST(post())).json()).toEqual({ count: 1 }) // same visitor, still 1
    expect(await (await POST(post({ 'x-forwarded-for': '9.9.9.9' }))).json()).toEqual({ count: 2 })
    expect(await (await GET()).json()).toEqual({ count: 2 })
  })

  it('never stores the raw IP address and sends the token only as a header', async () => {
    await POST(post())
    const sent = JSON.stringify(redis.calls)
    expect(sent).not.toContain('1.2.3.4')
    expect(sent).not.toContain('secret-token')
    expect(redis.handler.mock.calls[0][1].headers).toMatchObject({ Authorization: 'Bearer secret-token' })
  })

  it('rejects POSTs from another origin or without one', async () => {
    expect((await POST(post({ origin: 'https://evil.test' }))).status).toBe(403)
    const noOrigin = new Request('https://explore.test/api/downloads', { method: 'POST', headers: { host: 'explore.test' } })
    expect((await POST(noOrigin)).status).toBe(403)
    expect(redis.handler).not.toHaveBeenCalled()
  })

  it('answers 503 with a null count when storage is missing or failing', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL
    expect((await GET()).status).toBe(503)
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.test'
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })))
    const res = await POST(post())
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ count: null })
  })

  it('ignores a corrupted stored value', async () => {
    redis.store.set('naogaon:downloads', 'abc')
    expect(await (await GET()).json()).toEqual({ count: 0 })
  })
})

describe('download counter client helpers', () => {
  it('accepts only sane counts', () => {
    expect(parseCount({ count: 12 })).toBe(12)
    for (const bad of [null, 'x', {}, { count: -1 }, { count: 1.5 }, { count: '5' }, { count: null }]) expect(parseCount(bad)).toBeNull()
  })
  it('hides small or missing numbers', () => {
    expect(shouldShowCount(null, 50)).toBe(false)
    expect(shouldShowCount(49, 50)).toBe(false)
    expect(shouldShowCount(50, 50)).toBe(true)
  })
})
