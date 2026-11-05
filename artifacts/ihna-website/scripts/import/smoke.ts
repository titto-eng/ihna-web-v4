/**
 * Smoke test of the import: GET 20 random imported page URLs (pages.csv, seeded so the sample is reproducible) and every post URL
 * against the running site, write status counts to scripts/import/out/<site>-import-smoke.json.
 * Usage: npx tsx scripts/import/smoke.ts [baseUrl]   (default NEXT_PUBLIC_SITE_URL, else `DEV_SITE_URL`: :3001 on IHNA; never a form post, GET only)
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import pLimit from 'p-limit'
import { CONCURRENCY, DEV_SITE_URL, OUT_DIR, outPath } from './lib/config'
import { loadPageRows, loadPosts, pathOf } from './lib/data'

const base = (process.argv[2] ?? (process.env.NEXT_PUBLIC_SITE_URL || DEV_SITE_URL)).replace(/\/$/, '')

/** mulberry32: a tiny seeded PRNG so "random" is the same on every run. */
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

async function check(path: string) {
  const started = Date.now()
  try {
    const res = await fetch(`${base}${path}`, { redirect: 'manual', signal: AbortSignal.timeout(60_000) })
    return { path, status: res.status, location: res.headers.get('location') ?? undefined, ms: Date.now() - started }
  } catch (e) {
    return { path, status: 0, error: e instanceof Error ? e.message : String(e), ms: Date.now() - started }
  }
}

const counts = (rs: { status: number }[]) => rs.reduce<Record<string, number>>((m, r) => ((m[r.status] = (m[r.status] ?? 0) + 1), m), {})

async function main() {
  const pagePaths = loadPageRows().filter((r) => r.wp_type === 'page' && r.path !== '/').map((r) => r.path)
  const random = rng(20261018)
  const sample = [...pagePaths].sort(() => random() - 0.5).slice(0, 20).sort()
  const postPaths = loadPosts().map((p) => pathOf(p.link))
  const limit = pLimit(CONCURRENCY)
  const [pages, posts] = await Promise.all([Promise.all(sample.map((p) => limit(() => check(p)))), Promise.all(postPaths.map((p) => limit(() => check(p))))])
  const out = {
    base, ranAt: new Date().toISOString(), seed: 20261018,
    pages: { total: pages.length, statusCounts: counts(pages), notOk: pages.filter((r) => r.status !== 200) },
    posts: { total: posts.length, statusCounts: counts(posts), notOk: posts.filter((r) => r.status !== 200) },
    sample,
  }
  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(outPath('import-smoke.json'), JSON.stringify(out, null, 2))
  console.log(`pages ${JSON.stringify(out.pages.statusCounts)} of ${pages.length}; posts ${JSON.stringify(out.posts.statusCounts)} of ${posts.length}`)
}

main().then(() => process.stdout.write('', () => process.exit(0)))
