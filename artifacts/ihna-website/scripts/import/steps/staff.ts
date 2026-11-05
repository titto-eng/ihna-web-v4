import type { ImportContext } from '../lib/context'
import { assertNoLegacyMarkup } from '../lib/assert-clean'
import { decodeTitle, loadPageRows, loadPages, pathOf, type WpItem } from '../lib/data'
import { fingerprint } from '../lib/hash'
import { parseStaffPage, type StaffProfile } from '../lib/staff-parse'
import { SITE } from '../lib/config'
import { runIhnaStaff } from '../ihna/staff'

// `staff` (IHNA: `runIhnaStaff`, profiles keyed by `legacyId`, DEC-111). IHM: the 52 profile pages → 51 `staff` docs (DEC-9: /dr-md-parves-sultan/ and its `-2/` twin share one doc); the old profile
// URLs are code (src/content/staff-paths.ts). Emails and phones are never stored. A doc whose stored fields equal the parsed
// profile is skipped (`staffUnchanged`), so a re-run writes nothing; `--force` rewrites every matched doc.
export const name = 'staff'
export const order = 50

/** The 5 pages the selectors are validated on before anything is written (30-import §7.2 step 4). */
export const VALIDATION_SAMPLES = ['/annie-chang/', '/dr-abhishek-sharma/', '/ambika-achanta/', '/dr-priyanka-malaiyappan/', '/dr-bindu-k-abraham/']
const LISTS = ['research', 'grants', 'activities', 'supervision'] as const

type Group = { key: string; primary: WpItem; pages: WpItem[] }

/** `…-2/` joins the page of the same person when that page exists (DEC-9). */
export function groupPages(pages: WpItem[]): Group[] {
  const bySlug = new Map(pages.map((p) => [pathOf(p.link), p]))
  const groups = new Map<string, Group>()
  for (const p of [...pages].sort((a, b) => a.id - b.id)) {
    const path = pathOf(p.link)
    const base = path.replace(/-2\/$/, '/')
    const baseKey = bySlug.has(base) && base !== path ? base : path
    const g = groups.get(baseKey) ?? { key: baseKey, primary: bySlug.get(baseKey) ?? p, pages: [] }
    g.pages.push(p)
    groups.set(baseKey, g)
  }
  return [...groups.values()]
}

/** Hand-checkable facts about the 5 sample pages. Returns the list of problems (empty = selectors are good). */
export function validateSamples(pages: WpItem[]): string[] {
  const problems: string[] = []
  for (const path of VALIDATION_SAMPLES) {
    const page = pages.find((p) => pathOf(p.link) === path)
    if (!page?.content) {
      problems.push(`${path}: page not found`)
      continue
    }
    const s = parseStaffPage(page.content, decodeTitle(page.title.rendered))
    if (!s.name || s.nameFromFallback) problems.push(`${path}: name not found with .personal-details-box .details h4`)
    if (!s.position) problems.push(`${path}: position (p.designation-text) is empty`)
    if (!s.bio) problems.push(`${path}: bio (#about .details-container) is empty`)
    if (!s.photoSrc) problems.push(`${path}: photo (.profile-img-box img) not found`)
    if (s.variant === 'script') for (const k of LISTS) if (s[k].length !== s.sourceCounts[k]) problems.push(`${path}: ${k} has ${s[k].length} rows, source has ${s.sourceCounts[k]}`)
    if (path === '/ambika-achanta/' && LISTS.some((k) => s[k].length === 0) === false) problems.push(`${path}: expected at least one empty array`)
    if (path === '/dr-priyanka-malaiyappan/' && s.supervision.length !== 0) problems.push(`${path}: expected no supervision rows`)
    if (path === '/dr-bindu-k-abraham/' && (s.variant !== 'static' || s.research.length < 5)) problems.push(`${path}: expected the static variant with research boxes`)
  }
  return problems
}

const staffFields = (s: StaffProfile) => ({
  name: s.name, position: s.position, postNominals: s.postNominals, bio: s.bio, linkedin: s.linkedin, googleScholar: s.googleScholar, orcid: s.orcid,
  research: s.research, grants: s.grants, activities: s.activities, supervision: s.supervision,
})

/** Everything the step writes for one person. */
export type StaffData = ReturnType<typeof staffFields> & { slug: string; legacyId: number; active: boolean }
const WRITTEN_KEYS = ['name', 'position', 'postNominals', 'bio', 'linkedin', 'googleScholar', 'orcid', 'research', 'grants', 'activities', 'supervision', 'slug', 'legacyId', 'active'] as const satisfies readonly (keyof StaffData)[]

/**
 * True when the stored doc already holds what the step would write, so the write is skipped. `fingerprint` (lib/hash.ts) runs on the
 * written keys of both sides: it drops row ids, nulls, empty strings and empty arrays, which Payload adds on save, so an untouched doc
 * hashes like the parsed profile and any changed text, link or row (from the source or from an admin edit) does not. A draft is never
 * "unchanged": the step publishes.
 */
export function staffUnchanged(existing: Record<string, unknown> | undefined, data: StaffData): boolean {
  if (!existing || existing._status !== 'published') return false
  const pick = (o: Record<string, unknown>) => Object.fromEntries(WRITTEN_KEYS.map((k) => [k, o[k]]))
  return fingerprint(pick(existing)) === fingerprint(pick(data))
}

export async function run(ctx: ImportContext) {
  // IHNA's staff are not WordPress pages: scripts/import/ihna/staff.ts reads the live directory and profile pages
  if (SITE === 'ihna') return runIhnaStaff(ctx)
  const { payload, report } = ctx
  const rows = loadPageRows().filter((r) => r.wp_type === 'page' && r.suggested_page_type === 'staff-profile')
  const ids = new Set(rows.map((r) => r.wp_id))
  const pages = loadPages().filter((p) => ids.has(String(p.id)))

  const problems = validateSamples(pages)
  report.validation = { samples: VALIDATION_SAMPLES, problems }
  if (problems.length) throw new Error(`selector validation failed on the sample pages:\n${problems.join('\n')}`)

  const groups = groupPages(pages).filter((g) => g.pages.some((p) => ctx.wanted(p.id, pathOf(p.link))))
  const totals = { staffDocs: 0, pageDocs: 0, script: 0, static: 0, arrays: { research: 0, grants: 0, activities: 0, supervision: 0 }, personalContactsDropped: 0, photosPendingThemeAsset: 0, countMismatches: 0 }

  for (const g of groups) {
    try {
      const profile = parseStaffPage(g.primary.content ?? '', decodeTitle(g.primary.title.rendered))
      totals[profile.variant]++
      totals.personalContactsDropped += profile.personalContactsDropped
      if (profile.photoSrc && /\/wp-content\/themes\//.test(profile.photoSrc)) totals.photosPendingThemeAsset++
      for (const k of LISTS) totals.arrays[k] += profile[k].length

      const reasons: string[] = []
      if (profile.nameFromFallback) reasons.push('name-from-page-title')
      if (!profile.bio) reasons.push('empty-bio')
      if (profile.variant === 'script') {
        for (const k of LISTS) if (profile[k].length !== profile.sourceCounts[k]) {
          reasons.push(`${k}-count-mismatch`)
          totals.countMismatches++
        }
      }
      const data: StaffData = { ...staffFields(profile), slug: g.key.split('/').filter(Boolean).pop() as string, legacyId: g.primary.id, active: true }
      assertNoLegacyMarkup(data, `staff/${g.primary.id}`)

      const existing = (await payload.find({ collection: 'staff', where: { legacyId: { equals: g.primary.id } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as unknown as Record<string, unknown> | undefined
      totals.staffDocs++
      if (reasons.length) report.reviewQueue.push({ id: g.primary.id, path: g.key, reasons })
      if (!ctx.args.force && staffUnchanged(existing, data)) {
        report.skipped++
        continue
      }

      if (!ctx.dry) {
        if (existing) await payload.update({ collection: 'staff', id: existing.id as number, data: { ...data, _status: 'published' }, ...ctx.opts })
        else await payload.create({ collection: 'staff', data: { ...data, _status: 'published' }, ...ctx.opts })
      }
      if (existing) report.updated++
      else report.created++
    } catch (e) {
      report.failed.push({ id: g.primary.id, reason: e instanceof Error ? e.message : String(e) })
    }
  }
  return { people: groups.length, pages: pages.length, ...totals }
}

