import { beforeEach, describe, expect, it, vi } from 'vitest'

const calls: { keys: string[]; opts: { tags: string[]; revalidate: number } }[] = []
const revalidateTag = vi.fn()
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown, keys: string[], opts: { tags: string[]; revalidate: number }) => {
    calls.push({ keys, opts })
    return fn
  },
  revalidateTag: (...a: unknown[]) => revalidateTag(...a),
}))
vi.mock('@/lib/portal/queries', () => ({
  censusDates: vi.fn(async () => []),
  startDates: vi.fn(async () => ({ campuses: [] })),
  intakeCalendar: vi.fn(async () => []),
  countries: vi.fn(async () => []),
  courseByKhId: vi.fn(async () => null),
}))

import { cached, NEGATIVE_MAX_KEYS, revalidatePortal } from '@/lib/portal/cache'
import { getCensusDates, getCountries, getIntakeCalendar, getStartDates } from '@/lib/portal'

beforeEach(() => {
  process.env.PORTAL_ENABLED = '1'
  calls.length = 0
  revalidateTag.mockClear()
})

describe('portal cache (50 §8 check 6)', () => {
  it('tags portal and portal:<khId>, revalidates every 15 minutes', async () => {
    await getCensusDates(41, '2026-10-16')
    expect(calls[0].opts).toEqual({ tags: ['portal', 'portal:41'], revalidate: 900 })
  })

  it('the key changes when today changes', async () => {
    await getCensusDates(41, '2026-10-16')
    await getCensusDates(41, '2026-10-17')
    expect(calls[0].keys).not.toEqual(calls[1].keys)
    expect(calls[0].keys).toContain('2026-10-16')
  })

  it('calendar and countries have their own tags', async () => {
    await getIntakeCalendar(2026, 11, 0, '2026-10-16')
    await getCountries()
    expect(calls[0].opts.tags).toEqual(['portal', 'portal:calendar'])
    expect(calls[1].opts.tags).toEqual(['portal', 'portal:countries'])
  })

  it('a thrown error is not cached: the caller gets unavailable, empty data', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const r = await cached('x', 1, [], async () => { throw new Error('down') }, [] as string[])
    expect(r).toEqual({ unavailable: true, data: [] })
    warn.mockRestore()
  })

  it('a failure is remembered for 60 s: the next call does not run the query again; revalidatePortal(scope) clears it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fn = vi.fn(async () => { throw new Error('down') })
    expect(await cached('neg', 7, ['d'], fn, [] as string[])).toEqual({ unavailable: true, data: [] })
    expect(await cached('neg', 7, ['d'], fn, [] as string[])).toEqual({ unavailable: true, data: [] })
    expect(fn).toHaveBeenCalledTimes(1)
    revalidatePortal(7)
    await cached('neg', 7, ['d'], fn, [] as string[])
    expect(fn).toHaveBeenCalledTimes(2)
    warn.mockRestore()
  })

  it('a failure expires after 60 s', async () => {
    vi.useFakeTimers()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fn = vi.fn(async () => { throw new Error('down') })
    await cached('neg2', 8, [], fn, [] as string[])
    vi.advanceTimersByTime(59_000)
    await cached('neg2', 8, [], fn, [] as string[])
    expect(fn).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(2_000)
    await cached('neg2', 8, [], fn, [] as string[])
    expect(fn).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
    warn.mockRestore()
  })

  it('the negative cache is bounded: distinct failing keys never hold more than NEGATIVE_MAX_KEYS entries', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fn = async () => { throw new Error('down') }
    for (let i = 0; i < NEGATIVE_MAX_KEYS + 25; i++) await cached('flood', 'census', [i], fn, null)
    const map = (globalThis as unknown as { __portalNegative: Map<string, number> }).__portalNegative
    expect(map.size).toBeLessThanOrEqual(NEGATIVE_MAX_KEYS)
    expect(map.has(`census|flood|${NEGATIVE_MAX_KEYS + 24}`)).toBe(true) // newest kept, oldest dropped
    expect(map.has('census|flood|0')).toBe(false)
    revalidatePortal('census')
    warn.mockRestore()
  })

  it('census and start dates share one bundle read per course and day (one tag, one key)', async () => {
    await getCensusDates(41, '2026-10-16')
    await getStartDates(41, '2026-10-16')
    expect(calls.map((c) => c.keys)).toEqual([calls[0].keys, calls[0].keys])
    expect(calls[0].opts.tags).toEqual(['portal', 'portal:41'])
  })

  it('revalidatePortal(khId) expires one course, no argument expires everything', () => {
    revalidatePortal(41)
    revalidatePortal()
    expect(revalidateTag.mock.calls).toEqual([['portal:41', { expire: 0 }], ['portal', { expire: 0 }]])
  })
})
