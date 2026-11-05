/**
 * Step `wp-courses` (30-import §7.2 step 6, DEC-8, DEC-15, DEC-22): the course bodies into `courses`. On IHNA the work is done by
 * `scripts/import/ihna/wp-courses.ts` (`runIhnaCourses`); what follows is the IHM path (26 IHM course bodies).
 *
 * For each course: core fields from the page facts; `kh_id` through the old theme's lists (kh-id.ts); the body is cut of its page
 * chrome (section-mapper.ts `prepareCourseHtml`), run through `extract()`, mapped to CourseDetail slots by tab label, and each slot
 * is converted with lib/to-payload.ts (Lexical, media map). `[StartDates]` is commented out on every body (confirmed in the report);
 * the expanded `[IHMCensusDate]` table and `[CourseManagers]` output are removed and replaced by `censusDates` / `courseManagers`
 * blocks. Fragments identical across all real courses go into the `courseShared` global once (`--hoist-min`, default: every
 * non-test course).
 *
 * Upsert key: `import.wpId`. Same source hash and untouched layout: unchanged. Layout edited in the admin: conflict, skipped unless --force.
 * Reports: out/ihm-wp-courses.report.json, out/khid.report.json. No body text is written to a report.
 *
 * Run: `npm run import -- wp-courses [--dry] [--only=868,/courses/x/] [--force] [--hoist-min=N]`
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { extract } from '../html-to-blocks'
import { assertNoLegacyMarkup } from '../lib/assert-clean'
import { COVERAGE_THRESHOLD, INVENTORY_DIR, OUT_DIR, SITE } from '../lib/config'
import { loadMediaMap, type ImportContext } from '../lib/context'
import { loadAnalysis, loadPageRows, decodeTitle, pathOf } from '../lib/data'
import { createLexicaliser } from '../lib/lexical'
import { toPayloadBlocks } from '../lib/to-payload'
import { resolveKhId, TEST_COURSE_WP_IDS } from '../kh-id'
import { fingerprint, introParagraph, mapCourse, prepareCourseHtml, protoText, SLOTS, wordCoverage, type MappedSection, type PreparedCourse, type Proto } from '../section-mapper'
import { deliveryName, disciplineOf, durationMonths, durationName, ensureLookup, levelName, schoolOf, slugOf, type LookupRow } from './lookups'
import { runIhnaCourses } from '../ihna/wp-courses'

export const name = 'wp-courses'
export const order = 40

type WpCourse = { id: number; slug: string; link: string; title: { rendered: string }; content: string; excerpt?: string; modified: string }

const sha = (v: unknown) => createHash('sha256').update(typeof v === 'string' ? v : JSON.stringify(v)).digest('hex').slice(0, 24)

/** Ids and Payload-added nulls stripped, so a stored layout can be compared with what was written. */
const normalise = (v: unknown): unknown => JSON.parse(JSON.stringify(v ?? null, (k, x) => (k === 'id' || k === 'blockName' || x === null ? undefined : x)) ?? 'null')

type Plan = {
  wp: WpCourse
  prepared: PreparedCourse
  sections: MappedSection[]
  mapped: ReturnType<typeof mapCourse>
  extractorCoverage: number
  unplaced: string[]
  extractWarnings: string[]
  coverage: number
  missingWords: string[]
  isTest: boolean
}

/** Blocks whose fingerprint appears in at least `min` courses (once per course) become the shared section. */
export function hoist(plans: Plan[], min: number): { shared: Proto[]; candidates: { count: number; type: string; sample: string }[] } {
  const seen = new Map<string, { block: Proto; courses: Set<number> }>()
  for (const p of plans) {
    for (const s of p.sections) {
      for (const b of s.blocks) {
        if (b.blockType === 'courseData') continue
        const key = fingerprint(b)
        const e = seen.get(key) ?? { block: b, courses: new Set<number>() }
        e.courses.add(p.wp.id)
        seen.set(key, e)
      }
    }
  }
  const candidates = [...seen.values()]
    .filter((e) => e.courses.size >= Math.min(12, min))
    .sort((a, b) => b.courses.size - a.courses.size)
    .map((e) => ({ count: e.courses.size, type: e.block.blockType, sample: protoText(e.block).join(' ').slice(0, 40) }))
  const shared = [...seen.values()].filter((e) => e.courses.size >= min).map((e) => e.block)
  return { shared, candidates }
}

export async function run(ctx: ImportContext) {
  // IHNA's course pages have their own layouts, lookups and kh_id source: scripts/import/ihna/wp-courses.ts
  if (SITE === 'ihna') return runIhnaCourses(ctx)
  const { payload, report, opts } = ctx
  const hoistMin = Number(ctx.args.flags['hoist-min'] ?? 0) || 0

  // ---- inputs
  const wp = JSON.parse(readFileSync(resolve(INVENTORY_DIR, `data/${SITE}/courses.json`), 'utf8')) as WpCourse[]
  const pageRows = new Map(loadPageRows().filter((r) => r.wp_type === 'courses').map((r) => [Number(r.wp_id), r]))
  const analysis = new Map(loadAnalysis().map((r) => [Number(r.wp_id), r]))
  if (pageRows.size !== wp.length) ctx.log(`warning: pages.csv has ${pageRows.size} course rows, courses.json ${wp.length}`)

  // ---- plan every course (pure)
  const plans: Plan[] = wp.map((c) => {
    const prepared = prepareCourseHtml(c.content)
    const ex = extract(prepared.html, { url: c.link, wpType: 'courses' })
    const mapped = mapCourse(ex.layout as Proto[], { switcherDefinition: prepared.facts.switcherDefinition, testimonials: prepared.testimonials })
    const wc = wordCoverage(prepared.html, mapped.sections.flatMap((s) => s.blocks), [...mapped.tabs.map((t) => t.label), ...mapped.sections.map((s) => s.title), ...mapped.chromeCtaLabels])
    return {
      wp: c, prepared, sections: mapped.sections, mapped, extractorCoverage: ex.coverage, unplaced: ex.unplaced, extractWarnings: ex.warnings,
      coverage: wc.coverage, missingWords: wc.missing, isTest: TEST_COURSE_WP_IDS.includes(c.id),
    }
  })

  // ---- hoist what is identical across the real courses (DEC-15a, DEC-22)
  const real = plans.filter((p) => !p.isTest)
  const hoistAt = hoistMin || real.length
  const { shared, candidates } = hoist(real, hoistAt)
  const sharedKeys = new Set(shared.map(fingerprint))
  for (const p of plans) {
    p.sections = p.sections
      .map((s) => ({ ...s, blocks: s.blocks.filter((b) => !sharedKeys.has(fingerprint(b))) }))
      .filter((s) => s.blocks.length)
  }

  const mediaMap = loadMediaMap()
  const lexical = await createLexicaliser(mediaMap)
  const deps = { lexical, mediaMap }

  // courseShared global
  let sharedWritten = 0
  if (shared.length) {
    const { layout } = toPayloadBlocks(shared, deps)
    if (!ctx.dry) await payload.updateGlobal({ slug: 'courseShared', data: { layout } as never, ...opts })
    sharedWritten = layout.length
  }

  // ---- lookups
  const lookupIds = new Map<string, number>()
  const need = async (collection: LookupRow['collection'], n: string, extra?: Record<string, unknown>): Promise<number | undefined> => {
    const { id } = await ensureLookup(ctx, { collection, name: n, slug: slugOf(n), extra, sortOrder: lookupIds.size }, lookupIds)
    return id
  }
  const ids = (xs: (number | undefined)[]) => xs.filter((x): x is number => typeof x === 'number')

  const khItems: Record<string, unknown>[] = []
  const items: Record<string, unknown>[] = []
  const slugs = new Set(wp.map((c) => c.slug))

  for (const p of plans) {
    const c = p.wp
    const row = pageRows.get(c.id)
    const path = row?.path ?? pathOf(c.link)
    if (!ctx.wanted(c.id, path)) continue
    const f = p.prepared.facts
    const title = decodeTitle(c.title.rendered)
    const kh = resolveKhId(c.id)
    try {
      // sections -> Payload blocks
      const reasons = new Set<string>()
      const sections = p.sections.map((s) => {
        const { layout, reasons: r } = toPayloadBlocks(s.blocks, deps)
        r.forEach((x) => reasons.add(x))
        return { slot: s.slot, title: s.title, layout }
      })
      const layouts = sections.flatMap((s) => s.layout)
      assertNoLegacyMarkup(layouts, `course ${c.id}`)

      // lookups from the page facts
      const deliveryModes = f.deliveryMode ? [await need('deliveryModes', deliveryName(f.deliveryMode))] : []
      const levels = f.aqfLevel ? [await need('levels', levelName(f.aqfLevel))] : []
      const durations = f.duration ? [await need('durations', durationName(f.duration), { months: durationMonths(f.duration) })] : []
      const campuses = await Promise.all(f.campuses.map((n) => need('campuses', n)))
      const school = await need('categories', schoolOf(title))
      const discipline = await need('disciplines', disciplineOf(title))

      // student type: the switcher's sibling page, the "Available for" list, the slug
      const hasIntlSibling = slugs.has(`${c.slug}-international`)
      const studentType = c.slug.endsWith('-international') ? 'international' : f.availableFor.length === 2 ? 'both' : hasIntlSibling ? 'domestic' : 'both'
      const courseType = !f.aqfLevel && !f.accreditation && !/package|pathway| to /i.test(title) ? 'non-award' : 'award'

      // review status (30-import "reviewStatus"): kh-unresolved wins; then check; else auto
      const orphan = p.unplaced.filter((u) => /orphan tab pane/.test(u))
      const review = new Set<string>()
      if (p.coverage < COVERAGE_THRESHOLD) review.add('low-coverage')
      if (p.mapped.flags.some((x) => x.startsWith('unknown-tab:'))) review.add('unmatched-course-section')
      if (p.mapped.flags.includes('no-course-tabs')) review.add('no-course-tabs')
      if (p.unplaced.length) review.add('unplaced-fragments')
      if (p.extractWarnings.some((w) => ['attr-leak', 'review'].includes(w))) review.add('extractor-review')
      if (reasons.has('fallback')) review.add('fallback-richtext')
      if (p.isTest) review.add('test-course')
      const unresolved = !kh && !p.isTest
      const computed = unresolved ? 'kh-unresolved' : review.size ? 'check' : 'auto'

      const sourceHash = sha(c.content)
      const heroSubheading = introParagraph(p.sections)
      const data = {
        title,
        slug: c.slug,
        _status: 'published',
        cricosCode: f.cricos ?? undefined,
        studentType,
        courseType,
        khId: kh?.khId ?? null,
        khIdSource: kh ? 'scrape' : undefined,
        showStartDates: false, // DEC-7: [StartDates] is commented out on every live body
        school,
        categories: ids([school]),
        disciplines: ids([discipline]),
        levels: ids(levels),
        campuses: ids(campuses),
        deliveryModes: ids(deliveryModes),
        durations: ids(durations),
        excerpt: heroSubheading, // null clears a value from an earlier run
        accreditation: f.accreditation ?? undefined,
        units: f.units ?? undefined,
        applyLink: f.applyLink ?? undefined,
        brochureUrl: f.brochureUrl ?? undefined,
        fees: f.feeLines.length ? { displayAmount: f.feeLines.join(' · ') } : undefined,
        sections,
        seo: { noindex: p.isTest },
      }

      const named = SLOTS.filter((s) => s !== 'additional').reduce((n, s) => n + p.mapped.chars[s], 0)
      const additional = p.mapped.chars.additional
      const item = {
        wpId: c.id, path, slug: c.slug, importClass: analysis.get(c.id)?.class ?? null, khId: kh?.khId ?? null, reviewStatus: computed,
        reasons: [...new Set([...review, ...reasons, ...p.mapped.flags])],
        coveragePct: Math.round(p.coverage * 1000) / 10, extractorCoveragePct: Math.round(p.extractorCoverage * 1000) / 10,
        namedSlotPct: named + additional ? Math.round((named / (named + additional)) * 1000) / 10 : 100,
        chars: { ...p.mapped.chars, named, source: p.prepared.sourceChars },
        title,
        heroSubheading,
        slots: sections.map((s) => ({ slot: s.slot, title: s.title, blocks: s.layout.length })),
        tabs: p.mapped.tabs.map((t) => ({ label: t.label, slot: t.slot, known: t.known, extension: t.extension })),
        removed: [
          ...p.prepared.removed.filter((r) => r.chars || /SKIPPED/.test(r.kind)),
          { kind: 'Apply / Enquire / brochure buttons (fields)', chars: p.mapped.chromeCtasDropped },
          { kind: 'census table (re-rendered live by censusDates)', chars: p.mapped.removedStartDates },
        ],
        startDates: p.prepared.startDates,
        data: { censusDates: p.mapped.hasCensus, courseManagers: p.mapped.hasManagers },
        unplaced: p.unplaced.map((u) => u.replace(/:.*$/s, '').slice(0, 60)),
        orphanTabPanes: orphan.length,
        videosDropped: p.mapped.videosDropped.length,
        imagesDropped: lexical.dropped.length,
        missingWordsSample: p.missingWords.slice(0, 8),
      }
      items.push(item)
      khItems.push({ wpId: c.id, path, slug: c.slug, khId: kh?.khId ?? null, status: kh ? 'resolved' : p.isTest ? 'test-course' : 'unresolved', evidence: kh?.evidence ?? [] })

      // ---- upsert
      const existing = (await payload.find({ collection: 'courses', where: { 'import.wpId': { equals: c.id } }, limit: 1, depth: 0, draft: true, ...opts })).docs[0]
      const importMeta = { wpId: c.id, importClass: (analysis.get(c.id)?.class ?? 'new') as 'A', importReport: { sourceHash, coveragePct: item.coveragePct, reasons: item.reasons, khId: kh?.khId ?? null, layoutHash: '' } }
      const stored = (existing?.import?.importReport ?? {}) as { sourceHash?: string; layoutHash?: string }
      const currentLayoutHash = existing ? sha(normalise(existing.sections)) : ''
      const reviewStatus = existing?.import?.reviewStatus === 'ok' && stored.sourceHash === sourceHash ? 'ok' : computed

      if (existing && stored.sourceHash === sourceHash && stored.layoutHash === currentLayoutHash && !ctx.args.force) {
        report.skipped++
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
        const write = { ...data, import: { ...importMeta, reviewStatus } }
        let doc = existing
          ? await payload.update({ collection: 'courses', id: existing.id, data: write as never, draft: false, ...opts })
          : await payload.create({ collection: 'courses', data: write as never, draft: false, ...opts })
        if (existing) report.updated++
        else report.created++
        // layoutHash is of what the database stored (Payload adds ids and defaults), so a later run can tell an admin edit from itself
        const layoutHash = sha(normalise(doc.sections))
        doc = await payload.update({
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

  // ---- reports
  const real26 = items.filter((i) => !TEST_COURSE_WP_IDS.includes(i.wpId as number))
  const sum = (k: 'named' | 'additional') => real26.reduce((n, i) => n + ((i.chars as Record<string, number>)[k] ?? 0), 0)
  const khSummary = {
    resolved: khItems.filter((k) => k.status === 'resolved').length,
    unresolved: khItems.filter((k) => k.status === 'unresolved').length,
    testCourses: khItems.filter((k) => k.status === 'test-course').length,
  }
  writeFileSync(
    resolve(OUT_DIR, 'khid.report.json'),
    JSON.stringify({
      step: 'wp-courses', stopgap: 'DEC-8: WP post id mapped through the lists in ../ihmv3/wp-content/themes/mwt-ihm; replaced by from-dump/kh-id',
      nonTestCourses: real26.length, ...khSummary,
      unresolved: khItems.filter((k) => k.status === 'unresolved').map((k) => ({ wpId: k.wpId, path: k.path })),
      items: khItems,
    }, null, 2),
  )
  return {
    courses: items.length,
    kh: khSummary,
    startDatesShortcode: {
      // DEC-7 / 50 §7: `[StartDates]` is never live. 20 bodies carry it, all inside an HTML comment; 6 do not carry it at all.
      neverLive: items.every((i) => (i.startDates as { live: number }).live === 0),
      inComment: items.filter((i) => (i.startDates as { tokens: number }).tokens > 0).length,
      absent: items.filter((i) => (i.startDates as { tokens: number }).tokens === 0).length,
      of: items.length,
    },
    mapper: {
      coveragePctAvg: items.length ? Math.round((items.reduce((n, i) => n + (i.coveragePct as number), 0) / items.length) * 10) / 10 : null,
      coverageBelowTarget: items.filter((i) => (i.coveragePct as number) < COVERAGE_THRESHOLD * 100).length,
      namedSlotPct: sum('named') + sum('additional') ? Math.round((sum('named') / (sum('named') + sum('additional'))) * 1000) / 10 : null,
      note: 'coveragePct = source words (after intended removals) found in the placed blocks; namedSlotPct = text in a named slot / (named + "additional"), non-test courses',
    },
    hoist: { min: hoistAt, courses: real.length, shared: shared.length, sharedBlocksWritten: sharedWritten, candidatesAtHalf: candidates.slice(0, 40) },
    items,
  }
}

if (process.argv[1]?.endsWith('steps/wp-courses.ts')) {
  const { runStandalone } = await import('../lib/standalone')
  await runStandalone(name, run)
}

