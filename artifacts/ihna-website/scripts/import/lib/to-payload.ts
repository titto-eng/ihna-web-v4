import { accordionChildren, tabsChildren } from '../../../src/blocks/nested'
import { extract, type Block, type ExtractCtx, type ExtractResult } from '../html-to-blocks'
import { COVERAGE_THRESHOLD, CONFIDENCE_THRESHOLD } from './config'
import { normaliseLegacyPath, type MediaMap } from './context'
import { type Lexicalise, lexicalText } from './lexical'

// Intermediate layout (html-to-blocks `extract`) → the REAL block shapes of src/blocks. Nothing here touches the database.
export type PayloadBlock = { blockType: string } & Record<string, unknown>
export type Deps = { lexical: Lexicalise; mediaMap: MediaMap }
type Reasons = Set<string>

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
/** Text of one of our minimal HTML strings: no tags, entities decoded, whitespace collapsed. */
export const plain = (html: unknown): string =>
  String(html ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
      if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)))
      return ENTITIES[e.toLowerCase()] ?? m
    })
    .replace(/\s+/g, ' ')
    .trim()

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const mediaIdOf = (img: unknown, deps: Deps): number | null => {
  const src = (img as { src?: string } | undefined)?.src
  return src ? (deps.mediaMap[normaliseLegacyPath(src)] ?? null) : null
}

// --- nesting rules (20-blocks "Nesting", DEC-6) ---------------------------------------------------------------------------

type Tab = { label: string; blocks: Block[] }
type Item = { title: string; blocks: Block[] }
const heading = (level: 3 | 4, text: string): Block => ({ blockType: 'richText', html: `<h${level}>${esc(text)}</h${level}>` })

/** Makes `blocks` legal children of `parent`: hoists what cannot nest, never drops text. */
function fitChildren(blocks: Block[], parent: 'tabs' | 'accordion', reasons: Reasons): Block[] {
  const allowed: readonly string[] = parent === 'tabs' ? tabsChildren : accordionChildren
  const out: Block[] = []
  for (const b of blocks) {
    const type = b.blockType === 'testimonial' ? 'testimonials' : b.blockType === 'courseData' ? String(b.kind) : b.blockType
    if (b.blockType === 'tabs') {
      reasons.add('nested-tabs-hoisted')
      for (const t of b.tabs as Tab[]) out.push(heading(3, t.label), ...fitChildren(t.blocks, parent, reasons))
    } else if (b.blockType === 'accordion' && parent === 'accordion') {
      reasons.add('nested-accordion-hoisted')
      for (const i of b.items as Item[]) out.push(heading(4, i.title), ...fitChildren(i.blocks, parent, reasons))
    } else if (b.blockType === 'hero') {
      out.push({ blockType: 'richText', html: `<h3>${esc(String(b.heading))}</h3>${b.subheading ? `<p>${esc(String(b.subheading))}</p>` : ''}` })
    } else if (b.blockType === 'testimonial' && !allowed.includes(type)) {
      out.push({ blockType: 'richText', html: `<p>${esc(`“${String(b.quote)}” ${String(b.name)}`)}</p>` })
    } else if (!allowed.includes(type)) {
      reasons.add(`${type}-in-${parent}-dropped`)
    } else out.push(b)
  }
  return out
}

// --- conversion -------------------------------------------------------------------------------------------------------------

function toPayload(blocks: Block[], deps: Deps, reasons: Reasons): PayloadBlock[] {
  const out: PayloadBlock[] = []
  let ctas: { label: string; href: string }[] = []
  let quotes: { quote: string; name: string }[] = []
  const flushCtas = () => {
    for (let i = 0; i < ctas.length; i += 2) {
      out.push({
        blockType: 'cta', variant: 'inline',
        links: ctas.slice(i, i + 2).map((l, j) => ({ label: l.label, href: l.href, style: j === 0 ? 'primary' : 'secondary' })),
      })
    }
    ctas = []
  }
  const flushQuotes = () => {
    if (quotes.length) out.push({ blockType: 'testimonials', variant: quotes.length > 1 ? 'carousel' : 'single', inline: quotes })
    quotes = []
  }
  const rich = (html: string): PayloadBlock | null => {
    const before = deps.lexical.dropped.length
    const content = deps.lexical(html)
    if (deps.lexical.dropped.length > before) reasons.add('image-not-imported')
    return lexicalText(content).trim() || html.includes('<img') ? { blockType: 'richText', content } : null
  }

  for (const b of blocks) {
    if (b.blockType !== 'cta') flushCtas()
    if (b.blockType !== 'testimonial') flushQuotes()
    switch (b.blockType) {
      case 'cta':
        ctas.push({ label: String(b.label), href: String(b.href) })
        break
      case 'testimonial':
        quotes.push({ quote: String(b.quote), name: String(b.name) })
        break
      case 'richText': {
        const r = rich(String(b.html))
        if (r) out.push(r)
        if (b.reviewStatus === 'check') reasons.add('fallback')
        break
      }
      case 'hero': {
        const image = mediaIdOf(b.image, deps)
        if (b.image && !image) reasons.add('hero-image-not-imported')
        out.push({ blockType: 'hero', heading: String(b.heading), ...(b.subheading ? { subheading: String(b.subheading) } : {}), ...(image ? { image } : {}), variant: image ? 'full' : 'compact' })
        break
      }
      case 'imageText': {
        const media = mediaIdOf(b.image, deps)
        if (!media) {
          reasons.add('image-not-imported')
          const r = rich(String(b.text))
          if (r) out.push(r)
          break
        }
        out.push({ blockType: 'imageText', media, content: deps.lexical(String(b.text)), imageSide: b.imagePosition === 'right' ? 'right' : 'left' })
        break
      }
      case 'tabs': {
        const tabs = (b.tabs as Tab[]).map((t) => ({ label: t.label, blocks: toPayload(fitChildren(t.blocks, 'tabs', reasons), deps, reasons) }))
        if (tabs.length < 2) {
          // Tabs needs two rows: a lone pane is just content under its label
          reasons.add('single-tab-hoisted')
          for (const t of b.tabs as Tab[]) out.push(...toPayload([heading(3, t.label), ...fitChildren(t.blocks, 'tabs', reasons)], deps, reasons))
        } else out.push({ blockType: 'tabs', variant: 'underline', tabs })
        break
      }
      case 'accordion': {
        const items = (b.items as Item[]).map((i) => ({ title: i.title, blocks: toPayload(fitChildren(i.blocks, 'accordion', reasons), deps, reasons) }))
        if (items.length) out.push({ blockType: 'accordion', variant: 'faq', items })
        break
      }
      case 'table': {
        const rows = (b.rows as string[][]).map((r) => r.map(plain))
        out.push({ blockType: 'table', ...(b.caption ? { caption: plain(b.caption) } : {}), headerRow: Number(b.headerRows) > 0, variant: 'striped', rows })
        break
      }
      case 'videoEmbed':
        out.push({ blockType: 'videoEmbed', url: String(b.url), title: String(b.title ?? 'Video'), variant: 'inline' })
        break
      case 'iframeEmbed':
      case 'mapEmbed':
      case 'enquiryForm':
        out.push({ ...b, ...(b.blockType === 'enquiryForm' ? { variant: 'card' } : {}) })
        break
      case 'cardGrid': {
        const cards = (b.cards as { title: string; text?: string; image?: unknown; href?: string }[]).map((c) => {
          const image = mediaIdOf(c.image, deps)
          const body = plain(c.text)
          return { title: plain(c.title), ...(body ? { body } : {}), ...(image ? { image } : {}), ...(c.href ? { href: c.href } : {}) }
        })
        const n = cards.length
        out.push({ blockType: 'cardGrid', columns: n === 2 ? '2' : n === 4 ? '4' : '3', variant: b.variant === 'carousel' ? 'carousel' : 'grid', cards })
        break
      }
      case 'courseData':
        out.push({ blockType: String(b.kind) })
        break
      default:
        reasons.add(`unknown-block:${b.blockType}`)
    }
  }
  flushCtas()
  flushQuotes()
  return out
}

export function toPayloadBlocks(layout: Block[], deps: Deps): { layout: PayloadBlock[]; reasons: string[] } {
  const reasons: Reasons = new Set()
  const out = toPayload(layout, deps, reasons)
  return { layout: out, reasons: [...reasons] }
}

// --- posts: one Lexical document -------------------------------------------------------------------------------------------

/** Posts only have a `content` richText field, so every block is written out as plain headings, paragraphs and links. */
export function blocksToHtml(blocks: Block[], title = ''): string {
  const parts: string[] = []
  const link = (href: unknown, label: string) => `<p><a href="${esc(String(href))}">${esc(label)}</a></p>`
  for (const b of blocks) {
    switch (b.blockType) {
      case 'richText': parts.push(String(b.html)); break
      case 'hero':
        // the post title is already the page h1
        if (plain(b.heading).toLowerCase() !== title.toLowerCase()) parts.push(`<h2>${esc(String(b.heading))}</h2>`)
        if (b.subheading) parts.push(`<p>${esc(String(b.subheading))}</p>`)
        break
      case 'accordion':
        for (const i of b.items as Item[]) parts.push(`<h3>${esc(i.title)}</h3>`, blocksToHtml(i.blocks))
        break
      case 'tabs':
        for (const t of b.tabs as Tab[]) parts.push(`<h2>${esc(t.label)}</h2>`, blocksToHtml(t.blocks))
        break
      case 'table':
        for (const r of b.rows as string[][]) parts.push(`<p>${esc(r.map(plain).filter(Boolean).join(' | '))}</p>`)
        break
      case 'videoEmbed': parts.push(link(b.url, `Watch: ${String(b.title ?? 'video')}`)); break
      case 'cta': parts.push(link(b.href, String(b.label))); break
      case 'testimonial': parts.push(`<p>${esc(`“${String(b.quote)}” ${String(b.name)}`)}</p>`); break
      case 'imageText': parts.push(`<img src="${esc(String((b.image as { src: string }).src))}" alt="${esc(String((b.image as { alt?: string }).alt ?? ''))}">`, String(b.text)); break
      case 'cardGrid':
        for (const c of b.cards as { title: string; text?: string; href?: string }[]) parts.push(c.href ? link(c.href, c.title) : `<h3>${esc(c.title)}</h3>`, String(c.text ?? ''))
        break
      default: break // embeds, forms, course data have no Lexical equivalent in a post
    }
  }
  return parts.join('')
}

// --- one call for steps -----------------------------------------------------------------------------------------------------

export type Converted = {
  layout: PayloadBlock[]
  confidence: number
  coverage: number
  reviewStatus: 'auto' | 'check'
  reasons: string[]
  extract: ExtractResult
}

/** Review reasons for a converted document (30-import `reviewStatus`). */
export function reviewReasons(x: ExtractResult, extra: string[] = []): string[] {
  const reasons = new Set(extra)
  if (x.confidence < CONFIDENCE_THRESHOLD) reasons.add('low-confidence')
  if (x.coverage < COVERAGE_THRESHOLD) reasons.add('low-coverage')
  if (x.warnings.includes('theme-asset-link')) reasons.add('theme-asset-link')
  for (const u of x.unplaced) reasons.add(`unplaced:${u.match(/^\[([^\]]+)\]/)?.[1] ?? 'fragment'}`)
  return [...reasons]
}

/** extract → real blocks → review status. `deps.lexical` carries the media map. */
export function convertHtml(html: string, ctx: ExtractCtx, deps: Deps, extra: string[] = []): Converted {
  const x = extract(html, ctx)
  const { layout, reasons } = toPayloadBlocks(x.layout, deps)
  const all = reviewReasons(x, [...extra, ...reasons])
  return { layout, confidence: x.confidence, coverage: x.coverage, reviewStatus: all.length ? 'check' : 'auto', reasons: all, extract: x }
}
