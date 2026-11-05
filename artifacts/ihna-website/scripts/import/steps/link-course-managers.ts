import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as cheerio from 'cheerio'
import { type WpItem } from '../lib/data'
import { type ImportContext } from '../lib/context'
import { INVENTORY_DIR, SITE } from '../lib/config'

// `link-course-managers`: the old `[CourseManagers]` shortcode listed staff per course (`staff_pages`: staff_id ↔ course post_id, read at render time).
// The WP database is not available, so the only evidence of who manages a course is the course HTML itself:
//   • `section#courseManagers` with literal `.courseManagers-card` markup (5 courses, names + designation), and
//   • `section#courseManagers` holding the bare `[CourseManagers]` shortcode (17 courses): the live site prints the literal text, names unknown.
// Names from the first kind are matched to `staff` docs and written to `staff.courses` (the field the CourseManagers block reads; the
// reverse side, not a second `courses.courseManagers` field). The second kind is reported, never guessed. Re-runs only add links.
export const name = 'link-course-managers'
export const order = 90 // after wp-courses and staff

const HONORIFIC = /^(?:assoc(?:iate)?\.?|asst\.?|assistant|adjunct|emeritus|prof(?:essor)?\.?|dr\.?|mr\.?|mrs\.?|ms\.?|miss)$/i

/** Lowercase name tokens without honorifics and punctuation: "Associate Prof. Helen Almond" → ['helen','almond']. */
export function nameTokens(raw: string): string[] {
  return raw
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z.'\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !HONORIFIC.test(t))
    .map((t) => t.replace(/[.']/g, '').toLowerCase())
    .filter(Boolean)
}

export type StaffRef = { id: number | string; name: string }
export type Match = { staff: StaffRef | null; how: 'exact' | 'first-last' | 'none' | 'ambiguous'; candidates?: string[] }

/** Exact token match first; else same first and last token (drops middle names: "Helen Mary Almond" = "Helen Almond"). */
export function matchStaff(name: string, staff: StaffRef[]): Match {
  const t = nameTokens(name)
  if (!t.length) return { staff: null, how: 'none' }
  const key = t.join(' ')
  const exact = staff.filter((s) => nameTokens(s.name).join(' ') === key)
  if (exact.length === 1) return { staff: exact[0], how: 'exact' }
  if (exact.length > 1) return { staff: null, how: 'ambiguous', candidates: exact.map((s) => s.name) }
  if (t.length < 2) return { staff: null, how: 'none' }
  const fl = staff.filter((s) => {
    const st = nameTokens(s.name)
    return st.length >= 2 && st[0] === t[0] && st[st.length - 1] === t[t.length - 1]
  })
  if (fl.length === 1) return { staff: fl[0], how: 'first-last' }
  if (fl.length > 1) return { staff: null, how: 'ambiguous', candidates: fl.map((s) => s.name) }
  return { staff: null, how: 'none' }
}

export type CourseManagersSource = { kind: 'cards'; names: string[] } | { kind: 'shortcode' } | { kind: 'empty' } | { kind: 'absent' }

/** What the course HTML says about its managers. */
export function readManagersSection(html: string): CourseManagersSource {
  if (!/id=["']courseManagers["']/.test(html)) return { kind: 'absent' }
  const $ = cheerio.load(html)
  const section = $('section#courseManagers').first()
  const names = section
    .find('.cmCard .name-info')
    .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
    .get()
    .filter(Boolean)
  if (names.length) return { kind: 'cards', names }
  return /\[CourseManagers\]/i.test(section.text()) ? { kind: 'shortcode' } : { kind: 'empty' }
}

type ManualMap = Record<string, string[]>

export async function run(ctx: ImportContext) {
  const { payload, report } = ctx
  const mapFile = typeof ctx.args.flags.map === 'string' ? resolve(ctx.args.flags.map) : null
  const manual: ManualMap = mapFile ? (JSON.parse(readFileSync(mapFile, 'utf8')) as ManualMap) : {}
  const courses = JSON.parse(readFileSync(resolve(INVENTORY_DIR, `data/${SITE}/courses.json`), 'utf8')) as WpItem[]

  const staffAll = (await payload.find({ collection: 'staff', limit: 0, pagination: false, depth: 0, overrideAccess: true, draft: true })).docs
  const staff: StaffRef[] = staffAll.map((s) => ({ id: s.id, name: s.name }))
  const linked = new Map<string, Set<string>>() // staff id → course ids (merged with what already exists)
  for (const s of staffAll) linked.set(String(s.id), new Set(((s.courses as (number | { id: number })[] | null | undefined) ?? []).map((c) => String(typeof c === 'object' ? c.id : c))))

  const matched: { course: string; name: string; staff: string; how: string }[] = []
  const unmatched: { course: string; name: string; why: string }[] = []
  const unresolvedShortcode: string[] = []
  let alreadyLinked = 0
  const touched = new Set<string>()

  for (const c of courses) {
    if (!ctx.wanted(c.id, c.slug)) continue
    const src = manual[c.slug] ? ({ kind: 'cards', names: manual[c.slug] } as const) : readManagersSection(c.content ?? '')
    if (src.kind === 'shortcode') {
      unresolvedShortcode.push(c.slug)
      continue
    }
    if (src.kind !== 'cards') continue
    const doc = (await payload.find({ collection: 'courses', where: { slug: { equals: c.slug } }, limit: 1, depth: 0, overrideAccess: true, draft: true })).docs[0]
    if (!doc) {
      for (const n of src.names) unmatched.push({ course: c.slug, name: n, why: 'course-doc-missing' })
      continue
    }
    for (const n of src.names) {
      const m = matchStaff(n, staff)
      if (!m.staff) {
        unmatched.push({ course: c.slug, name: n, why: m.how === 'ambiguous' ? `ambiguous: ${m.candidates?.join(' | ')}` : 'no-staff-doc' })
        continue
      }
      const set = linked.get(String(m.staff.id)) ?? new Set<string>()
      if (set.has(String(doc.id))) alreadyLinked++
      else {
        set.add(String(doc.id))
        linked.set(String(m.staff.id), set)
        touched.add(String(m.staff.id))
      }
      matched.push({ course: c.slug, name: n, staff: m.staff.name, how: m.how })
    }
  }

  for (const id of touched) {
    if (!ctx.dry) {
      await payload.update({ collection: 'staff', id, data: { courses: [...(linked.get(id) ?? [])].map(Number) }, ...ctx.opts })
    }
    report.updated++
  }
  report.skipped += alreadyLinked
  for (const u of unmatched) report.reviewQueue.push({ id: u.course, reasons: [`unmatched-manager: ${u.name} (${u.why})`] })
  for (const slug of unresolvedShortcode) report.reviewQueue.push({ id: slug, reasons: ['shortcode-only: names live in the WP `staff_pages` table (no dump); link in /admin or pass --map=file.json'] })
  ctx.log(`${matched.length} matched, ${unmatched.length} unmatched, ${unresolvedShortcode.length} courses with a bare [CourseManagers] shortcode`)
  return { matched, unmatched, unresolvedShortcode, alreadyLinked }
}
