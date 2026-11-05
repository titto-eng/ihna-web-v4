import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import * as cheerio from 'cheerio'
import pLimit from 'p-limit'
import { readFileSync } from 'node:fs'
import { CACHE_DIR, CONCURRENCY, INVENTORY_DIR, LEGACY_BASE_URL, MEDIA_EXTENSIONS, MEDIA_MAP_PATH, MEDIA_MAX_BYTES, OUT_DIR, SITE } from '../lib/config'
import { loadMediaMap, normaliseLegacyPath, type ImportContext, type MediaMap } from '../lib/context'
import { loadPages, loadPosts } from '../lib/data'
import { loadCourseLive } from './course-live'

// `media`: every wp-content/uploads URL referenced by pages, posts, course bodies and staff pages, and each course's featured image
// (the `course-live` step's `heroImage`), goes into the `media` collection with legacyPath = the original path (no host, no leading
// slash). Theme assets (wp-content/themes) are NOT imported: they are the old theme's decoration.
export const name = 'media'
export const order = 20

const host = new URL(LEGACY_BASE_URL).hostname.replace(/^www\./, '').replace(/\./g, '\\.')
// our host, or no host at all (a path); an uploads path on another host (e.g. a sister site) is not ours to fetch
const UPLOADS = new RegExp(`(?:(?:https?:)?\\/\\/(?:www\\.)?${host}|(?<![\\w.\\/-]))(\\/wp-content\\/uploads\\/[^"'\\s)<>\\\\]+)`, 'gi')

/** Course bodies (the inventory copy of the WP REST items); empty when the site has none. */
const courseBodies = (): string[] => {
  try {
    return (JSON.parse(readFileSync(resolve(INVENTORY_DIR, `data/${SITE}/courses.json`), 'utf8')) as { content?: string | null }[]).map((c) => c.content ?? '')
  } catch {
    return []
  }
}

type Ref = { path: string; alt: string }

/** uploads URL → first alt text seen. Looks at src, href and CSS url(): the extractor reads the same places. */
export function collectReferences(htmls: string[]): Map<string, Ref> {
  const refs = new Map<string, Ref>()
  for (const html of htmls) {
    const alts = new Map<string, string>()
    if (html.includes('<img')) {
      const $ = cheerio.load(html)
      $('img[src]').each((_, el) => {
        const key = normaliseLegacyPath(($(el).attr('src') ?? '').replace(/&#038;|&amp;/g, '&'))
        if (!alts.get(key)) alts.set(key, ($(el).attr('alt') ?? '').trim())
      })
    }
    for (const m of html.matchAll(UPLOADS)) {
      const key = normaliseLegacyPath(m[1].replace(/&#038;|&amp;/g, '&'))
      const found = refs.get(key)
      if (!found) refs.set(key, { path: key, alt: alts.get(key) ?? '' })
      else if (!found.alt && alts.get(key)) found.alt = alts.get(key) ?? ''
    }
  }
  return refs
}

/** GET only. Retries network errors and 5xx twice; a 404 is final (the file is gone from the live site). */
async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': `${SITE}-web-import/1.0` }, signal: AbortSignal.timeout(30_000) })
      if (res.status < 500 || i === attempts) return res
    } catch (e) {
      if (i === attempts) throw e
    }
    await new Promise((r) => setTimeout(r, 500 * i))
  }
}

const humanise = (file: string) =>
  basename(file, extname(file))
    .replace(/-(scaled|e\d{10,})$/g, '')
    .replace(/-\d+x\d+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Image'

export async function run(ctx: ImportContext) {
  const { payload, report } = ctx
  const heroes = Object.values(loadCourseLive()).flatMap((c) => (c.heroImage ? [`<img src="/${c.heroImage}" alt="">`] : []))
  const refs = collectReferences([...[...loadPages(), ...loadPosts()].map((p) => p.content ?? ''), ...courseBodies(), ...heroes])
  ctx.log(`${refs.size} distinct uploads referenced`)
  mkdirSync(resolve(CACHE_DIR, 'media'), { recursive: true })
  const limit = pLimit(CONCURRENCY)
  const skippedByReason: Record<string, number> = {}
  const skip = (reason: string) => {
    report.skipped++
    skippedByReason[reason] = (skippedByReason[reason] ?? 0) + 1
  }

  await Promise.all(
    [...refs.values()].map((ref) =>
      limit(async () => {
        if (!ctx.wanted(ref.path)) return
        const ext = extname(ref.path).slice(1).toLowerCase()
        if (!(MEDIA_EXTENSIONS as readonly string[]).includes(ext)) {
          skip(`extension-not-allowed:${ext || 'none'}`)
          return
        }
        const existing = await payload.find({ collection: 'media', where: { legacyPath: { equals: ref.path } }, limit: 1, depth: 0, overrideAccess: true })
        if (existing.docs[0]) {
          skip('already-imported')
          return
        }
        if (ctx.dry) {
          report.created++
          return
        }
        try {
          const url = `${LEGACY_BASE_URL}/${ref.path.split('/').map(encodeURIComponent).join('/')}`
          const res = await fetchWithRetry(url)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const type = res.headers.get('content-type') ?? ''
          if (!/^(image\/|application\/pdf)/.test(type)) throw new Error(`unexpected content-type ${type}`)
          const buf = Buffer.from(await res.arrayBuffer())
          if (buf.length > MEDIA_MAX_BYTES) throw new Error(`file too large (${buf.length} bytes)`)
          const file = resolve(CACHE_DIR, 'media', `${createHash('sha256').update(ref.path).digest('hex').slice(0, 12)}-${basename(ref.path)}`)
          writeFileSync(file, buf)
          await payload.create({
            collection: 'media',
            data: { alt: ref.alt || humanise(ref.path), legacyPath: ref.path },
            filePath: file,
            ...ctx.opts,
          })
          report.created++
        } catch (e) {
          report.failed.push({ id: ref.path, reason: e instanceof Error ? e.message : String(e) })
        }
      }),
    ),
  )
  report.skippedByReason = skippedByReason

  // The URL map every later step reads: legacyPath → media id (all docs that carry a legacyPath).
  const map: MediaMap = ctx.dry && existsSync(MEDIA_MAP_PATH) ? loadMediaMap() : {}
  if (!ctx.dry) {
    const all = await payload.find({ collection: 'media', limit: 0, depth: 0, pagination: false, overrideAccess: true })
    for (const d of all.docs) if (d.legacyPath) map[d.legacyPath] = Number(d.id)
    mkdirSync(OUT_DIR, { recursive: true })
    writeFileSync(MEDIA_MAP_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), count: Object.keys(map).length, map }, null, 2))
  }
  report.referenced = refs.size
  report.mapEntries = Object.keys(map).length
}
