/**
 * html-to-blocks.ts: the production extractor (30-import §7.1, AGENTS.md rule 5).
 *
 * Two stages:
 *   extract(html, ctx)            sync. Recognises patterns and returns an intermediate layout (blocks that still carry a minimal
 *                                 `html` string) plus confidence, unplaced fragments, stats and warnings.
 *   toPayloadBlocks / convertHtml async. Turns the intermediate layout into the REAL block shapes of src/blocks (hero, richText as
 *                                 Lexical via convertHTMLToLexical, imageText, accordion with nested blocks, tabs, table, cta,
 *                                 videoEmbed, iframeEmbed, mapEmbed, cardGrid, testimonials, enquiryForm) in `./lib/to-payload.ts`.
 *
 * extract(html, ctx) -> { layout, confidence, unplaced, stats, warnings, unknownClasses }
 *
 * Pipeline
 *   1. sanitize-html first pass: drop script/style/noscript, on* handlers, javascript: URLs and every iframe that is not
 *      YouTube / Vimeo / Google Maps. class, id and style SURVIVE this pass because they are used for recognition only.
 *   2. Course-data shortcode output is located by its wrapper markup and replaced by a courseData placeholder (see below).
 *   3. A recursive "flow" walk recognises patterns (tabs, accordion, table, video, imageText, cardGrid, testimonial,
 *      enquiryForm, cta, hero) and buffers everything else as prose.
 *   4. Every block that carries HTML is produced by our own serialiser, which emits ONLY
 *      p,h2,h3,h4,ul,ol,li,a[href],strong,em,img[src,alt],br. class/id/style never reach the output.
 *
 * Selectors chosen for the expanded shortcodes (all in ../ihmv3/wp-content/themes/mwt-ihm/, grepped, not guessed):
 *   [StartDates]      functions.php:1309-1470 (function start_dates, add_shortcode at 1470). Output is
 *                     `<div class="row"> <div class="col-*"> <h2>{campus}</h2> <p><strong>{Face to Face|Online|Blended} Delivery</strong></p>
 *                     <ul class='start-date-ul'>...` (row opened at :1338, h2 at :1392, p at :1398/:1423/:1439, ul at :1399/:1424).
 *                     Selector: `ul.start-date-ul`, wrapper = closest `.row` when the row holds nothing but the h2 / p>strong / ul trio.
 *   [IHMCensusDate]   functions.php:4410-4426 -> ihm-census-dates-sc.php:23-27. Output is
 *                     `div.container > h2.captionBG "Course Start Dates" + div.container.mt-3 > table.table-bordered`
 *                     (headers Course Intake / Start / End / Census / Orientation). Selector: a `table` whose header row
 *                     contains "Census Date", wrapper = highest ancestor that holds only that table and `h2.captionBG`.
 *                     Census dates are start-date data, so this maps to kind 'startDates'.
 *   [CourseManagers]  functions.php:3520-3537 -> course-manager-sc.php:23-46. Output is
 *                     `div.container > div.row > div.col-lg-6 > h2.captionBG (position) + div.courseManagers-card.cmCard (name, email, a.seeDetailsBtn)`.
 *                     Selector: `.cmCard`, wrapper = highest ancestor that holds only cmCards and `h2.captionBG`.
 *                     The (often empty) slot `section#courseManagers` that course bodies carry is also replaced.
 *   Literal, unexpanded `[StartDates ...]`, `[IHMCensusDate]`, `[CourseManagers]` text (16 items) is replaced too.
 *   fees              NO fees shortcode or partial exists in the IHM theme (grep "fees" over mwt-ihm finds only templates for payments
 *                     and micro-credentials). IHM fees are hand-written `table` markup inside the "Fees and Charges" tab pane, so they
 *                     are kept as `table` blocks (removing them would lose content). FEES_WRAPPER_SELECTORS is an empty hook for
 *                     IHNA, whose fees come from funding_contracts / course_unit_state_fees.
 */
import * as cheerio from 'cheerio'
import type { Cheerio, CheerioAPI } from 'cheerio'
import type { AnyNode, Element } from 'domhandler'
import sanitizeHtml from 'sanitize-html'
import { hostAllowed, isMapEmbedUrl } from '../../src/blocks/embeds'
import { ROLE_MAILBOXES, SEED_EMBED_HOSTS } from './lib/config'
import { formKeyForAction } from './lib/formkeys'

export type Block = { blockType: string; [key: string]: unknown }
export type ExtractCtx = {
  url: string
  wpType: string
  /** Extra allowed embed hosts (DEC-5), added to `SEED_EMBED_HOSTS` (lib/config.ts). */
  allowedEmbedHosts?: string[]
}
export type ExtractResult = {
  layout: Block[]
  confidence: number
  unplaced: string[]
  stats: Record<string, number>
  warnings: string[]
  unknownClasses: Record<string, number>
  /** Share of the visible source text (after intended removals) that landed in the layout. */
  coverage: number
  /** Count of fallback richText blocks that came from interactive markup (carousel, modal, button, form controls). */
  interactiveFallbacks: number
  /** What the sanitiser / recogniser refused: iframe sources and form actions. */
  dropped: { iframes: string[]; forms: string[] }
}

export const FEES_WRAPPER_SELECTORS: string[] = []

type Sel = Cheerio<AnyNode>

// ---------------------------------------------------------------------------------------------------------------------
// Step 1: sanitize-html first pass
// ---------------------------------------------------------------------------------------------------------------------

const BASE_IFRAME_HOSTS = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'youtu.be',
  'player.vimeo.com',
  'vimeo.com',
  'www.google.com',
  'google.com',
  'maps.google.com',
]

/** First pass for one document. Iframes survive only for YouTube, Vimeo, Google Maps embeds and `allowedEmbedHosts` (DEC-5). */
function firstPass(allowedEmbedHosts: string[]): sanitizeHtml.IOptions {
  return {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'section', 'article', 'main', 'header', 'footer', 'nav', 'aside',
      'figure', 'figcaption', 'a', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'b', 'strong', 'i', 'em', 'u', 'small', 'mark', 'sub', 'sup',
      'br', 'hr', 'img', 'iframe', 'form', 'button', 'blockquote', 'pre', 'code', 'center', 'font', 'details', 'summary', 'label',
      'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col',
    ],
    allowedAttributes: {
      '*': ['class', 'id', 'style', 'role', 'title', 'data-id', 'data-title', 'data-bs-target', 'data-bs-toggle', 'data-target', 'aria-controls', 'colspan', 'rowspan'],
      a: ['href', 'target'],
      img: ['src', 'alt'],
      iframe: ['src', 'title', 'height'],
      form: ['action', 'method'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: true,
    allowedIframeHostnames: [...BASE_IFRAME_HOSTS, ...allowedEmbedHosts],
    nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript'],
    exclusiveFilter: (frame) => {
      if (frame.tag !== 'iframe') return false
      const src = frame.attribs.src ?? ''
      if (!src) return true
      if (/(^|\/\/)(www\.|maps\.)?google\.com/.test(src) && !/google\.com\/maps/.test(src)) return true
      return false
    },
  }
}

const RICH_STRICT: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'img', 'br'],
  allowedAttributes: { a: ['href'], img: ['src', 'alt'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
}

// ---------------------------------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------------------------------

const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const strip = (html: string) => norm(html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'))
const snippet = (s: string, n = 120) => {
  const t = norm(s)
  return t.length > n ? t.slice(0, n - 1) + '…' : t
}

const BENIGN_CLASS =
  /^(container(-\w+)?|row|col(-[a-z]+)*(-\d+)?|offset(-[a-z]+)*-\d+|[mp][trblxyse]?-(?:[a-z]+-)?(\d+|auto)|mob-[\w-]+|d-[\w-]+|flex-[\w-]+|align-[\w-]+|justify-[\w-]+|text-[\w-]+|w-\d+|w-auto|h-\d+|g[xy]?-\d+|gap-\d+|fade|show|active|collapse|req(-p)?|reveal|titleH2|gradient-text|bullet-point-[\w-]+|table-responsive|clearfix|float-[\w-]+|position-[\w-]+|border[\w-]*|bg-[\w-]+|rounded[\w-]*|shadow[\w-]*|fw-[\w-]+|fs-\d|lh-\d|font-weight-bold|hide-md|show-md|section|wrapper|inner|first-head|duel-tone-title|order-[\w-]+|img-fluid|mx-auto|small|lead|h[1-6]|display-\d|me-\d|ms-\d)$/

const THEME_IMG = /\/wp-content\/themes\//i
const YT_THUMB = /img\.youtube\.com\//i
const BLOCK_TAGS = new Set([
  'div', 'section', 'article', 'main', 'header', 'footer', 'aside', 'figure', 'figcaption', 'center', 'details', 'summary', 'nav', 'span', 'font',
])
const INLINE_TAGS = new Set(['a', 'strong', 'b', 'em', 'i', 'u', 'small', 'mark', 'sub', 'sup', 'br', 'img', 'label', 'code'])
const PROSE_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol'])
const CHROME_CLASS =
  /(^|\s)(fixed-cta-btns|ihm-course-switcher-wrapper|breadcrumb|skip-link|sr-only|visually-hidden|d-none|modal-backdrop)(\s|$)/
const UI_FALLBACK_CLASS =
  /(^|\s)(search-box|search-pagination-container|pagination-info|pagination|dataTable|owl-carousel|carousel|swiper|slick-slider|modal|dropdown|dropdown-menu|map-container)(\s|$)/

type State = {
  $: CheerioAPI
  ctx: ExtractCtx
  origin: string
  stats: Record<string, number>
  warnings: Set<string>
  unplaced: string[]
  unknownClasses: Record<string, number>
  heroDone: boolean
  allowedHosts: string[]
  /** Visible text removed on purpose (floating chrome, hidden blocks): excluded from the coverage denominator. */
  removedChars: number
  interactiveFallbacks: number
  dropped: { iframes: string[]; forms: string[] }
  /** Blocks built ahead of the walk (tabs), spliced in where their `<x-block data-ref>` placeholder sits. */
  pending: Block[]
}

const bump = (S: State, k: string, n = 1) => {
  S.stats[k] = (S.stats[k] ?? 0) + n
}
const warn = (S: State, w: string) => S.warnings.add(w)

const tagOf = (n: AnyNode): string => (n.type === 'tag' ? (n as Element).name : '')
const clsOf = (S: State, n: AnyNode): string => (n.type === 'tag' ? ((n as Element).attribs.class ?? '') : '')
const isCls = (S: State, n: AnyNode, re: RegExp) => re.test(clsOf(S, n))
const textLen = (S: State, n: AnyNode | Sel): number => norm(S.$(n as AnyNode).text()).length

function keptSrc(src: string, allowed: string[]): boolean {
  try {
    const u = new URL(src, 'https://ihm.edu.au')
    if (/(^|\.)google\.com$/.test(u.hostname) && !u.pathname.startsWith('/maps')) return false
    return [...BASE_IFRAME_HOSTS, ...allowed].includes(u.hostname)
  } catch {
    return false
  }
}

function isSafeImg(src: string): boolean {
  return !!src && !THEME_IMG.test(src) && !YT_THUMB.test(src) && !src.startsWith('data:')
}

function absUrl(S: State, u: string): string {
  try {
    return new URL(u, S.ctx.url).href
  } catch {
    return u
  }
}

/**
 * Links to the site's own host are made relative. The host comes from `ctx.url` (ihm.edu.au on IHM, ihna.edu.au on IHNA), with
 * its `www.` and `uat.` (the old staging copy some editors linked to) variants; any other host stays absolute.
 */
function selfHostRe(S: State): RegExp {
  let host = 'ihm.edu.au'
  try {
    host = new URL(S.ctx.url).hostname.replace(/^(www|uat)\./i, '')
  } catch {
    /* keep default */
  }
  return new RegExp(`^(?:https?:)?\\/\\/(?:(?:www|uat)\\.)?${host.replace(/\./g, '\\.')}(\\/[^]*)?$`, 'i')
}

/**
 * WordPress forms post to `admin-post.php` and name the handler in a hidden `action` input. The first pass drops inputs, so the
 * handler moves into the form's action URL (`…admin-post.php?action=quick_enquiry`), where `formKeyForAction` reads it.
 */
function hoistFormActions(html: string): string {
  if (!/<form\b/i.test(html)) return html
  const $ = cheerio.load(html, { xml: false }, false)
  $('form').each((_, f) => {
    const hidden = $(f).find('input[name="action"]').first().attr('value')?.trim()
    const action = $(f).attr('action') ?? ''
    if (hidden && /^[\w-]+$/.test(hidden) && !/[?&]action=/.test(action)) $(f).attr('action', `${action || '/wp-admin/admin-post.php'}${action.includes('?') ? '&' : '?'}action=${hidden}`)
  })
  return $.html()
}

/** Freecall, 13-numbers, 000 and landlines are organisation lines; mobiles are people. */
function isOrgPhone(num: string): boolean {
  const n = num.replace(/^\+/, '')
  return /^(61)?(1800|1300)\d{6}$/.test(n) || /^13\d{4}$/.test(n) || n === '000' || /^(61|0)[2378]\d{8}$/.test(n)
}

function rewriteHref(S: State, href: string | undefined): string | null {
  if (!href) return null
  const h = href.trim()
  if (!h || h === '#') return null
  if (h.startsWith('#')) {
    bump(S, 'anchorLinksDropped')
    return null
  }
  if (/^mailto:/i.test(h)) {
    const addr = h.slice(7).split('?')[0].replace(/\.$/, '').toLowerCase()
    if (!addr.includes(',') && ROLE_MAILBOXES.includes(addr.split('@')[0])) return `mailto:${addr}`
    bump(S, 'personalLinksStripped')
    return null
  }
  if (/^tel:/i.test(h)) {
    const num = h.slice(4).replace(/[^\d+]/g, '')
    if (isOrgPhone(num)) return `tel:${num}`
    bump(S, 'personalLinksStripped')
    return null
  }
  // files that only exist inside the old theme are not imported (theme assets stay behind): keep the words, lose the link
  if (/\/wp-content\/themes\//i.test(h)) {
    bump(S, 'themeLinksDropped')
    warn(S, 'theme-asset-link')
    return null
  }
  // links to the site itself (the page's own host, with or without www./uat.) become site-relative
  const m = h.match(selfHostRe(S))
  if (m) {
    bump(S, 'selfLinksRelativized')
    return (m[1] || '/').replace(/\s+/g, '%20')
  }
  return h.replace(/\s+/g, '%20')
}

// ---------------------------------------------------------------------------------------------------------------------
// Serialiser: DOM nodes -> minimal HTML (p,h2,h3,h4,ul,ol,li,a[href],strong,em,img[src,alt],br)
// ---------------------------------------------------------------------------------------------------------------------

function inlineOf(S: State, nodes: AnyNode[]): string {
  let out = ''
  for (const n of nodes) {
    if (n.type === 'text') {
      out += esc(n.data.replace(/\s+/g, ' '))
      continue
    }
    if (n.type !== 'tag') continue
    const el = n as Element
    const name = el.name
    const kids = (el.children ?? []) as AnyNode[]
    switch (name) {
      case 'br':
        out += '<br>'
        break
      case 'img': {
        const src = el.attribs.src ?? ''
        if (isSafeImg(src)) out += `<img src="${esc(absUrl(S, src))}" alt="${esc(el.attribs.alt ?? '')}">`
        else bump(S, 'themeImagesDropped')
        break
      }
      case 'a': {
        const href = rewriteHref(S, el.attribs.href)
        const inner = inlineOf(S, kids)
        const hasContent = !!strip(inner) || inner.includes('<img')
        out += href && hasContent ? `<a href="${esc(href)}">${inner}</a>` : inner
        break
      }
      case 'strong':
      case 'b': {
        const inner = inlineOf(S, kids)
        out += strip(inner) ? `<strong>${inner}</strong>` : inner
        break
      }
      case 'em':
      case 'i': {
        const inner = inlineOf(S, kids)
        out += strip(inner) ? `<em>${inner}</em>` : inner
        break
      }
      case 'p':
      case 'div':
      case 'li':
      case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
        out += ' ' + inlineOf(S, kids) + ' '
        break
      case 'script': case 'style': case 'iframe': case 'form': case 'button': case 'x-coursedata': case 'svg': case 'ul': case 'ol':
        break
      default:
        out += inlineOf(S, kids)
    }
  }
  return out
}

function listHtml(S: State, el: Element): string {
  const tag = el.name === 'ol' ? 'ol' : 'ul'
  let items = ''
  for (const li of (el.children ?? []) as AnyNode[]) {
    if (tagOf(li) !== 'li') continue
    const kids = ((li as Element).children ?? []) as AnyNode[]
    const inline = inlineOf(S, kids.filter((k) => tagOf(k) !== 'ul' && tagOf(k) !== 'ol')).trim()
    const nested = kids
      .filter((k) => tagOf(k) === 'ul' || tagOf(k) === 'ol')
      .map((k) => listHtml(S, k as Element))
      .join('')
    if (strip(inline) || nested) items += `<li>${inline}${nested}</li>`
  }
  return items ? `<${tag}>${items}</${tag}>` : ''
}

function blocksHtml(S: State, nodes: AnyNode[], acc: string[] = []): string[] {
  let inl: AnyNode[] = []
  const flushInline = () => {
    if (!inl.length) return
    const h = inlineOf(S, inl).replace(/^(\s|<br>)+|(\s|<br>)+$/g, '').trim()
    if (strip(h) || h.includes('<img')) acc.push(`<p>${h}</p>`)
    inl = []
  }
  for (const n of nodes) {
    if (n.type === 'text') {
      inl.push(n)
      continue
    }
    if (n.type !== 'tag') continue
    const el = n as Element
    const kids = (el.children ?? []) as AnyNode[]
    const name = el.name
    if (/^h[1-6]$/.test(name)) {
      flushInline()
      const lvl = name === 'h1' ? 'h2' : name === 'h5' || name === 'h6' ? 'h4' : name
      // mismatched closing tags (<h3>..</h5>) make the parser keep following lists/paragraphs inside the heading: split them out
      const cut = kids.findIndex((k) => ['ul', 'ol', 'p', 'div', 'table', 'section', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagOf(k)))
      const headKids = cut < 0 ? kids : kids.slice(0, cut)
      const h = inlineOf(S, headKids).replace(/<br>/g, ' ').replace(/<img[^>]*>/g, '').trim()
      if (strip(h)) acc.push(`<${lvl}>${h}</${lvl}>`)
      if (cut >= 0) {
        bump(S, 'headingWithBlockChildrenSplit')
        blocksHtml(S, kids.slice(cut), acc)
      }
    } else if (name === 'p') {
      flushInline()
      const h = inlineOf(S, kids).replace(/^(\s|<br>)+|(\s|<br>)+$/g, '').trim()
      if (strip(h) || h.includes('<img')) acc.push(`<p>${h}</p>`)
    } else if (name === 'ul' || name === 'ol') {
      flushInline()
      // WordPress content often nests p/h2 directly inside ul (invalid, but the parser keeps it): split the list around them
      let run: AnyNode[] = []
      const flushRun = () => {
        if (!run.length) return
        const fake = { ...el, children: run } as unknown as Element
        const h = listHtml(S, fake)
        if (h) acc.push(h)
        run = []
      }
      for (const k of kids) {
        if (tagOf(k) === 'li') run.push(k)
        else if (k.type === 'text' && !k.data.trim()) continue
        else {
          flushRun()
          blocksHtml(S, [k], acc)
        }
      }
      flushRun()
    } else if (name === 'table') {
      flushInline()
      bump(S, 'tableFlattenedInRichText')
      warn(S, 'table-flattened-in-richText')
      S.$(el).find('tr').each((_, tr) => {
        const cells = S.$(tr).children('th,td').toArray().map((c) => norm(S.$(c).text())).filter(Boolean)
        if (cells.length) acc.push(`<p>${esc(cells.join(' | '))}</p>`)
      })
    } else if (name === 'blockquote') {
      flushInline()
      blocksHtml(S, kids, acc)
    } else if (name === 'img' || INLINE_TAGS.has(name)) {
      inl.push(n)
    } else if (['script', 'style', 'iframe', 'form', 'button', 'x-coursedata', 'hr', 'svg', 'nav'].includes(name)) {
      flushInline()
    } else if (name === 'span' || name === 'font') {
      inl.push(n)
    } else {
      // div/section/... : block container
      flushInline()
      blocksHtml(S, kids, acc)
    }
  }
  flushInline()
  return acc
}

function cleanRich(html: string): string {
  const out = sanitizeHtml(html, RICH_STRICT)
    .replace(/<p>(\s|<br \/>)*<\/p>/g, '')
    .replace(/(<br \/>\s*){3,}/g, '<br /><br />')
    .replace(/>\s+</g, '><')
    .trim()
  return out
}

function richHtml(S: State, nodes: AnyNode[]): string {
  return cleanRich(blocksHtml(S, nodes).join(''))
}

// ---------------------------------------------------------------------------------------------------------------------
// Step 2: course-data shortcode output -> placeholder
// ---------------------------------------------------------------------------------------------------------------------

const placeholder = (kind: string) => `<x-coursedata data-kind="${kind}"></x-coursedata>`

function replaceShortcodes(S: State): void {
  const { $ } = S
  const root = $.root()

  // (a) literal, unexpanded shortcode text
  const re = /\[(StartDates|IHMCensusDate|CourseManagers)([^\]]*)\]/g
  root.find('*').contents().each((_, n) => {
    if (n.type !== 'text' || !re.test(n.data)) {
      re.lastIndex = 0
      return
    }
    re.lastIndex = 0
    const html = esc(n.data).replace(/\[(StartDates|IHMCensusDate|CourseManagers)([^\]]*)\]/g, (_m, name: string) => {
      bump(S, 'shortcodeLiteralReplaced')
      return placeholder(name === 'CourseManagers' ? 'courseManagers' : name === 'IHMCensusDate' ? 'censusDates' : 'startDates')
    })
    $(n).replaceWith(html)
  })

  // (b) [StartDates] expanded: functions.php:1338-1399 (row > col > h2 + p>strong + ul.start-date-ul)
  $('ul.start-date-ul').each((_, ul) => {
    if (!ul.parent) return
    const row = $(ul).closest('.row')
    if (row.length) {
      const core =
        row.find('ul.start-date-ul').toArray().reduce((a, u) => a + textLen(S, u), 0) +
        row.find('h2').toArray().reduce((a, u) => a + textLen(S, u), 0) +
        row.find('p > strong').toArray().reduce((a, u) => a + textLen(S, u), 0)
      if (core >= textLen(S, row) - 4) {
        row.replaceWith(placeholder('startDates'))
        bump(S, 'shortcodeExpandedRemoved.startDates')
        return
      }
    }
    // not a clean wrapper: remove just the list and its delivery-mode label
    const prev = $(ul).prev('p')
    if (prev.length && prev.children('strong').length) prev.remove()
    $(ul).replaceWith(placeholder('startDates'))
    bump(S, 'shortcodeExpandedRemoved.startDates')
    warn(S, 'startDates-wrapper-unclean')
  })

  // (c) [IHMCensusDate] expanded: ihm-census-dates-sc.php:23-27
  $('table').each((_, t) => {
    if (!t.parent) return
    const head = norm($(t).find('tr').first().text())
    if (!/census date/i.test(head) || !/course intake/i.test(head)) return
    const wrapper = highestWrapper(S, t, (el) => textLen(S, el) - textLen(S, t) - $(el).find('h2.captionBG').toArray().reduce((a, h) => a + textLen(S, h), 0) <= 20)
    $(wrapper).replaceWith(placeholder('censusDates'))
    bump(S, 'shortcodeExpandedRemoved.census')
  })

  // (d) [CourseManagers] expanded: course-manager-sc.php:23-46
  $('.cmCard').each((_, card) => {
    if (!card.parent) return
    const wrapper = highestWrapper(S, card, (el) => {
      const cards = $(el).find('.cmCard').toArray().reduce((a, c) => a + textLen(S, c), 0)
      const caps = $(el).find('h2.captionBG').toArray().reduce((a, c) => a + textLen(S, c), 0)
      return textLen(S, el) - cards - caps <= 24
    })
    $(wrapper).replaceWith(placeholder('courseManagers'))
    bump(S, 'shortcodeExpandedRemoved.courseManagers')
  })
  // the template slot that carries the shortcode in course bodies (section#courseManagers)
  $('section#courseManagers').each((_, sec) => {
    if ($(sec).find('x-coursedata[data-kind="courseManagers"]').length) {
      $(sec).replaceWith($(sec).find('x-coursedata').first().clone())
    } else if (!textLen(S, sec)) {
      $(sec).replaceWith(placeholder('courseManagers'))
      bump(S, 'courseManagersSlotEmpty')
    }
  })
}

/** Climb from `el` while the parent still satisfies `ok`; returns the highest ancestor that does. */
function highestWrapper(S: State, el: AnyNode, ok: (el: AnyNode) => boolean): AnyNode {
  let cur: AnyNode = el
  for (;;) {
    const p = cur.parent as AnyNode | null
    if (!p || p.type !== 'tag') break
    const name = (p as Element).name
    if (name === 'body' || name === 'html') break
    if (S.$(p).is('.tab-pane, .tab-content, .accordion-body, [id^="v-pills"]')) break
    if (!ok(p)) break
    cur = p
  }
  return cur
}

// ---------------------------------------------------------------------------------------------------------------------
// Recognisers
// ---------------------------------------------------------------------------------------------------------------------

const NAV_SEL = '.nav-tabs, .nav-pills, [role="tablist"]'

function hasStructure(S: State, el: Sel): boolean {
  return el.find('table, form, iframe, blockquote, .accordion, .panel-group, .tab-content, x-coursedata, h1').length > 0
}

function youtubeId(u: string): string | null {
  const m = u.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|v\/)|youtu\.be\/)([\w-]{6,})/)
  return m ? m[1] : null
}

function videoBlock(S: State, src: string, title?: string): Block | null {
  void S
  const t = title?.trim() || 'Video'
  const yt = youtubeId(src)
  if (yt) return { blockType: 'videoEmbed', url: `https://www.youtube.com/watch?v=${yt}`, title: t }
  const vm = src.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) return { blockType: 'videoEmbed', url: `https://vimeo.com/${vm[1]}`, title: t }
  return null
}

/** iframe → videoEmbed | mapEmbed | iframeEmbed (allowlisted host only, DEC-5). Anything else is dropped and reported. */
function iframeBlock(S: State, el: Element): Block | null {
  const src = absUrl(S, (el.attribs.src ?? '').trim())
  const title = norm(el.attribs.title ?? '')
  const video = videoBlock(S, src, title)
  if (video) return video
  if (isMapEmbedUrl(src)) return { blockType: 'mapEmbed', embedUrl: src, ...(title ? { caption: title } : {}) }
  if (hostAllowed(src, S.allowedHosts)) {
    const h = Number(el.attribs.height)
    return { blockType: 'iframeEmbed', url: src, title: title || 'Embedded content', ...(h >= 200 && h <= 2000 ? { height: h } : {}) }
  }
  S.dropped.iframes.push(src)
  S.unplaced.push(`[iframe] ${snippet(src, 100)}`)
  warn(S, 'iframe-dropped')
  return null
}

function isBtnLink(S: State, n: AnyNode): boolean {
  return tagOf(n) === 'a' && !!(n as Element).attribs.href && /(^|\s)([\w-]*btn[\w-]*|[\w-]+-btn)(\s|$)/i.test(clsOf(S, n)) && !isCls(S, n, /nav-link/)
}

/** CTA hrefs keep in-page anchors (#quickContact): the label is content even though the target id no longer exists. */
function ctaHref(S: State, href: string | undefined): string | null {
  if (href && href.trim().startsWith('#') && href.trim().length > 1) {
    bump(S, 'anchorCtaKept')
    return href.trim()
  }
  return rewriteHref(S, href)
}

function ctaBlocks(S: State, el: Element): Block[] | null {
  const t = textLen(S, el)
  if (!t || t > 120) return null
  if (isBtnLink(S, el)) {
    const href = ctaHref(S, el.attribs.href)
    return href ? [{ blockType: 'cta', label: norm(S.$(el).text()), href }] : null
  }
  const kids = (el.children ?? []).filter((c) => c.type === 'tag' && !['br'].includes((c as Element).name)) as Element[]
  if (!kids.length) return null
  const links: Element[] = []
  for (const k of kids) {
    if (isBtnLink(S, k)) links.push(k)
    else if (['li', 'p', 'div', 'span'].includes(k.name) && S.$(k).children().length === 1 && isBtnLink(S, S.$(k).children()[0]) && textLen(S, k) === textLen(S, S.$(k).children()[0]))
      links.push(S.$(k).children()[0] as Element)
    else return null
  }
  if (['ul', 'ol'].includes(el.name) === false && !['p', 'div', 'li', 'span', 'section'].includes(el.name)) return null
  const joined = links.reduce((a, l) => a + textLen(S, l), 0)
  if (joined < t - 2) return null
  const out: Block[] = []
  for (const l of links) {
    const href = ctaHref(S, l.attribs.href)
    if (href) out.push({ blockType: 'cta', label: norm(S.$(l).text()), href })
  }
  return out.length ? out : null
}

/** Builds the tabs block for `el` when `el` is the lowest common ancestor of a nav and its pane container. */
function tabsOf(S: State, el: Sel): boolean {
  const $ = S.$
  const insideContent = (n: AnyNode) => {
    let p = n.parent as AnyNode | null
    while (p && p !== el[0]) {
      if (p.type === 'tag' && $(p).is('.tab-content')) return true
      p = p.parent as AnyNode | null
    }
    return false
  }
  const tc = el.find('.tab-content').toArray().find((t) => !insideContent(t))
  if (!tc) return false
  const navNode = el.find(NAV_SEL).toArray().find((n) => !insideContent(n) && !$.contains(tc, n))
  if (!navNode) return false
  // el must be the lowest common ancestor
  const kids = el.children().toArray()
  if (kids.some((k) => $.contains(k, navNode) && $.contains(k, tc))) return false

  const nav = $(navNode)
  const panes = $(tc).children('.tab-pane').toArray()
  const allPanes = panes.length ? panes : $(tc).find('.tab-pane').toArray().filter((p) => $(p).parentsUntil(tc).filter('.tab-pane').length === 0)
  const triggers = nav.find('a, button').toArray()
  if (!triggers.length || !allPanes.length) return false

  const paneById = new Map<string, Element>()
  for (const p of allPanes) if ((p as Element).attribs.id) paneById.set((p as Element).attribs.id, p as Element)
  const used = new Set<Element>()
  const tabs: { label: string; blocks: Block[] }[] = []
  triggers.forEach((t, i) => {
    const a = (t as Element).attribs
    const target = (a['data-bs-target'] ?? a['data-target'] ?? (a.href?.startsWith('#') ? a.href : '') ?? '').replace(/^#/, '') || a['aria-controls'] || ''
    let pane = target ? paneById.get(target) : undefined
    if (!pane && a.id) pane = paneById.get(a.id.replace(/-tab$/, '')) ?? paneById.get('v-pills-' + a.id.replace(/-tab$/, ''))
    if (!pane && triggers.length === allPanes.length) pane = allPanes[i] as Element
    // two buttons pointing at the same pane is a source typo (/new-to-australia/): the second one means the next pane in order
    if (pane && used.has(pane) && allPanes[i] && !used.has(allPanes[i] as Element)) pane = allPanes[i] as Element
    const label = norm($(t).text())
    if (!pane || !label || used.has(pane)) {
      if (label) warn(S, 'tab-label-without-pane')
      return
    }
    used.add(pane)
    tabs.push({ label, blocks: flow(S, $(pane)) })
  })
  for (const p of allPanes) {
    if (!used.has(p as Element) && textLen(S, p) > 0) {
      S.unplaced.push('[orphan tab pane, no visible tab button] ' + snippet($(p).text(), 90))
      warn(S, 'orphan-tab-pane')
      bump(S, 'orphanTabPanes')
    }
  }
  if (!tabs.length) return false
  // The tab nav becomes a placeholder and the pane container is removed, so a heading or intro that shares the wrapper
  // with the tabs is still flowed in order around the block instead of being swallowed by it.
  S.pending.push({ blockType: 'tabs', tabs })
  // swap the whole wrapper that holds nothing but the nav (a `<nav>` or `.container` around it would otherwise swallow the placeholder)
  let slot: AnyNode = navNode
  while (slot.parent && slot.parent !== el[0] && textLen(S, slot.parent as AnyNode) - textLen(S, navNode) <= 2) slot = slot.parent as AnyNode
  $(slot).replaceWith(`<x-block data-ref="${S.pending.length - 1}"></x-block>`)
  $(tc).remove()
  return true
}

function accordionOf(S: State, el: Sel): Block | null {
  const $ = S.$
  let items: Sel
  if (el.is('.accordion, .panel-group')) {
    items = el.children('.accordion-item, .card, .panel')
    // malformed WP markup nests later items inside the first one (unclosed div): take every item that is not inside another item's body
    const all = el.find('.accordion-item').filter((_, it) => !$(it).parentsUntil(el[0] as Element).filter('.accordion-body, .accordion-collapse, .card-body, .collapse').length)
    if (all.length > items.length) items = all
    if (!items.length) items = el.find('.accordion-item, .panel').first().parent().children()
  } else {
    const kids = el.children('.card')
    if (kids.length >= 2 && kids.length === el.children().length && kids.toArray().every((k) => $(k).find('.collapse').length && $(k).find('.card-header, [data-bs-toggle="collapse"]').length)) items = kids
    else return null
  }
  const out: { title: string; blocks: Block[] }[] = []
  items.each((_, it) => {
    const item = $(it)
    const header = item.find('.accordion-header, .card-header, .panel-heading, .accordion-button, [data-bs-toggle="collapse"]').first()
    const title = norm(header.text())
    let body = item.find('.accordion-body, .card-body, .panel-body').first()
    if (!body.length) body = item.find('.accordion-collapse, .collapse, .panel-collapse').first()
    if (!title || !body.length) return
    // the body is walked like any other flow, so a table inside it stays a nested `table` block (DEC-15d)
    out.push({ title, blocks: flow(S, body) })
  })
  if (!out.length) return null
  return { blockType: 'accordion', items: out }
}

function tableOf(S: State, el: Sel): Block | null {
  const $ = S.$
  const rows: string[][] = []
  let headerRows = 0
  let leadingHeader = true
  el.find('tr').each((_, tr) => {
    if ($(tr).closest('table')[0] !== el[0]) return
    const cells = $(tr).children('th,td').toArray()
    const vals = cells.map((c) => cleanRich(inlineOf(S, ((c as Element).children ?? []) as AnyNode[]).replace(/<img[^>]*>/g, '')).replace(/^<p>|<\/p>$/g, '') || strip(inlineOf(S, ((c as Element).children ?? []) as AnyNode[])))
    if (!vals.some((v) => strip(v))) return
    rows.push(vals)
    const allTh = cells.length > 0 && cells.every((c) => (c as Element).name === 'th')
    if (leadingHeader && (allTh || $(tr).parent().is('thead'))) headerRows++
    else leadingHeader = false
  })
  if (!rows.length) return null
  const caption = norm(el.children('caption').text())
  const b: Block = { blockType: 'table', rows, headerRows }
  if (caption) b.caption = caption
  return b
}

function testimonialOf(S: State, el: Sel): Block | null {
  const $ = S.$
  // markup seen: blockquote > footer/cite, and the IHM course pages' div.testimony-item > img + h4(name) + loose quote text
  let nameEl = el.find('footer, cite, figcaption, .name, .author').first()
  if (!nameEl.length && !el.is('blockquote')) nameEl = el.find('h2, h3, h4, h5, h6').first()
  let name = norm(nameEl.text())
  const clone = el.clone()
  clone.find('footer, cite, figcaption, .name, .author').remove()
  if (!el.is('blockquote')) clone.find('h2, h3, h4, h5, h6').first().remove()
  let quote = norm(clone.text())
  if (!name) {
    const m = quote.match(/^([^]*?)\s*[—–~-]\s*([A-Z][^—–~]{2,60})$/)
    if (m) {
      quote = m[1]
      name = m[2]
    }
  }
  name = name.replace(/^[—–~-]\s*/, '')
  if (!quote || !name) return null
  void $
  return { blockType: 'testimonial', quote: quote.replace(/^["“]|["”]$/g, ''), name }
}

function cardGridOf(S: State, el: Sel, lenient = false): Block | null {
  const $ = S.$
  if (el.find('.youtube-player, iframe, table, form').length) return null
  const kids = el.children().toArray().filter((k) => textLen(S, k) > 0 || $(k).find('img').length)
  if (kids.length < 3) return null
  const cards: Record<string, unknown>[] = []
  for (const k of kids) {
    const root = $(k).find('.card').length === 1 ? $(k).find('.card').first() : $(k)
    const heading = root.find('h2, h3, h4, h5, h6, .card-title').first()
    const title = norm(heading.text())
    const img = root.find('img').toArray().find((i) => isSafeImg((i as Element).attribs.src ?? ''))
    const hasImg = root.find('img').length > 0
    const hasLink = root.find('a[href]').length > 0
    const hasBody = textLen(S, root) > title.length + 5
    if (!title || !(hasImg || root.is('.card') || root.find('.card-body').length || (hasLink && hasBody) || (lenient && (hasBody || hasLink)))) return null
    if (textLen(S, root) > 700) return null
    const body = root.clone()
    body.find('h2, h3, h4, h5, h6, .card-title').first().remove()
    const link = root.find('a[href]').first()
    // the "Read more" style link becomes card.href, so it is not repeated in the text
    if (link.length && textLen(S, link) <= 30) body.find('a[href]').first().remove()
    const text = richHtml(S, body.contents().toArray())
    const card: Record<string, unknown> = { title, text }
    const bg = root.find('[style*="url("]').toArray().map((n) => ((n as Element).attribs.style ?? '').match(/url\(\s*['"]?([^)'"]+)['"]?\s*\)/)?.[1]).find((u) => u && isSafeImg(u))
    if (img) card.image = { src: absUrl(S, (img as Element).attribs.src), alt: (img as Element).attribs.alt ?? '' }
    else if (bg) card.image = { src: absUrl(S, bg), alt: '' }
    const href = rewriteHref(S, link.attr('href'))
    if (href) card.href = href
    cards.push(card)
  }
  return cards.length >= 3 ? { blockType: 'cardGrid', cards } : null
}

function imageTextOf(S: State, el: Sel): Block | null {
  const $ = S.$
  const cols = el.children().toArray().filter((k) => textLen(S, k) > 0 || $(k).find('img').length)
  if (cols.length !== 2) return null
  if (!cols.every((c) => /(^|\s)col(-|\s|$)/.test(clsOf(S, c)) || /(^|\s)col-/.test(clsOf(S, c)))) return null
  const picOf = (c: AnyNode) => $(c).find('img').toArray().find((i) => isSafeImg((i as Element).attribs.src ?? ''))
  const [a, b] = cols
  const pa = picOf(a)
  const pb = picOf(b)
  let imgCol: AnyNode | undefined
  let txtCol: AnyNode | undefined
  let pos: 'left' | 'right' = 'left'
  if (pa && !pb && textLen(S, a) <= 60 && textLen(S, b) >= 40) [imgCol, txtCol, pos] = [a, b, 'left']
  else if (pb && !pa && textLen(S, b) <= 60 && textLen(S, a) >= 40) [imgCol, txtCol, pos] = [b, a, 'right']
  if (!imgCol || !txtCol) return null
  if (hasStructure(S, $(txtCol)) || $(txtCol).find('.card, .owl-carousel').length) return null
  const img = picOf(imgCol) as Element
  const text = richHtml(S, $(txtCol).contents().toArray())
  if (!strip(text)) return null
  return { blockType: 'imageText', image: { src: absUrl(S, img.attribs.src), alt: img.attribs.alt ?? '' }, text, imagePosition: pos }
}

/**
 * owl-carousel → blocks, never richText (DEC-15c). Items are classified by markup: video testimonials → videoEmbed,
 * quote + name → testimonial, staff cards (name + designation only, never the email) and blog teasers → one carousel cardGrid.
 * Returns null when any item is not recognised, so the caller can fall back and flag the page.
 */
function carouselOf(S: State, el: Sel): Block[] | null {
  const $ = S.$
  let items = el.children('.item')
  if (!items.length) items = el.children()
  const live = items.toArray().filter((i) => textLen(S, i) > 0 || $(i).find('img, .youtube-player').length)
  if (!live.length) return null
  const out: Block[] = []
  const cards: Record<string, unknown>[] = []
  for (const node of live) {
    const item = $(node)
    const yt = item.find('.youtube-player[data-id]').first()
    if (yt.length) {
      const name = norm(item.find('h1, h2, h3, h4, h5, h6, .testimonial-name').first().text()) || norm(yt.attr('data-title') ?? '')
      out.push({ blockType: 'videoEmbed', url: `https://www.youtube.com/watch?v=${yt.attr('data-id')}`, title: name || 'Video' })
      continue
    }
    const nameEl = item.find('.testimonial-name, .testimony-name, .author').first()
    const quote = norm(item.find('p').first().text())
    if (nameEl.length && quote.length >= 20) {
      out.push({ blockType: 'testimonial', quote: quote.replace(/^["“]|["”]$/g, ''), name: norm(nameEl.text()) })
      continue
    }
    const person = item.find('.cmCard, .courseManagers-card').first()
    if (person.length) {
      const title = norm(person.find('.name-info').first().text())
      const role = norm(person.find('p').toArray().map((p) => $(p).text()).find((t) => /designation/i.test(t)) ?? '').replace(/^designation\s*:?\s*/i, '')
      if (!title) return null
      cards.push({ title, text: role ? `<p>${esc(role)}</p>` : '' })
      bump(S, 'personalLinksStripped')
      continue
    }
    const news = item.find('.news-list-item').first()
    if (news.length) {
      const title = norm(news.find('h1, h2, h3, h4, h5, h6').first().text())
      if (!title) return null
      const card: Record<string, unknown> = { title, text: '' }
      const href = rewriteHref(S, news.find('a[href]').first().attr('href'))
      if (href) card.href = href
      const bg = item.find('[style*="url("]').toArray().map((n) => ((n as Element).attribs.style ?? '').match(/url\(\s*['"]?([^)'"]+)['"]?\s*\)/)?.[1]).find((u) => u && isSafeImg(u))
      if (bg) card.image = { src: absUrl(S, bg), alt: '' }
      cards.push(card)
      continue
    }
    return null
  }
  if (cards.length) out.push({ blockType: 'cardGrid', variant: 'carousel', cards })
  return out
}

function heroOf(S: State, h1: Element): Block | null {
  const $ = S.$
  const heading = norm($(h1).text())
  if (!heading) return null
  const b: Block = { blockType: 'hero', heading }
  const next = $(h1).next()
  if (next.length) {
    const cls = next.attr('class') ?? ''
    const t = norm(next.text())
    if (t && t.length <= 140 && /lead|sub-?title|sub-?head|tagline|banner-text/i.test(cls)) {
      b.subheading = t
      next.remove()
    }
  }
  // image: background-image url on h1 or up to 3 ancestors, else a direct <img> sibling in its parent / grandparent
  const chain = [$(h1), ...$(h1).parents().toArray().slice(0, 3).map((p) => $(p))]
  for (const c of chain) {
    const m = (c.attr('style') ?? '').match(/background(?:-image)?\s*:[^;]*url\(\s*['"]?([^)'"]+)['"]?\s*\)/i)
    if (m && isSafeImg(m[1])) {
      b.image = { src: absUrl(S, m[1]), alt: '' }
      break
    }
  }
  if (!b.image) {
    for (const c of [$(h1).parent(), $(h1).parent().parent()]) {
      const img = c.children('img').toArray().find((i) => isSafeImg((i as Element).attribs.src ?? '')) as Element | undefined
      if (img) {
        b.image = { src: absUrl(S, img.attribs.src), alt: img.attribs.alt ?? '' }
        $(img).remove()
        break
      }
    }
  }
  // banner rows: the h1 in one column, a picture alone in the sibling column (`.row > .col-md-5 h1 + .col-md-7 img`)
  if (!b.image) {
    const row = $(h1).closest('.row')
    const cols = row.children().toArray()
    const own = cols.find((c) => c === h1 || $.contains(c as Element, h1))
    for (const c of cols) {
      if (c === own || textLen(S, c) > 0) continue
      const img = $(c).find('img').toArray().find((i) => isSafeImg((i as Element).attribs.src ?? '')) as Element | undefined
      if (img) {
        b.image = { src: absUrl(S, img.attribs.src), alt: img.attribs.alt ?? '' }
        $(c).remove()
        bump(S, 'heroImageFromSiblingColumn')
        break
      }
    }
  }
  return b
}

// ---------------------------------------------------------------------------------------------------------------------
// Step 3: the flow walk
// ---------------------------------------------------------------------------------------------------------------------

/** Flag richText produced from a widget we cannot reproduce. Captions shorter than `keepShort` chars (video captions) stay placed. */
function markFallback(blocks: Block[], keepShort = 0): void {
  for (const b of blocks) {
    if (b.blockType === 'richText') {
      if (!(keepShort && strip(String(b.html)).length < keepShort)) b.reviewStatus = 'check'
    } else if (b.blockType === 'tabs') for (const t of b.tabs as { blocks: Block[] }[]) markFallback(t.blocks, keepShort)
    else if (b.blockType === 'accordion') for (const t of b.items as { blocks: Block[] }[]) markFallback(t.blocks, keepShort)
  }
}

function flow(S: State, parent: Sel): Block[] {
  const { $ } = S
  const out: Block[] = []
  let buf: AnyNode[] = []
  const flush = () => {
    if (!buf.length) return
    const html = richHtml(S, buf)
    buf = []
    if (html) out.push({ blockType: 'richText', html })
  }
  const fallback = (el: AnyNode, reason: string) => {
    flush()
    const html = richHtml(S, [el])
    const text = strip(html)
    if (!text) return
    out.push({ blockType: 'richText', html, reviewStatus: 'check' })
    if (reason === 'button') S.interactiveFallbacks++
    S.unplaced.push(`[${reason}] ${snippet(text, 100)}`)
    bump(S, 'fallback.' + reason)
  }

  for (const node of parent.contents().toArray()) {
    // a recogniser may have taken a later sibling already (the hero's picture column): skip detached nodes
    if (!node.parent) continue
    if (node.type === 'text') {
      if (node.data.trim()) buf.push(node)
      continue
    }
    if (node.type !== 'tag') continue
    const el = node as Element
    const $el = $(el)
    const name = el.name
    const cls = el.attribs.class ?? ''

    if (name === 'x-block') {
      flush()
      out.push(S.pending[Number(el.attribs['data-ref'])])
      continue
    }
    if (name === 'x-coursedata') {
      flush()
      out.push({ blockType: 'courseData', kind: el.attribs['data-kind'] })
      continue
    }
    if (['script', 'style', 'head', 'noscript', 'br', 'hr'].includes(name)) {
      if (name === 'br') buf.push(el)
      continue
    }
    if (/display\s*:\s*none/i.test(el.attribs.style ?? '') || CHROME_CLASS.test(cls)) {
      if (textLen(S, el)) {
        bump(S, 'hiddenOrChromeDropped')
        S.removedChars += norm($el.text()).replace(/\s/g, '').length
      }
      continue
    }
    const empty = !textLen(S, el) && !$el.find('img, iframe, table, form, x-coursedata, .youtube-player').length && !['img', 'iframe', 'form'].includes(name) && !$el.is('.youtube-player[data-id]')
    if (empty) continue

    // video: YouTube lite player (div.youtube-player[data-id]) and iframes
    if (cls.includes('youtube-player') && el.attribs['data-id']) {
      flush()
      // a caption heading beside the player (`.pressmeetVideo > .youtube-player + h5`) is its title
      let title = norm(el.attribs['data-title'] ?? '')
      const caption = $el.siblings('h2, h3, h4, h5, h6')
      if (!title && caption.length === 1 && textLen(S, el.parent as AnyNode) === textLen(S, caption[0]) && textLen(S, caption[0]) <= 120) {
        title = norm(caption.text())
        caption.remove()
      }
      out.push({ blockType: 'videoEmbed', url: `https://www.youtube.com/watch?v=${el.attribs['data-id']}`, title: title || 'Video' })
      continue
    }
    if (name === 'iframe') {
      flush()
      const block = iframeBlock(S, el)
      if (block) out.push(block)
      continue
    }
    if (name === 'form') {
      flush()
      const action = el.attribs.action ?? ''
      const formKey = formKeyForAction(action)
      if (formKey) out.push({ blockType: 'enquiryForm', formKey })
      else {
        // not one of the 25 canonical forms (library search, external hosts): there is nothing to place, say so
        S.dropped.forms.push(action || '(none)')
        S.unplaced.push(`[form] ${snippet(action || '(no action)', 100)}`)
        warn(S, 'form-unmapped')
        bump(S, 'formsDropped')
      }
      continue
    }
    if (name === 'table') {
      flush()
      const t = tableOf(S, $el)
      if (t) out.push(t)
      continue
    }
    if (name === 'blockquote' || /(^|\s)(testimonial(-item)?|testimony-item)(\s|$)/.test(cls)) {
      const t = testimonialOf(S, $el)
      if (t) {
        flush()
        out.push(t)
      } else fallback(el, 'blockquote-without-name')
      continue
    }
    if (name === 'h1' && !S.heroDone) {
      const h = heroOf(S, el)
      if (h) {
        flush()
        S.heroDone = true
        out.push(h)
        continue
      }
    }
    if (name === 'button') {
      fallback(el, 'button')
      continue
    }
    if (name === 'dl' || name === 'pre') {
      fallback(el, name)
      continue
    }
    if (isBtnLink(S, el)) {
      const c = ctaBlocks(S, el)
      if (c) {
        flush()
        out.push(...c)
        continue
      }
    }
    if (INLINE_TAGS.has(name) || PROSE_TAGS.has(name)) {
      if (name === 'p' || name === 'ul' || name === 'ol' || name === 'div' || name === 'li') {
        const c = ctaBlocks(S, el)
        if (c) {
          flush()
          out.push(...c)
          continue
        }
      }
      // a prose element that hides a pattern (e.g. a p holding an iframe / table) is flowed instead of buffered
      if (PROSE_TAGS.has(name) && $el.find('iframe, table, form, .youtube-player, x-coursedata').length) {
        flush()
        out.push(...flow(S, $el))
        continue
      }
      buf.push(el)
      continue
    }

    // containers
    if (name === 'nav') {
      fallback(el, 'nav')
      continue
    }
    if (!BLOCK_TAGS.has(name) && !['li', 'ul', 'ol'].includes(name)) {
      // unknown tag: flow into it
      flush()
      out.push(...flow(S, $el))
      continue
    }
    if ($el.find('.tab-content').length && tabsOf(S, $el)) {
      flush()
      out.push(...flow(S, $el))
      continue
    }
    const acc = $el.is('.accordion, .panel-group') || $el.children('.card').length >= 2 ? accordionOf(S, $el) : null
    if (acc) {
      flush()
      out.push(acc)
      continue
    }
    const ctas = ctaBlocks(S, el)
    if (ctas) {
      flush()
      out.push(...ctas)
      continue
    }
    if (UI_FALLBACK_CLASS.test(cls)) {
      flush()
      if (/(^|\s)owl-carousel(\s|$)/.test(cls)) {
        const recognised = carouselOf(S, $el)
        if (recognised) {
          out.push(...recognised)
          bump(S, 'carouselRecognised')
          continue
        }
        const grid = cardGridOf(S, $el, true)
        if (grid) {
          out.push({ ...grid, variant: 'carousel' })
          bump(S, 'carouselAsCardGrid')
          continue
        }
      }
      const sub = flow(S, $el)
      const hasVideo = sub.some((b) => b.blockType === 'videoEmbed')
      markFallback(sub, hasVideo ? 80 : 0)
      const label = (cls.match(UI_FALLBACK_CLASS) ?? [])[2] ?? 'ui'
      const txt = sub.filter((b) => b.blockType === 'richText').map((b) => strip(String(b.html))).join(' ')
      if (txt) S.unplaced.push(`[${label}] ${snippet(txt, 100)}`)
      bump(S, 'fallback.' + label)
      if (txt) S.interactiveFallbacks++
      warn(S, `ui-widget:${label}`)
      out.push(...sub)
      continue
    }
    if ($el.children().length >= 3) {
      const grid = cardGridOf(S, $el)
      if (grid) {
        flush()
        out.push(grid)
        continue
      }
    }
    if ($el.children().length >= 2) {
      const it = imageTextOf(S, $el)
      if (it) {
        flush()
        out.push(it)
        continue
      }
    }
    // plain wrapper: unwrap and flow. Unknown classes are tallied (recognition vocabulary for the next round).
    for (const c of cls.split(/\s+/).filter(Boolean)) if (!BENIGN_CLASS.test(c)) S.unknownClasses[c] = (S.unknownClasses[c] ?? 0) + 1
    flush()
    out.push(...flow(S, $el))
  }
  flush()

  // merge adjacent richText blocks of the same review status
  const merged: Block[] = []
  for (const b of out) {
    const last = merged[merged.length - 1]
    if (last && last.blockType === 'richText' && b.blockType === 'richText' && last.reviewStatus === b.reviewStatus) {
      last.html = String(last.html) + String(b.html)
    } else merged.push(b)
  }
  return merged
}

// ---------------------------------------------------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------------------------------------------------

function blockChars(b: Block): { placed: number; fallback: number } {
  const n = (s: unknown) => (typeof s === 'string' ? strip(s).length : 0)
  switch (b.blockType) {
    case 'richText': {
      const c = n(b.html)
      return b.reviewStatus === 'check' ? { placed: 0, fallback: c } : { placed: c, fallback: 0 }
    }
    case 'hero':
      return { placed: n(b.heading) + n(b.subheading), fallback: 0 }
    case 'tabs': {
      let p = 0
      let f = 0
      for (const t of b.tabs as { label: string; blocks: Block[] }[]) {
        p += t.label.length
        for (const x of t.blocks) {
          const c = blockChars(x)
          p += c.placed
          f += c.fallback
        }
      }
      return { placed: p, fallback: f }
    }
    case 'accordion': {
      let p = 0
      let f = 0
      for (const i of b.items as { title: string; blocks: Block[] }[]) {
        p += i.title.length
        for (const x of i.blocks) {
          const c = blockChars(x)
          p += c.placed
          f += c.fallback
        }
      }
      return { placed: p, fallback: f }
    }
    case 'table':
      return { placed: (b.rows as string[][]).reduce((a, r) => a + r.reduce((x, c) => x + n(c), 0), 0), fallback: 0 }
    case 'imageText':
      return { placed: n(b.text), fallback: 0 }
    case 'cardGrid':
      return { placed: (b.cards as { title: string; text: string }[]).reduce((a, c) => a + c.title.length + n(c.text), 0), fallback: 0 }
    case 'testimonial':
      return { placed: n(b.quote) + n(b.name), fallback: 0 }
    case 'cta':
      return { placed: n(b.label), fallback: 0 }
    default:
      return { placed: 0, fallback: 0 }
  }
}

/** All human text in a block tree, used for the coverage check (extracted text vs source text). */
function blockText(b: Block): string {
  const n = (x: unknown) => (typeof x === 'string' ? strip(x) : '')
  switch (b.blockType) {
    case 'richText': return n(b.html)
    case 'hero': return n(b.heading) + n(b.subheading)
    case 'tabs': return (b.tabs as { label: string; blocks: Block[] }[]).map((t) => t.label + t.blocks.map(blockText).join('')).join('')
    case 'accordion': return (b.items as { title: string; blocks: Block[] }[]).map((i) => i.title + i.blocks.map(blockText).join('')).join('')
    case 'table': return (b.rows as string[][]).map((r) => r.map(n).join('')).join('') + n(b.caption)
    case 'imageText': return n(b.text)
    case 'cardGrid': return (b.cards as { title: string; text: string }[]).map((c) => c.title + n(c.text)).join('')
    case 'testimonial': return n(b.quote) + n(b.name)
    case 'cta': return n(b.label)
    default: return ''
  }
}

function countBlocks(blocks: Block[], stats: Record<string, number>): void {
  for (const b of blocks) {
    const k = 'block.' + b.blockType
    stats[k] = (stats[k] ?? 0) + 1
    if (b.blockType === 'courseData') stats[`courseData.${b.kind}`] = (stats[`courseData.${b.kind}`] ?? 0) + 1
    if (b.blockType === 'richText' && b.reviewStatus === 'check') stats['block.richText.fallback'] = (stats['block.richText.fallback'] ?? 0) + 1
    if (b.blockType === 'tabs') for (const t of b.tabs as { blocks: Block[] }[]) countBlocks(t.blocks, stats)
    if (b.blockType === 'accordion') for (const t of b.items as { blocks: Block[] }[]) countBlocks(t.blocks, stats)
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------------------------------------------------

export function extract(html: string, ctx: ExtractCtx): ExtractResult {
  const stats: Record<string, number> = {}
  const warnings = new Set<string>()
  const raw = html ?? ''

  // diagnostics about what the first pass will remove
  stats.scriptsDropped = (raw.match(/<script\b/gi) ?? []).length
  stats.styleTagsDropped = (raw.match(/<style\b/gi) ?? []).length
  stats.onHandlersDropped = (raw.match(/\son[a-z]+\s*=/gi) ?? []).length
  const iframeSrcs = [...raw.matchAll(/<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1])

  // content that only exists inside inline scripts (staff pages: researchData/grantsData/activitiesData arrays rendered client side)
  let lostChars = 0
  for (const m of raw.matchAll(/<script\b[^>]*>([^]*?)<\/script>/gi)) {
    if (/\b\w*(Data|data)\s*=\s*\[/.test(m[1]) && m[1].length > 400) {
      const text = [...m[1].matchAll(/["']([^"'\\]{12,})["']/g)].map((x) => x[1]).join(' ')
      lostChars += text.length
    }
  }
  if (lostChars) {
    stats['lostJsDataChars'] = lostChars
    warnings.add('js-rendered-data-lost')
  }

  // Step 1
  const allowedHosts = [...new Set([...(ctx.allowedEmbedHosts ?? []), ...SEED_EMBED_HOSTS])]
  const clean = sanitizeHtml(hoistFormActions(raw), firstPass(allowedHosts))
  const keptIframes = (clean.match(/<iframe\b/gi) ?? []).length
  stats.iframesDropped = Math.max(0, iframeSrcs.length - keptIframes)
  if (stats.iframesDropped) {
    const hosts = new Set<string>()
    for (const s of iframeSrcs) {
      try {
        hosts.add(new URL(s, ctx.url).hostname)
      } catch {
        /* ignore */
      }
    }
    for (const h of hosts) if (![...BASE_IFRAME_HOSTS, ...allowedHosts].includes(h)) warnings.add(`iframe-dropped:${h}`)
  }

  const $ = cheerio.load(clean, { xml: false }, false)
  let origin = 'https://ihm.edu.au'
  try {
    origin = new URL(ctx.url).origin
  } catch {
    /* keep default */
  }
  const S: State = {
    $, ctx, origin, stats, warnings, unplaced: [], unknownClasses: {}, heroDone: false, allowedHosts,
    removedChars: 0, interactiveFallbacks: 0, pending: [], dropped: { iframes: iframeSrcs.filter((u) => !keptSrc(u, allowedHosts)), forms: [] },
  }

  // Step 2 (recognition of shortcode output happens while class/id are still present)
  replaceShortcodes(S)
  if (FEES_WRAPPER_SELECTORS.length) {
    for (const sel of FEES_WRAPPER_SELECTORS) {
      $(sel).each((_, n) => {
        $(n).replaceWith(placeholder('fees'))
      })
    }
  }
  // IHM fees are static tables: flag, keep
  if ($('.tab-pane').toArray().some((p) => /fee/i.test(((p as Element).attribs.id ?? '') + norm($(p).find('caption, h5').first().text())) && $(p).find('table').length)) {
    stats.feesStaticTable = 1
    warnings.add('fees-static-table-kept')
  }

  const sourceChars = norm($.root().text()).replace(/\s/g, '').length
  for (const src of S.dropped.iframes) S.unplaced.push(`[iframe] ${snippet(src, 100)}`)

  // Step 3
  const layout = flow(S, $.root())
  const extractedChars = layout.map(blockText).join('').replace(/\s/g, '').length
  const expected = Math.max(1, sourceChars - S.removedChars)
  stats.sourceChars = sourceChars
  stats.removedChars = S.removedChars
  stats.extractedChars = extractedChars
  const coverage = sourceChars > 0 ? Math.min(1, extractedChars / expected) : 1
  stats.coveragePct = Math.round(coverage * 100)
  if (coverage < 0.9) warnings.add('low-coverage')

  // confidence (30-import): placed/src - 0.05 x interactive fallbacks - 0.10 x unplaced, clamped to 0..1
  let placed = 0
  let fb = 0
  for (const b of layout) {
    const c = blockChars(b)
    placed += c.placed
    fb += c.fallback
  }
  if (lostChars) {
    fb += lostChars
    S.unplaced.push(`[js-rendered-data] ${lostChars} chars of research/grants/activities data live only in an inline script and are not in the HTML`)
  }
  const total = placed + fb
  // a page that is only an embed has no text to place: its single block is the whole content
  const base = sourceChars === 0 ? (layout.length ? 1 : 0) : placed / expected
  const raw01 = base - 0.05 * S.interactiveFallbacks - 0.1 * S.unplaced.length
  const confidence = Math.round(Math.min(1, Math.max(0, raw01)) * 1000) / 1000
  if (total === 0) warnings.add('no-text-content')
  if (confidence < 0.6) warnings.add('review')

  countBlocks(layout, stats)
  stats.textChars = total

  // rule 5 safety net: nothing class/id/style shaped may be in the intermediate output either
  const dump = JSON.stringify(layout)
  if (/\s(class|id|style)\s*=|<(script|style|iframe)\b|javascript:/i.test(dump.replace(/\\"/g, '"'))) warnings.add('attr-leak')

  return {
    layout, confidence, coverage, interactiveFallbacks: S.interactiveFallbacks, dropped: S.dropped,
    unplaced: S.unplaced.slice(0, 60), stats, warnings: [...warnings], unknownClasses: S.unknownClasses,
  }
}
