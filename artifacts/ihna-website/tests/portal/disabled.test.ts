import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// PORTAL_ENABLED=0 (the default): the site never waits on the portal. No pool is created, no query runs, no await is needed.
const createPool = vi.fn(() => { throw new Error('a connection was opened while PORTAL_ENABLED=0') })
vi.mock('mysql2/promise', () => ({ default: { createPool: () => createPool() } }))
vi.mock('next/cache', () => ({ unstable_cache: (fn: () => unknown) => fn, revalidateTag: vi.fn() }))

import { CensusDates } from '@/blocks/censusDates/Component'
import { IntakeCalendar } from '@/blocks/intakeCalendar/Component'
import { StartDates } from '@/blocks/startDates/Component'
import { getCensusDates, getCountries, getCourseByKhId, getCoursePortal, getIntakeCalendar, getStartDates, portalEnabled } from '@/lib/portal'

const original = process.env.PORTAL_ENABLED
beforeEach(() => {
  process.env.PORTAL_DB_RO_USER = 'x'
  createPool.mockClear()
})
afterEach(() => {
  if (original === undefined) delete process.env.PORTAL_ENABLED
  else process.env.PORTAL_ENABLED = original
})

const course = { id: 1, title: 'T', slug: 't', khId: 41, showStartDates: true, studentType: 'both' }
const render = async (el: unknown) => renderToStaticMarkup((await (el as Promise<React.ReactElement | null>)) ?? createElement('i'))

describe.each([['unset', undefined], ['0', '0']])('PORTAL_ENABLED %s', (_name, value) => {
  beforeEach(() => {
    if (value === undefined) delete process.env.PORTAL_ENABLED
    else process.env.PORTAL_ENABLED = value
  })

  it('is off', () => expect(portalEnabled()).toBe(false))

  it('every read returns { unavailable: true } synchronously (not a promise)', () => {
    for (const r of [getCensusDates(41), getStartDates(41), getCoursePortal(41), getIntakeCalendar(2026, 11, null), getCountries(), getCourseByKhId(41)]) {
      expect(r).not.toBeInstanceOf(Promise)
      expect(r).toMatchObject({ unavailable: true })
    }
    expect(getCensusDates(41)).toEqual({ unavailable: true, data: [] })
    expect(createPool).not.toHaveBeenCalled()
  })

  it('the date blocks render "Dates coming soon" at once and open no connection', async () => {
    const renderAll = async () => [
      await render(CensusDates({ block: { blockType: 'censusDates' }, ctx: { depth: 0, course } } as never)),
      await render(StartDates({ block: { blockType: 'startDates', mode: 'all' }, ctx: { depth: 0, course } } as never)),
      await render(IntakeCalendar({ block: { blockType: 'intakeCalendar', months: 12 }, ctx: { depth: 0 } } as never)),
    ]
    await renderAll() // the first render pays for lazy module work (full-suite load made it a flaky timing); the timed one measures the portal path
    const t = Date.now()
    for (const out of await renderAll()) expect(out).toContain('Dates coming soon')
    expect(Date.now() - t).toBeLessThan(100)
    expect(createPool).not.toHaveBeenCalled()
  })
})
