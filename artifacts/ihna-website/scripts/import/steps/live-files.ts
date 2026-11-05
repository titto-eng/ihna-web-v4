/**
 * Step `live-files` (30-import §7.2): files the live site serves that the old repo does not hold (seeds/static-held.json
 * `missingOnServerOnly`, plus live `brochures-dead-target` rows of landing-pages.csv) are fetched once from LEGACY_BASE_URL into
 * public/ at the same path, so the `documents` step (order 110) imports them like the copied ones.
 * GET only, one request at a time, at most one per second; extension, content-type and magic bytes must agree (`recoverStatic`).
 * A file already in public/ is not fetched again unless `--force`. `--dry` lists what it would fetch.
 * Run: `npm run import -- live-files [--dry] [--force]`
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from '../lib/config'
import type { ImportContext } from '../lib/context'
import { recoverStatic, staticTargets, type LiveGet } from '../lib/recover-missing'

export const name = 'live-files'
export const order = 105 // after `static` (100), before `documents` (110)

const MIN_GAP_MS = 1100
const UA = 'ihna-web import (live-files; GET only)'
let last = 0
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** One GET at a time, at least MIN_GAP_MS apart; a network error or 5xx is retried twice (3 s, 6 s later). */
const politeGet: LiveGet = async (url) => {
  for (let attempt = 1; ; attempt++) {
    const wait = last + MIN_GAP_MS - Date.now()
    if (wait > 0) await sleep(wait)
    last = Date.now()
    try {
      const res = await fetch(url, { method: 'GET', headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(60_000) })
      if (res.status >= 500 && attempt < 3) {
        await sleep(3000 * attempt)
        continue
      }
      return { status: res.status, type: res.headers.get('content-type') ?? '', buf: Buffer.from(await res.arrayBuffer()), finalUrl: res.url, headers: res.headers }
    } catch (e) {
      if (attempt >= 3) throw e
      await sleep(3000 * attempt)
    }
  }
}

export async function run(ctx: ImportContext) {
  const publicDir = join(ROOT, 'public')
  const all = staticTargets().filter((t) => ctx.wanted(t.path))
  const present = all.filter((t) => existsSync(join(publicDir, t.path)))
  const todo = ctx.args.force ? all : all.filter((t) => !present.includes(t))
  ctx.report.skipped += all.length - todo.length
  if (ctx.dry) {
    for (const t of todo) ctx.log(`would fetch ${t.path}`)
    return { targets: all.length, wouldFetch: todo.map((t) => t.path), alreadyPresent: all.length - todo.length }
  }
  const result = await recoverStatic(todo, politeGet, publicDir)
  ctx.report.created += result.recovered.filter((r) => r.wrote).length
  for (const m of result.stillMissing) ctx.report.failed.push({ id: m.path, reason: m.reason })
  return { targets: all.length, alreadyPresent: all.length - todo.length, recovered: result.recovered, stillMissing: result.stillMissing }
}
