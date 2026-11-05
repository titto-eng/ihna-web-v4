import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, resolve, sep } from 'node:path'
import { parse } from 'csv-parse/sync'
import { INVENTORY_DIR, LEGACY_BASE_URL, MEDIA_EXTENSIONS, MEDIA_MAX_BYTES, OUT_DIR, outPath, reportPath, ROOT, SITE } from './config'

// Step 4 of `npm run import:refresh`: files an earlier run could not fetch may be back on the live site. GET only, allowlisted types only
// (extension AND content-type AND magic bytes must agree), same public path, never anything an HTML page could smuggle in.

export type LiveGet = (url: string) => Promise<{ status: number; type: string; buf: Buffer; finalUrl: string; headers: Headers }>

const STATIC_ALLOW = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif'] as const
const STATIC_MAX_BYTES = 50 * 1024 * 1024
const encodePath = (p: string) => p.split('/').map(encodeURIComponent).join('/').replace(/%26/g, '&')

const MAGIC: Record<string, (b: Buffer) => boolean> = {
  pdf: (b) => b.subarray(0, 5).toString('latin1') === '%PDF-',
  png: (b) => b.subarray(1, 4).toString('latin1') === 'PNG',
  jpg: (b) => b[0] === 0xff && b[1] === 0xd8,
  jpeg: (b) => b[0] === 0xff && b[1] === 0xd8,
  gif: (b) => b.subarray(0, 3).toString('latin1') === 'GIF',
  webp: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP',
}
const TYPE_OK = (ext: string, type: string) => (ext === 'pdf' ? /^application\/pdf/.test(type) : /^image\//.test(type))

export type Probe = { path: string; status: number | 'error'; type?: string; bytes?: number; ok: boolean; reason?: string }

/** `ok` only when the live site answers 200 with an allowlisted file whose bytes match its extension. */
export function judge(path: string, res: { status: number; type: string; buf: Buffer }, allow: readonly string[], maxBytes: number): Probe {
  const ext = extname(path).slice(1).toLowerCase()
  const base = { path, status: res.status, type: res.type.split(';')[0], bytes: res.buf.length }
  if (res.status !== 200) return { ...base, ok: false, reason: `HTTP ${res.status}` }
  if (!allow.includes(ext)) return { ...base, ok: false, reason: `extension not allowed: ${ext || '(none)'}` }
  if (!TYPE_OK(ext, res.type)) return { ...base, ok: false, reason: `not a ${ext} file (content-type ${base.type || 'none'}); a page or folder, not copied` }
  if (!MAGIC[ext]?.(res.buf)) return { ...base, ok: false, reason: 'bytes do not match the extension' }
  if (res.buf.length > maxBytes) return { ...base, ok: false, reason: `too large (${res.buf.length} bytes)` }
  return { ...base, ok: true }
}

export type UploadRecovery = { probed: Probe[]; recovered: string[]; stillMissing: { path: string; reason: string }[] }

/** The 404 uploads of the last media run, plus the ones an earlier refresh could not get. State in out/<site>-missing-uploads.json. */
export function candidateUploads(): string[] {
  const set = new Set<string>()
  const state = outPath('missing-uploads.json')
  if (existsSync(state)) for (const p of (JSON.parse(readFileSync(state, 'utf8')) as { paths: string[] }).paths) set.add(p)
  const media = reportPath('media')
  if (existsSync(media)) {
    const r = JSON.parse(readFileSync(media, 'utf8')) as { failed?: { id: string; reason: string }[] }
    for (const f of r.failed ?? []) if (/HTTP 404/.test(f.reason) && f.id.startsWith('wp-content/uploads/')) set.add(f.id)
  }
  return [...set].sort()
}

export function saveMissingUploads(paths: string[]): void {
  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(outPath('missing-uploads.json'), JSON.stringify({ updatedAt: new Date().toISOString(), paths: [...new Set(paths)].sort() }, null, 2))
}

/** Probe only (GET, body discarded): the media step does the real download and import for the ones that answer. */
export async function probeUploads(paths: string[], get: LiveGet): Promise<UploadRecovery> {
  const probed: Probe[] = []
  for (const p of paths) {
    try {
      const res = await get(`${LEGACY_BASE_URL}/${encodePath(p)}`)
      probed.push(judge(p, res, MEDIA_EXTENSIONS, MEDIA_MAX_BYTES))
    } catch (e) {
      probed.push({ path: p, status: 'error', ok: false, reason: e instanceof Error ? e.message : String(e) })
    }
  }
  return {
    probed,
    recovered: probed.filter((x) => x.ok).map((x) => x.path),
    stillMissing: probed.filter((x) => !x.ok).map((x) => ({ path: x.path, reason: x.reason ?? 'unknown' })),
  }
}

export type StaticTarget = { path: string; source: 'static-held.missingOnServerOnly' | 'landing-pages.csv brochures-dead-target' }

/** The live-only PDFs of seeds/static-held.json and the live (200) brochure rows of landing-pages.csv. */
export function staticTargets(): StaticTarget[] {
  const out = new Map<string, StaticTarget>()
  const held = JSON.parse(readFileSync(resolve(ROOT, 'scripts/import/seeds/static-held.json'), 'utf8')) as { missingOnServerOnly?: { paths?: string[] } }
  for (const p of held.missingOnServerOnly?.paths ?? []) out.set(p, { path: p, source: 'static-held.missingOnServerOnly' })
  const rows = parse(readFileSync(resolve(INVENTORY_DIR, `v2/${SITE}/landing-pages.csv`), 'utf8'), { columns: true, skip_empty_lines: true, bom: true }) as Record<string, string>[]
  for (const r of rows.filter((x) => x.section === 'brochures-dead-target' && x.live_status.startsWith('live'))) {
    const p = decodeURI(new URL(r.url).pathname)
    out.set(p, { path: p, source: 'landing-pages.csv brochures-dead-target' })
  }
  return [...out.values()]
}

export type StaticRecovery = {
  recovered: { path: string; bytes: number; sha256: string; wrote: boolean }[]
  stillMissing: { path: string; source: string; reason: string }[]
}

/** Writes each allowlisted answer to public/<same path>. An identical file already there is left alone. */
export async function recoverStatic(targets: StaticTarget[], get: LiveGet, publicDir = join(ROOT, 'public')): Promise<StaticRecovery> {
  const result: StaticRecovery = { recovered: [], stillMissing: [] }
  for (const t of targets) {
    try {
      const res = await get(`${LEGACY_BASE_URL}${encodePath(t.path)}`)
      const probe = judge(t.path, res, STATIC_ALLOW, STATIC_MAX_BYTES)
      if (!probe.ok) {
        result.stillMissing.push({ path: t.path, source: t.source, reason: probe.reason ?? 'unknown' })
        continue
      }
      const sha256 = createHash('sha256').update(res.buf).digest('hex')
      const dest = join(publicDir, t.path)
      if (!resolve(dest).startsWith(resolve(publicDir) + sep)) throw new Error('path escapes public/')
      const same = existsSync(dest) && createHash('sha256').update(readFileSync(dest)).digest('hex') === sha256
      if (!same) {
        mkdirSync(dirname(dest), { recursive: true })
        writeFileSync(dest, res.buf)
      }
      result.recovered.push({ path: t.path, bytes: res.buf.length, sha256, wrote: !same })
    } catch (e) {
      result.stillMissing.push({ path: t.path, source: t.source, reason: e instanceof Error ? e.message : String(e) })
    }
  }
  return result
}
