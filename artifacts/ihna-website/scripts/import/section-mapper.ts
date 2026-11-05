/**
 * Section mapper for course bodies (30-import §7.2 step 6, DEC-15f).
 *
 * `prepareCourseHtml(html)` cuts the page chrome and shortcode output out of a course body (title, fact list, campus list,
 * fee list, Apply/Enquire buttons, student-type switcher, hidden blocks, the commented-out `[StartDates]`) and keeps what it
 * read from them as facts. `mapCourse(layout)` then places the blocks `extract()` (html-to-blocks.ts) produced into the
 * CourseDetail slots by the text of the `.course-details-tabs` labels. It works on the extractor's intermediate blocks;
 * wp-courses.ts turns each slot into real Payload blocks with lib/to-payload.ts, so Lexical and media stay in one place.
 * Pure functions, no I/O and no Payload: tests/courses/section-mapper.test.ts runs it on fixtures.
 */
import * as cheerio from 'cheerio'
import type { AnyNode } from 'domhandler'
import { parseVideoUrl } from '../../src/blocks/embeds'

// ------------------------------------------------------------------ slots and labels

export const SLOTS = ['overview', 'entry', 'structure', 'careers', 'placements', 'pathways', 'faq', 'fees', 'additional'] as const
export type Slot = (typeof SLOTS)[number]
export const SLOT_TITLES: Record<Slot, string> = {
  overview: 'Overview', entry: 'Entry requirements', structure: 'Course structure', careers: 'Career outcomes',
  placements: 'Placements', pathways: 'Pathways', faq: 'Frequently asked questions', fees: 'Fees', additional: 'Additional information',
}

export const normLabel = (s: string): string =>
  cheerio.load(`<p>${s}</p>`)('p').text().toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim()

type LabelRule = { slot: Slot | 'removed'; known: boolean; match: RegExp }
// Spec table first (30-import §7.2 step 6), then the extras observed in the 26 bodies (marked `known: true` where the spec lists them).
const RULES: LabelRule[] = [
  { slot: 'removed', known: true, match: /^(course )?start dates?$/ },
  { slot: 'overview', known: true, match: /^(course details|learning objectives)$/ },
  { slot: 'overview', known: false, match: /^(why choose this package|features|why choose ihm for .+)$/ },
  { slot: 'entry', known: true, match: /^(admission requirements?|entry requirements?|inherent requirements?)$/ },
  { slot: 'structure', known: true, match: /^(course units|course structure and fees|training details)$/ },
  { slot: 'structure', known: false, match: /^(pre course inclusions|units of study)$/ },
  { slot: 'careers', known: true, match: /^(where will this take me|career outcomes|employment opportunities( for graduates)?)$/ },
  { slot: 'placements', known: true, match: /^(professional experience placement|social work field education)$/ },
  { slot: 'pathways', known: true, match: /^(pathways|credit transfer)$/ },
  { slot: 'faq', known: true, match: /^(frequently asked questions|faqs?)$/ },
  { slot: 'fees', known: true, match: /^(fee help|fees and scholarships|fees and charges)$/ },
  { slot: 'additional', known: true, match: /^((are you )?ready to apply|what you need to know|partnership|partners|professional recognition|registration process|institutional partnership|registered partners|(changes in the )?australian nursing registration process)$/ },
]

export function slotForLabel(label: string): { slot: Slot | 'removed'; known: boolean; extension: boolean } {
  return slotForLabelDefault(label)
}
function slotForLabelDefault(label: string): { slot: Slot | 'removed'; known: boolean; extension: boolean } {
  const n = normLabel(label)
  const rule = RULES.find((r) => r.match.test(n))
  // `extension`: a label the spec table does not list but this mapper places (reported, never silently)
  return rule ? { slot: rule.slot, known: rule.known, extension: !rule.known } : { slot: 'additional', known: false, extension: false }
}

// ------------------------------------------------------------------ facts and chrome

export type CourseFacts = {
  title: string
  deliveryMode: string | null
  accreditation: string | null
  aqfLevel: string | null
  units: number | null
  duration: string | null
  cricos: string | null
  campuses: string[]
  availableFor: ('domestic' | 'international')[]
  feeLines: string[]
  applyLink: string | null
  brochureUrl: string | null
  siblingInternationalPath: string | null
  switcherDefinition: string | null
}

export type PreparedCourse = {
  html: string
  facts: CourseFacts
  /** Text cut as page chrome or hidden content (intended removals), in non-space characters. */
  removed: { kind: string; chars: number }[]
  sourceChars: number
  /** `[StartDates` occurrences in the raw body, and how many of them are outside an HTML comment (live) */
  startDates: { tokens: number; live: number }
  testimonials: { quote: string; name: string }[]
}

export const KNOWN_CAMPUSES = ['Melbourne', 'Sydney', 'Brisbane', 'Perth'] as const
const flat = (s: string) => s.replace(/\s+/g, ' ').trim()
const nonSpace = (s: string) => s.replace(/\s/g, '').length

export function prepareCourseHtml(rawHtml: string): PreparedCourse {
  const startDates = {
    tokens: (rawHtml.match(/\[StartDates/gi) ?? []).length,
    live: (rawHtml.replace(/<!--[\s\S]*?-->/g, '').match(/\[StartDates/gi) ?? []).length,
  }
  const stripped = rawHtml.replace(/<b\s*\/>/gi, '</b>') // NCLEX body: `<b/>` opens a bold that swallows the page
    .replace(/<!--[\s\S]*?-->/g, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '')
  const $ = cheerio.load(stripped, null, false)
  const sourceChars = nonSpace($.root().text())
  const removed: { kind: string; chars: number }[] = []
  const cut = (kind: string, sel: string | AnyNode[]) => {
    const nodes = typeof sel === 'string' ? $(sel).toArray() : sel
    for (const n of nodes) {
      const el = $(n)
      if (!el.closest('html, body, :root').length && !n.parent) continue
      const chars = nonSpace(el.text())
      // a chrome selector that matches a huge subtree means unclosed markup swallowed content: keep it, say so
      if (chars > 4000) {
        removed.push({ kind: `SKIPPED (swallows ${chars} chars): ${kind}`, chars: 0 })
        continue
      }
      removed.push({ kind, chars })
      el.remove()
    }
  }

  const titleEl = $('h1').first()
  const title = flat(titleEl.text())
  const facts: CourseFacts = {
    title, deliveryMode: null, accreditation: null, aqfLevel: null, units: null, duration: null, cricos: null,
    campuses: [], availableFor: [], feeLines: [], applyLink: null, brochureUrl: null, siblingInternationalPath: null, switcherDefinition: null,
  }

  // fact list: "Label: value" in `ul.course-basic-details li` (p > span, or li > span)
  $('ul.course-basic-details li').each((_, li) => {
    const el = $(li)
    const value = flat(el.find('span').first().text())
    const label = flat(el.text().replace(el.find('span').first().text(), '')).replace(/:$/, '').toLowerCase()
    if (!value) return
    if (/^delivery mode/.test(label)) facts.deliveryMode = value
    else if (/^accreditation/.test(label)) facts.accreditation = value
    else if (/^aqf level/.test(label)) facts.aqfLevel = value
    else if (/^units/.test(label)) facts.units = Number(value.replace(/\D/g, '')) || null
    else if (/^(course )?duration/.test(label)) facts.duration = flat(el.find('span').first().html()?.replace(/<br\s*\/?>/gi, ' ') ? cheerio.load(`<p>${el.find('span').first().html()!.replace(/<br\s*\/?>/gi, ' ')}</p>`)('p').text() : value)
    else if (/^cricos/.test(label)) facts.cricos = value
  })

  // campuses and availability
  const campusText = [
    ...$('ul.camp-loc li').toArray().map((x) => $(x).text()),
    ...$('.payonline-sec li').toArray().map((x) => $(x).text()),
    ...$('.payonline-sec').toArray().map((x) => $(x).find('ul').first().text()),
  ].join(' ')
  facts.campuses = KNOWN_CAMPUSES.filter((c) => new RegExp(`\\b${c}\\b`, 'i').test(campusText))
  const avail = flat($('ul.camp-loc').text())
  if (/domestic/i.test(avail)) facts.availableFor.push('domestic')
  if (/international/i.test(avail)) facts.availableFor.push('international')

  // fees list in the payonline bar
  facts.feeLines = $('ul.payUl li').toArray().map((x) => flat($(x).text())).filter(Boolean)
  if (!facts.feeLines.length) {
    const m = flat($('.payonline-sec').text()).match(/(?:On Campus:\s*)?Total Tuition Fee:?\s*AUD\s*\$[\d,]+/i)
    if (m) facts.feeLines.push(m[0])
  }

  // buttons: Apply / brochure (the template regenerates the buttons from course fields)
  $('a').each((_, a) => {
    const href = $(a).attr('href') ?? ''
    const label = flat($(a).text())
    if (!facts.applyLink && /^(apply|enrol)\b/i.test(label) && /^https?:/.test(href)) facts.applyLink = href
    if (!facts.brochureUrl && /download.*(brochure|guide)/i.test(label) && /\.pdf$/i.test(href)) facts.brochureUrl = href
  })

  // student-type switcher: the sibling page link and the definition sentence
  const intl = $('.ihm-switcher-toggle-group a').toArray().find((a) => /international/i.test($(a).text()) && ($(a).attr('href') ?? '').startsWith('/courses/'))
  if (intl) facts.siblingInternationalPath = $(intl).attr('href') ?? null
  const def = flat($('.ihm-switcher-info p').first().text())
  if (def) facts.switcherDefinition = def

  // the empty `<main id="main">` of the old theme is left open and wraps the whole body: unwrap it
  $('main').each((_, m) => {
    $(m).replaceWith($(m).contents())
  })

  // modals: testimonial modals (full text of the carousel cards) -> testimonials; programme modals keep their title and body
  // (content a visitor opens with a button); a modal with no text is widget chrome
  const testimonials: { quote: string; name: string }[] = []
  $('div.modal').each((_, m) => {
    const el = $(m)
    const heading = el.find('.modal-title, h1, h2, h3, h4, h5, h6').first()
    const title = flat(heading.text().replace(/×/g, ''))
    const body = el.find('.modal-body').first()
    const bodyHtml = body.length ? body.html() ?? '' : ''
    const bodyText = flat(body.length ? body.text() : '')
    if (/testimon/i.test(el.attr('class') ?? '') || /testimon/i.test(el.attr('id') ?? '')) {
      if (title && bodyText) testimonials.push({ quote: bodyText, name: title })
      el.remove()
    } else if (bodyText.length > 30) {
      el.replaceWith(`<h3>${title}</h3>${bodyHtml}`)
    } else {
      removed.push({ kind: 'empty modal', chars: nonSpace(el.text()) })
      el.remove()
    }
  })

  // intended removals
  const navOnly = $('.course-details-sec').toArray().filter((s) => /^admission requirements? faqs/i.test(flat($(s).text())))
  cut('hidden (d-none)', '.d-none')
  cut('jump-link nav', navOnly)
  cut('title (h1)', titleEl.toArray())
  cut('fact list', 'ul.course-basic-details')
  cut('student-type switcher', '.ihm-switcher-header')
  cut('campus / availability / fee lists', 'ul.camp-loc, ul.payUl, .payonline-sec ul')
  // buttons in the pay bar and the floating bar only: the `.course-cta` groups inside the body also carry real links (Credit & RPL,
  // Global Recognition, Events), so those stay and mapCourse drops just the Apply / Enquire / brochure ones
  cut('Apply / Enquire buttons', '.payonline-sec .course-cta, .fixed-cta-btns, .payonline-sec a.gradient-oval-btn, .payonline-sec a.orange-border-btn')
  cut('widget chrome', 'svg')
  return { html: $.html(), facts, removed, sourceChars, startDates, testimonials }
}

// ------------------------------------------------------------------ intermediate blocks (extract() output)

export type Proto = { blockType: string; [k: string]: unknown }

const str = (v: unknown): string => (typeof v === 'string' ? v : '')
// block-level tags become spaces first, so `</p><p>` does not glue two words together
const textOfHtml = (html: string) => cheerio.load(`<div>${html.replace(/<\/?(p|h[1-6]|li|ul|ol|br|div|tr|td|th)\b[^>]*>/gi, ' ')}</div>`)('div').text()
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Visible text of an intermediate block (recursive), one string per text field. */
export function protoText(b: Proto): string[] {
  const own = (s: unknown): string[] => (typeof s === 'string' && s ? [textOfHtml(s.replace(/<br\s*\/?>/gi, ' '))] : [])
  switch (b.blockType) {
    case 'richText': return own(b.html)
    case 'hero': return [...own(b.heading), ...own(b.subheading)]
    case 'cta': return own(b.label)
    case 'tabs': return (b.tabs as { label: string; blocks: Proto[] }[]).flatMap((t) => [...own(t.label), ...t.blocks.flatMap(protoText)])
    case 'accordion': return (b.items as { title: string; body?: string; blocks?: Proto[] }[]).flatMap((i) => [...own(i.title), ...own(i.body), ...(i.blocks ?? []).flatMap(protoText)])
    case 'table': return [...(b.rows as string[][]).flatMap((r) => r.flatMap(own)), ...own(b.caption)]
    case 'imageText': return own(b.text)
    case 'cardGrid': return (b.cards as { title: string; text?: string }[]).flatMap((c) => [...own(c.title), ...own(c.text)])
    case 'testimonial': return [...own(b.quote), ...own(b.name)]
    case 'videoEmbed': return own(b.title)
    default: return []
  }
}

/** Non-space characters of visible text in an intermediate block (recursive). */
export const protoChars = (b: Proto): number => protoText(b).reduce((n, t) => n + nonSpace(t), 0)

const tokens = (text: string): string[] => text.toLowerCase().split(/\s+/).map((w) => w.replace(/[^a-z0-9]/g, '')).filter(Boolean)

/**
 * Word-level coverage (DEC-15f): source words that reappear in the placed blocks / source words, after intended removals.
 * Intended removals on the source side: the expanded census table, the manager cards (names and emails come from `staff`;
 * emails are never captured), "Read more" button text. The prepared HTML already lost the page chrome (prepareCourseHtml).
 */
export function wordCoverage(preparedHtml: string, placed: Proto[], extraText: string[] = []): { coverage: number; sourceWords: number; missing: string[] } {
  const $ = cheerio.load(preparedHtml, null, false)
  $('table').each((_, t) => {
    if (/census date/i.test($(t).text())) $(t).remove()
  })
  $('.cmCard, .courseManagers, .courseManagers-card, h2.captionBG').remove()
  $('a').each((_, a) => {
    if (/^read more$/i.test(flat($(a).text()))) $(a).remove()
  })
  const src = tokens(textOfHtml($.html()))
  // containment against the placed text with spaces removed: immune to how cells and paragraphs were joined
  const blob = [...placed.flatMap(protoText), ...extraText].join(' ').toLowerCase().replace(/[^a-z0-9]/g, '')
  const missing = src.filter((w) => !blob.includes(w))
  return { coverage: src.length ? 1 - missing.length / src.length : 1, sourceWords: src.length, missing }
}

/** Fingerprint of an intermediate block, for the hoisting pass. */
export const fingerprint = (b: Proto): string => JSON.stringify(b)

// ------------------------------------------------------------------ the mapper

/**
 * Census table (`[IHMCensusDate]` output) or StartDates output. The extractor names the first `censusDates`; older builds called it
 * `startDates`. No live course body has real `[StartDates]` output (all commented out), so both mean the census table here.
 */
const isCensusData = (b: Proto) => b.blockType === 'courseData' && (b.kind === 'censusDates' || b.kind === 'startDates')

const CHROME_CTA = (b: Proto) => {
  const label = str(b.label).toLowerCase()
  const href = str(b.href)
  return b.blockType === 'cta' && (href === '#quickContact' || /^(apply|enrol|enquire)\b/.test(label) || (/download.*(brochure|guide)/.test(label) && /\.pdf$/i.test(href)))
}

/** Split rich-text HTML at h2/h3 headings (used when a body has no tab set). The heading stays with its segment. */
export function splitByHeadings(html: string): { label: string | null; html: string }[] {
  const $ = cheerio.load(`<div id="r">${html}</div>`, null, false)
  const segs: { label: string | null; parts: string[] }[] = [{ label: null, parts: [] }]
  $('#r').contents().each((_, n) => {
    const el = $(n)
    if (n.type === 'tag' && /^h[2-3]$/i.test((n as { name: string }).name)) segs.push({ label: flat(el.text()), parts: [$.html(n)] })
    else segs[segs.length - 1].parts.push($.html(n))
  })
  return segs.map((g) => ({ label: g.label, html: g.parts.join('') })).filter((g) => nonSpace(textOfHtml(g.html)) > 0)
}

export type MappedSection = { slot: Slot; title: string; blocks: Proto[] }

export type MapResult = {
  sections: MappedSection[]
  tabs: { label: string; slot: Slot | 'removed'; known: boolean; extension: boolean }[]
  /** non-space characters of source text placed per slot (data blocks carry none) */
  chars: Record<Slot, number>
  removedStartDates: number
  chromeCtasDropped: number
  hasCensus: boolean
  hasManagers: boolean
  videosDropped: string[]
  /** labels of the Apply / Enquire / brochure buttons dropped as page chrome (counted as intended removals) */
  chromeCtaLabels: string[]
  flags: string[]
}

const COURSE_TAB_MIN_KNOWN = 0.5

type SlotFor = typeof slotForLabel

/** The tab set whose labels are mostly in the vocabulary is the course-details tab set. */
function findCourseTabs(layout: Proto[], slotFor: SlotFor = slotForLabel): number {
  let best = -1
  let bestScore = 0
  layout.forEach((b, i) => {
    if (b.blockType !== 'tabs') return
    const tabs = b.tabs as { label: string }[]
    const known = tabs.filter((t) => { const m = slotFor(t.label); return m.known || m.extension }).length
    if (tabs.length >= 3 && known / tabs.length >= COURSE_TAB_MIN_KNOWN && known > bestScore) {
      best = i
      bestScore = known
    }
  })
  return best
}

/** Removes video embeds the VideoEmbed validator would reject (e.g. a playlist `watch?v=videoseries`), recursively. */
function dropBadVideos(blocks: Proto[], dropped: string[]): Proto[] {
  const out: Proto[] = []
  for (const b of blocks) {
    if (b.blockType === 'videoEmbed' && !parseVideoUrl(str(b.url))) {
      dropped.push(str(b.url))
      continue
    }
    if (b.blockType === 'tabs') out.push({ ...b, tabs: (b.tabs as { label: string; blocks: Proto[] }[]).map((t) => ({ ...t, blocks: dropBadVideos(t.blocks, dropped) })) })
    else if (b.blockType === 'accordion') out.push({ ...b, items: (b.items as { title: string; blocks?: Proto[] }[]).map((i) => ({ ...i, blocks: i.blocks ? dropBadVideos(i.blocks, dropped) : i.blocks })) })
    else out.push(b)
  }
  return out
}

export function mapCourse(
  layout: Proto[],
  opts: { switcherDefinition?: string | null; testimonials?: { quote: string; name: string }[]; slotFor?: SlotFor } = {},
): MapResult {
  // `slotFor`: the label vocabulary (IHM's RULES by default; IHNA passes its own, course-ihna.ts)
  const slotForLabel = opts.slotFor ?? slotForLabelDefault
  const flags = new Set<string>()
  const slots = new Map<Slot, Proto[]>()
  const slotLabels = new Map<Slot, string[]>()
  const add = (slot: Slot, blocks: Proto[]) => slots.set(slot, [...(slots.get(slot) ?? []), ...blocks])
  const videosDropped: string[] = []
  let chromeCtasDropped = 0
  const chromeCtaLabels: string[] = []
  let removedStartDates = 0
  let hasCensus = false
  let hasManagers = false
  const tabInfo: MapResult['tabs'] = []

  const tabsAt = findCourseTabs(layout, slotForLabel)
  if (tabsAt < 0) flags.add('no-course-tabs')

  /** drops chrome (hero, Apply/Enquire/brochure buttons, census and manager shortcode output) and notes what it saw */
  const plain = (blocks: Proto[]): Proto[] => {
    const kept: Proto[] = []
    for (const b of blocks) {
      if (b.blockType === 'hero') continue
      if (CHROME_CTA(b)) { chromeCtasDropped++; chromeCtaLabels.push(str(b.label)); continue }
      if (isCensusData(b)) { removedStartDates++; hasCensus = true; continue }
      if (b.blockType === 'courseData' && b.kind === 'courseManagers') { hasManagers = true; continue }
      kept.push(b)
    }
    return dropBadVideos(kept, videosDropped)
  }
  const richBlock = (html: string): Proto => ({ blockType: 'richText', html })

  if (opts.switcherDefinition) add('entry', [richBlock(`<p>${esc(opts.switcherDefinition)}</p>`)])

  layout.forEach((b, i) => {
    if (i === tabsAt) {
      const tabs = b.tabs as { label: string; blocks: Proto[] }[]
      const counts = new Map<Slot, number>()
      for (const t of tabs) {
        const m = slotForLabel(t.label)
        tabInfo.push({ label: flat(textOfHtml(t.label)), ...m })
        if (m.slot !== 'removed') counts.set(m.slot, (counts.get(m.slot) ?? 0) + 1)
      }
      for (const t of tabs) {
        const m = slotForLabel(t.label)
        const label = flat(textOfHtml(t.label))
        if (m.slot === 'removed') {
          // "Course Start Dates": the census table is re-rendered live; anything else on the tab is kept under fees
          const isData = isCensusData
          if (t.blocks.some(isData)) hasCensus = true
          removedStartDates += t.blocks.filter(isData).length
          const rest = plain(t.blocks.filter((x) => !isData(x)))
          if (rest.length) add('fees', rest)
          continue
        }
        if (!m.known) flags.add(m.extension ? `label-extension:${label}` : `unknown-tab:${label}`)
        const labels = slotLabels.get(m.slot) ?? []
        labels.push(label)
        slotLabels.set(m.slot, labels)
        // a slot fed by several tabs keeps each tab label as a heading, so no text is lost
        if ((counts.get(m.slot) ?? 0) > 1) add(m.slot, [richBlock(`<h3>${esc(label)}</h3>`)])
        add(m.slot, plain(t.blocks))
      }
    } else if (tabsAt < 0 && b.blockType === 'richText' && typeof b.html === 'string') {
      // no tab set: place text by its own h2/h3 headings, same vocabulary
      let slot: Slot = 'overview'
      for (const seg of splitByHeadings(b.html)) {
        if (seg.label) {
          const m = slotForLabel(seg.label)
          if (m.slot !== 'removed' && m.slot !== 'additional' && (m.known || m.extension)) slot = m.slot
        }
        add(/considers you/.test(seg.html) ? 'entry' : slot, [richBlock(seg.html)])
      }
    } else if (tabsAt < 0 || i < tabsAt) {
      // before the tab set: intro copy; the student-type sentence belongs with admissions
      const isDefinition = /considers you/.test(JSON.stringify(b))
      add(isDefinition ? 'entry' : 'overview', plain([b]))
    } else {
      // after the tab set: videos, blog cards, testimonials, managers, extra buttons
      const kept = plain([b])
      add('additional', kept)
      if (kept.length) flags.add('tail-content-in-additional')
    }
  })

  const testimonialBlocks: Proto[] = (opts.testimonials ?? []).map((t) => ({ blockType: 'testimonial', quote: t.quote, name: t.name }))
  if (testimonialBlocks.length) add('additional', testimonialBlocks)

  // data blocks go where the shortcode output was: census in fees ("Course Start Dates" sat beside the fee tabs), managers last
  if (hasCensus) add('fees', [{ blockType: 'courseData', kind: 'censusDates' }])
  if (hasManagers) add('additional', [{ blockType: 'courseData', kind: 'courseManagers' }])

  const sections: MappedSection[] = []
  const chars = Object.fromEntries(SLOTS.map((s) => [s, 0])) as Record<Slot, number>
  for (const slot of SLOTS) {
    const blocks = slots.get(slot)
    if (!blocks?.length) continue
    const labels = slotLabels.get(slot) ?? []
    const title = slot === 'additional' ? SLOT_TITLES.additional : labels.length === 1 ? labels[0] : SLOT_TITLES[slot]
    sections.push({ slot, title, blocks })
    chars[slot] = blocks.reduce((n, x) => n + protoChars(x), 0)
  }
  return { sections, tabs: tabInfo, chars, removedStartDates, chromeCtasDropped, hasCensus, hasManagers, videosDropped, chromeCtaLabels, flags: [...flags] }
}

// ------------------------------------------------------------------ hero subheading

/** Text that belongs to the old page chrome (student-type toggle, facts strip) or is a footnote, never hero copy. */
const NOT_INTRO = /select student type|considers you an? ['‘’"]?(domestic|international)|^(domestic|international)\b|delivery mode\s*:|aqf level\s*:|course duration\s*:|cricos|^\*/i

/**
 * The hero subheading: the first real intro paragraph (>= 40 words of prose) in the overview slot, i.e. the text after the
 * title; empty when there is none. Never the WordPress excerpt (it is auto-generated from the page text, toggle labels and
 * facts strip included).
 */
export function introParagraph(sections: MappedSection[], minWords = 40): string | null {
  const overview = sections.find((x) => x.slot === 'overview')
  for (const b of overview?.blocks ?? []) {
    if (b.blockType !== 'richText' || typeof b.html !== 'string') continue
    const $ = cheerio.load(`<div id="r">${b.html}</div>`, null, false)
    for (const p of $('#r > p').toArray()) {
      const text = flat($(p).text())
      if (text.split(/\s+/).length >= minWords && !NOT_INTRO.test(text)) return text
    }
  }
  return null
}
