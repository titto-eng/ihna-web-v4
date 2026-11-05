/**
 * `wp-courses` on IHNA (30-import §7.4): the 21 ihna.edu.au course pages (`courses.json`; the `-int` / `-international` pages are
 * their own courses at their own URLs) into `courses`, keyed by `import.wpId`.
 *
 * Per course: the body is cut of its page chrome by `prepareIhnaCourse` (course-ihna.ts; the two old-layout bodies go through the
 * IHM `prepareCourseHtml`/`mapCourse` with IHNA's label rules), each labelled section is run through `extract()` and placed in a
 * CourseDetail slot, and the slots become Payload blocks (lib/to-payload.ts). Lookups come from `seeds/ihna-course-groups.json`
 * (school, level, discipline, university) and from the page facts (campuses, delivery modes, durations). `khId` comes from the
 * `course-live` step (the live page's form field); none = `kh-unresolved`. The start-date tab is the portal's own output, so it is
 * dropped and `showStartDates` is set (DEC-7). Fee text goes to `fees` (finance-owned, DEC-67); `facts` are left to
 * `scripts/dev/fill-course-facts.ts` (marketing-owned, never overwritten).
 *
 * Idempotent like the IHM step: same `sourceHash` and an untouched layout = skipped; a layout edited in the admin = conflict, skipped
 * unless --force. Reports: out/ihna-wp-courses.report.json, out/khid.report.json (counts and reasons, never body text).
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as cheerio from 'cheerio'
import { extract } from '../html-to-blocks'
import { assertNoLegacyMarkup } from '../lib/assert-clean'
import { COVERAGE_THRESHOLD, EXTRACTOR_VERSION, INVENTORY_DIR, OUT_DIR, SITE } from '../lib/config'
import { loadMediaMap, type ImportContext } from '../lib/context'
import { decodeTitle, loadAnalysis, loadPageRows, pathOf } from '../lib/data'
import { createLexicaliser } from '../lib/lexical'
import { toPayloadBlocks } from '../lib/to-payload'
import { ihnaSlotForLabel, kindOf, mapIhnaCourse, prepareIhnaCourse, type IhnaFacts } from '../course-ihna'
import { introParagraph, mapCourse, prepareCourseHtml, wordCoverage, type MappedSection, type MapResult, type Proto } from '../section-mapper'
import { durationMonths, ensureLookup, slugOf, type LookupRow } from '../steps/lookups'
import { loadCourseLive } from '../steps/course-live'
import { loadGroups, type GroupCollection } from './groups'

/** Bumped when this mapping changes on purpose, so every course is re-evaluated on the next run. */
export const IHNA_COURSE_MAPPER_VERSION = 1

type WpCourse = { id: number; slug: string; link: string; title: { rendered: string }; content: string; modified: string }

const sha = (v: unknown) => createHash('sha256').update(typeof v === 'string' ? v : JSON.stringify(v)).digest('hex').slice(0, 24)
const normalise = (v: unknown): unknown => JSON.parse(JSON.stringify(v ?? null, (k, x) => (k === 'id' || k === 'blockName' || x === null ? undefined : x)) ?? 'null')
const flat = (s: string) => s.replace(/\s+/g, ' ').trim()

export type IhnaCoursePlan = {
  wp: WpCourse
  path: string
  kind: 'v2' | 'short' | 'legacy'
  title: string
  facts: IhnaFacts
  sections: MappedSection[]
  mapped: MapResult
  coverage: number
  missingWords: string[]
  extractWarnings: string[]
  unplaced: string[]
  leftOverChars: number
  removed: { kind: string; chars: number }[]
  showStartDates: boolean
  excerpt: string | null
  units: number | null
}

/** "Blended (Sydney & Perth) · Face to Face & Blended (Melbourne)" -> ['Face to Face', 'Blended'] (site order). */
export function deliveryModesOf(text: string | null): string[] {
  if (!text) return []
  const out: string[] = []
  if (/face[\s-]*to[\s-]*face|on[\s-]?campus/i.test(text)) out.push('Face to Face')
  if (/blended/i.test(text)) out.push('Blended')
  // "Online theory with face to face simulation workshop" is blended delivery
  if (/\bonline\b/i.test(text) && /face/i.test(text) && !out.includes('Blended')) return ['Blended']
  if (/\bonline\b/i.test(text) && !/blended/i.test(text) && !/face/i.test(text)) out.push('Online')
  return out
}

/** A duration lookup only for a plain "<n> Months|Weeks|Years|Hours" value; anything longer stays a fact. */
export const durationLookupName = (text: string | null): string | null => {
  const t = flat(text ?? '').replace(/\*+/g, '').trim()
  return /^\d+(\.\d+)?\s+(months?|weeks?|years?|hours?)$/i.test(t) ? t.replace(/^(\d+(?:\.\d+)?)\s+(\w)(\w*)$/, (_, n: string, a: string, b: string) => `${n} ${a.toUpperCase()}${b.toLowerCase()}`) : null
}

/** "made up of 14 units", "a total of 13 units", "16 units of competency". */
export function unitsOf(sections: MappedSection[]): number | null {
  const text = flat(JSON.stringify(sections.filter((s) => s.slot === 'structure' || s.slot === 'overview')).replace(/<[^>]+>/g, ' '))
  const m = /(?:made up of|total of|consists? of|comprises?)\s+(\d{1,2})\s+units/i.exec(text) ?? /\b(\d{1,2})\s+units of competency/i.exec(text)
  return m ? Number(m[1]) : null
}

/** The package page's fee: "Package Program Total Fees: $90,000 (Save $2,000 ...)". */
function legacyFee(raw: string): IhnaFacts['fee'] {
  const text = flat(cheerio.load(raw.replace(/<!--[\s\S]*?-->/g, '').replace(/<(style|script)[\s\S]*?<\/\1>/gi, '')).root().text())
  const m = /Total Fees?:?\s*(\$[\d,]+)\s*(\([^)]{0,80}\))?/i.exec(text)
  return m ? { value: m[1], detail: m[2] ? m[2].replace(/^\(|\)$/g, '') : null } : null
}

/** Pure: one course body -> its plan (no Payload, no I/O). */
export function planIhnaCourse(wp: WpCourse, path: string): IhnaCoursePlan {
  const title = decodeTitle(wp.title.rendered)
  const kind = kindOf(wp.content)
  const warnings = new Set<string>()
  const unplaced: string[] = []
  const run = (html: string): Proto[] => {
    if (!flat(html.replace(/<[^>]+>/g, ' ')) && !/youtube-player|<iframe|<img/.test(html)) return []
    const ex = extract(html, { url: wp.link, wpType: 'courses' })
    ex.warnings.filter((w) => w !== 'no-text-content').forEach((w) => warnings.add(w))
    unplaced.push(...ex.unplaced)
    return ex.layout as Proto[]
  }
  if (kind === 'legacy') {
    const prepared = prepareCourseHtml(wp.content)
    const ex = extract(prepared.html, { url: wp.link, wpType: 'courses' })
    ex.warnings.filter((w) => w !== 'no-text-content').forEach((w) => warnings.add(w))
    const mapped = mapCourse(ex.layout as Proto[], { switcherDefinition: prepared.facts.switcherDefinition, testimonials: prepared.testimonials, slotFor: ihnaSlotForLabel })
    const wc = wordCoverage(prepared.html, mapped.sections.flatMap((s) => s.blocks), [...mapped.tabs.map((t) => t.label), ...mapped.sections.map((s) => s.title), ...mapped.chromeCtaLabels])
    const f = prepared.facts
    const facts: IhnaFacts = {
      title: f.title || title, code: null, deliveryMode: f.deliveryMode, duration: f.duration, aqfLevel: f.aqfLevel, placement: null, campuses: [],
      cricos: f.cricos, brochureUrl: f.brochureUrl, handbookUrl: null, applyLink: f.applyLink, siblingPath: null, audience: null, fee: legacyFee(wp.content),
      notices: [], audienceDefinitionHtml: null, overviewRows: [],
    }
    return {
      wp, path, kind, title, facts, sections: mapped.sections, mapped, coverage: wc.coverage, missingWords: wc.missing, extractWarnings: [...warnings],
      unplaced: ex.unplaced, leftOverChars: 0, removed: prepared.removed, showStartDates: false, excerpt: introParagraph(mapped.sections), units: unitsOf(mapped.sections),
    }
  }
  const prepared = prepareIhnaCourse(wp.content)
  const mapped = mapIhnaCourse(prepared, run)
  const placedHtml = [prepared.intro, ...prepared.sections.filter((s) => ihnaSlotForLabel(s.label).slot !== 'removed').map((s) => s.html), prepared.tailVideosHtml, prepared.facts.audienceDefinitionHtml ?? ''].join('')
  const wc = wordCoverage(placedHtml, mapped.sections.flatMap((s) => s.blocks), [...mapped.labels, ...mapped.chromeCtaLabels])
  const subtitle = prepared.kind === 'v2' ? flat(cheerio.load(wp.content.replace(/<(style|script)[\s\S]*?<\/\1>/gi, ''))('header.masthead .col-lg-7 h5').first().text()) : ''
  return {
    wp, path, kind, title, facts: prepared.facts, sections: mapped.sections, mapped, coverage: wc.coverage, missingWords: wc.missing,
    extractWarnings: [...warnings], unplaced, leftOverChars: prepared.removed.filter((r) => /^left over/.test(r.kind)).reduce((n, r) => n + r.chars, 0),
    removed: prepared.removed, showStartDates: prepared.startDates.tab, excerpt: subtitle || introParagraph(mapped.sections), units: unitsOf(mapped.sections),
  }
}

export async function runIhnaCourses(ctx: ImportContext) {
  const { payload, report, opts } = ctx
  const wp = JSON.parse(readFileSync(resolve(INVENTORY_DIR, `data/${SITE}/courses.json`), 'utf8')) as WpCourse[]
  const pageRows = new Map(loadPageRows().filter((r) => r.wp_type === 'courses').map((r) => [Number(r.wp_id), r]))
  const analysis = new Map(loadAnalysis().map((r) => [Number(r.wp_id), r]))
  const live = loadCourseLive()
  const groups = loadGroups()
  if (pageRows.size !== wp.length) ctx.log(`warning: pages.csv has ${pageRows.size} course rows, courses.json ${wp.length}`)

  const mediaMap = loadMediaMap()
  const lexical = await createLexicaliser(mediaMap)
  const deps = { lexical, mediaMap }

  // lookups: the four seeded ones by slug (the `lookups` step creates them; ensured here too so the step can run alone)
  const lookupIds = new Map<string, number>()
  const seeded = async (collection: GroupCollection, slug: string | undefined): Promise<number | undefined> => {
    if (!slug) return undefined
    const row = groups[collection].find((r) => r.slug === slug)
    if (!row) throw new Error(`seeds/ihna-course-groups.json: unknown ${collection} slug ${slug}`)
    const i = groups[collection].indexOf(row)
    const { id } = await ensureLookup(ctx, { collection, name: row.name, slug, sortOrder: i, extra: row.legacyId != null ? { legacyId: row.legacyId } : undefined }, lookupIds)
    return id
  }
  const fromFacts = async (collection: LookupRow['collection'], n: string, extra?: Record<string, unknown>) =>
    (await ensureLookup(ctx, { collection, name: n, slug: slugOf(n), extra, sortOrder: lookupIds.size }, lookupIds)).id
  const ids = (xs: (number | undefined)[]) => xs.filter((x): x is number => typeof x === 'number')

  const items: Record<string, unknown>[] = []
  const khItems: Record<string, unknown>[] = []
  for (const c of wp) {
    const row = pageRows.get(c.id)
    const path = row?.path ?? pathOf(c.link)
    if (!ctx.wanted(c.id, path, c.slug)) continue
    try {
      const p = planIhnaCourse(c, path)
      const f = p.facts
      const g = groups.courses[c.slug]
      if (!g) throw new Error(`no entry for ${c.slug} in seeds/ihna-course-groups.json`)
      const kh = live[c.slug]
      const khId = kh?.khId ?? null

      // sections -> Payload blocks
      const reasons = new Set<string>()
      const sections = p.sections.map((s) => {
        const { layout, reasons: r } = toPayloadBlocks(s.blocks as never, deps)
        r.forEach((x) => reasons.add(x))
        return { slot: s.slot, title: s.title, layout }
      })
      assertNoLegacyMarkup(sections, `course ${c.id}`)

      // lookups
      const school = await seeded('categories', g.school)
      const levels = ids([await seeded('levels', g.level)])
      const disciplines = ids([await seeded('disciplines', g.discipline)])
      const universities = ids([await seeded('universities', g.university)])
      const campuses = ids(await Promise.all(f.campuses.map((n) => fromFacts('campuses', n))))
      const deliveryModes = ids(await Promise.all(deliveryModesOf(f.deliveryMode).map((n) => fromFacts('deliveryModes', n))))
      const dName = durationLookupName(f.duration)
      const durations = dName ? ids([await fromFacts('durations', dName, { months: durationMonths(dName) })]) : []

      const studentType = f.audience ?? (p.kind === 'short' ? 'domestic' : 'both')
      const courseType = g.level === 'certificate-iii' || g.level === 'diploma' ? 'award' : 'non-award'

      // review status: kh-unresolved wins; then check; else auto
      const review = new Set<string>()
      if (p.coverage < COVERAGE_THRESHOLD) review.add('low-coverage')
      if (p.mapped.flags.some((x) => x.startsWith('unknown-tab:'))) review.add('unmatched-course-section')
      if (p.mapped.flags.includes('no-course-tabs')) review.add('no-course-tabs')
      if (p.leftOverChars > 0) review.add('text-left-outside-sections')
      if (p.extractWarnings.some((w) => ['attr-leak', 'review'].includes(w))) review.add('extractor-review')
      if (reasons.has('fallback')) review.add('fallback-richtext')
      const computed = khId == null ? 'kh-unresolved' : review.size ? 'check' : 'auto'

      // the media ids of the uploads the body shows: a newly imported image re-imports the course, another course's does not
      const images = [...new Set(c.content.match(/wp-content\/uploads\/[^"'\s)<>]+/g) ?? [])].map((ref) => [ref, mediaMap[ref] ?? null])
      const sourceHash = sha({ v: [EXTRACTOR_VERSION, IHNA_COURSE_MAPPER_VERSION], content: c.content, kh: khId, groups: g, images })
      const data = {
        title: p.title,
        slug: c.slug,
        _status: 'published',
        code: f.code ?? undefined,
        cricosCode: f.cricos ?? undefined,
        studentType,
        courseType,
        khId,
        khIdSource: khId != null ? 'scrape' : undefined,
        showStartDates: p.showStartDates,
        school,
        categories: ids([school]),
        disciplines,
        levels,
        universities,
        campuses,
        deliveryModes,
        durations,
        excerpt: p.excerpt,
        units: p.units ?? undefined,
        applyLink: f.applyLink ?? undefined,
        brochureUrl: f.brochureUrl ?? undefined,
        handbookUrl: f.handbookUrl ?? undefined,
        fees: f.fee ? { displayAmount: f.fee.value, note: f.fee.detail } : undefined,
        sections,
        seo: { noindex: false },
      }

      const item = {
        wpId: c.id, path, slug: c.slug, kind: p.kind, importClass: analysis.get(c.id)?.class ?? null, khId, khSource: kh?.khSource ?? null,
        reviewStatus: computed, reasons: [...new Set([...review, ...reasons, ...p.mapped.flags])],
        coveragePct: Math.round(p.coverage * 1000) / 10, leftOverChars: p.leftOverChars,
        studentType, school: g.school, level: g.level ?? null, discipline: g.discipline ?? null, university: g.university ?? null,
        campuses: f.campuses, deliveryModes: deliveryModesOf(f.deliveryMode), duration: dName, units: p.units,
        fee: f.fee ? 'set' : 'none', showStartDates: p.showStartDates, sibling: f.siblingPath,
        slots: sections.map((s) => ({ slot: s.slot, title: s.title, blocks: s.layout.length })),
        labels: p.mapped.tabs.map((t) => ({ label: t.label, slot: t.slot })),
        removed: p.removed.filter((r) => r.chars),
        imagesDropped: lexical.dropped.length,
        missingWordsSample: p.missingWords.slice(0, 8),
      }
      items.push(item)
      khItems.push({ wpId: c.id, path, slug: c.slug, khId, status: khId != null ? 'resolved' : 'unresolved', evidence: kh ? [`live page ${kh.khSource ?? 'no'} course_id field`] : ['not scraped (run course-live)'] })

      // ---- upsert (same contract as the IHM step)
      const existing = (await payload.find({ collection: 'courses', where: { 'import.wpId': { equals: c.id } }, limit: 1, depth: 0, draft: true, ...opts })).docs[0]
      const importMeta = { wpId: c.id, importClass: (analysis.get(c.id)?.class ?? 'new') as 'A', importReport: { sourceHash, coveragePct: item.coveragePct, reasons: item.reasons, khId, layoutHash: '' } }
      const stored = (existing?.import?.importReport ?? {}) as { sourceHash?: string; layoutHash?: string }
      const currentLayoutHash = existing ? sha(normalise(existing.sections)) : ''
      const reviewStatus = existing?.import?.reviewStatus === 'ok' && stored.sourceHash === sourceHash ? 'ok' : computed
      // HubSpot `course` (40 §6): the course code, as the old site sent it; an id typed in the admin is kept.
      const hubspotCourseId = (existing as { hubspotCourseId?: string | null } | undefined)?.hubspotCourseId || f.code || undefined
      if (existing && stored.sourceHash === sourceHash && stored.layoutHash === currentLayoutHash && !ctx.args.force) {
        // unchanged content: only backfill an empty hubspotCourseId (no content write)
        if (hubspotCourseId && !(existing as { hubspotCourseId?: string | null }).hubspotCourseId && !ctx.dry) {
          await payload.update({ collection: 'courses', id: existing.id, data: { hubspotCourseId } as never, draft: false, ...opts })
          report.updated++
        } else report.skipped++
        continue
      }
      if (existing && stored.layoutHash && stored.layoutHash !== currentLayoutHash && !ctx.args.force) {
        report.skipped++
        report.reviewQueue.push({ id: c.id, path, reasons: ['conflict: layout edited in the admin since the last import (use --force)'] })
        continue
      }
      if (ctx.dry) {
        if (existing) report.updated++
        else report.created++
      } else {
        const write = { ...data, hubspotCourseId, import: { ...importMeta, reviewStatus } }
        const doc = existing
          ? await payload.update({ collection: 'courses', id: existing.id, data: write as never, draft: false, ...opts })
          : await payload.create({ collection: 'courses', data: write as never, draft: false, ...opts })
        if (existing) report.updated++
        else report.created++
        const layoutHash = sha(normalise(doc.sections))
        await payload.update({
          collection: 'courses', id: doc.id, draft: false,
          data: { import: { ...importMeta, reviewStatus, importReport: { ...importMeta.importReport, layoutHash } } } as never,
          ...opts,
        })
      }
      if (reviewStatus !== 'auto' && reviewStatus !== 'ok') report.reviewQueue.push({ id: c.id, path, reasons: item.reasons, confidence: item.coveragePct / 100 })
    } catch (e) {
      report.failed.push({ id: c.id, reason: e instanceof Error ? e.message : String(e) })
    }
  }

  const count = (k: string, v: unknown) => items.filter((i) => i[k] === v).length
  const khSummary = { resolved: khItems.filter((k) => k.status === 'resolved').length, unresolved: khItems.filter((k) => k.status === 'unresolved').length }
  if (!ctx.args.only) {
    writeFileSync(
      resolve(OUT_DIR, 'khid.report.json'),
      JSON.stringify({
        step: 'wp-courses', site: SITE, source: 'out/ihna-course-live.json (the live page form field, step course-live)', courses: khItems.length, ...khSummary,
        unresolved: khItems.filter((k) => k.status === 'unresolved').map((k) => ({ wpId: k.wpId, path: k.path })),
        items: khItems,
      }, null, 2),
    )
  }
  return {
    courses: items.length,
    kinds: { v2: count('kind', 'v2'), short: count('kind', 'short'), legacy: count('kind', 'legacy') },
    kh: khSummary,
    showStartDates: count('showStartDates', true),
    withFee: count('fee', 'set'),
    studentTypes: { domestic: count('studentType', 'domestic'), international: count('studentType', 'international'), both: count('studentType', 'both') },
    mapper: {
      coveragePctAvg: items.length ? Math.round((items.reduce((n, i) => n + (i.coveragePct as number), 0) / items.length) * 10) / 10 : null,
      coverageBelowTarget: items.filter((i) => (i.coveragePct as number) < COVERAGE_THRESHOLD * 100).length,
      note: 'coveragePct = source words of the placed sections found in the blocks (after intended removals: page chrome, the phone duplicate of the tabs, the portal start-date output)',
    },
    items,
  }
}
