/**
 * Smoke test of the course URLs (pages.csv wp_type=courses): GET each against the running site, record status counts.
 * Writes scripts/import/out/<site>-courses-smoke.json. Usage: `npx tsx scripts/import/smoke-courses.ts [--base=<url>]` (default
 * NEXT_PUBLIC_SITE_URL, else `DEV_SITE_URL`: :3001 on IHNA).
 * Local site only: never point it at the live domain.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { DEV_SITE_URL, OUT_DIR, outPath } from './lib/config'
import { loadPageRows } from './lib/data'

const base = (process.argv.find((a) => a.startsWith('--base='))?.slice(7) ?? (process.env.NEXT_PUBLIC_SITE_URL || DEV_SITE_URL)).replace(/\/$/, '')
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base)) throw new Error('smoke-courses only runs against localhost')

const rows = loadPageRows().filter((r) => r.wp_type === 'courses')
const results: { path: string; wpId: string; status: number; ms: number; title: string | null; censusRows: number; dataBlocks: string[]; legacyMarkup: boolean }[] = []
for (const r of rows) {
  const t = Date.now()
  const res = await fetch(base + r.path, { redirect: 'manual' })
  const html = res.status === 200 ? await res.text() : ''
  results.push({
    path: r.path, wpId: r.wp_id, status: res.status, ms: Date.now() - t,
    title: html.match(/<title>([^<]*)<\/title>/)?.[1] ?? null,
    censusRows: (html.match(/data-course-block="censusDates"[\s\S]*?<\/table>/)?.[0].match(/<tr\b/g)?.length ?? 1) - 1,
    dataBlocks: [...new Set([...html.matchAll(/data-course-block="([A-Za-z]+)"/g)].map((m) => m[1]))],
    legacyMarkup: /start-date-ul|wp-content\/themes|class="titleH2|owl-carousel/.test(html),
  })
}
const counts: Record<string, number> = {}
for (const r of results) counts[r.status] = (counts[r.status] ?? 0) + 1
mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(outPath('courses-smoke.json'), JSON.stringify({ base, ranAt: new Date().toISOString(), total: results.length, statusCounts: counts, results }, null, 2))
console.log(`courses smoke: ${results.length} urls, statuses ${JSON.stringify(counts)}`)
for (const r of results.filter((x) => x.status !== 200)) console.log(`  ${r.status} ${r.path}`)
