/**
 * Step `documents`: turns the static PDF stores in public/ (copied by the `static` step; the folders are `DOCUMENT_STORES` in
 * seeds/documents.ts) into `documents` rows, one per file, with `publicPath` = its public URL, so marketing can replace a file in
 * the admin and the URL keeps serving (src/app/(site)/pdf/serve.ts).
 *
 * - Skips paths in seeds/static-held.json (DEC-32: gone stays gone) and the old names in DOCUMENT_ALIASES (they serve the aliased
 *   document). An alias whose target has no file of its own is imported FROM the old name.
 * - category/audience from the folder (`DOCUMENT_FOLDERS` in the seed; 'by-name' folders and loose files use `categoryFromName`).
 * - title = the link text on the site's policies page (`PAGE_LINKS`, `FORM_TITLES` in the seed), else the cleaned file name.
 *   `listings` (tab + order) come from PAGE_LINKS, keeping the page's order.
 * - Idempotent on publicPath: a missing row is created with its file; an existing row gets its title/category/audience/listings
 *   refreshed when they differ, and its FILE IS NEVER REPLACED unless `--force` (a file marketing replaced stays replaced).
 * Run: `npm run import -- documents [--dry] [--force] [--only=/pdf/X.pdf,...]`
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, posix, relative, resolve } from 'node:path'
import { DOCUMENT_ALIASES, type DocumentSection } from '../../../src/collections/Documents'
import { DEV_SITE_URL, ROOT } from '../lib/config'
import type { ImportContext } from '../lib/context'
import { DOCUMENT_FOLDERS, DOCUMENT_STORES, FORM_TITLES, PAGE_LINKS } from '../seeds/documents'

export const name = 'documents'
export const order = 110 // after `static` (100): the files it imports are the ones static copies into public/

const PUBLIC = resolve(ROOT, 'public')

export { PAGE_LINKS }

type Category = 'policy' | 'procedure' | 'staff-policy' | 'form' | 'guide' | 'handbook' | 'brochure' | 'other'
type Audience = 'students' | 'staff' | 'public'

/** Category from the name alone (loose files and the smaller folders). */
export function categoryFromName(file: string): Category {
  const n = file.toLowerCase()
  if (/handbook|(^|[^a-z])shb([^a-z]|$)/.test(n)) return 'handbook'
  if (/how-do-i|what-documents/.test(n)) return 'guide'
  if (/(^|[^a-z])form([^a-z]|$)|application|checklist|declaration|access_plan/.test(n)) return 'form'
  if (/procedure/.test(n)) return 'procedure'
  if (/polic(y|ies)|framework|terms_of_reference|_tor\b|constitution/.test(n)) return 'policy'
  if (/guide|guideline|referenc|glossary|faq|_qa\b|how-do-i|what-documents|process|requirement|competency|fee_help|prospectus|profile|information/.test(n)) return 'guide'
  return 'other'
}

/** category + audience for a public path (decoded, leading slash): the seed's folder rules, else the file name. */
export function classify(publicPath: string): { category: Category; audience: Audience } {
  const file = posix.basename(publicPath)
  const folder = DOCUMENT_FOLDERS.find(([prefix]) => publicPath.startsWith(prefix))
  if (folder) return { category: folder[1] === 'by-name' ? categoryFromName(file) : folder[1], audience: folder[2] }
  return { category: categoryFromName(file), audience: 'public' }
}

/** `Student_Code-of Conduct.pdf` → `Student Code of Conduct`. */
export const titleFromFile = (publicPath: string): string =>
  posix.basename(publicPath).replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim() || publicPath

function walk(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith('.')) return []
    const p = join(dir, e.name)
    return e.isDirectory() ? walk(p) : e.isFile() ? [p] : []
  })
}

export type Planned = {
  publicPath: string
  source: string
  title: string
  category: Category
  audience: Audience
  listings: { section: DocumentSection; order: number }[]
}

/** What the step would write, from the files on disk. Pure apart from reading the directory tree. */
export function plan(publicDir = PUBLIC, held: Set<string> = loadHeld()): { planned: Planned[]; skipped: { path: string; reason: string }[] } {
  const files = new Map<string, string>() // public path → absolute file
  for (const s of DOCUMENT_STORES) for (const f of walk(join(publicDir, s))) {
    if (!/\.pdf$/i.test(f)) continue
    files.set('/' + relative(publicDir, f).split('\\').join('/'), f)
  }
  const skipped: { path: string; reason: string }[] = []
  for (const [from, to] of Object.entries(DOCUMENT_ALIASES)) {
    const src = files.get(from)
    if (!src) continue
    files.delete(from)
    if (files.has(to)) skipped.push({ path: from, reason: `alias of ${to} (served from that document)` })
    else {
      files.set(to, src)
      skipped.push({ path: from, reason: `imported as ${to}; the old URL is an alias` })
    }
  }

  const titles = new Map<string, string>(Object.entries(FORM_TITLES))
  const listings = new Map<string, Planned['listings']>()
  const positions: Partial<Record<DocumentSection, number>> = {}
  for (const [section, href, label] of PAGE_LINKS) {
    if (!titles.has(href)) titles.set(href, label)
    const order = (positions[section] = (positions[section] ?? 0) + 10)
    const list = listings.get(href) ?? []
    if (!list.some((l) => l.section === section)) list.push({ section, order })
    listings.set(href, list)
  }

  const planned: Planned[] = []
  for (const [publicPath, source] of [...files].sort(([a], [b]) => a.localeCompare(b))) {
    if (held.has(publicPath)) {
      skipped.push({ path: publicPath, reason: 'held: 404 on production (static-held.json)' })
      continue
    }
    planned.push({ publicPath, source, title: titles.get(publicPath) ?? titleFromFile(publicPath), ...classify(publicPath), listings: listings.get(publicPath) ?? [] })
  }
  return { planned, skipped }
}

function loadHeld(): Set<string> {
  const p = resolve(ROOT, 'scripts/import/seeds/static-held.json')
  return new Set(existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as { paths: string[] }).paths : [])
}

const sameListings = (a: Planned['listings'], b: { section?: string | null; order?: number | null }[] | null | undefined) =>
  JSON.stringify(a.map((l) => [l.section, l.order])) === JSON.stringify((b ?? []).map((l) => [l.section, Number(l.order ?? 0)]))

export async function run(ctx: ImportContext) {
  const { payload, report } = ctx
  const { planned, skipped } = plan()
  const missingLinks = PAGE_LINKS.map(([, href]) => href).filter((h, i, all) => all.indexOf(h) === i && !planned.some((p) => p.publicPath === h))
  for (const s of skipped) ctx.log(`skip ${s.path}: ${s.reason}`)
  report.skipped += skipped.length
  const byCategory: Record<string, number> = {}

  for (const p of planned) {
    if (!ctx.wanted(p.publicPath)) continue
    byCategory[p.category] = (byCategory[p.category] ?? 0) + 1
    const data = { title: p.title, category: p.category, audience: p.audience, publicPath: p.publicPath, listings: p.listings }
    try {
      const existing = (
        await payload.find({ collection: 'documents', where: { publicPath: { equals: p.publicPath } }, limit: 1, depth: 0, pagination: false, overrideAccess: true })
      ).docs[0]
      if (ctx.dry) {
        if (existing) report.updated++
        else report.created++
        continue
      }
      if (!existing) {
        await payload.create({ collection: 'documents', data, filePath: p.source, ...ctx.opts })
        report.created++
      } else if (ctx.args.force) {
        await payload.update({ collection: 'documents', id: existing.id, data, filePath: p.source, overwriteExistingFiles: true, ...ctx.opts })
        report.updated++
      } else if (
        existing.title !== p.title ||
        existing.category !== p.category ||
        existing.audience !== p.audience ||
        !sameListings(p.listings, existing.listings)
      ) {
        await payload.update({ collection: 'documents', id: existing.id, data: { title: p.title, category: p.category, audience: p.audience, listings: p.listings }, ...ctx.opts })
        report.updated++
      } else report.skipped++
    } catch (e) {
      report.failed.push({ id: p.publicPath, reason: e instanceof Error ? e.message : String(e) })
    }
  }

  if (!ctx.dry) await revalidateDocuments(ctx)
  return { planned: planned.length, byCategory, skippedList: skipped, pageLinksWithoutFile: missingLinks }
}

/** Imports skip the collection hooks (context.importing), so tell the running site to drop the `documents` cache tag. */
async function revalidateDocuments(ctx: ImportContext) {
  const secret = process.env.REVALIDATE_SECRET
  const base = process.env.NEXT_PUBLIC_SITE_URL || DEV_SITE_URL
  if (!secret) return ctx.log('REVALIDATE_SECRET not set; documents cache not cleared')
  try {
    const res = await fetch(`${base}/api/revalidate/`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ tags: ['documents', 'collection:documents'] }),
      signal: AbortSignal.timeout(10_000),
    })
    ctx.log(`documents cache tag cleared: ${res.status}`)
  } catch {
    ctx.log(`site not reachable at ${base}; documents cache not cleared`)
  }
}
