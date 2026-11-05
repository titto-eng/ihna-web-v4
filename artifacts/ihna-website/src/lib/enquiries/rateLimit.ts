import type { Payload } from 'payload'
import { rateLimitStore } from './config'

export const RATE_LIMIT = 10 // per window, per IP + formKey (40 §4 step 4)
export const RATE_WINDOW_MS = 60_000

export type RateResult = { allowed: boolean; count: number; retryAfterSeconds: number }

// ---- memory store: dev and test (single process). Fixed window per key. ---------------------------------------------------
const memory = new Map<string, { count: number; resetAt: number }>()
export const resetRateLimit = () => memory.clear()

function memoryHit(key: string, limit: number, windowMs: number, now: number): RateResult {
  if (memory.size > 5000) for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k)
  const cur = memory.get(key)
  const entry = cur && cur.resetAt > now ? cur : { count: 0, resetAt: now + windowMs }
  entry.count++
  memory.set(key, entry)
  return { allowed: entry.count <= limit, count: entry.count, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) }
}

// ---- postgres store: production (several instances share one counter). Table is created on first use. --------------------
type PgPool = { query: (text: string, values?: unknown[]) => Promise<{ rows: { count: number }[] }> }
let tableReady: Promise<void> | null = null

async function postgresHit(payload: Payload, key: string, limit: number, windowMs: number, now: number): Promise<RateResult> {
  const pool = (payload.db as unknown as { pool?: PgPool }).pool
  if (!pool) return memoryHit(key, limit, windowMs, now)
  tableReady ??= pool
    .query('CREATE TABLE IF NOT EXISTS enquiry_rate_limits (key text NOT NULL, window_start bigint NOT NULL, count integer NOT NULL DEFAULT 0, PRIMARY KEY (key, window_start))')
    .then(() => undefined)
  await tableReady
  const windowStart = Math.floor(now / windowMs) * windowMs
  const res = await pool.query(
    'INSERT INTO enquiry_rate_limits (key, window_start, count) VALUES ($1, $2, 1) ON CONFLICT (key, window_start) DO UPDATE SET count = enquiry_rate_limits.count + 1 RETURNING count',
    [key, windowStart],
  )
  if (Math.random() < 0.02) void pool.query('DELETE FROM enquiry_rate_limits WHERE window_start < $1', [now - windowMs * 10]).catch(() => {})
  const count = Number(res.rows[0]?.count ?? 1)
  return { allowed: count <= limit, count, retryAfterSeconds: Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000)) }
}

/** Counts this request and says whether it is allowed. Key = IP + formKey. Memory in dev/test, Postgres in production. */
export async function rateLimit(payload: Payload, ip: string, formKey: string, opts: { limit?: number; windowMs?: number; now?: number; store?: 'memory' | 'postgres' } = {}): Promise<RateResult> {
  const { limit = RATE_LIMIT, windowMs = RATE_WINDOW_MS, now = Date.now() } = opts
  const key = `${ip}|${formKey}`
  const store = opts.store ?? rateLimitStore()
  try {
    return store === 'postgres' ? await postgresHit(payload, key, limit, windowMs, now) : memoryHit(key, limit, windowMs, now)
  } catch (e) {
    console.error('[enquire] rate limit store failed; falling back to memory', e instanceof Error ? e.message : e)
    return memoryHit(key, limit, windowMs, now) // never block a submission because the counter is down
  }
}
