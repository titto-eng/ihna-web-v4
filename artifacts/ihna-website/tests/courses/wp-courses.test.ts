import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import { findLegacyMarkup } from '../../scripts/import/lib/assert-clean'
import { loadPageRows } from '../../scripts/import/lib/data'
import { newReport, type ImportContext } from '../../scripts/import/lib/context'
import { run as runWpCourses } from '../../scripts/import/steps/wp-courses'
import { loadCourseLive } from '../../scripts/import/steps/course-live'
import { boot } from '../collections/helpers'

// Integration: the IHNA wp-courses step against the dev Postgres (the import is idempotent, so this runs it again and expects no
// change). Needs `npm run import -- lookups,course-live,media,wp-courses` to have run once in the database `.env` points at.
let payload: Payload
const rows = loadPageRows().filter((r) => r.wp_type === 'courses')
const live = loadCourseLive()

// Only the imported courses (`import.wpId` set): other test files create temporary courses in the same database while this one runs.
const all = async () =>
  (await payload.find({ collection: 'courses', where: { 'import.wpId': { exists: true } }, limit: 100, depth: 0, pagination: false, overrideAccess: true, draft: true })).docs

describe('wp-courses import state (IHNA)', () => {
  beforeAll(async () => {
    payload = await boot()
    const report = newReport('wp-courses', false)
    const ctx: ImportContext = {
      payload, args: { step: 'wp-courses', only: null, dry: false, force: false, flags: {} }, dry: false, report,
      opts: { context: { importing: true }, overrideAccess: true }, log: () => {}, wanted: () => true,
    }
    await runWpCourses(ctx)
    Object.assign(globalThis, { __wpCoursesReport: report })
  }, 170_000)
  afterAll(async () => {
    await payload?.destroy?.()
  })

  it('a second run changes nothing (idempotent)', () => {
    const r = (globalThis as unknown as { __wpCoursesReport: { created: number; updated: number; skipped: number; failed: unknown[] } }).__wpCoursesReport
    expect(r.failed).toEqual([])
    expect(r.created).toBe(0)
    expect(r.updated).toBe(0)
    expect(r.skipped).toBe(21)
  })

  it('has the 21 courses at the pages.csv paths (the -int / -international pages are their own courses)', async () => {
    const docs = await all()
    expect(rows).toHaveLength(21)
    expect(docs.map((d) => d.path).sort()).toEqual(rows.map((r) => r.path).sort())
  })

  it('kh_id: read from the live page form; the rest kh-unresolved', async () => {
    const docs = await all()
    const resolved = Object.entries(live).filter(([, l]) => l.khId != null)
    expect(resolved.length).toBeGreaterThanOrEqual(17)
    for (const d of docs) {
      const l = live[d.slug]
      expect(d.khId ?? null, d.slug).toBe(l?.khId ?? null)
      if (d.khId) expect(d.khIdSource).toBe('scrape')
      else expect(d.import?.reviewStatus, d.slug).toBe('kh-unresolved')
    }
    expect(docs.find((d) => d.slug === 'diploma-of-nursing')?.khId).toBe(363)
  })

  it('DEC-7: start dates are switched on where the live page showed the portal dates, and the dates never reached a layout', async () => {
    const docs = await all()
    expect(docs.find((d) => d.slug === 'diploma-of-nursing')?.showStartDates).toBe(true)
    expect(docs.find((d) => d.slug === 'provide-cardiopulmonary-resuscitation')?.showStartDates).toBe(false)
    expect(JSON.stringify(docs.map((d) => d.sections))).not.toMatch(/date-card|"blockType":"startDates"/)
  })

  it('stores blocks only: no legacy markup, one section per slot, the Diploma of Nursing has its slots', async () => {
    const docs = await all()
    for (const d of docs) {
      expect(findLegacyMarkup(d.sections), d.slug).toEqual([])
      expect(JSON.stringify(d.sections), d.slug).not.toMatch(/class=|style=|<script|<style/)
      const slots = (d.sections ?? []).map((s) => s.slot)
      expect(new Set(slots).size, d.slug).toBe(slots.length)
    }
    const don = docs.find((d) => d.slug === 'diploma-of-nursing')!
    const slots = (don.sections ?? []).map((s) => s.slot)
    for (const s of ['overview', 'entry', 'structure', 'careers', 'placements', 'pathways', 'faq', 'fees']) expect(slots).toContain(s)
  })

  it('every course has its school, the qualification courses their level and interest, and the fee text where the page states one', async () => {
    const docs = await all()
    expect(docs.every((d) => d.school)).toBe(true)
    const don = docs.find((d) => d.slug === 'diploma-of-nursing')!
    expect(don.levels?.length).toBe(1)
    expect(don.disciplines?.length).toBe(1)
    expect(don.fees?.displayAmount).toMatch(/^\$[\d,]+$/)
    expect(docs.find((d) => d.slug === 'diploma-of-community-service-to-bachelor-of-social-work')?.universities?.length).toBe(1)
  })

  it('a table inside an accordion body stays a nested table block (DEC-15d)', async () => {
    const docs = await all()
    expect(docs.some((d) => /"blockType":"accordion"[\s\S]*?"blockType":"table"/.test(JSON.stringify(d.sections)))).toBe(true)
  })
})
