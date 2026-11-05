// Fills `courses.facts.<fact>.value/detail` (the key facts strip, src/components/course/facts.ts) for every published course.
//   1. a fact that already has a value is left alone (the script is safe to re-run; marketing's edits win);
//   2. blank facts (except fee, which finance owns via `fees`) are filled from the course's current fields (the same fallback the component uses);
//   3. facts still blank are read from the live page https://www.ihm.edu.au/courses/<slug>/ ("Delivery Mode:", "Units:",
//      "CRICOS Course Code:", "Duration", "Per Semester Fee"/"Annual Fee", or the BON <dl> where the page has one).
//      HTML comments are dropped first: a value commented out on the live page is not public, so it is not used.
// On IHNA (SITE = 'ihna') the course page's own fact strip comes first (source `page`): the body of the course in
// ../inventory/data/ihna/courses.json, read by scripts/import/ihna/wp-courses.ts `planIhnaCourse` (duration with the placement hours
// as detail, delivery as the page words it, AQF level, campuses, CRICOS, units); then step 2; no live fetch (the body is the live page).
// A domestic-only course gets facts.cricos.show = false (CRICOS is for international students), unless already set false.
// Nothing is invented: a fact with no source stays blank and is listed in the report.
//
// Usage: npx tsx scripts/dev/fill-course-facts.ts [--dry] [--offline]
//   --dry      write the report only, no database writes
//   --offline  skip the live fetch
// Report: scripts/dev/out/course-facts-report.json
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import { getPayload } from 'payload'
import type { Course } from '../../src/payload-types'
import { FACT_KEYS, factFallback, type FactKey } from '../../src/components/course/facts'
import { DEV_SITE_URL, INVENTORY_DIR, LEGACY_BASE_URL, SITE } from '../import/lib/config'
import { planIhnaCourse } from '../import/ihna/wp-courses'

if (process.env.NODE_ENV === 'production') throw new Error('fill-course-facts is dev only')
process.env.DISABLE_DB_PUSH ??= '1' // the dev server owns schema push (DEC-46); the config reads the flag when it loads, so it is imported in main()

const DRY = process.argv.includes('--dry')
const OFFLINE = process.argv.includes('--offline')
const LIVE = SITE === 'ihm' ? 'https://www.ihm.edu.au' : LEGACY_BASE_URL
const UA = 'Mozilla/5.0 (inventory script)'
const OUT = path.resolve('scripts/dev/out/course-facts-report.json')

type Slot = { value?: string; detail?: string }
type Live = Partial<Record<FactKey, Slot & { all?: string[] }>>
type Source = 'existing' | 'page' | 'current' | 'live'
type Row = {
  slug: string
  studentType: Course['studentType']
  live: { url: string; status: number | string } | null
  filled: Partial<Record<FactKey, { value?: Source; detail?: Source }>>
  empty: FactKey[]
  cricosHidden?: boolean
  /** live values that differ from what was kept (marketing may prefer them) or were ambiguous */
  notes: string[]
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const tidy = (s: string) => s.replace(/\s+/g, ' ').trim()

const unitsText = (raw: string): string => {
  const t = tidy(raw)
  if (/^\d+$/.test(t)) {
    const n = Number(t)
    return n > 0 ? `${n} ${n === 1 ? 'unit' : 'units'}` : ''
  }
  return t
}

/** Parse the live course page. Pure: exported shape only, never throws. */
function parseLive(html: string): Live {
  const out: Live = {}
  const $ = cheerio.load(html.replace(/<!--[\s\S]*?-->/g, ''))
  $('script, style, noscript, template, svg').remove()

  // 1. BON markup (the redesigned live pages): <dl><div><dt>Label</dt><dd>value</dd><dd>detail</dd></div></dl>
  const DL: Record<string, FactKey> = { duration: 'duration', units: 'units', delivery: 'delivery', level: 'level', campuses: 'campuses', cricos: 'cricos', fees: 'fee', fee: 'fee' }
  $('dl').each((_, dl) => {
    $(dl).find('dt').each((__, dt) => {
      const key = DL[tidy($(dt).text()).toLowerCase().replace(/[^a-z]/g, '')]
      if (!key || out[key]) return
      const dds = $(dt).nextAll('dd')
      const value = tidy(dds.eq(0).text())
      if (!value) return
      const detail = tidy(dds.eq(1).text())
      out[key] = { value: key === 'units' ? unitsText(value) : value, ...(detail ? { detail } : {}) }
    })
  })

  // 2. Old course info box: "Label:" followed by the value (same element or the next text line)
  $('body *').each((_, el) => {
    $(el).prepend('\n').append('\n')
  })
  const lines = $('body').text().split('\n').map(tidy).filter(Boolean)
  const LABELS: { re: RegExp; key: FactKey; detail?: string }[] = [
    { re: /^Delivery Mode\s*:\s*(.*)$/, key: 'delivery' },
    { re: /^Units\s*:\s*(.*)$/, key: 'units' },
    { re: /^Duration\s*:\s*(.*)$/, key: 'duration' },
    { re: /^CRICOS Course Code\s*:\s*(.*)$/, key: 'cricos' },
    { re: /^Per Semester Fee\s*:\s*(.*)$/, key: 'fee', detail: 'per semester' },
    { re: /^Annual Fee\s*:\s*(.*)$/, key: 'fee', detail: 'per year' },
  ]
  const found: Partial<Record<FactKey, { value: string; detail?: string }[]>> = {}
  lines.forEach((line, i) => {
    for (const l of LABELS) {
      const m = line.match(l.re)
      if (!m) continue
      let value = tidy(m[1] ?? '')
      if (!value) {
        const next = lines[i + 1] ?? ''
        // the next line is another label: this one is empty on the page
        if (!next || /^[A-Za-z][A-Za-z ]{1,30}:$/.test(next)) continue
        value = next
      }
      if (l.key === 'units') value = unitsText(value)
      if (!value || value.length > 120) continue
      ;(found[l.key] ??= []).push({ value, ...(l.detail ? { detail: l.detail } : {}) })
    }
  })
  for (const key of FACT_KEYS) {
    const hits = found[key]
    if (!hits?.length || out[key]) continue
    const distinct = [...new Map(hits.map((h) => [h.value.toLowerCase(), h])).values()]
    // several different values (a pathway course lists each stage): ambiguous, report them but fill nothing
    out[key] = distinct.length === 1 ? distinct[0] : { all: distinct.map((h) => h.value) }
  }
  return out
}

async function fetchLive(slug: string): Promise<{ url: string; status: number | string; html?: string }> {
  const url = `${LIVE}/courses/${slug}/`
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' }, redirect: 'follow', signal: AbortSignal.timeout(30_000) })
      if ((res.status === 429 || res.status >= 500) && attempt < 3) {
        await sleep(1500 * attempt)
        continue
      }
      return { url, status: res.status, html: res.ok ? await res.text() : undefined }
    } catch (e) {
      if (attempt === 3) return { url, status: e instanceof Error ? e.message : 'fetch failed' }
      await sleep(1500 * attempt)
    }
  }
  return { url, status: 'fetch failed' }
}

/** IHNA: the fact strip of each course body (by WP id), as `planIhnaCourse` reads it. */
function ihnaPageFacts(): Map<number, Partial<Record<FactKey, Slot>>> {
  const out = new Map<number, Partial<Record<FactKey, Slot>>>()
  if (SITE !== 'ihna') return out
  type Wp = { id: number; slug: string; link: string; title: { rendered: string }; content: string; modified: string }
  const wp = JSON.parse(fs.readFileSync(path.resolve(INVENTORY_DIR, `data/${SITE}/courses.json`), 'utf8')) as Wp[]
  for (const c of wp) {
    const p = planIhnaCourse(c, new URL(c.link).pathname)
    const f = p.facts
    const facts: Partial<Record<FactKey, Slot>> = {}
    if (f.duration) facts.duration = { value: f.duration, ...(f.placement ? { detail: `Includes ${f.placement.toLowerCase()} of Professional Experience Placement` } : {}) }
    if (f.deliveryMode) facts.delivery = { value: f.deliveryMode }
    if (f.aqfLevel) facts.level = { value: /^\d+$/.test(f.aqfLevel) ? `AQF Level ${Number(f.aqfLevel)}` : f.aqfLevel }
    if (f.campuses.length) facts.campuses = { value: f.campuses.join(' · ') }
    if (f.cricos) facts.cricos = { value: f.cricos }
    if (p.units) facts.units = { value: unitsText(String(p.units)) }
    out.set(c.id, facts)
  }
  return out
}

async function main() {
  const pageFacts = ihnaPageFacts()
  const { default: config } = await import('../../src/payload.config')
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'courses', where: { _status: { equals: 'published' } }, depth: 1, limit: 0, pagination: false, sort: 'slug' })
  const rows: Row[] = []

  for (const course of docs as Course[]) {
    const facts = structuredClone(course.facts ?? {}) as Record<FactKey, { show?: boolean | null; value?: string | null; detail?: string | null }>
    const row: Row = { slug: course.slug, studentType: course.studentType, live: null, filled: {}, empty: [], notes: [] }
    const mark = (key: FactKey, slot: 'value' | 'detail', src: Source) => ((row.filled[key] ??= {})[slot] = src)

    for (const key of FACT_KEYS) {
      const f = (facts[key] ??= {})
      // `fee` is finance-owned (Courses.ts): never written by this script; it falls back to `fees` at render time.
      if (key === 'fee') continue
      if (f.value?.trim()) {
        mark(key, 'value', 'existing')
        if (f.detail?.trim()) mark(key, 'detail', 'existing')
        continue
      }
      const own = pageFacts.get(course.import?.wpId ?? -1)?.[key]
      if (own?.value) {
        f.value = own.value
        mark(key, 'value', 'page')
        if (!f.detail?.trim() && own.detail) {
          f.detail = own.detail
          mark(key, 'detail', 'page')
        }
        continue
      }
      const fb = factFallback(course, key)
      if (fb.value) {
        f.value = fb.value
        mark(key, 'value', 'current')
        if (!f.detail?.trim() && fb.detail) {
          f.detail = fb.detail
          mark(key, 'detail', 'current')
        }
      }
    }

    const missing = FACT_KEYS.filter((k) => !facts[k].value?.trim())
    if (!OFFLINE && SITE !== 'ihna') {
      const res = await fetchLive(course.slug)
      row.live = { url: res.url, status: res.status }
      const live = res.html ? parseLive(res.html) : {}
      for (const key of FACT_KEYS) {
        const l = live[key]
        if (!l) continue
        if (l.all) {
          row.notes.push(`${key}: live page lists several values (${l.all.join(' | ')}); left for marketing`)
          continue
        }
        if (key !== 'fee' && missing.includes(key) && l.value) {
          facts[key].value = l.value
          mark(key, 'value', 'live')
          if (l.detail && !facts[key].detail?.trim()) {
            facts[key].detail = l.detail
            mark(key, 'detail', 'live')
          }
        } else if (l.value && facts[key].value && l.value.toLowerCase() !== facts[key].value!.toLowerCase()) {
          row.notes.push(`${key}: kept "${facts[key].value}"; live page shows "${l.value}"${l.detail ? ` / "${l.detail}"` : ''}`)
        }
      }
      await sleep(400)
    }

    if (course.studentType === 'domestic' && facts.cricos.show !== false) {
      facts.cricos.show = false
      row.cricosHidden = true
    }
    row.empty = FACT_KEYS.filter((k) => !facts[k].value?.trim())

    const changed = JSON.stringify(facts) !== JSON.stringify(course.facts ?? {})
    if (changed && !DRY) {
      await payload.update({
        collection: 'courses', id: course.id, data: { facts } as never, draft: false, overrideAccess: true, depth: 0,
        context: { disableRevalidate: true },
      })
    }
    rows.push(row)
    console.log(`[facts] ${course.slug}: ${Object.entries(row.filled).map(([k, v]) => `${k}=${v.value}`).join(' ')}${row.empty.length ? ` | empty: ${row.empty.join(',')}` : ''}`)
  }

  const counts = Object.fromEntries(
    FACT_KEYS.map((k) => [
      k,
      {
        existing: rows.filter((r) => r.filled[k]?.value === 'existing').length,
        page: rows.filter((r) => r.filled[k]?.value === 'page').length,
        current: rows.filter((r) => r.filled[k]?.value === 'current').length,
        live: rows.filter((r) => r.filled[k]?.value === 'live').length,
        empty: rows.filter((r) => r.empty.includes(k)).length,
        detail: rows.filter((r) => r.filled[k]?.detail).length,
      },
    ]),
  )
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), dryRun: DRY, offline: OFFLINE, courses: rows.length, counts, rows }, null, 2) + '\n')
  console.log(`[facts] ${rows.length} courses${DRY ? ' (dry run)' : ''}; report: ${path.relative(process.cwd(), OUT)}`)
  if (!DRY) await revalidateCourses()
  console.table(counts)
}

await main()

/** Course pages are cached under `collection:courses` (courses/[slug]/page.tsx); a running site must be told, as the import CLI does. */
async function revalidateCourses(): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET
  const base = process.env.NEXT_PUBLIC_SITE_URL || DEV_SITE_URL
  if (!secret) return console.log('[facts] REVALIDATE_SECRET not set; course cache not cleared')
  try {
    const res = await fetch(`${base}/api/revalidate/`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ tags: ['collection:courses', 'courses'] }),
      signal: AbortSignal.timeout(10_000),
    })
    console.log(`[facts] course cache cleared: ${res.status}`)
  } catch {
    console.log(`[facts] site not reachable at ${base}; course cache not cleared (restart or POST /api/revalidate/)`)
  }
}

process.exit(0)
