/**
 * Step `link-course-brochures` (DEC-69): sets `courses.brochure` to the `documents` row (category `brochure`) that holds the course's
 * brochure PDF. Runs after `documents` (another step imports the PDFs); safe to re-run at any time.
 *   1. candidates, in order: the course's `brochureUrl` when it is a path on this site (normalised like a document path, through
 *      `DOCUMENT_ALIASES`), then the site's own brochure PDF for the course (`brochurePdf` in seeds/ihna-course-groups.json on IHNA);
 *   2. the first candidate that is a `documents.publicPath` wins: that row gets category `brochure` (so the course picker accepts
 *      it) and the course gets `brochure` = that row; `brochureUrl` stays as the legacy fallback;
 *   3. a course whose `brochure` is set is `already` (marketing's pick wins); one with a newer unpublished draft is `draft-pending`;
 *      an external `brochureUrl` (a FlipHTML5 viewer) with no document is `external`; nothing found is `unmatched`.
 * IHNA: no brochure PDF answers on the live site (`/brochures-new/` and `/brochures/` are 404, brief-nav-redirects-static), so every
 * course stays on its FlipHTML5 `brochureUrl` until a PDF is uploaded to `documents` at one of the candidate paths.
 *
 * Run: `npm run import -- link-course-brochures [--dry] [--only=<slug>]`
 */
import { existsSync } from 'node:fs'
import { DOCUMENT_ALIASES, normalisePublicPath } from '../../../src/collections/Documents'
import { LEGACY_BASE_URL, SITE } from '../lib/config'
import type { ImportContext } from '../lib/context'
import { GROUPS_PATH, loadGroups } from '../ihna/groups'

export const name = 'link-course-brochures'
export const order = 95

type Status = 'linked' | 'already' | 'unmatched' | 'draft-pending' | 'external' | 'no-brochure'

const ownHosts = [new URL(LEGACY_BASE_URL).hostname.replace(/^www\./, ''), SITE === 'ihm' ? 'ihm.edu.au' : null].filter(Boolean) as string[]
const isExternal = (url: string) => {
  if (!/^https?:\/\//i.test(url)) return false
  try {
    return !ownHosts.includes(new URL(url).hostname.replace(/^www\./, ''))
  } catch {
    return true
  }
}

/** Pure: the document paths to look for, in order. */
export function brochureCandidates(course: { brochureUrl?: string | null }, sitePdf?: string | null): string[] {
  const out: string[] = []
  const url = (course.brochureUrl ?? '').trim()
  if (url && !isExternal(url)) {
    const p = normalisePublicPath(url)
    out.push(DOCUMENT_ALIASES[p] ?? p)
  }
  if (sitePdf) out.push(DOCUMENT_ALIASES[sitePdf] ?? sitePdf)
  return [...new Set(out)]
}

export async function run(ctx: ImportContext) {
  const { payload, report } = ctx
  const sitePdfs: Record<string, string> =
    SITE === 'ihna' && existsSync(GROUPS_PATH)
      ? Object.fromEntries(Object.entries(loadGroups().courses).flatMap(([slug, g]) => (g.brochurePdf ? [[slug, g.brochurePdf]] : [])))
      : {}
  const { docs: courses } = await payload.find({ collection: 'courses', depth: 0, limit: 0, pagination: false, sort: 'slug', draft: false, ...ctx.opts })
  const rows: { slug: string; status: Status; candidates: string[]; documentId?: number }[] = []
  const recategorised = new Set<number>()

  for (const course of courses) {
    if (!ctx.wanted(course.slug, course.id)) continue
    const candidates = brochureCandidates(course, sitePdfs[course.slug])
    const row: (typeof rows)[number] = { slug: course.slug, status: 'unmatched', candidates }
    rows.push(row)
    if (course.brochure) {
      row.status = 'already'
      row.documentId = typeof course.brochure === 'object' ? course.brochure.id : course.brochure
      report.skipped++
      continue
    }
    let doc: { id: number; category?: string | null } | undefined
    for (const publicPath of candidates) {
      doc = (await payload.find({ collection: 'documents', where: { publicPath: { equals: publicPath } }, depth: 0, limit: 1, ...ctx.opts })).docs[0]
      if (doc) break
    }
    if (!doc) {
      row.status = course.brochureUrl ? (isExternal(course.brochureUrl) ? 'external' : 'unmatched') : candidates.length ? 'unmatched' : 'no-brochure'
      report.skipped++
      continue
    }
    row.documentId = doc.id
    const latest = await payload.findVersions({ collection: 'courses', where: { parent: { equals: course.id } }, sort: '-updatedAt', limit: 1, depth: 0, ...ctx.opts })
    if (latest.docs[0]?.version?._status === 'draft') {
      row.status = 'draft-pending'
      report.skipped++
      report.reviewQueue.push({ id: course.slug, path: course.path ?? undefined, reasons: ['brochure: newer draft exists, set it on the draft by hand'] })
      continue
    }
    row.status = 'linked'
    report.updated++
    if (ctx.dry) continue
    if (doc.category !== 'brochure' && !recategorised.has(doc.id)) {
      await payload.update({ collection: 'documents', id: doc.id, data: { category: 'brochure' }, depth: 0, ...ctx.opts })
      recategorised.add(doc.id)
    }
    await payload.update({ collection: 'courses', id: course.id, data: { brochure: doc.id } as never, draft: false, depth: 0, ...ctx.opts })
  }
  const count = (s: Status) => rows.filter((r) => r.status === s).length
  return {
    summary: { courses: rows.length, linked: count('linked'), already: count('already'), external: count('external'), unmatched: count('unmatched'), noBrochure: count('no-brochure'), draftPending: count('draft-pending'), documentsRecategorised: recategorised.size },
    rows,
  }
}
