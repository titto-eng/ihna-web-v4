import { TZDate } from '@date-fns/tz'
import { extract } from '../html-to-blocks'
import { WP_POSTS_IMPORTED } from '../lib/config'
import { loadMediaMap, normaliseLegacyPath, type ImportContext } from '../lib/context'
import { decodeTitle, loadPosts, pathOf } from '../lib/data'
import { createLexicaliser, lexicalText } from '../lib/lexical'
import { mediaRefs } from '../lib/hash'
import { classifyLinks, collectLinks } from '../lib/links'
import { blocksToHtml, plain, reviewReasons } from '../lib/to-payload'
import { upsertImported } from '../lib/upsert'

// `wp-posts`: WordPress posts → `posts` with Lexical `content`, hero image from the first image, category from the URL prefix
// (/blog/ → blog, /news/ → news), date from `date` (WordPress local time, Australia/Melbourne). A site whose run leaves the step
// out (`WP_POSTS_IMPORTED`, lib/config.ts: IHNA, whose 4 WordPress posts are route files, DEC-42) refuses it and writes nothing.
export const name = 'wp-posts'
export const order = 40

/** WordPress `date` has no zone: read it as Melbourne wall-clock time. */
export function wpDate(date: string): string {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
  if (!m) return new Date(date).toISOString()
  const [y, mo, d, h, mi, s] = m.slice(1).map(Number)
  return new TZDate(y, mo - 1, d, h, mi, s, 'Australia/Melbourne').toISOString()
}

const FLATTENED = new Set(['table', 'tabs', 'videoEmbed', 'iframeEmbed', 'mapEmbed', 'cta', 'cardGrid', 'testimonial', 'enquiryForm', 'imageText', 'courseData'])
const blockTypes = (blocks: { blockType: string; tabs?: unknown; items?: unknown }[], found = new Set<string>()) => {
  for (const b of blocks) {
    found.add(b.blockType)
    for (const child of [...((b.tabs as { blocks: never[] }[]) ?? []), ...((b.items as { blocks: never[] }[]) ?? [])]) blockTypes(child.blocks, found)
  }
  return found
}

export async function run(ctx: ImportContext) {
  const { report } = ctx
  if (!WP_POSTS_IMPORTED) {
    report.failed.push({ id: 'step', reason: 'wp-posts is not part of this site\'s import: its WordPress posts are route files (DEC-42); nothing written' })
    return
  }
  const mediaMap = loadMediaMap()
  const lexical = await createLexicaliser(mediaMap)
  const posts = loadPosts().filter((p) => ctx.wanted(p.id, pathOf(p.link)))
  const totals = { blog: 0, news: 0, heroImages: 0, noHeroImage: 0, flattened: {} as Record<string, number>, imagesDropped: 0, deadLinkTotal: 0 }
  const deadLinks: Record<string, number> = {}

  for (const p of posts) {
    const path = pathOf(p.link)
    try {
      const category = path.startsWith('/news/') ? 'news' : 'blog'
      totals[category]++
      const title = decodeTitle(p.title.rendered)
      const x = extract(p.content ?? '', { url: p.link, wpType: 'post' })
      let html = blocksToHtml(x.layout, title)

      // hero image = the first imported image; it moves out of the body so it is not shown twice
      let heroImage: number | undefined
      for (const m of html.matchAll(/<img\b[^>]*>/g)) {
        const src = m[0].match(/\bsrc="([^"]*)"/)?.[1]?.replace(/&amp;/g, '&') ?? ''
        const id = mediaMap[normaliseLegacyPath(src)]
        if (id) {
          heroImage = id
          html = html.replace(m[0], '')
          break
        }
      }
      if (heroImage) totals.heroImages++
      else totals.noHeroImage++

      const before = lexical.dropped.length
      const content = lexical(html.replace(/<p>\s*<\/p>/g, ''))
      totals.imagesDropped += lexical.dropped.length - before
      const flattened = [...blockTypes(x.layout as never)].filter((t) => FLATTENED.has(t))
      for (const t of flattened) totals.flattened[t] = (totals.flattened[t] ?? 0) + 1

      const reasons = reviewReasons(x, [
        ...flattened.map((t) => `flattened:${t}`),
        ...(lexical.dropped.length > before ? ['image-not-imported'] : []),
      ])
      const links = classifyLinks(collectLinks(content))
      for (const l of links.internal) deadLinks[l] = (deadLinks[l] ?? 0) + 1
      if (links.internal.length) reasons.push('dead-link')
      if (links.uat.length) reasons.push('uat-link')
      if (!lexicalText(content).trim()) reasons.push('empty-content')
      const reviewStatus = reasons.length ? 'check' : 'auto'

      const words = lexicalText(content).split(/\s+/).filter(Boolean).length
      const res = await upsertImported(ctx, {
        collection: 'posts', wpId: p.id, path, source: [p.content ?? '', mediaRefs(p.content, mediaMap)], contentField: 'content',
        data: {
          title, slug: path.split('/').filter(Boolean).pop(), category, publishedAt: wpDate(p.date),
          ...(heroImage ? { heroImage } : {}), excerpt: plain(p.excerpt).slice(0, 400), readTime: Math.max(1, Math.round(words / 200)), content,
        },
        confidence: x.confidence, reviewStatus, reasons, extraReport: { coverage: Math.round(x.coverage * 100) / 100 },
      })
      if (res.outcome !== 'failed' && reviewStatus === 'check') report.reviewQueue.push({ id: p.id, path, reasons, confidence: x.confidence })
    } catch (e) {
      report.failed.push({ id: p.id, reason: e instanceof Error ? e.message : String(e) })
    }
  }
  return { posts: posts.length, ...totals, deadLinks: Object.fromEntries(Object.entries(deadLinks).slice(0, 40)), deadLinkTotal: Object.keys(deadLinks).length }
}
