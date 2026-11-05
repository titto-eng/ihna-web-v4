/**
 * Step `lookups` (30-import §7.2 step 1). On IHNA: the four lookups of `seeds/ihna-course-groups.json` (`runIhna`, below). On IHM:
 * PROVISIONAL course lookups until the dump's `mwt_*` tables arrive.
 * Derived from what the 26 live course bodies state (`ul.course-basic-details`, `ul.camp-loc`, the pay bar) and from the
 * /courses/ filter UI the theme builds (archive-courses.php:20-70, 112-115: School, delivery-mode tabs, campus, student type).
 * Keyed by the slug of the name. `legacyId` stays empty (the old table ids are in the dump). The collections have no
 * `provisional` field, so the report lists every row as provisional instead. Idempotent: upsert by slug.
 *
 * Run: `npm run import -- lookups [--dry]`
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Payload } from 'payload'
import { INVENTORY_DIR, SITE } from '../lib/config'
import type { ImportContext } from '../lib/context'
import { GROUP_COLLECTIONS, loadGroups } from '../ihna/groups'
import { KNOWN_CAMPUSES, prepareCourseHtml, type CourseFacts } from '../section-mapper'

export const name = 'lookups'
export const order = 30

export type LookupCollection = 'levels' | 'disciplines' | 'campuses' | 'deliveryModes' | 'durations' | 'universities' | 'categories'
export type LookupRow = { collection: LookupCollection; name: string; slug: string; extra?: Record<string, unknown>; sortOrder: number }

export const slugOf = (s: string): string =>
  s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

/** "AQF Level: 07" -> "AQF Level 7" */
export const levelName = (aqf: string): string => `AQF Level ${Number(aqf.replace(/\D/g, ''))}`

export const deliveryName = (text: string): string => (/blended/i.test(text) ? 'Online (Blended)' : /online/i.test(text) ? 'Online' : /campus|face/i.test(text) ? 'On Campus' : text.trim())

/** First duration in the text, as months (the `durations.months` field): weeks / 4.345, years x 12. */
export function durationMonths(text: string): number {
  const y = /(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i.exec(text)
  if (y) return Math.round(Number(y[1]) * 12)
  const m = /(\d+)\s*months?/i.exec(text)
  if (m) return Number(m[1])
  const w = /(\d+)\s*weeks?/i.exec(text)
  return w ? Math.round(Number(w[1]) / 4.345) : 0
}

export const durationName = (text: string): string =>
  text.replace(/\s+/g, ' ').replace(/\s*\*+\s*/g, ' ').trim().replace(/^0(\d)/, '$1')

/** What a course (title + facts) says about its school and discipline. The theme's filter UI lists Schools, not disciplines. */
export const schoolOf = (title: string): string => (/social work/i.test(title) ? 'School of Social Work' : 'School of Nursing')
export const disciplineOf = (title: string): string => (/social work|community service/i.test(title) ? 'Social Work' : 'Nursing')

export function deriveLookups(facts: CourseFacts[]): LookupRow[] {
  const rows = new Map<string, LookupRow>()
  const add = (collection: LookupCollection, n: string, extra?: Record<string, unknown>) => {
    const slug = slugOf(n)
    if (n && slug && !rows.has(`${collection}:${slug}`)) rows.set(`${collection}:${slug}`, { collection, name: n, slug, extra, sortOrder: [...rows.keys()].filter((k) => k.startsWith(collection)).length })
  }
  for (const f of facts) {
    if (f.aqfLevel) add('levels', levelName(f.aqfLevel))
    if (f.deliveryMode) add('deliveryModes', deliveryName(f.deliveryMode))
    if (f.duration) add('durations', durationName(f.duration), { months: durationMonths(f.duration) })
    add('categories', schoolOf(f.title))
    add('disciplines', disciplineOf(f.title))
  }
  for (const c of KNOWN_CAMPUSES) add('campuses', c) // named in the body of a GCAN, MoN, BoN or OSCE page
  return [...rows.values()].sort((a, b) => a.collection.localeCompare(b.collection) || a.sortOrder - b.sortOrder)
}

/** Facts of all 26 course bodies (same parser wp-courses uses). */
export function loadCourseFacts(): CourseFacts[] {
  const courses = JSON.parse(readFileSync(resolve(INVENTORY_DIR, `data/${SITE}/courses.json`), 'utf8')) as { content: string }[]
  return courses.map((c) => prepareCourseHtml(c.content).facts)
}

/** Upsert one lookup by slug; returns its id (undefined in a dry run). */
export async function ensureLookup(ctx: Pick<ImportContext, 'payload' | 'opts' | 'dry'>, row: LookupRow, ids?: Map<string, number>): Promise<{ id?: number; created: boolean }> {
  const key = `${row.collection}:${row.slug}`
  const known = ids?.get(key)
  if (known) return { id: known, created: false }
  const payload: Payload = ctx.payload
  const found = await payload.find({ collection: row.collection, where: { slug: { equals: row.slug } }, limit: 1, depth: 0, ...ctx.opts })
  if (found.docs[0]) {
    ids?.set(key, found.docs[0].id as number)
    return { id: found.docs[0].id as number, created: false }
  }
  if (ctx.dry) return { created: true }
  const doc = await payload.create({
    collection: row.collection,
    data: { name: row.name, slug: row.slug, active: true, sortOrder: row.sortOrder, ...row.extra } as never,
    ...ctx.opts,
  })
  ids?.set(key, doc.id as number)
  return { id: doc.id as number, created: true }
}

/**
 * IHNA: the four lookups of `seeds/ihna-course-groups.json` (schools from the Courses menu, levels and disciplines from the live
 * course finder, the IHM university), keyed by slug, in the seed's order. A row whose name, order, legacyId or detailPath differ
 * from the seed is updated (an `active` switched off in the admin is kept); a second run writes nothing.
 */
async function runIhna(ctx: ImportContext) {
  const groups = loadGroups()
  const byCollection: Record<string, string[]> = {}
  for (const collection of GROUP_COLLECTIONS) {
    const rows = groups[collection]
    byCollection[collection] = rows.map((r) => r.name)
    for (const [i, row] of rows.entries()) {
      if (!ctx.wanted(row.slug, collection)) continue
      try {
        const want: Record<string, unknown> = { name: row.name, sortOrder: i, ...(row.legacyId != null ? { legacyId: row.legacyId } : {}) }
        if (collection === 'universities') want.detailPath = row.detailPath ?? null // categories have no detailPath field
        const found = (await ctx.payload.find({ collection, where: { slug: { equals: row.slug } }, limit: 1, depth: 0, ...ctx.opts })).docs[0] as unknown as Record<string, unknown> | undefined
        if (!found) {
          if (!ctx.dry) await ctx.payload.create({ collection, data: { slug: row.slug, active: true, ...want } as never, ...ctx.opts })
          ctx.report.created++
          continue
        }
        const changed = Object.entries(want).some(([k, v]) => (found[k] ?? null) !== (v ?? null))
        if (!changed) {
          ctx.report.skipped++
          continue
        }
        if (!ctx.dry) await ctx.payload.update({ collection, id: found.id as number, data: want as never, ...ctx.opts })
        ctx.report.updated++
      } catch (e) {
        ctx.report.failed.push({ id: `${collection}:${row.slug}`, reason: e instanceof Error ? e.message : String(e) })
      }
    }
  }
  return {
    source: 'scripts/import/seeds/ihna-course-groups.json',
    lookups: byCollection,
    note: 'deliveryModes, durations and campuses are ensured per course by wp-courses from the page facts',
  }
}

export async function run(ctx: ImportContext) {
  if (SITE === 'ihna') return runIhna(ctx)
  const rows = deriveLookups(loadCourseFacts())
  const ids = new Map<string, number>()
  for (const row of rows) {
    if (!ctx.wanted(row.slug, row.collection)) continue
    try {
      const { created } = await ensureLookup(ctx, row, ids)
      if (created) ctx.report.created++
      else ctx.report.skipped++
    } catch (e) {
      ctx.report.failed.push({ id: `${row.collection}:${row.slug}`, reason: e instanceof Error ? e.message : String(e) })
    }
  }
  const byCollection: Record<string, string[]> = {}
  for (const r of rows) (byCollection[r.collection] ??= []).push(r.name)
  return {
    provisional: true,
    note: 'Provisional lookups derived from the live course HTML and the /courses/ filter UI. The lookup collections have no `provisional` field; replace from the dump (`from-dump/*`) and set legacyId.',
    universities: 'none derivable: no course body names a partner university',
    lookups: byCollection,
  }
}

// `npx tsx scripts/import/steps/lookups.ts [--dry]` without the CLI.
if (process.argv[1]?.endsWith('steps/lookups.ts')) {
  const { runStandalone } = await import('../lib/standalone')
  await runStandalone(name, run)
}
