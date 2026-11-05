/**
 * extract-samples.ts: run the extractor prototype on a deterministic sample and write the report.
 * Usage: npx tsx scripts/import/extract-samples.ts
 * Prints only the summary table. Never prints page bodies.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'csv-parse/sync'
import { extract, type Block } from './html-to-blocks'

const here = path.dirname(fileURLToPath(import.meta.url))
const hci = path.resolve(here, '../../..')
const dataDir = path.join(hci, 'inventory/data/ihm')
const outDir = path.join(here, 'out')
const samplesDir = path.join(outDir, 'samples')
fs.mkdirSync(samplesDir, { recursive: true })

type WpItem = { id: string | number; type: string; link: string; content: string | null }
const load = (f: string): WpItem[] => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'))
const items = [...load('pages.json'), ...load('posts.json'), ...load('courses.json')]
const byId = new Map(items.map((i) => [String(i.id), i]))

type Row = { wp_id: string; wp_type: string; url: string; class: string; interactive_components: string }
const rows: Row[] = parse(fs.readFileSync(path.join(hci, 'inventory/v2/ihm/html-analysis.csv'), 'utf8'), { columns: true, skip_empty_lines: true })

const LITE_OK = new Set(['accordion', 'tabs', 'youtube-embed', 'iframe'])
const isLite = (r: Row) => {
  const comps = r.interactive_components.split(';').filter(Boolean)
  return comps.length > 0 && comps.every((c) => LITE_OK.has(c)) && (!comps.includes('iframe') || comps.includes('youtube-embed'))
}

/** deterministic: sort by numeric wp id, take 10 evenly spaced items */
function pick(list: Row[], n = 10): Row[] {
  const s = [...list].sort((a, b) => Number(a.wp_id) - Number(b.wp_id))
  if (s.length <= n) return s
  return Array.from({ length: n }, (_, i) => s[Math.floor(((i + 0.5) * s.length) / n)])
}

const nonCourse = rows.filter((r) => r.wp_type !== 'courses')
const groups: Record<string, Row[]> = {
  A: pick(nonCourse.filter((r) => r.class === 'A')),
  B: pick(nonCourse.filter((r) => r.class === 'B')),
  'C-lite': pick(nonCourse.filter((r) => r.class === 'C' && isLite(r))),
  C: pick(nonCourse.filter((r) => r.class === 'C' && !isLite(r))),
  courses: rows.filter((r) => r.wp_type === 'courses').sort((a, b) => Number(a.wp_id) - Number(b.wp_id)),
}

type Entry = {
  wpId: string
  url: string
  wpType: string
  class: string
  group: string
  blocks: Record<string, number>
  confidence: number
  unplaced: string[]
  warnings: string[]
  chars: number
  coveragePct: number
}
const entries: Entry[] = []
const unknownClasses: Record<string, number> = {}
const warnCounts: Record<string, number> = {}
const fallbackReasons: Record<string, number> = {}

for (const [group, list] of Object.entries(groups)) {
  for (const r of list) {
    const it = byId.get(r.wp_id)
    if (!it) continue
    const res = extract(it.content ?? '', { url: it.link || r.url, wpType: r.wp_type })
    fs.writeFileSync(path.join(samplesDir, `${r.wp_id}.json`), JSON.stringify(res.layout, null, 1))
    const blocks: Record<string, number> = {}
    for (const [k, v] of Object.entries(res.stats)) {
      if (k.startsWith('block.') || k.startsWith('courseData.')) blocks[k.replace(/^block\./, '')] = v
      if (k.startsWith('fallback.')) fallbackReasons[k.slice(9)] = (fallbackReasons[k.slice(9)] ?? 0) + v
    }
    for (const [c, n] of Object.entries(res.unknownClasses)) unknownClasses[c] = (unknownClasses[c] ?? 0) + n
    for (const w of res.warnings) warnCounts[w] = (warnCounts[w] ?? 0) + 1
    entries.push({
      wpId: r.wp_id,
      url: it.link || r.url,
      wpType: r.wp_type,
      class: r.class,
      group,
      blocks,
      confidence: res.confidence,
      unplaced: res.unplaced.slice(0, 15).map((u) => (u.length > 120 ? u.slice(0, 119) + '…' : u)),
      warnings: res.warnings,
      chars: res.stats.textChars ?? 0,
      coveragePct: res.stats.coveragePct ?? 0,
    })
  }
}

const avg = (a: number[]) => (a.length ? Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 1000) / 1000 : 0)
const summary: Record<string, { n: number; avgConfidence: number; review: number }> = {}
const totals: Record<string, number> = {}
for (const g of Object.keys(groups)) {
  const es = entries.filter((e) => e.group === g)
  summary[g] = { n: es.length, avgConfidence: avg(es.map((e) => e.confidence)), review: es.filter((e) => e.warnings.includes('review')).length }
}
for (const e of entries) for (const [k, v] of Object.entries(e.blocks)) totals[k] = (totals[k] ?? 0) + v
const top = (o: Record<string, number>, n: number) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n))

const report = {
  generated: new Date().toISOString(),
  summary,
  blockTotals: totals,
  topWarnings: top(warnCounts, 20),
  fallbackReasons: top(fallbackReasons, 20),
  topUnknownClasses: top(unknownClasses, 40),
  items: entries,
}
fs.writeFileSync(path.join(outDir, 'extract-samples.report.json'), JSON.stringify(report, null, 1))

const pad = (s: string | number, n: number) => String(s).padEnd(n)
console.log(pad('group', 9) + pad('n', 4) + pad('avg conf', 10) + 'review')
for (const [g, s] of Object.entries(summary)) console.log(pad(g, 9) + pad(s.n, 4) + pad(s.avgConfidence, 10) + s.review)
console.log('\nblocks:', JSON.stringify(totals))
console.log('warnings:', JSON.stringify(report.topWarnings))
console.log('fallbacks:', JSON.stringify(report.fallbackReasons))
const leaks = entries.filter((e) => e.warnings.includes('attr-leak')).length
console.log(`attr-leak items: ${leaks}; items: ${entries.length}`)
export type { Block }
