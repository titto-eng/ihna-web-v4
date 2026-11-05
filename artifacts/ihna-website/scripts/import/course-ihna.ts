/**
 * IHNA course bodies (30-import §7.4, DEC-15f): cuts the page chrome out of an ihna.edu.au course body and returns its labelled
 * sections and key facts. Pure (no I/O, no Payload); `ihna/wp-courses.ts` runs `extract()` on each section and places it with
 * `mapIhnaCourse`. Tests: tests/courses/course-ihna.test.ts.
 *
 * The 21 bodies (WP REST `content.rendered`, 30-480 KB, shortcodes expanded) come in three layouts:
 *   - `v2` (15): `header.masthead` (title h2, `.cd-box` facts, `.course-details-two` campuses/CRICOS/handbook, the student-type card
 *     with its `a.switch-btn` to the other-audience page), `section#course-details-container` (intro column, then `#tabLayout`
 *     desktop tabs `#vTabs` + `#vTabContent` panes; the `.d-md-none` accordion below is the same text again for phones and is cut),
 *     then template sections: `#cta-sec`, `#testimonials-video` (YouTube carousel, kept as videos), `#relatedBlogs`,
 *     `#respected-institution`, `#enquiry-sec` (the enquiry form), `#flexible-classes-widget` (all cut: the CourseDetail template
 *     renders its own CTA, related courses and enquiry form).
 *   - `short` (4 first-aid units): `.course-header-title h1`, an intro column split by `h2.title-h2`, a `.course-overview` table of
 *     facts, and `#courseAccordion > .card` sections.
 *   - `legacy` (2: the BSW package and the English preparatory course): the old `.course-details-sec` layout shared with IHM; these
 *     go through the IHM `prepareCourseHtml` / `mapCourse` with IHNA's extra label rules.
 * The "Course Start Date(s)" tab is the expanded `[CourseStartDates]` output (portal `course_batch_dates`, brief §1.1 D6): it is
 * removed and the course gets `showStartDates: true`, so the startDates block reads the same dates live (DEC-7, 50-portal-data).
 * YouTube `<youtube-widget video-id>` and `[data-video-id]` carousel items become `div.youtube-player[data-id]`, the extractor's
 * video pattern.
 */
import * as cheerio from 'cheerio'
import type { CheerioAPI } from 'cheerio'
import type { AnyNode } from 'domhandler'
import { SLOT_TITLES, slotForLabel, normLabel, protoChars, type MappedSection, type MapResult, type Proto, type Slot } from './section-mapper'

export type IhnaKind = 'v2' | 'short' | 'legacy'

export type IhnaFacts = {
  title: string
  /** National training package code, e.g. HLT54121 (from the title). */
  code: string | null
  deliveryMode: string | null
  duration: string | null
  aqfLevel: string | null
  /** "400 Hours" (Professional Experience Placement). */
  placement: string | null
  campuses: string[]
  cricos: string | null
  brochureUrl: string | null
  handbookUrl: string | null
  applyLink: string | null
  /** The other-audience page (the student-type card's switch button). */
  siblingPath: string | null
  /** The audience this page is for, from the student-type card; null when the page has none. */
  audience: 'domestic' | 'international' | null
  /** Fee text as the static fees section states it (finance-owned `fees`, DEC-67). */
  fee: { value: string; detail: string | null } | null
  /** Banner notes under the title ("This course has been superseded ...", "Online classes are available."). */
  notices: string[]
  /** The student-type definition sentence and its list (kept under admissions). */
  audienceDefinitionHtml: string | null
  /** Short courses: "Label : value" rows of the overview table. */
  overviewRows: { label: string; value: string }[]
}

export type IhnaSection = { label: string; html: string }

export type IhnaPrepared = {
  kind: IhnaKind
  facts: IhnaFacts
  /** Intro copy before the tab set (overview). */
  intro: string
  sections: IhnaSection[]
  /** Videos after the tab set (student testimonials), as extractor-ready HTML. */
  tailVideosHtml: string
  removed: { kind: string; chars: number }[]
  sourceChars: number
  /** The expanded start-date output was found (and removed). */
  startDates: { tab: boolean; dates: number }
  /** Text left outside every placed part (diagnostics only; never written to a report). */
  leftOver?: string
}

const flat = (s: string) => s.replace(/\s+/g, ' ').trim()
const nonSpace = (s: string) => s.replace(/\s/g, '').length
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Comments, inline CSS/JS and inline SVG icons go first: they are a third of every body and never content. */
export function stripNoise(raw: string): string {
  return raw
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
}

export function kindOf(raw: string): IhnaKind {
  if (/id=["']vTabs["']|id=["']tabLayout["']|class=["'][^"']*\bmasthead\b/.test(raw)) return 'v2'
  if (/id=["']courseAccordion["']/.test(raw) && /course-header-title/.test(raw)) return 'short'
  return 'legacy'
}

/** `<youtube-widget video-id>` and `[data-video-id]` items -> the extractor's `div.youtube-player[data-id]` (title kept). */
function normaliseVideos($: CheerioAPI) {
  $('youtube-widget[video-id]').each((_, n) => {
    const el = $(n)
    $(n).replaceWith(`<div class="youtube-player" data-id="${esc(el.attr('video-id') ?? '')}" data-title="${esc(el.attr('data-title') ?? 'Video')}"></div>`)
  })
  // carousel items keep their wrapper (the extractor reads `.owl-carousel` items) and get the player inside
  $('[data-video-id]').each((_, n) => {
    const el = $(n)
    const id = el.attr('data-video-id') ?? ''
    el.removeAttr('data-video-id').html(`<div class="youtube-player" data-id="${esc(id)}" data-title="${esc(el.attr('data-title') ?? 'Student testimonial')}"></div>`)
  })
}

/**
 * Campus tour video block (`.campus-video-sec` / `section#campusTourVid`): a location tab list whose panes hold one video each.
 * Becomes one titled video per campus ("Campus tour: Perth"), with no tab chrome.
 */
function flattenCampusVideos($: CheerioAPI) {
  $('.campus-video-sec, section#campusTourVid').each((_, n) => {
    const sec = $(n)
    const out: string[] = []
    sec.find('[role=tablist] a[href^="#"], [role=tablist] button[data-bs-target^="#"]').each((__, a) => {
      const label = flat($(a).text())
      const target = $(a).attr('href') ?? $(a).attr('data-bs-target') ?? ''
      const pane = target.length > 1 ? sec.find(`[id="${target.slice(1)}"]`) : sec.find('nothing')
      const id = pane.find('[data-id]').attr('data-id') ?? pane.find('youtube-widget').attr('video-id')
      if (id) out.push(`<div class="youtube-player" data-id="${esc(id)}" data-title="${esc(`Campus tour: ${label}`)}"></div>`)
    })
    sec.replaceWith(out.join(''))
  })
}

const emptyFacts = (title: string): IhnaFacts => ({
  title, code: /^([A-Z]{3,}\d{3,}[A-Z]?)\b/.exec(title)?.[1] ?? null, deliveryMode: null, duration: null, aqfLevel: null, placement: null,
  campuses: [], cricos: null, brochureUrl: null, handbookUrl: null, applyLink: null, siblingPath: null, audience: null, fee: null,
  notices: [], audienceDefinitionHtml: null, overviewRows: [],
})

/** Campus names as the course pages write them, in the order the site lists campuses. */
export const IHNA_CAMPUSES = ['Melbourne CBD', 'Heidelberg', 'Sydney', 'Perth', 'Brisbane'] as const
/** "Melbourne" alone is the Melbourne CBD campus; "Melbourne (Heidelberg)" is Heidelberg. */
export function campusNames(text: string): string[] {
  const t = ` ${flat(text)} `
  const out = new Set<string>()
  if (/heidelberg/i.test(t)) out.add('Heidelberg')
  if (/melbourne(?!\s*\(heidelberg)/i.test(t.replace(/melbourne\s*\(heidelberg\)/gi, ''))) out.add('Melbourne CBD')
  for (const c of ['Sydney', 'Perth', 'Brisbane']) if (new RegExp(`\\b${c}\\b`, 'i').test(t)) out.add(c)
  return IHNA_CAMPUSES.filter((c) => out.has(c))
}

/** The fee as the fees section states it: the `.fee-box-lt` price card, else the first "total tuition / total fee ... $X" line. */
export function feeOf($: CheerioAPI, scope: ReturnType<CheerioAPI>): IhnaFacts['fee'] {
  const box = scope.find('.fee-box-lt').first()
  if (box.length) {
    const ps = box.find('p').toArray().map((p) => flat($(p).text())).filter(Boolean)
    const value = ps.find((p) => /\$\s?[\d,]+/.test(p) && !/upfront/i.test(p))
    const upfront = ps.find((p) => /upfront/i.test(p))
    if (value) return { value: value.replace(/[\s*]+/g, ''), detail: upfront ? upfront.replace(/\s*:\s*/, ': ').replace(/\*+$/, '') : null }
  }
  const text = flat(scope.text())
  const m =
    /(?:total tuition (?:cost|fee)[^$.]{0,120}?|the total fee for [^$]{0,120}?|standard tuition fee for [^$]{0,120}?)(?:AUD\s*)?(\$\s?[\d,]+(?:\.\d\d)?\s*\*?)([^.$]{0,60})/i.exec(text)
  if (!m) return null
  const value = `${/AUD/i.test(m[0]) ? 'AUD ' : ''}${m[1].replace(/[\s*]+/g, '')}`
  const tail = flat(m[2].replace(/^\*/, ''))
  return { value, detail: /international|domestic|for 20\d\d/i.test(tail) ? tail.replace(/^for\s+/i, 'For ') : null }
}

// ------------------------------------------------------------------ v2 layout

function prepareV2($: CheerioAPI, removed: IhnaPrepared['removed'], cut: (kind: string, sel: string | AnyNode[]) => void): Omit<IhnaPrepared, 'kind' | 'removed' | 'sourceChars'> {
  const mast = $('header.masthead').first()
  const title = flat(mast.find('h1, h2').first().text())
  const facts = emptyFacts(title)

  // facts: `.cd-box` = p label + ul values
  mast.find('.cd-box').each((_, box) => {
    const el = $(box)
    const label = flat(el.find('p').first().text()).replace(/:$/, '').toLowerCase()
    const values = el.find('ul li').toArray().map((li) => flat($(li).text())).filter(Boolean)
    const value = values.join(' · ') || flat(el.text().replace(el.find('p').first().text(), ''))
    if (!value) return
    if (/^(mode of )?delivery/.test(label)) facts.deliveryMode = value
    else if (/duration/.test(label)) facts.duration = value
    else if (/^aqf/.test(label)) facts.aqfLevel = value
    else if (/placement|pep/.test(label)) facts.placement = values[0] ?? value
  })
  // "AQF Level 5" written without a box on some pages
  if (!facts.aqfLevel) facts.aqfLevel = /AQF Level:?\s*(\d+)/i.exec(flat(mast.text()))?.[1] ?? null
  const two = mast.find('.course-details-two').first()
  facts.campuses = campusNames(two.find('ul li').toArray().map((li) => $(li).text()).join(' · '))
  facts.cricos = /CRICOS Code:?\s*([0-9]{5,6}[A-Z])/i.exec(flat(mast.text()))?.[1] ?? null
  mast.find('a').each((_, a) => {
    const href = ($(a).attr('href') ?? '').trim()
    const label = flat($(a).text()).toLowerCase()
    if (!facts.brochureUrl && /brochure/.test(label) && href) facts.brochureUrl = href
    if (!facts.handbookUrl && /handbook/.test(label) && href) facts.handbookUrl = href
    if (!facts.applyLink && /^(apply|enrol)/.test(label) && /^https?:/.test(href)) facts.applyLink = href
  })
  const sw = mast.find('a.switch-btn').attr('href')
  if (sw?.startsWith('/courses/')) facts.siblingPath = sw.endsWith('/') ? sw : `${sw}/`
  const selected = flat(mast.find('.select-selected').first().text()).toLowerCase()
  facts.audience = /international/.test(selected) ? 'international' : /domestic/.test(selected) ? 'domestic' : null
  const defBox = mast.find('.card-container .mb-0').first()
  if (defBox.length && /considers you/i.test(defBox.text())) {
    const p = flat(defBox.find('p').first().text())
    const items = defBox.find('li').toArray().map((li) => `<li>${esc(flat($(li).text()))}</li>`).join('')
    facts.audienceDefinitionHtml = `<p>${esc(p)}</p>${items ? `<ul>${items}</ul>` : ''}`
  }
  // banner notes under the title (once each)
  const notices = new Set<string>()
  mast.find('.attention-banner, .info-note').each((_, n) => {
    const t = flat($(n).text())
    if (t) notices.add(t)
  })
  facts.notices = [...notices]

  // fees from the fees tab (resolved below once the panes are known)
  const tabs = $('#vTabs').length ? $('#vTabs') : $('#tabLayout [role=tablist]').first()
  const sections: IhnaSection[] = []
  let startTab = false
  let dates = 0
  tabs.find('a[href^="#"], button[data-bs-target^="#"]').each((_, a) => {
    const label = flat($(a).text())
    const id = ($(a).attr('href') ?? $(a).attr('data-bs-target') ?? '').slice(1)
    const pane = $(`[id="${id}"]`).first()
    if (!label || !pane.length) return
    if (/^course start dates?$/i.test(label)) {
      startTab = true
      dates += pane.find('.date-card').length || (flat(pane.text()).match(/\b20\d\d\b/g) ?? []).length
      removed.push({ kind: 'start dates tab (portal [CourseStartDates] output; startDates block)', chars: nonSpace(pane.text()) })
      return
    }
    if (/^fees?\b/i.test(label) && !facts.fee) facts.fee = feeOf($, pane)
    sections.push({ label, html: $.html(pane.contents()) })
  })
  // international fee lines sit in the fees tab under another heading on some pages
  if (!facts.fee) facts.fee = feeOf($, $('#vTabContent'))

  // intro: the first container of #course-details-container, without the jump-link row and the logo strip
  // the id attribute carries a stray class on some pages (`id="course-details-container p-b-0"`)
  const details = $('[id^="course-details-container"]').first()
  const introBox = details.children('.container').first().clone()
  introBox.find('.d-none, .accred-logo-container').remove()
  // the masthead subtitle (h5) is the course excerpt (hero subheading), so it is not repeated in the intro
  const intro = [
    ...facts.notices.map((n) => `<p><strong>${esc(n)}</strong></p>`),
    introBox.html() ?? '',
  ].join('')

  // tail: student testimonials (a video carousel, or a carousel of written quotes) without the section heading
  const tail = $('section#testimonials-video').not('.d-none').first().clone()
  tail.find('h1, h2, h3').first().remove()
  const tailVideosHtml = flat(tail.text()) || tail.find('.youtube-player').length ? (tail.html() ?? '') : ''

  // what is cut (intended removals, counted)
  cut('masthead (title, facts, buttons, student-type card)', mast.toArray())
  cut('phone duplicate of the tabs (.d-md-none accordion)', details.find('.d-md-none').toArray())
  cut('tab layout (placed by section)', details.toArray())
  cut('template sections (CTA band, related blogs, respected institution, enquiry form, flexible-classes widget)', '#cta-sec, #relatedBlogs, #respected-institution, #enquiry-sec, #flexible-classes-widget')
  cut('student testimonials (placed under additional)', '#testimonials-video')
  return { facts, intro, sections, tailVideosHtml, startDates: { tab: startTab, dates } }
}

// ------------------------------------------------------------------ short-course layout

function prepareShort($: CheerioAPI, removed: IhnaPrepared['removed'], cut: (kind: string, sel: string | AnyNode[]) => void): Omit<IhnaPrepared, 'kind' | 'removed' | 'sourceChars'> {
  const title = flat($('.course-header-title h1, h1').first().text())
  const facts = emptyFacts(title)
  const sections: IhnaSection[] = []
  let startTab = false
  let dates = 0

  // overview table: "Label : value"
  const table = $('.course-overview table').first()
  table.find('tr').each((_, tr) => {
    const t = flat($(tr).text())
    const m = /^([^:]{3,60}?)\s*:\s*(.+)$/.exec(t)
    if (m) facts.overviewRows.push({ label: m[1].trim(), value: m[2].trim() })
  })
  const row = (re: RegExp) => facts.overviewRows.find((r) => re.test(r.label))?.value ?? null
  facts.campuses = campusNames(row(/^campus/i) ?? '')
  const theory = row(/online theory/i)
  const practical = row(/practical/i)
  facts.deliveryMode = row(/^(course )?delivery/i) ?? (theory && practical ? 'Blended' : practical ? 'Face to Face' : theory ? 'Online' : null)
  facts.duration =
    row(/duration/i) ?? ([theory && `Online theory: ${theory}`, practical && `On-campus practical: ${practical}`].filter(Boolean).join(' · ') || null)

  // the intro column, split at its h2 headings ("Introduction", "Course Start Dates")
  const introCol = $('.col-lg-8').filter((_, c) => $(c).find('h2.title-h2, h2').length > 0).first()
  let current: IhnaSection | null = null
  const introParts: string[] = []
  introCol.contents().each((_, n) => {
    const el = $(n)
    if (n.type === 'tag' && (n as { name: string }).name === 'h2') {
      current = { label: flat(el.text()), html: '' }
      sections.push(current)
      return
    }
    if (current) current.html += $.html(n)
    else introParts.push($.html(n))
  })
  for (let i = sections.length - 1; i >= 0; i--) {
    if (/^course start dates?$/i.test(sections[i].label)) {
      startTab = true
      const t = cheerio.load(sections[i].html, null, false).root().text()
      dates += (t.match(/\b20\d\d\b/g) ?? []).length
      removed.push({ kind: 'start dates (portal [StartDates] output; startDates block)', chars: nonSpace(t) })
      sections.splice(i, 1)
    }
  }
  // the overview table itself is a section ("At a glance"), the course-delivery facts with it
  if (table.length) sections.push({ label: 'At a glance', html: $.html(table) })

  // accordion cards -> sections
  $('#courseAccordion > .card').each((_, card) => {
    const el = $(card)
    const head = el.children('.card-header').first()
    const label = flat(head.text())
    const body = el.find('.card-body').first()
    if (body.length) {
      if (/^fees?$/i.test(label)) facts.fee = feeOf($, body)
      sections.push({ label, html: body.html() ?? '' })
    } else if (label) {
      // a header-only card ("Course Overview 18 Hours Blended"): its text is a fact line
      const t = flat(el.text())
      sections.push({ label: 'Course overview', html: `<p>${esc(t.replace(/^course overview\s*/i, ''))}</p>` })
    }
  })

  const terms = $('.terms-and-conditions').first()
  if (terms.length) {
    const t = terms.clone()
    const label = flat(t.find('h2').first().text()) || 'Terms and conditions'
    t.find('h2').first().remove()
    sections.push({ label: label.charAt(0) + label.slice(1).toLowerCase(), html: t.html() ?? '' })
  }

  cut('course header (title, apply button, audience links)', '.course-header-title, .course-header-links')
  cut('terms and conditions (placed as a section)', terms.toArray())
  cut('"How to apply?" button', '.course-overview-block .cta-btns')
  cut('intro column (placed by section)', introCol.toArray())
  cut('overview table (placed as a section)', $('.course-overview').toArray())
  cut('accordion (placed by section)', '#courseAccordion')
  cut('awards strip', '#awards-block')
  return { facts, intro: introParts.join(''), sections, tailVideosHtml: '', startDates: { tab: startTab, dates } }
}

// ------------------------------------------------------------------ entry point

/**
 * Written testimonials are `.item > p + h4` (the extractor reads the name from `.testimonial-name`); a `blockquote.alert` is a
 * note under a list ("*This list should be used as a guide only"), not a quotation.
 */
function normaliseQuotes($: CheerioAPI) {
  $('.owl-carousel .item').each((_, n) => {
    const item = $(n)
    const name = item.children('h3, h4, h5, h6').last()
    if (name.length && item.children('p').length) name.addClass('testimonial-name')
  })
  $('blockquote.alert, blockquote.alert-danger, blockquote.note').each((_, n) => {
    $(n).replaceWith(`<p><em>${$(n).html() ?? ''}</em></p>`)
  })
}

export function prepareIhnaCourse(rawHtml: string): IhnaPrepared {
  const kind = kindOf(rawHtml)
  const $ = cheerio.load(stripNoise(rawHtml), null, false)
  normaliseVideos($)
  flattenCampusVideos($)
  normaliseQuotes($)
  const sourceChars = nonSpace($.root().text())
  const removed: IhnaPrepared['removed'] = []
  // a node inside one already cut is not counted twice
  const attached = (n: AnyNode): boolean => {
    let x: AnyNode | null = n
    while (x?.parent) x = x.parent as AnyNode
    return x?.type === 'root'
  }
  const cut = (k: string, sel: string | AnyNode[]) => {
    const nodes = typeof sel === 'string' ? $(sel).toArray() : sel
    for (const n of nodes) {
      if (!attached(n)) continue
      removed.push({ kind: k, chars: nonSpace($(n).text()) })
      $(n).remove()
    }
  }
  const parts = kind === 'v2' ? prepareV2($, removed, cut) : kind === 'short' ? prepareShort($, removed, cut) : null
  if (!parts) throw new Error('legacy layout: use the IHM prepareCourseHtml path')
  // whatever text is left outside the placed parts is reported, never silently dropped
  const left = nonSpace($.root().text())
  if (left) removed.push({ kind: 'left over (not placed)', chars: left })
  return { kind, removed, sourceChars, leftOver: flat($.root().text()).slice(0, 300), ...parts }
}

// ------------------------------------------------------------------ slots

type LabelRule = { slot: Slot | 'removed'; match: RegExp }
/** IHNA tab and accordion labels (normalised by `normLabel`: lower case, & -> and, punctuation -> space). */
export const IHNA_RULES: LabelRule[] = [
  { slot: 'removed', match: /^(course )?start dates?$/ },
  { slot: 'overview', match: /^(why study .+ at ihna|why choose .+|course overview|about the course|introduction|flexibility|mode of delivery|course delivery|delivery mode|who could attend the course|course award|at a glance|how can i become a .+|what does a .+ do|modules)$/ },
  { slot: 'entry', match: /^(entry requirements?|admission requirements?)$/ },
  { slot: 'structure', match: /^(course structure( and fees)?|what will i study|how is the course assessed|assessment guidelines|course units)$/ },
  { slot: 'placements', match: /^(professional experience placement( pep)?)$/ },
  { slot: 'pathways', match: /^((articulation )?pathways?|recognition of prior learning rpl and credit transfer( ct)?|credit transfer)$/ },
  { slot: 'careers', match: /^((possible )?career outcomes?|career options?)$/ },
  { slot: 'faq', match: /^(frequently asked questions|faqs?)$/ },
  { slot: 'fees', match: /^(fees?( and (funding|scholarships|charges))?|vet student loans|packages)$/ },
  { slot: 'additional', match: /^((are you )?ready to apply|campuses|student testimonials|terms and conditions)$/ },
]

export function ihnaSlotForLabel(label: string): { slot: Slot | 'removed'; known: boolean; extension: boolean } {
  const n = normLabel(label)
  const rule = IHNA_RULES.find((r) => r.match.test(n))
  return rule ? { slot: rule.slot, known: true, extension: false } : slotForLabel(label)
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '')
/** Apply / Enquire / brochure buttons are page chrome: the template draws them from course fields. */
const chromeCta = (b: Proto) => {
  const label = str(b.label).toLowerCase()
  return b.blockType === 'cta' && (str(b.href) === '#enquiry-sec' || /^(apply|enrol|enquire)\b/.test(label) || /brochure|handbook/.test(label))
}

/**
 * Places extracted sections into CourseDetail slots by label. `extractSection` turns one section's HTML into intermediate blocks
 * (the caller binds `extract()`); a slot fed by several labels keeps each label as an h3 so no heading is lost.
 */
export function mapIhnaCourse(
  prepared: IhnaPrepared,
  extractSection: (html: string) => Proto[],
): MapResult & { labels: string[] } {
  const flags = new Set<string>()
  const slots = new Map<Slot, { label: string; blocks: Proto[] }[]>()
  const tabs: MapResult['tabs'] = []
  let chromeCtasDropped = 0
  const chromeCtaLabels: string[] = []
  const clean = (blocks: Proto[]) =>
    blocks.filter((b) => {
      if (b.blockType === 'hero') return false
      if (chromeCta(b)) {
        chromeCtasDropped++
        chromeCtaLabels.push(str(b.label))
        return false
      }
      return true
    })
  const add = (slot: Slot, label: string, blocks: Proto[]) => {
    if (!blocks.length) return
    slots.set(slot, [...(slots.get(slot) ?? []), { label, blocks }])
  }

  if (prepared.facts.audienceDefinitionHtml) add('entry', '', [{ blockType: 'richText', html: prepared.facts.audienceDefinitionHtml }])
  add('overview', '', clean(extractSection(prepared.intro)))
  for (const s of prepared.sections) {
    const m = ihnaSlotForLabel(s.label)
    tabs.push({ label: s.label, ...m })
    if (m.slot === 'removed') continue
    if (!m.known) flags.add(m.extension ? `label-extension:${s.label}` : `unknown-tab:${s.label}`)
    add(m.slot, s.label, clean(extractSection(s.html)))
  }
  if (prepared.tailVideosHtml) add('additional', 'Student testimonials', extractSection(prepared.tailVideosHtml))

  const sections: MappedSection[] = []
  const chars = Object.fromEntries((Object.keys(SLOT_TITLES) as Slot[]).map((s) => [s, 0])) as Record<Slot, number>
  for (const slot of Object.keys(SLOT_TITLES) as Slot[]) {
    const parts = slots.get(slot)
    if (!parts?.length) continue
    const labelled = parts.filter((p) => p.label)
    const many = labelled.length > 1
    const blocks = parts.flatMap((p) => (many && p.label ? [{ blockType: 'richText', html: `<h3>${esc(p.label)}</h3>` } as Proto, ...p.blocks] : p.blocks))
    const title = slot === 'additional' ? SLOT_TITLES.additional : labelled.length === 1 && slot !== 'overview' ? labelled[0].label : SLOT_TITLES[slot]
    sections.push({ slot, title, blocks })
    chars[slot] = blocks.reduce((n, b) => n + protoChars(b), 0)
  }
  return {
    sections, tabs, chars, removedStartDates: prepared.startDates.tab ? 1 : 0, chromeCtasDropped, hasCensus: false, hasManagers: false,
    videosDropped: [], chromeCtaLabels, flags: [...flags], labels: prepared.sections.map((s) => s.label),
  }
}
