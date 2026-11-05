import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { Payload } from 'payload'
import { MEDIA_MAP_PATH, OUT_DIR, SITE, reportPath } from './config'

// The contract every `steps/*.ts` file follows. cli.ts only discovers files; it knows nothing about a step.
//   export const name = 'wp-pages'            (or `export default { name, run }`)
//   export const order = 30                   (optional; `all` runs ascending, default 100)
//   export async function run(ctx: ImportContext): Promise<void | Partial<StepReport>>

export type ReviewItem = { id: string | number; path?: string; reasons: string[]; confidence?: number }
export type StepReport = {
  site: string
  step: string
  dryRun: boolean
  startedAt: string
  finishedAt?: string
  created: number
  updated: number
  skipped: number
  failed: { id: string | number; reason: string }[]
  reviewQueue: ReviewItem[]
  [extra: string]: unknown
}

export type ImportArgs = { step: string; only: Set<string> | null; dry: boolean; force: boolean; flags: Record<string, string | true> }

export type ImportContext = {
  payload: Payload
  args: ImportArgs
  dry: boolean
  report: StepReport
  /** Spread into every Local API write: `{ context: { importing: true }, overrideAccess: true }`. */
  opts: { context: { importing: true }; overrideAccess: true }
  log: (msg: string) => void
  /** True when `--only` is absent or lists this id or path. */
  wanted: (...keys: (string | number)[]) => boolean
}

export type ImportStep = { name: string; order?: number; run: (ctx: ImportContext) => Promise<void | Partial<StepReport>> }

export const newReport = (step: string, dry: boolean): StepReport => ({
  site: SITE, step, dryRun: dry, startedAt: new Date().toISOString(), created: 0, updated: 0, skipped: 0, failed: [], reviewQueue: [],
})

export function writeReport(report: StepReport): string {
  mkdirSync(OUT_DIR, { recursive: true })
  const file = reportPath(report.step)
  writeFileSync(file, JSON.stringify({ ...report, finishedAt: new Date().toISOString() }, null, 2))
  return file
}

/** legacyPath (no host, no leading slash) → media id. Written by `media`, read by every step that places images. */
export type MediaMap = Record<string, number>
export const normaliseLegacyPath = (src: string): string => {
  let p = src.trim()
  try {
    p = new URL(p, 'https://ihm.edu.au').pathname
  } catch {
    /* keep */
  }
  try {
    p = decodeURI(p)
  } catch {
    /* keep */
  }
  return p.replace(/^\/+/, '')
}

export function loadMediaMap(): MediaMap {
  if (!existsSync(MEDIA_MAP_PATH)) return {}
  const raw = JSON.parse(readFileSync(MEDIA_MAP_PATH, 'utf8')) as { map?: MediaMap } | MediaMap
  return ('map' in raw && raw.map ? raw.map : raw) as MediaMap
}
