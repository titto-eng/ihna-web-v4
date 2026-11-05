// Read-only portal connection (50-portal-data §6). Server-only: import from server components, route handlers and scripts.
// The only module allowed to import `mysql2`. SQL is a constant string with `?` placeholders (see queries.ts);
// values are always bound, never interpolated (tests/portal/no-raw-sql.test.ts enforces it).
import mysql, { type Pool, type PoolConnection, type RowDataPacket } from 'mysql2/promise'

export class PortalUnavailable extends Error {
  readonly code: string
  constructor(code: string, message?: string) {
    super(message ?? `portal unavailable: ${code}`)
    this.name = 'PortalUnavailable'
    this.code = code
  }
}

/** Master switch (PORTAL_ENABLED, default 0): with 0 no read path opens a connection or awaits a query. */
export const portalEnabled = (): boolean => process.env.PORTAL_ENABLED === '1'

/** Hard ceiling on every portal read, whatever PORTAL_QUERY_TIMEOUT_MS says. */
export const PORTAL_MAX_TIMEOUT_MS = 3000

const readTimeout = (): number => {
  const n = Number(process.env.PORTAL_QUERY_TIMEOUT_MS ?? PORTAL_MAX_TIMEOUT_MS)
  return Math.min(Number.isFinite(n) && n > 0 ? n : PORTAL_MAX_TIMEOUT_MS, PORTAL_MAX_TIMEOUT_MS)
}

// PORTAL_DB_NAME names the portal database (`ihna_portal` on IHNA); it is set in every environment, and the fallback below is
// ihm-web's database name (this file is shared, SHARED-FILES.md).
export const portalConfig = () => ({
  host: process.env.PORTAL_DB_HOST ?? '127.0.0.1',
  port: Number(process.env.PORTAL_DB_PORT ?? 3306),
  database: process.env.PORTAL_DB_NAME ?? 'ihmedu_portal',
  user: process.env.PORTAL_DB_RO_USER ?? process.env.PORTAL_DB_READ_USER ?? '',
  password: process.env.PORTAL_DB_RO_PASSWORD ?? process.env.PORTAL_DB_READ_PASSWORD ?? '',
  timeoutMs: readTimeout(),
})

let pool: Pool | undefined

function getPool(): Pool {
  if (pool) return pool
  const c = portalConfig()
  if (!c.user) throw new PortalUnavailable('not-configured', 'PORTAL_DB_RO_USER is not set')
  pool = mysql.createPool({
    host: c.host,
    port: c.port,
    database: c.database,
    user: c.user,
    password: c.password,
    connectTimeout: c.timeoutMs,
    connectionLimit: 4,
    waitForConnections: true,
    queueLimit: 20,
    dateStrings: true, // DATE columns arrive as 'YYYY-MM-DD' strings, never Date objects
    timezone: 'Z',
  })
  return pool
}

/** Test hook: drop the pool so the next query re-reads the environment. */
export async function resetPortalPool(): Promise<void> {
  const p = pool
  pool = undefined
  await p?.end().catch(() => {})
  await resetPayPool()
}

export type SqlParam = string | number | null

/** Give a connection back; a connection in an unknown state (error, timeout) is destroyed instead of pooled. */
const giveBack = (c: PoolConnection, ok: boolean): void => {
  try {
    if (ok) c.release()
    else c.destroy()
  } catch {
    /* already gone */
  }
}

/**
 * Run one parameterised read. Rejects with PortalUnavailable on connect errors and when connect + query take longer than
 * PORTAL_QUERY_TIMEOUT_MS (default and ceiling 3000). The connection is taken explicitly so it is always accounted for:
 * released after a clean query, destroyed after an error or timeout, and handed straight back if it only arrives after
 * the deadline (a pool that waits for a connection must never leak one to an abandoned call).
 */
export async function runQuery<T extends RowDataPacket>(sql: string, params: SqlParam[] = []): Promise<T[]> {
  const { timeoutMs } = portalConfig()
  const started = Date.now()
  let timer: ReturnType<typeof setTimeout> | undefined
  let abandoned = false
  let held: PoolConnection | undefined
  try {
    const work = (async () => {
      const conn = await getPool().getConnection()
      if (abandoned) {
        giveBack(conn, false)
        throw new PortalUnavailable('timeout')
      }
      held = conn
      try {
        const [rows] = await conn.execute<T[]>({ sql, timeout: timeoutMs }, params)
        held = undefined
        giveBack(conn, true)
        return rows
      } catch (e) {
        held = undefined
        giveBack(conn, false)
        throw e
      }
    })()
    work.catch(() => {}) // a late rejection after the race is lost must not become unhandled
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        abandoned = true
        if (held) giveBack(held, false) // kills a query the server never answered; its execute() then rejects harmlessly
        held = undefined
        reject(new PortalUnavailable('timeout', `portal query exceeded ${timeoutMs}ms`))
      }, timeoutMs)
    })
    return await Promise.race([work, timeout])
  } catch (e) {
    const code = e instanceof PortalUnavailable ? e.code : String((e as { code?: string }).code ?? 'error')
    console.warn(`portal.unavailable ${JSON.stringify({ code, ms: Date.now() - started })}`)
    if (e instanceof PortalUnavailable) throw e
    throw new PortalUnavailable(code)
  } finally {
    if (timer) clearTimeout(timer)
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Write-limited `payments` pool (45-payments §2, 50-portal-data §6). Used ONLY by src/lib/portal/payments-write.ts.
// User PORTAL_DB_PAY_USER (alias PORTAL_DB_PAYMENTS_USER): SELECT, INSERT and column-level UPDATE on `payments`, no DELETE.
// ---------------------------------------------------------------------------------------------------------------------
export const payConfig = () => ({
  host: process.env.PORTAL_DB_HOST ?? '127.0.0.1',
  port: Number(process.env.PORTAL_DB_PORT ?? 3306),
  database: process.env.PORTAL_DB_NAME ?? 'ihmedu_portal',
  // `||`, not `??`: an empty `PORTAL_DB_PAY_USER=` line in .env falls back to the alias (50-portal-data §6).
  user: process.env.PORTAL_DB_PAY_USER || process.env.PORTAL_DB_PAYMENTS_USER || '',
  password: process.env.PORTAL_DB_PAY_PASSWORD || process.env.PORTAL_DB_PAYMENTS_PASSWORD || '',
  timeoutMs: Number(process.env.PORTAL_QUERY_TIMEOUT_MS ?? 5000),
})

let payPool: Pool | undefined

function getPayPool(): Pool {
  if (payPool) return payPool
  const c = payConfig()
  if (!c.user) throw new PortalUnavailable('not-configured', 'PORTAL_DB_PAY_USER is not set')
  payPool = mysql.createPool({
    host: c.host, port: c.port, database: c.database, user: c.user, password: c.password,
    connectTimeout: c.timeoutMs, connectionLimit: 4, waitForConnections: true, queueLimit: 20,
    dateStrings: true, timezone: 'Z',
  })
  return payPool
}

/** Test hook: drop the payments pool so the next write re-reads the environment. */
export async function resetPayPool(): Promise<void> {
  const p = payPool
  payPool = undefined
  await p?.end().catch(() => {})
}

export type PortalPaymentRow = RowDataPacket & { id: number; status: number; amount: string; paid_amount: string | null; payment_gateway: string | null; invoice_number: string | null; email: string | null }

export type WriteResult = { affectedRows: number; insertId: number }

async function payExec<R>(sql: string, params: SqlParam[], pick: (r: unknown) => R): Promise<R> {
  const { timeoutMs } = payConfig()
  const started = Date.now()
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const exec = getPayPool().execute({ sql, timeout: timeoutMs }, params)
    exec.catch(() => {})
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new PortalUnavailable('timeout', `portal write exceeded ${timeoutMs}ms`)), timeoutMs)
    })
    const [res] = await Promise.race([exec, timeout])
    return pick(res)
  } catch (e) {
    const code = e instanceof PortalUnavailable ? e.code : String((e as { code?: string }).code ?? 'error')
    console.warn(`portal.pay.unavailable ${JSON.stringify({ code, ms: Date.now() - started })}`)
    if (e instanceof PortalUnavailable) throw e
    throw new PortalUnavailable(code)
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/** One parameterised INSERT or UPDATE through the payments user. `sql` is a constant with `?` placeholders. */
export const runPayWrite = (sql: string, params: SqlParam[] = []): Promise<WriteResult> =>
  payExec(sql, params, (r) => ({ affectedRows: Number((r as { affectedRows?: number }).affectedRows ?? 0), insertId: Number((r as { insertId?: number }).insertId ?? 0) }))

/** One parameterised SELECT through the payments user (it holds SELECT on `payments`). */
export const runPayRead = <T extends RowDataPacket>(sql: string, params: SqlParam[] = []): Promise<T[]> => payExec(sql, params, (r) => r as T[])
