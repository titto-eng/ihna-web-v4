/**
 * Step `course-live` (IHNA, 30-import §7.4, DEC-8): reads each live course page once (GET, at most one request per second) for what
 * the WordPress REST body does not carry:
 *   - `khId`: the portal course id, the hidden `course_id` field of the page's brochure/handbook form (`form#brchHndbk_enquiry`,
 *     single-courses.php:271, value = postmeta `kh_id`), else the quick-enquiry form's `input#course` (same postmeta). The feedback
 *     form's `course_id` is the WordPress post id and is never read. Both empty = `unresolved` (the postmeta is not set);
 *   - `heroImage`: the featured image (`og:image`), a wp-content/uploads path that the `media` step imports.
 * Writes `out/ihna-course-live.json` (slug -> { khId, heroImage, status }), which `media`, `wp-courses` and `assign-images` read
 * offline; pages are cached in `out/cache/live-courses/` (not committed). A page with no field is recorded `unresolved`.
 * IHM has no such step (its kh_ids come from the theme evidence in kh-id.ts): on another site it does nothing.
 *
 * Run: `npm run import -- course-live [--offline] [--refresh] [--only=<slug>]`
 *   --offline  use the cache only     --refresh  re-fetch cached pages
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as cheerio from 'cheerio'
import { CACHE_DIR, INVENTORY_DIR, LEGACY_BASE_URL, OUT_DIR, SITE } from '../lib/config'
import { normaliseLegacyPath, type ImportContext } from '../lib/context'
import { pathOf } from '../lib/data'

export const name = 'course-live'
export const order = 15

export const COURSE_LIVE_PATH = resolve(OUT_DIR, `${SITE}-course-live.json`)
const PAGE_CACHE = resolve(CACHE_DIR, 'live-courses')

export type CourseLive = {
  path: string
  khId: number | null
  /** Where the id was read: `brochure-form`, `form` (the quick-enquiry form's `#course` field), or null (both empty). */
  khSource: 'brochure-form' | 'form' | null
  /** legacyPath of the featured image (wp-content/uploads/...), or null. */
  heroImage: string | null
  status: 'resolved' | 'unresolved' | 'fetch-failed'
  fetchedAt: string | null
}
export type CourseLiveFile = { generatedAt: string; source: string; courses: Record<string, CourseLive> }

export function loadCourseLive(): Record<string, CourseLive> {
  if (!existsSync(COURSE_LIVE_PATH)) return {}
  return (JSON.parse(readFileSync(COURSE_LIVE_PATH, 'utf8')) as CourseLiveFile).courses ?? {}
}

/** Pure: what one live course page says. */
export function parseCoursePage(html: string): Pick<CourseLive, 'khId' | 'khSource' | 'heroImage'> {
  const $ = cheerio.load(html)
  const num = (v: string | undefined) => (v && /^\d+$/.test(v.trim()) ? Number(v.trim()) : null)
  const fromBrochure = num($('form#brchHndbk_enquiry input[name="course_id"]').attr('value'))
  // the quick-enquiry form's `#course` field carries the same postmeta; `form#feed_enquiry` carries the WP post id (not a kh_id)
  const anyField = $('form#enquiry input[name="course_id"], input#course[name="course_id"]').toArray().map((i) => num($(i).attr('value'))).find((v) => v != null) ?? null
  const og = $('meta[property="og:image"]').attr('content') ?? ''
  const hero = /\/wp-content\/uploads\//.test(og) ? normaliseLegacyPath(og) : null
  return { khId: fromBrochure ?? anyField, khSource: fromBrochure != null ? 'brochure-form' : anyField != null ? 'form' : null, heroImage: hero }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function run(ctx: ImportContext) {
  if (SITE !== 'ihna') return { note: `no live course scrape on ${SITE}` }
  const offline = Boolean(ctx.args.flags.offline)
  const refresh = Boolean(ctx.args.flags.refresh)
  const courses = JSON.parse(readFileSync(resolve(INVENTORY_DIR, `data/${SITE}/courses.json`), 'utf8')) as { id: number; slug: string; link: string }[]
  const previous = loadCourseLive()
  const out: Record<string, CourseLive> = { ...previous }
  mkdirSync(PAGE_CACHE, { recursive: true })
  let fetched = 0
  for (const c of courses) {
    const path = pathOf(c.link)
    if (!ctx.wanted(c.id, c.slug, path)) continue
    const file = resolve(PAGE_CACHE, `${c.slug}.html`)
    let html: string | null = existsSync(file) && !refresh ? readFileSync(file, 'utf8') : null
    if (!html && !offline) {
      if (fetched) await sleep(1100) // at most one request per second (AGENTS.md)
      fetched++
      try {
        const res = await fetch(`${LEGACY_BASE_URL}${path}`, { headers: { 'user-agent': 'ihna-web-import/1.0' }, signal: AbortSignal.timeout(30_000) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        html = await res.text()
        writeFileSync(file, html)
      } catch (e) {
        ctx.report.failed.push({ id: c.slug, reason: e instanceof Error ? e.message : String(e) })
      }
    }
    if (!html) {
      out[c.slug] = previous[c.slug] ?? { path, khId: null, khSource: null, heroImage: null, status: 'fetch-failed', fetchedAt: null }
      continue
    }
    const parsed = parseCoursePage(html)
    const next: CourseLive = { path, ...parsed, status: parsed.khId != null ? 'resolved' : 'unresolved', fetchedAt: previous[c.slug]?.fetchedAt && !refresh && existsSync(file) ? previous[c.slug].fetchedAt : new Date().toISOString() }
    const same = JSON.stringify({ ...previous[c.slug], fetchedAt: null }) === JSON.stringify({ ...next, fetchedAt: null })
    if (same) ctx.report.skipped++
    else if (previous[c.slug]) ctx.report.updated++
    else ctx.report.created++
    out[c.slug] = same ? previous[c.slug] : next
  }
  if (!ctx.dry) {
    mkdirSync(OUT_DIR, { recursive: true })
    const file: CourseLiveFile = { generatedAt: new Date().toISOString(), source: `${LEGACY_BASE_URL}/courses/<slug>/ (GET, cached in out/cache/live-courses/)`, courses: out }
    writeFileSync(COURSE_LIVE_PATH, JSON.stringify(file, null, 2) + '\n')
  }
  const rows = Object.entries(out)
  for (const [slug, r] of rows) if (r.status !== 'resolved') ctx.report.reviewQueue.push({ id: slug, path: r.path, reasons: [`kh-${r.status}`] })
  return {
    fetched,
    resolved: rows.filter(([, r]) => r.status === 'resolved').length,
    unresolved: rows.filter(([, r]) => r.status !== 'resolved').map(([slug]) => slug),
    withHero: rows.filter(([, r]) => r.heroImage).length,
    khIds: Object.fromEntries(rows.map(([slug, r]) => [slug, r.khId])),
  }
}
