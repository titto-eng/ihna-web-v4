import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// 50-portal-data §8 check 4: a driver that never answers gives PortalUnavailable within the timeout, never an exception on the page,
// and every connection taken from the pool is released (clean query) or destroyed (error, timeout) — never leaked.
type Conn = { execute: ReturnType<typeof vi.fn>; release: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn> }
let conns: Conn[] = []
let mode: 'hang-query' | 'hang-connect' | 'reject' | 'ok' | 'late-connect' = 'hang-query'
let lateResolve: ((c: Conn) => void) | undefined
const makeConn = (): Conn => {
  const c: Conn = {
    execute: vi.fn(() => (mode === 'hang-query' ? new Promise(() => {}) : mode === 'reject' ? Promise.reject(Object.assign(new Error('boom'), { code: 'ER_NO_SUCH_TABLE' })) : Promise.resolve([[{ ok: 1 }]]))),
    release: vi.fn(),
    destroy: vi.fn(),
  }
  conns.push(c)
  return c
}
const getConnection = vi.fn(() => {
  if (mode === 'hang-connect') return new Promise(() => {})
  if (mode === 'late-connect') return new Promise<Conn>((resolve) => { lateResolve = resolve })
  return Promise.resolve(makeConn())
})
vi.mock('mysql2/promise', () => ({ default: { createPool: () => ({ getConnection, end: async () => {} }) } }))
vi.mock('next/cache', () => ({ unstable_cache: (fn: () => unknown) => fn, revalidateTag: vi.fn() }))

import { PortalUnavailable, resetPortalPool, runQuery } from '@/lib/portal/client'
import { getCensusDates, getStartDates } from '@/lib/portal'

beforeEach(() => {
  conns = []
  mode = 'hang-query'
  lateResolve = undefined
  getConnection.mockClear()
  process.env.PORTAL_ENABLED = '1'
  process.env.PORTAL_DB_RO_USER = 'x'
  process.env.PORTAL_QUERY_TIMEOUT_MS = '200'
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(async () => {
  vi.restoreAllMocks()
  await resetPortalPool()
})

describe('portal timeout and connection release', () => {
  it('a query the server never answers rejects with PortalUnavailable within the timeout and destroys its connection', async () => {
    const t = Date.now()
    await expect(runQuery('SELECT 1')).rejects.toBeInstanceOf(PortalUnavailable)
    expect(Date.now() - t).toBeLessThan(1000)
    expect(conns[0].destroy).toHaveBeenCalledTimes(1)
    expect(conns[0].release).not.toHaveBeenCalled()
  })

  it('a pool that never hands out a connection rejects within the timeout', async () => {
    mode = 'hang-connect'
    const t = Date.now()
    await expect(runQuery('SELECT 1')).rejects.toBeInstanceOf(PortalUnavailable)
    expect(Date.now() - t).toBeLessThan(1000)
  })

  it('a connection that arrives after the deadline goes straight back and its query never runs', async () => {
    mode = 'late-connect'
    await expect(runQuery('SELECT 1')).rejects.toBeInstanceOf(PortalUnavailable)
    const c = makeConn()
    lateResolve?.(c)
    await new Promise((r) => setTimeout(r, 20))
    expect(c.execute).not.toHaveBeenCalled()
    expect(c.destroy).toHaveBeenCalledTimes(1)
  })

  it('a failing query (missing table) rejects with its code and destroys the connection instead of leaking it', async () => {
    mode = 'reject'
    await expect(runQuery('SELECT 1')).rejects.toMatchObject({ name: 'PortalUnavailable', code: 'ER_NO_SUCH_TABLE' })
    expect(conns[0].destroy).toHaveBeenCalledTimes(1)
    expect(conns[0].release).not.toHaveBeenCalled()
  })

  it('a clean query releases its connection', async () => {
    mode = 'ok'
    expect(await runQuery('SELECT 1')).toEqual([{ ok: 1 }])
    expect(conns[0].release).toHaveBeenCalledTimes(1)
    expect(conns[0].destroy).not.toHaveBeenCalled()
  })

  it('the timeout never exceeds 3 s, whatever the env says', async () => {
    process.env.PORTAL_QUERY_TIMEOUT_MS = '60000'
    const { portalConfig } = await import('@/lib/portal/client')
    expect(portalConfig().timeoutMs).toBe(3000)
  })

  it('the public API resolves { unavailable: true } with empty data when the driver hangs, and never throws', async () => {
    const t = Date.now()
    expect(await getStartDates(41, '2026-10-16')).toEqual({ unavailable: true, data: { campuses: [] } })
    expect(await getCensusDates(41, '2026-10-16')).toEqual({ unavailable: true, data: [] })
    expect(Date.now() - t).toBeLessThan(1500) // the second call is answered by the 60 s negative cache, no second 200 ms wait
  })

  it('an unconfigured portal is unavailable, not a crash', async () => {
    delete process.env.PORTAL_DB_RO_USER
    delete process.env.PORTAL_DB_READ_USER
    expect((await getCensusDates(77, '2026-10-16')).unavailable).toBe(true)
  })
})
