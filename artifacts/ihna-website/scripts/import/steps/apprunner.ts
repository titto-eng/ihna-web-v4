import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import pLimit from 'p-limit'
import { extract } from '../html-to-blocks'
import { loadApi, politeGet, type ApiBlog, type ApiGalleryCategory, type ApiGalleryItem, type ApiSnapshot } from '../lib/apprunner'
import { CACHE_DIR, CONCURRENCY, MEDIA_EXTENSIONS, MEDIA_MAX_BYTES } from '../lib/config'
import { normaliseLegacyPath, type ImportContext, type MediaMap } from '../lib/context'
import { sha } from '../lib/hash'
import { createLexicaliser, lexicalText } from '../lib/lexical'
import { classifyLinks, collectLinks } from '../lib/links'
import { blocksToHtml, plain, reviewReasons } from '../lib/to-payload'
import { upsertImported } from '../lib/upsert'
import { wpDate } from './wp-posts'
import { postAliasPath, postPathOf, splitApiSlug } from '../../../src/lib/blog-paths'
import { galleryCampuses, type GalleryCampusKey } from '../../../src/content/campuses'
import { slugify } from '../../../src/lib/paths'

// `apprunner` (30-import §7.2): the old App Runner content API → Payload, once (plan D12; the API is retired after cut-over).
//   /blogs/                 → `posts` (186; key `import.apprunnerId`), `blogCategories` (by `legacyCode`)
//   /gallerycategory/ + /gallery/ + /campus_category_get/ → `galleries` (by `apprunnerId`; items with a category only)
//   images (S3 webp renditions, inline blog images on www.ihna.edu.au) → `media` (by `legacyPath`, downloaded once)
// GET only, ≤ 1 request/second for the API and every image (lib/apprunner `pace`). Snapshots: ../inventory/data/ihna/apprunner/.
// Flags: --refresh (re-fetch the API), --no-images (no downloads; posts and galleries keep the images already imported).
export const name = 'apprunner'
export const order = 35

const S3 = 'https://ihna-website.s3.ap-southeast-2.amazonaws.com'
/** Hosts images may be fetched from (import only; the site serves Payload media). */
const IMAGE_HOSTS = new Set(['ihna-website.s3.ap-southeast-2.amazonaws.com', 'ihna.edu.au', 'www.ihna.edu.au'])

export const blogHeroPath = (id: string) => `static/images/desktop/blog/${id}.webp`
export const blogCardPath = (id: string) => `static/images/mobile/blog/${id}.webp`
export const galleryImagePath = (id: string) => `static/images/desktop/gallery/${id}.webp`
/** The API writes the string `nan` for a missing image id. */
export const imageId = (id: string | null | undefined): string | null => (id && id.trim() && id.trim().toLowerCase() !== 'nan' ? id.trim() : null)

/** App Runner dates are midnight with no zone: Melbourne wall-clock, like WordPress dates. */
export const apiDate = (d: string | null | undefined): string | null => (d ? wpDate(d) : null)

export function readTimeOf(raw: unknown, words: number): number {
  const n = parseInt(String(raw ?? ''), 10)
  return Number.isFinite(n) && n > 0 ? n : Math.max(1, Math.round(words / 200))
}

/** Inline `<img src>` in a blog body → { legacyPath, url } when the host is allowed. */
export function inlineImages(html: string): { legacyPath: string; url: string; alt: string }[] {
  const out: { legacyPath: string; url: string; alt: string }[] = []
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const src = (m[0].match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1] ?? '').replace(/&amp;/g, '&').trim()
    if (!src) continue
    let u: URL
    try {
      u = new URL(src, 'https://ihna.edu.au')
    } catch {
      continue
    }
    if (!IMAGE_HOSTS.has(u.hostname)) continue
    out.push({ legacyPath: normaliseLegacyPath(u.href), url: u.href, alt: (m[0].match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1] ?? '').trim() })
  }
  return out
}

type ImageJob = { legacyPath: string; url: string; alt: string }

export async function run(ctx: ImportContext) {
  const { payload, report } = ctx
  const refresh = Boolean(ctx.args.flags.refresh)
  const images = !ctx.args.flags['no-images']
  const api: ApiSnapshot = await loadApi({ refresh, log: ctx.log })
  ctx.log(`api: ${api.blogs.length} blogs, ${api.categories.length} gallery categories, ${api.items.length} gallery items, ${api.campuses.length} campuses`)

  // ---- media ---------------------------------------------------------------------------------------------------------
  const mediaMap: MediaMap = {}
  // every imported media doc, page by page (a single unpaginated query has come back short on some databases)
  for (let page = 1; ; page++) {
    const known = await payload.find({ collection: 'media', where: { legacyPath: { exists: true } }, limit: 500, page, depth: 0, overrideAccess: true, select: { legacyPath: true } })
    for (const d of known.docs) if (d.legacyPath) mediaMap[d.legacyPath] = Number(d.id)
    if (!known.hasNextPage) break
  }
  const imageStats = { wanted: 0, existing: 0, downloaded: 0, missing: 0, notAllowed: 0 }
  const imageMisses: { legacyPath: string; reason: string }[] = []
  const notAllowedHosts: Record<string, number> = {}

  const jobs = new Map<string, ImageJob>()
  const want = (legacyPath: string, url: string, alt: string) => {
    if (!jobs.has(legacyPath)) jobs.set(legacyPath, { legacyPath, url, alt })
  }
  for (const b of api.blogs) {
    const page = imageId(b.page_img)
    const card = imageId(b.card_img)
    if (page) want(blogHeroPath(page), `${S3}/${blogHeroPath(page)}`, b.title)
    if (card) want(blogCardPath(card), `${S3}/${blogCardPath(card)}`, b.title)
    for (const i of inlineImages(b.detailed_blog ?? '')) want(i.legacyPath, i.url, i.alt || b.title)
    for (const m of (b.detailed_blog ?? '').matchAll(/<img\b[^>]*\bsrc\s*=\s*["']https?:\/\/([^/"']+)/gi)) {
      if (!IMAGE_HOSTS.has(m[1])) notAllowedHosts[m[1]] = (notAllowedHosts[m[1]] ?? 0) + 1
    }
  }
  const categoryIds = new Set(api.categories.map((c) => c._id))
  for (const c of api.categories) if (c.cover_img) want(galleryImagePath(c.cover_img), `${S3}/${galleryImagePath(c.cover_img)}`, c.title)
  for (const it of api.items) {
    if (it.gallery_category && categoryIds.has(it.gallery_category) && it.card_img) want(galleryImagePath(it.card_img), `${S3}/${galleryImagePath(it.card_img)}`, it.title || 'Event photo')
  }
  imageStats.wanted = jobs.size
  imageStats.notAllowed = Object.values(notAllowedHosts).reduce((a, b) => a + b, 0)

  mkdirSync(resolve(CACHE_DIR, 'apprunner'), { recursive: true })
  // up to CONCURRENCY downloads in flight (S3 answers in ~4 s from here), but a new request starts at most once per second (`pace`)
  const limit = pLimit(CONCURRENCY)
  const download = async (job: ImageJob) => {
    const ext = extname(job.legacyPath).slice(1).toLowerCase()
    if (!(MEDIA_EXTENSIONS as readonly string[]).includes(ext)) {
      imageMisses.push({ legacyPath: job.legacyPath, reason: `extension-not-allowed:${ext || 'none'}` })
      return
    }
    try {
      const res = await politeGet(job.url.replace(/ /g, '%20'))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const type = res.headers.get('content-type') ?? ''
      if (!type.startsWith('image/')) throw new Error(`unexpected content-type ${type}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length > MEDIA_MAX_BYTES) throw new Error(`file too large (${buf.length} bytes)`)
      const file = resolve(CACHE_DIR, 'apprunner', `${createHash('sha256').update(job.legacyPath).digest('hex').slice(0, 10)}-${basename(job.legacyPath)}`)
      writeFileSync(file, buf)
      const doc = await payload.create({ collection: 'media', data: { alt: job.alt.slice(0, 250) || 'Image', legacyPath: job.legacyPath }, filePath: file, ...ctx.opts })
      mediaMap[job.legacyPath] = Number(doc.id)
      imageStats.downloaded++
    } catch (e) {
      // already imported (an earlier, interrupted run): use the existing doc instead of failing on the unique legacyPath
      const found = await payload.find({ collection: 'media', where: { legacyPath: { equals: job.legacyPath } }, limit: 1, depth: 0, overrideAccess: true }).catch(() => null)
      const hit = found?.docs[0]
      if (hit) {
        mediaMap[job.legacyPath] = Number(hit.id)
        imageStats.existing++
        return
      }
      imageStats.missing++
      const detail = (e as { data?: { errors?: { path?: string; message?: string }[] }; cause?: unknown })?.data?.errors?.map((x) => `${x.path}: ${x.message}`).join('; ')
      imageMisses.push({ legacyPath: job.legacyPath, reason: [e instanceof Error ? e.message : String(e), detail].filter(Boolean).join(' | ') })
    }
  }
  const todo: ImageJob[] = []
  for (const job of jobs.values()) {
    if (mediaMap[job.legacyPath]) imageStats.existing++
    else if (images && !ctx.dry) todo.push(job)
  }
  let done = 0
  await Promise.all(
    todo.map((job) =>
      limit(async () => {
        await download(job)
        if (++done % 50 === 0) ctx.log(`images ${done}/${todo.length}`)
      }),
    ),
  )
  ctx.log(`images: ${JSON.stringify(imageStats)}`)

  // ---- blog categories ------------------------------------------------------------------------------------------------
  const categoryByCode = new Map<string, number>()
  const catCounts = { created: 0, updated: 0, unchanged: 0 }
  const labels = new Map<string, string>()
  for (const b of api.blogs) if (b.category) labels.set(b.category, (b.category_name || b.category).trim())
  for (const [code, label] of [...labels.entries()].sort((a, b) => a[1].localeCompare(b[1]))) {
    const found = await payload.find({ collection: 'blogCategories', where: { legacyCode: { equals: code } }, limit: 1, depth: 0, overrideAccess: true })
    const existing = found.docs[0]
    if (existing) {
      categoryByCode.set(code, Number(existing.id))
      catCounts.unchanged++ // marketing owns the label once imported
      continue
    }
    if (ctx.dry) {
      catCounts.created++
      continue
    }
    const doc = await payload.create({ collection: 'blogCategories', data: { name: label, slug: slugify(label), legacyCode: code }, ...ctx.opts })
    categoryByCode.set(code, Number(doc.id))
    catCounts.created++
  }

  // ---- posts ----------------------------------------------------------------------------------------------------------
  const lexical = await createLexicaliser(mediaMap)
  const postPaths = new Set<string>()
  for (const b of api.blogs) {
    const { urlDate, slug } = splitApiSlug(b.slug)
    postPaths.add(postPathOf({ slug, urlDate }))
    const alias = postAliasPath({ slug, urlDate, publishedAt: apiDate(b.published_date) })
    if (alias) postPaths.add(alias)
  }
  const totals = { posts: 0, dated: 0, flat: 0, inactive: 0, heroImages: 0, noHeroImage: 0, cardImages: 0, imagesDropped: 0, formsDropped: 0, videos: 0 }
  const deadLinks: Record<string, number> = {}
  const posts: { id: string; path: string }[] = []

  for (const b of api.blogs) {
    const { urlDate, slug } = splitApiSlug(b.slug)
    const path = postPathOf({ slug, urlDate })
    if (!ctx.wanted(b._id, path)) continue
    totals.posts++
    if (urlDate) totals.dated++
    else totals.flat++
    try {
      const body = b.detailed_blog ?? ''
      const x = extract(body, { url: `https://ihna.edu.au${path}`, wpType: 'post' })
      totals.formsDropped += Number(x.stats.formsDropped ?? 0)
      const html = blocksToHtml(x.layout, b.title)
      const before = lexical.dropped.length
      const content = lexical(html.replace(/<p>\s*<\/p>/g, ''))
      totals.imagesDropped += lexical.dropped.length - before
      totals.videos += (x.layout as { blockType: string }[]).filter((l) => l.blockType === 'videoEmbed').length

      const reasons = reviewReasons(x, lexical.dropped.length > before ? ['image-not-imported'] : [])
      const links = classifyLinks(collectLinks(content))
      const dead = links.internal.filter((l) => !postPaths.has(l))
      for (const l of dead) deadLinks[l] = (deadLinks[l] ?? 0) + 1
      if (dead.length) reasons.push('dead-link')
      if (links.uat.length) reasons.push('uat-link')
      if (!lexicalText(content).trim()) reasons.push('empty-content')
      if (b.status !== 'ACTIVE') {
        totals.inactive++
        reasons.push('inactive-in-source') // still published: the old page renders it (rule 1)
      }
      const reviewStatus = reasons.length ? 'check' : 'auto'

      const page = imageId(b.page_img)
      const card = imageId(b.card_img)
      const heroImage = page ? mediaMap[blogHeroPath(page)] : undefined
      const cardImage = card ? mediaMap[blogCardPath(card)] : undefined
      if (heroImage) totals.heroImages++
      else totals.noHeroImage++
      if (cardImage) totals.cardImages++
      const words = lexicalText(content).split(/\s+/).filter(Boolean).length
      const topic = b.category ? categoryByCode.get(b.category) : undefined
      const res = await upsertImported(ctx, {
        collection: 'posts',
        apprunnerId: b._id,
        importExtra: { sourceUpdatedAt: b.updated_at ?? null },
        path,
        source: [body, b.updated_at, inlineImages(body).map((i) => mediaMap[i.legacyPath] ?? null)],
        contentField: 'content',
        data: {
          title: b.title.trim(),
          slug,
          urlDate,
          category: 'blog',
          ...(topic ? { topic } : {}),
          publishedAt: apiDate(b.published_date) ?? apiDate(b.updated_at) ?? new Date().toISOString(),
          ...(heroImage ? { heroImage } : {}),
          ...(cardImage ? { cardImage } : {}),
          excerpt: plain(b.short_blog ?? '').slice(0, 600),
          readTime: readTimeOf(b.read_time, words),
          featured: Boolean(b.breaking_blog),
          content,
          meta: { title: (b.meta_title ?? '').trim() || undefined, description: (b.meta_description ?? '').trim() || undefined },
        },
        confidence: x.confidence,
        reviewStatus,
        reasons,
        extraReport: { coverage: Math.round(x.coverage * 100) / 100 },
      })
      if (res.outcome !== 'failed') posts.push({ id: b._id, path })
      if (res.outcome !== 'failed' && reviewStatus === 'check') report.reviewQueue.push({ id: b._id, path, reasons, confidence: x.confidence })
    } catch (e) {
      report.failed.push({ id: b._id, reason: e instanceof Error ? e.message : String(e) })
    }
  }

  // ---- galleries ------------------------------------------------------------------------------------------------------
  const campusKeyById = new Map(galleryCampuses.map((c) => [c.apprunnerId, c.key]))
  const campusesOf = new Map<string, Set<GalleryCampusKey>>()
  for (const [campusId, cats] of Object.entries(api.campusCategories)) {
    for (const c of cats) {
      const key = campusKeyById.get(campusId)
      if (key) (campusesOf.get(c.id) ?? campusesOf.set(c.id, new Set()).get(c.id)!).add(key)
    }
  }
  const itemsOf = new Map<string, ApiGalleryItem[]>()
  const orphanCategoryIds = new Set<string>()
  let uncategorised = 0
  for (const it of api.items) {
    if (!it.gallery_category) {
      uncategorised++
      continue
    }
    if (!categoryIds.has(it.gallery_category)) {
      orphanCategoryIds.add(it.gallery_category)
      continue
    }
    ;(itemsOf.get(it.gallery_category) ?? itemsOf.set(it.gallery_category, []).get(it.gallery_category)!).push(it)
  }
  const gal = { created: 0, updated: 0, skipped: 0, items: 0, itemsWithoutImage: 0, linkedToCampus: 0 }
  for (const c of api.categories) {
    if (!ctx.wanted(c._id)) continue
    const items = (itemsOf.get(c._id) ?? []).slice().sort((a, b) => String(a.gallery_event_date ?? '').localeCompare(String(b.gallery_event_date ?? '')) || a._id.localeCompare(b._id))
    const rows = items.flatMap((it) => {
      const image = it.card_img ? mediaMap[galleryImagePath(it.card_img)] : undefined
      if (!image) {
        gal.itemsWithoutImage++
        return []
      }
      return [{ image, title: (it.title ?? '').trim() || undefined, caption: plain(it.short_description ?? '').trim() || undefined, apprunnerId: it._id }]
    })
    gal.items += rows.length
    const campuses = [...(campusesOf.get(c._id) ?? [])].sort()
    if (campuses.length) gal.linkedToCampus++
    const data = {
      title: c.title.trim(),
      slug: slugify(c.slug || c.title) || c._id,
      eventDate: apiDate(c.gallery_event_date),
      campuses,
      featured: Boolean(c.featured),
      active: (c.status ?? 'ACTIVE') === 'ACTIVE',
      ...(c.cover_img && mediaMap[galleryImagePath(c.cover_img)] ? { coverImage: mediaMap[galleryImagePath(c.cover_img)] } : {}),
      items: rows,
      apprunnerId: c._id,
      sourceUpdatedAt: sha([c, items.map((i) => [i._id, i.updated_at]), rows.map((r) => r.image)]),
    }
    const found = await payload.find({ collection: 'galleries', where: { apprunnerId: { equals: c._id } }, limit: 1, depth: 0, overrideAccess: true })
    const existing = found.docs[0]
    if (!existing) {
      // the API holds a few events twice (same slug, different id): the later one gets -2, -3, …
      for (let k = 2; ; k++) {
        const taken = await payload.find({ collection: 'galleries', where: { slug: { equals: data.slug } }, limit: 1, depth: 0, overrideAccess: true })
        if (!taken.docs[0]) break
        data.slug = `${slugify(c.slug || c.title) || c._id}-${k}`
      }
    }
    if (existing && existing.sourceUpdatedAt === data.sourceUpdatedAt && !ctx.args.force) {
      gal.skipped++
      continue
    }
    if (ctx.dry) {
      gal[existing ? 'updated' : 'created']++
      continue
    }
    try {
      if (existing) {
        // marketing owns title, order, visibility and featured once imported; the source refreshes the photos, date and campuses
        const { title: _t, slug: _s, active: _a, featured: _f, ...refresh } = data
        await payload.update({ collection: 'galleries', id: existing.id, data: refresh, ...ctx.opts })
        gal.updated++
      } else {
        await payload.create({ collection: 'galleries', data, ...ctx.opts })
        gal.created++
      }
    } catch (e) {
      report.failed.push({ id: `gallery:${c._id}`, reason: e instanceof Error ? e.message : String(e) })
    }
  }

  return {
    api: { blogs: api.blogs.length, campuses: api.campuses.length, galleryCategories: api.categories.length, galleryItems: api.items.length },
    posts: totals,
    blogCategories: { total: labels.size, ...catCounts },
    galleries: { ...gal, categories: api.categories.length, itemsWithCategory: api.items.length - uncategorised, uncategorisedItemsNotImported: uncategorised, orphanCategoryIds: [...orphanCategoryIds] },
    images: { ...imageStats, notAllowedHosts, misses: imageMisses.slice(0, 50) },
    deadLinks: Object.fromEntries(Object.entries(deadLinks).slice(0, 60)),
    deadLinkTotal: Object.keys(deadLinks).length,
  }
}

export type { ApiBlog, ApiGalleryCategory }
