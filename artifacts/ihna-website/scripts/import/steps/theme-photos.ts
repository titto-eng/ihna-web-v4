import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, extname, join, relative, resolve } from 'node:path'
import pLimit from 'p-limit'
import sharp from 'sharp'
import { CACHE_DIR, CONCURRENCY, INVENTORY_DIR, LEGACY_BASE_URL, OUT_DIR, SITE } from '../lib/config'
import type { ImportContext } from '../lib/context'
import { loadPageRows, loadPages } from '../lib/data'
import {
  MAX_IMPORT_SIDE, THEME_ASSETS_DIR, THEME_LEGACY_PREFIX, UPLOADS_DIR, classify, dedupe, legacyPathOf, type HashedFile, type SkipReason,
} from '../lib/images-select'
import { imageRefs } from '../lib/images-plan'
import { isPlaceholderSrc, loadStaffRefs, matchByName, matchLocal, samePerson, themeRelOf, type StaffRef } from '../lib/images-staff'

// `theme-photos`: the site's own photography from the old theme (campuses, students, staff) goes into `media` once each (IHNA: only
// the theme photographs a course or page body shows; its theme folder is otherwise decoration), with
// legacyPath = `wp-content/themes/mwt-ihm/assets/<path>`. Rules live in lib/images-select.ts. Staff portraits are imported only for the
// people whose profile page used the file (the repo copy of the theme lacks about half of them, so those are GET from the live site
// unless --offline). Files under uploads/ are imported only when a course or staff page references them.
//   --offline   never touch the network      --limit=N   import at most N files (smoke runs)
export const name = 'theme-photos'
export const order = 21

export const THEME_PHOTOS_MAP_PATH = resolve(OUT_DIR, `${SITE}-theme-photos-map.json`)
export type ThemePhotosMap = {
  generatedAt: string
  /** legacyPath -> media id, for every media doc this step owns or found already present. */
  map: Record<string, number>
  /** legacyPath of a dropped duplicate -> legacyPath that was kept. */
  aliases: Record<string, string>
  /** legacyPaths that are photographs of one person: never used as a course or campus picture. */
  portraits: string[]
  /** staff slug -> the portrait chosen and how it was found. */
  staff: Record<string, { legacyPath: string; method: string } | null>
  /** Name on a board / executive card of /our-people/ (people who are not staff docs) -> portrait found by full name. */
  people: Record<string, string | null>
}

type Source = { rel: string; file: string; legacy: string; width: number; height: number; staffName?: string; slug?: string; method?: string }

const IMG = /\.(jpe?g|png|webp)$/i
const SKIP_DIRS = new Set(['css', 'js', 'fonts', 'scripts', 'docs', 'bootstrap/css', 'bootstrap/js', 'bootstrap/fonts'])

function walk(dir: string, root = dir, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(relative(root, p))) walk(p, root, out)
    } else out.push(relative(root, p))
  }
  return out
}

/** Pixel size after EXIF rotation. */
async function sizeOf(file: string | Buffer): Promise<{ width: number; height: number } | null> {
  try {
    const m = await sharp(file, { failOn: 'none' }).metadata()
    if (!m.width || !m.height) return null
    return (m.orientation ?? 1) >= 5 ? { width: m.height, height: m.width } : { width: m.width, height: m.height }
  } catch {
    return null
  }
}

async function fingerprintOf(file: string): Promise<Pick<HashedFile, 'sha' | 'dhash'>> {
  const buf = readFileSync(file)
  const px = await sharp(buf, { failOn: 'none' }).rotate().greyscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer()
  let bits = ''
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += px[y * 9 + x] < px[y * 9 + x + 1] ? '1' : '0'
  let dhash = ''
  for (let i = 0; i < 64; i += 4) dhash += parseInt(bits.slice(i, i + 4), 2).toString(16)
  return { sha: createHash('sha1').update(buf).digest('hex'), dhash }
}

/** Auto-orient, cap the longest side, and store PNG photographs as WebP (a 2800 px PNG portrait is several MB). */
export async function prepare(file: string, out: string): Promise<string> {
  let img = sharp(readFileSync(file), { failOn: 'none' }).rotate().resize({ width: MAX_IMPORT_SIDE, height: MAX_IMPORT_SIDE, fit: 'inside', withoutEnlargement: true })
  const ext = extname(file).toLowerCase()
  const target = ext === '.png' ? out.replace(/\.png$/i, '.webp') : out
  img = ext === '.jpg' || ext === '.jpeg' ? img.jpeg({ quality: 85, mozjpeg: true }) : img.webp({ quality: 85 })
  await img.toFile(target)
  return target
}

async function fetchLive(rel: string, to: string): Promise<boolean> {
  const url = `${LEGACY_BASE_URL}/${THEME_LEGACY_PREFIX}${rel.split('/').map(encodeURIComponent).join('/')}`
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'ihm-web-import/1.0' }, signal: AbortSignal.timeout(30_000) })
    if (!res.ok || !/^image\//.test(res.headers.get('content-type') ?? '')) return false
    writeFileSync(to, Buffer.from(await res.arrayBuffer()))
    return true
  } catch {
    return false
  }
}

export async function run(ctx: ImportContext) {
  const { payload, report } = ctx
  const offline = Boolean(ctx.args.flags.offline)
  const limitN = Number(ctx.args.flags.limit ?? 0) || Infinity
  const cache = resolve(CACHE_DIR, 'theme')
  mkdirSync(cache, { recursive: true })
  const skippedByReason: Record<string, number> = {}
  const skip = (reason: SkipReason | string, n = 1) => {
    report.skipped += n
    skippedByReason[reason] = (skippedByReason[reason] ?? 0) + n
  }
  const skippedFiles: Record<string, string[]> = {}
  const note = (reason: string, rel: string) => (skippedFiles[reason] ??= []).push(rel)

  // 1. staff portraits first, so the pool pass can tell a portrait that belongs to a staff page from one that does not
  const rels = existsSync(THEME_ASSETS_DIR) ? walk(THEME_ASSETS_DIR) : []
  if (!rels.length) report.warning = `theme assets not found at ${THEME_ASSETS_DIR}`
  const staff = await loadStaffRefs()
  const sources: Source[] = []
  const staffResult: ThemePhotosMap['staff'] = {}
  const staffStats = { exact: 0, live: 0, 'name-tokens': 0, unmatched: [] as string[] }
  const portraitFiles = new Set<string>()
  for (const s of staff) {
    if (!ctx.wanted(s.slug)) continue
    const got = await resolveStaffPhoto(s, rels, cache, offline)
    if (!got) {
      staffStats.unmatched.push(s.name)
      staffResult[s.slug] = null
      continue
    }
    const size = await sizeOf(got.file)
    const verdict = size ? classify(got.rel, size.width, { staffName: s.name }) : ({ ok: false, reason: 'unreadable' } as const)
    if (!size || !verdict.ok) {
      staffStats.unmatched.push(`${s.name} (${verdict.ok ? 'unreadable' : verdict.reason})`)
      staffResult[s.slug] = null
      continue
    }
    staffStats[got.method === 'live' ? 'live' : got.method === 'name-tokens' ? 'name-tokens' : 'exact']++
    portraitFiles.add(got.rel)
    const legacy = legacyPathOf(got.rel)
    staffResult[s.slug] = { legacyPath: legacy, method: got.method }
    if (!sources.some((x) => x.legacy === legacy)) sources.push({ rel: got.rel, file: got.file, legacy, ...size, staffName: s.name, slug: s.slug, method: got.method })
  }

  // 1b. The board and executive cards of /our-people/ are code (their portraits are in `media`); a re-run keeps the previous map
  // and matches no new names.
  const peopleResult: ThemePhotosMap['people'] = existsSync(THEME_PHOTOS_MAP_PATH) ? ((JSON.parse(readFileSync(THEME_PHOTOS_MAP_PATH, 'utf8')) as ThemePhotosMap).people ?? {}) : {}

  // 2. the pool: every theme photograph that passes the rules. On IHNA only the photographs the content shows (course and page
  //    bodies): the rest of its theme folder is decoration and campaign art, which is not imported.
  const contentOnly = SITE !== 'ihm'
  const shown = new Set<string>()
  if (contentOnly) {
    const bodies = [...loadPages().map((p) => p.content ?? ''), ...(JSON.parse(readFileSync(resolve(INVENTORY_DIR, `data/${SITE}/courses.json`), 'utf8')) as { content: string | null }[]).map((c) => c.content ?? '')]
    for (const html of bodies) for (const ref of imageRefs(html)) if (ref.startsWith(THEME_LEGACY_PREFIX)) shown.add(ref.slice(THEME_LEGACY_PREFIX.length))
  }
  const candidates: (Source & { v: ReturnType<typeof classify> })[] = []
  for (const rel of rels.filter((r) => IMG.test(r))) {
    if (contentOnly && !shown.has(rel)) {
      skip('not-in-content')
      continue
    }
    if (portraitFiles.has(rel)) continue
    const file = resolve(THEME_ASSETS_DIR, rel)
    const size = await sizeOf(file)
    const v = classify(rel, size?.width ?? null)
    if (!v.ok) {
      skip(v.reason)
      note(v.reason, rel)
      continue
    }
    candidates.push({ rel, file, legacy: legacyPathOf(rel), ...size!, v })
  }
  for (const rel of rels.filter((r) => !IMG.test(r) && /\.(svg|gif|avif|ico)$/i.test(r))) {
    skip(extname(rel).toLowerCase() === '.svg' ? 'svg' : 'format')
  }

  // 3. uploads referenced by course or staff pages and not imported yet
  const uploads = new Set<string>()
  const staffIds = new Set(loadPageRows().filter((r) => r.suggested_page_type === 'staff-profile').map((r) => r.wp_id))
  const courses = JSON.parse(readFileSync(resolve(INVENTORY_DIR, `data/${SITE}/courses.json`), 'utf8')) as { content: string | null }[]
  const staffPages = loadPages().filter((p) => staffIds.has(String(p.id)))
  for (const html of [...courses.map((c) => c.content ?? ''), ...staffPages.map((p) => p.content ?? '')]) {
    for (const ref of imageRefs(html)) if (ref.startsWith('wp-content/uploads/') && !/-\d+x\d+\.[a-z]+$/i.test(ref)) uploads.add(ref)
  }
  for (const ref of uploads) {
    const rel = `uploads:${ref.slice('wp-content/uploads/'.length)}`
    const file = resolve(UPLOADS_DIR, ref.slice('wp-content/uploads/'.length))
    if (!existsSync(file)) continue
    const size = await sizeOf(file)
    const v = classify(rel, size?.width ?? null)
    if (!v.ok) { skip(`uploads:${v.reason}`); note(`uploads:${v.reason}`, ref); continue }
    candidates.push({ rel, file, legacy: ref, ...size!, v })
  }

  // 4. one file per picture
  const hashed: HashedFile[] = []
  for (const c of candidates) hashed.push({ rel: c.rel, width: c.width, height: c.height, ...(await fingerprintOf(c.file)) })
  const { kept, alias: relAlias } = dedupe(hashed)
  const keptRels = new Set(kept.map((k) => k.rel))
  for (const c of candidates) {
    if (keptRels.has(c.rel)) sources.push(c)
    else { skip('duplicate'); note('duplicate', c.rel) }
  }
  const aliases: Record<string, string> = {}
  for (const [from, to] of Object.entries(relAlias)) aliases[legacyPathOf(from)] = legacyPathOf(to)

  // 5. write
  const limit = pLimit(CONCURRENCY)
  const map: Record<string, number> = {}
  let imported = 0
  const todo = sources.slice(0, Number.isFinite(limitN) ? limitN : undefined)
  await Promise.all(
    todo.map((s) =>
      limit(async () => {
        if (!ctx.wanted(s.legacy, s.rel)) return
        const existing = await payload.find({ collection: 'media', where: { legacyPath: { equals: s.legacy } }, limit: 1, depth: 0, overrideAccess: true })
        if (existing.docs[0]) {
          map[s.legacy] = Number(existing.docs[0].id)
          skip('already-imported')
          return
        }
        if (ctx.dry) {
          report.created++
          return
        }
        try {
          const prepared = await prepare(s.file, resolve(cache, `${createHash('sha1').update(s.legacy).digest('hex').slice(0, 10)}-${basename(s.file)}`))
          const verdict = classify(s.rel, s.width, { staffName: s.staffName })
          const alt = verdict.ok ? verdict.alt : 'IHM photo'
          const doc = await payload.create({ collection: 'media', data: { alt, legacyPath: s.legacy }, filePath: prepared, ...ctx.opts })
          map[s.legacy] = Number(doc.id)
          report.created++
          imported++
        } catch (e) {
          report.failed.push({ id: s.legacy, reason: e instanceof Error ? e.message : String(e) })
        }
      }),
    ),
  )

  // 6. the map every later step reads
  const previous = existsSync(THEME_PHOTOS_MAP_PATH) ? (JSON.parse(readFileSync(THEME_PHOTOS_MAP_PATH, 'utf8')) as ThemePhotosMap) : null
  if (!ctx.dry) {
    const all = await payload.find({ collection: 'media', where: { legacyPath: { like: 'wp-content/' } }, limit: 0, depth: 0, pagination: false, overrideAccess: true })
    for (const d of all.docs) if (d.legacyPath) map[d.legacyPath] = Number(d.id)
    const out: ThemePhotosMap = {
      generatedAt: new Date().toISOString(),
      map,
      aliases: ctx.args.only ? { ...previous?.aliases, ...aliases } : aliases,
      portraits: [...new Set([...(ctx.args.only ? previous?.portraits ?? [] : []), ...sources.filter((s) => s.staffName).map((s) => s.legacy), ...Object.values(staffResult).flatMap((x) => (x ? [x.legacyPath] : [])), ...Object.values(peopleResult).flatMap((x) => (x ? [x] : []))])],
      staff: ctx.args.only ? { ...previous?.staff, ...staffResult } : staffResult,
      people: ctx.args.only ? { ...previous?.people, ...peopleResult } : peopleResult,
    }
    mkdirSync(OUT_DIR, { recursive: true })
    writeFileSync(THEME_PHOTOS_MAP_PATH, JSON.stringify(out, null, 2))
  }
  report.skippedByReason = skippedByReason
  report.skippedFiles = Object.fromEntries(Object.entries(skippedFiles).map(([k, v]) => [k, v.length > 40 ? [...v.slice(0, 40), `... +${v.length - 40}`] : v]))
  report.selected = sources.length
  report.imported = imported
  report.staffPortraits = { wanted: staff.length, ...staffStats, unmatchedCount: staffStats.unmatched.length }
  report.peopleCards = { matched: Object.values(peopleResult).filter(Boolean).length, unmatched: Object.entries(peopleResult).filter(([, v]) => !v).map(([k]) => k) }
  report.duplicatesDropped = Object.keys(aliases).length
  report.offline = offline
}

/** Local file, then the live site, then a file named after the person. */
async function resolveStaffPhoto(s: StaffRef, rels: string[], cache: string, offline: boolean): Promise<{ rel: string; file: string; method: string } | null> {
  const local = matchLocal(s, rels)
  if (local) return { rel: local.rel, file: resolve(THEME_ASSETS_DIR, local.rel), method: local.method }
  const want = isPlaceholderSrc(s.photoSrc) ? null : themeRelOf(s.photoSrc)
  if (want && !offline && IMG.test(want)) {
    const to = resolve(cache, `live-${createHash('sha1').update(want).digest('hex').slice(0, 10)}-${basename(want)}`)
    if (existsSync(to) && statSync(to).size > 0) return { rel: want, file: to, method: 'live' }
    if (await fetchLive(want, to)) return { rel: want, file: to, method: 'live' }
  }
  let best: { rel: string; w: number } | null = null
  for (const rel of matchByName(s, rels)) {
    const size = await sizeOf(resolve(THEME_ASSETS_DIR, rel))
    if (size && (!best || size.width > best.w)) best = { rel, w: size.width }
  }
  return best ? { rel: best.rel, file: resolve(THEME_ASSETS_DIR, best.rel), method: 'name-tokens' } : null
}
