import { createElement, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { resetPortalPool } from '@/lib/portal/client'
import { AS_OF, usePortalFixtureDb } from '../portal/env'

// unstable_cache needs a Next request scope; the blocks are tested against the fixture portal with a pass-through cache.
vi.mock('next/cache', () => ({ unstable_cache: (fn: () => unknown) => fn, revalidateTag: vi.fn() }))
vi.mock('@/lib/portal/format', async (orig) => ({ ...(await orig<typeof import('@/lib/portal/format')>()), portalToday: () => AS_OF }))

import { CensusDates } from '@/blocks/censusDates/Component'
import { CourseFacts } from '@/blocks/courseFacts/Component'
import { FeesTable } from '@/blocks/feesTable/Component'
import { StartDates } from '@/blocks/startDates/Component'

beforeAll(() => usePortalFixtureDb())
afterAll(() => resetPortalPool())

type Course = Record<string, unknown>
const course = (over: Course = {}): Course => ({ id: 1, title: 'T', slug: 't', khId: 41, showStartDates: false, studentType: 'both', ...over })
const html = async (node: Promise<ReactElement | null> | ReactElement | null) => renderToStaticMarkup((await node) ?? createElement('i'))
const block = <P extends object>(C: (p: P) => unknown, props: P) => C(props) as Promise<ReactElement | null> | ReactElement | null

describe('censusDates', () => {
  it('shows the live table for Master of Nursing (kh 41): 6 rows, live formats', async () => {
    const out = await html(block(CensusDates, { block: { blockType: 'censusDates' }, ctx: { depth: 0, course: course() } } as never))
    expect(out).toContain('Course Start Dates')
    expect(out.match(/<tr/g)).toHaveLength(7)
    expect(out).toContain('November 2026')
    expect(out).toContain('02-11-2026')
    expect(out).toContain('30-10-2028')
  })
  it('renders nothing with no kh_id, no course, or an empty result (OSCE, kh 61)', async () => {
    expect(await html(block(CensusDates, { block: {}, ctx: { depth: 0, course: course({ khId: null }) } } as never))).toBe('<i></i>')
    expect(await html(block(CensusDates, { block: {}, ctx: { depth: 0 } } as never))).toBe('<i></i>')
    expect(await html(block(CensusDates, { block: {}, ctx: { depth: 0, course: course({ khId: 61 }) } } as never))).toBe('<i></i>')
  })
  it('portal down: "Dates coming soon", never an exception', async () => {
    process.env.PORTAL_DB_PORT = '3999'
    await resetPortalPool()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const out = await html(block(CensusDates, { block: {}, ctx: { depth: 0, course: course() } } as never))
    expect(out).toContain('Dates coming soon')
    warn.mockRestore()
    usePortalFixtureDb()
    await resetPortalPool()
  })
})

describe('startDates (DEC-7)', () => {
  it('renders nothing unless course.showStartDates', async () => {
    expect(await html(block(StartDates, { block: { mode: 'all' }, ctx: { depth: 0, course: course({ khId: 9101 }) } } as never))).toBe('<i></i>')
  })
  it('renders both audiences when switched on, international face to face only', async () => {
    const out = await html(block(StartDates, { block: { mode: 'all' }, ctx: { depth: 0, course: course({ khId: 9102, showStartDates: true }) } } as never))
    expect(out).toContain('data-audience-version="domestic"')
    expect(out).not.toContain('data-audience-version="international"') // 9102 has no face to face dates
    expect(out).toContain('Online (Blended) Delivery')
    expect(out).toContain('Enrol any time')
  })
  it('domestic-only courses render a single audience without the switch wrapper', async () => {
    const out = await html(block(StartDates, { block: { mode: 'all' }, ctx: { depth: 0, course: course({ khId: 9101, showStartDates: true, studentType: 'domestic' }) } } as never))
    expect(out).toContain('Face to Face Delivery')
    expect(out).not.toContain('data-audience-version')
  })
})

describe('courseFacts and feesTable read the course doc', () => {
  it('facts: values from populated lookups, hidden when empty', async () => {
    const c = course({ durations: [{ name: '2 years' }], deliveryModes: [{ name: 'On Campus' }], campuses: [{ name: 'Melbourne' }], levels: [{ name: 'AQF Level 9' }], cricosCode: '105600C' })
    const out = await html(block(CourseFacts, { block: { show: ['duration', 'cricos'] }, ctx: { depth: 0, course: c } } as never))
    expect(out).toContain('2 years')
    expect(out).toContain('105600C')
    expect(out).not.toContain('Melbourne')
    expect(await html(block(CourseFacts, { block: {}, ctx: { depth: 0, course: course() } } as never))).toBe('<i></i>')
  })
  it('fees: the course fee fields, nothing when unset', async () => {
    expect(await html(block(FeesTable, { block: {}, ctx: { depth: 0, course: course({ fees: { displayAmount: 'Total Tuition Fee: AUD $600' } }) } } as never))).toContain('AUD $600')
    expect(await html(block(FeesTable, { block: {}, ctx: { depth: 0, course: course() } } as never))).toBe('<i></i>')
  })
})
