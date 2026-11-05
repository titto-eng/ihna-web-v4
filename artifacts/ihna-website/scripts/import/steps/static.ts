/**
 * Step `static` (30-import, 60-landing §5 "copy-static" rows): copies the site's static stores into `public/` at the SAME public paths.
 *
 * Inputs (all under LEGACY_ROOT, read-only; the lists are site-specific in seeds/documents.ts):
 *   - `STATIC_STORES` folders (recursive) and `STATIC_FILES` single files;
 *   - `../inventory/v2/<site>/landing-pages.csv` rows with `recommendation=copy-static` that are not `gone` on live: a folder row copies
 *     that folder recursively;
 *   - `STATIC_ALIASES`: a repo file also served under a second public name (no redirect needed).
 * Rules: allowlist pdf, jpg, jpeg, png, webp, gif, svg plus `STATIC_EXTRA_EXTENSIONS` (never .php/.htaccess/.js/.html, backup names
 * such as `*.pdf_bkp(...)`, dotfiles); files over 50 MB are skipped and listed; an SVG that holds `<script`, `javascript:` or an `on*=`
 * handler is skipped and listed (`unsafeSvgReason`); exact names kept (spaces, `&`). Skips seeds/static-held.json paths (404 on live,
 * DEC-32). Never fetches from production (the `live-files` step does, for `missingOnServerOnly`): `/brochures/...` targets that exist
 * only there are listed as `missingOnProduction`. Writes `scripts/import/out/<site>-static-manifest.json` (path, bytes, sha256) and
 * `<site>-static.report.json`. Idempotent: an identical file (same size and sha256) is left alone.
 * Run: `npm run import -- static [--dry]` or `npx tsx scripts/import/steps/static.ts [--dry]` (`ctx.dry`, the CLI's flag).
 */
import 'dotenv/config'
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, extname, join, resolve, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parse } from 'csv-parse/sync'
import { LEGACY_ROOT, SITE } from '../lib/config'
import { STATIC_ALIASES, STATIC_EXTRA_EXTENSIONS, STATIC_FILES, STATIC_REVIEW, STATIC_STORES } from '../seeds/documents'

export const name = 'static'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '../../..')
const OLD = LEGACY_ROOT
const INV = resolve(ROOT, `../inventory/v2/${SITE}`)
const PUBLIC = join(ROOT, 'public')
const OUT = join(ROOT, 'scripts/import/out')
const SEEDS = join(process.cwd(), 'scripts', 'import', 'seeds')

const ALLOW = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', ...STATIC_EXTRA_EXTENSIONS])
const MAX_BYTES = 50 * 1024 * 1024

/** Why an SVG may not be served from public/ (90-security §7), or null when it carries no script. Checked on the decoded text. */
export function unsafeSvgReason(svg: string): string | null {
  const text = svg.replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);?/g, (_, d) => String.fromCodePoint(Number(d)))
  if (/<\s*script[\s>\/]/i.test(text)) return 'svg contains <script>'
  if (/javascript\s*:/i.test(text)) return 'svg contains a javascript: URL'
  if (/\son[a-z]+\s*=/i.test(text)) return 'svg contains an on*= event handler'
  return null
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith('.')) return []
    const p = join(dir, e.name)
    return e.isDirectory() ? walk(p) : e.isFile() ? [p] : []
  })
}

export async function run(ctx: { dry?: boolean } = {}) {
  const rows: Record<string, string>[] = parse(readFileSync(join(INV, 'landing-pages.csv'), 'utf8'), { columns: true, skip_empty_lines: true, bom: true })

  // public path (leading slash, decoded) -> source file
  const want = new Map<string, string>()
  const add = (file: string) => {
    const rel = '/' + relative(OLD, file).split('\\').join('/')
    want.set(rel, file)
  }
  for (const s of STATIC_STORES) for (const f of walk(join(OLD, s))) add(f)
  for (const f of STATIC_FILES) if (existsSync(join(OLD, f))) add(join(OLD, f))
  for (const r of rows.filter((x) => x.recommendation === 'copy-static' && x.live_status !== 'gone')) {
    const p = decodeURI(new URL(r.url).pathname)
    const abs = join(OLD, p)
    if (existsSync(abs) && statSync(abs).isDirectory()) walk(abs).forEach(add)
    else if (existsSync(abs)) add(abs)
  }
  // aliases: a repo file also served under the name the site links
  for (const [pub, repoPath] of Object.entries(STATIC_ALIASES)) if (existsSync(join(OLD, repoPath))) want.set(pub, join(OLD, repoPath))

  const manifest: { path: string; bytes: number; sha256: string }[] = []
  const skipped: { path: string; reason: string; bytes?: number }[] = []
  let copied = 0, unchanged = 0

  // Files production no longer serves (404 on live per the parity crawl) are held, never copied: a gone URL stays gone (rule 1, D11).
  const heldPath = join(SEEDS, 'static-held.json')
  const held = new Set<string>(existsSync(heldPath) ? (JSON.parse(readFileSync(heldPath, 'utf8')) as { paths: string[] }).paths : [])
  for (const [pub, src] of [...want].sort(([a], [b]) => a.localeCompare(b))) {
    if (held.has(pub)) { skipped.push({ path: pub, reason: 'held: 404 on production (static-held.json)' }); continue }
    const ext = extname(pub).toLowerCase()
    if (!ALLOW.has(ext)) { skipped.push({ path: pub, reason: `extension ${ext || '(none)'} not allowed` }); continue }
    const bytes = statSync(src).size
    if (bytes > MAX_BYTES) { skipped.push({ path: pub, reason: 'over 50 MB', bytes }); continue }
    const buf = readFileSync(src)
    if (ext === '.svg') {
      const unsafe = unsafeSvgReason(buf.toString('utf8'))
      if (unsafe) { skipped.push({ path: pub, reason: unsafe, bytes }); continue }
    }
    const sha256 = createHash('sha256').update(buf).digest('hex')
    const dest = join(PUBLIC, pub)
    const same = existsSync(dest) && statSync(dest).size === bytes && createHash('sha256').update(readFileSync(dest)).digest('hex') === sha256
    if (!ctx.dry) {
      if (same) unchanged++
      else { mkdirSync(dirname(dest), { recursive: true }); copyFileSync(src, dest); copied++ }
    }
    manifest.push({ path: pub, bytes, sha256 })
  }

  const missingOnProduction = rows
    .filter((r) => r.section === 'brochures-dead-target' && r.live_status.startsWith('live'))
    .map((r) => decodeURI(new URL(r.url).pathname))
  const totalBytes = manifest.reduce((n, m) => n + m.bytes, 0)

  mkdirSync(OUT, { recursive: true })
  writeFileSync(join(OUT, `${SITE}-static-manifest.json`), JSON.stringify(manifest, null, 2))
  const report = {
    step: name, dryRun: Boolean(ctx.dry), files: manifest.length, copied, unchanged, skipped: skipped.length, skippedList: skipped,
    totalBytes, totalMB: Math.round((totalBytes / 1048576) * 10) / 10, missingOnProduction,
    review: STATIC_REVIEW,
  }
  writeFileSync(join(OUT, `${SITE}-static.report.json`), JSON.stringify(report, null, 2))
  return { name, files: manifest.length, copied, unchanged, skipped: skipped.length, totalMB: report.totalMB, missingOnProduction: missingOnProduction.length }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run({ dry: process.argv.includes('--dry') || process.argv.includes('--dry-run') }).then((r) => { console.log(r); process.exit(0) }, (e) => { console.error(e); process.exit(1) })
}
