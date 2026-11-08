/**
 * Shared "maps downloaded so far" counter (Vercel serverless function).
 *
 *   GET  /api/downloads  ->  { count }          current total
 *   POST /api/downloads  ->  { count }          +1 (at most once per visitor per 10 minutes)
 *
 * Storage is a free Upstash Redis database, reached over its REST API (no extra npm package).
 * Set these two variables in Vercel -> Project -> Settings -> Environment Variables
 * (never commit them):
 *   UPSTASH_REDIS_REST_URL   (or KV_REST_API_URL)
 *   UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_TOKEN)
 * Optional: COUNTER_SALT = any random text, mixed into the visitor hash.
 *
 * Privacy: the visitor's IP address is never stored, only a one-way hash that expires after 10 minutes.
 * The number is a friendly estimate, not an audit: anyone determined can still inflate it slowly.
 */
// Vercel runs this file on Node.js; declared here so no extra type package is needed.
declare const process: { env: Record<string, string | undefined> }

const COUNT_KEY = 'naogaon:downloads'
const WINDOW_SECONDS = 600

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/+$/, ''), token } : null
}

async function redis(command: (string | number)[]): Promise<unknown> {
  const config = redisConfig()
  if (!config) throw new Error('Counter storage is not configured.')
  const response = await fetch(config.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  })
  if (!response.ok) throw new Error(`Counter storage answered ${response.status}.`)
  const body = (await response.json()) as { result?: unknown; error?: string }
  if (body.error) throw new Error('Counter storage rejected the command.')
  return body.result
}

function json(body: unknown, status: number, cache: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache },
  })
}

function toCount(value: unknown): number {
  const n = Number(value ?? 0)
  return Number.isSafeInteger(n) && n >= 0 ? n : 0
}

async function visitorKey(request: Request): Promise<string> {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwarded || request.headers.get('x-real-ip') || 'unknown'
  const data = new TextEncoder().encode(`${process.env.COUNTER_SALT ?? ''}|${ip}|${request.headers.get('user-agent') ?? ''}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `naogaon:downloads:seen:${hex.slice(0, 32)}`
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (!origin || !host) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export async function GET(): Promise<Response> {
  try {
    return json({ count: toCount(await redis(['GET', COUNT_KEY])) }, 200, 'public, s-maxage=30, stale-while-revalidate=120')
  } catch (error) {
    console.error('downloads GET failed', error instanceof Error ? error.message : error)
    return json({ count: null }, 503, 'no-store')
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!sameOrigin(request)) return json({ count: null }, 403, 'no-store')
  try {
    const fresh = await redis(['SET', await visitorKey(request), '1', 'NX', 'EX', WINDOW_SECONDS])
    const count = toCount(await redis(fresh === 'OK' ? ['INCR', COUNT_KEY] : ['GET', COUNT_KEY]))
    return json({ count }, 200, 'no-store')
  } catch (error) {
    console.error('downloads POST failed', error instanceof Error ? error.message : error)
    return json({ count: null }, 503, 'no-store')
  }
}
