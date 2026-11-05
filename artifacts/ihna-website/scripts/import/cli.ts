/**
 * npm run import -- <step|a,b|all> [--only=wpId|path,...] [--dry] [--force] [--key=value]
 *
 * Steps are discovered by listing scripts/import/steps/*.ts. Each exports `name` and `run(ctx)` (see lib/context.ts), so another
 * agent adds a step by adding a file, never by editing this one. `all` runs the site's list (`ALL_STEPS` in lib/config.ts; IHNA has no
 * `wp-posts`), or every step in ascending `order` (default 100) when the site has none; `a,b` runs the named steps in that order.
 * Every step writes scripts/import/out/<site>-<step>.report.json and gets `context: { importing: true }` + `overrideAccess: true`
 * through `ctx.opts`. The live site is only ever read with GET (rule 3: no secrets are read or sent).
 */
import 'dotenv/config'
process.env.DISABLE_DB_PUSH ??= '1' // the dev server owns schema push; imports only read/write rows
import { readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { ALL_STEPS, DEV_SITE_URL } from './lib/config'
import { newReport, writeReport, type ImportArgs, type ImportContext, type ImportStep, type StepReport } from './lib/context'
import { selectSteps, sortSteps } from './lib/steps'

const here = dirname(fileURLToPath(import.meta.url))

export function parseArgs(argv: string[]): ImportArgs {
  const flags: Record<string, string | true> = {}
  const positional: string[] = []
  for (const a of argv) {
    if (!a.startsWith('--')) positional.push(a)
    else {
      const [k, ...v] = a.slice(2).split('=')
      flags[k] = v.length ? v.join('=') : true
    }
  }
  const only = typeof flags.only === 'string' ? new Set(flags.only.split(',').map((s) => s.trim()).filter(Boolean)) : null
  return { step: positional[0] ?? '', only, dry: Boolean(flags.dry || flags['dry-run'] || process.env.IMPORT_DRY === '1'), force: Boolean(flags.force), flags }
}

async function discover(): Promise<ImportStep[]> {
  const dir = resolve(here, 'steps')
  const files = readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts') && !f.endsWith('.test.ts'))
  const steps: ImportStep[] = []
  for (const f of files) {
    const mod = (await import(pathToFileURL(resolve(dir, f)).href)) as Record<string, unknown> & { default?: Partial<ImportStep> }
    const run = (mod.default?.run ?? mod.run) as ImportStep['run'] | undefined
    const name = (mod.default?.name ?? mod.name ?? f.replace(/\.ts$/, '')) as string
    const order = (mod.default?.order ?? mod.order ?? 100) as number
    if (typeof run === 'function') steps.push({ name, order, run })
    else console.warn(`[import] ${f} has no run(ctx); skipped`)
  }
  return sortSteps(steps)
}

const line = (r: StepReport) =>
  `${r.step.padEnd(12)} created=${r.created} updated=${r.updated} skipped=${r.skipped} failed=${r.failed.length} review=${r.reviewQueue.length}${r.dryRun ? ' (dry run)' : ''}`

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2))
  const steps = await discover()
  if (!args.step) {
    console.log(`usage: npm run import -- <step|a,b|all> [--only=id,...] [--dry] [--force]\nsteps: ${steps.map((s) => s.name).join(', ')}\nall: ${selectSteps('all', steps, ALL_STEPS).steps.map((s) => s.name).join(', ')}`)
    return 2
  }
  const { steps: wanted, unknown } = selectSteps(args.step, steps, ALL_STEPS)
  if (unknown.length) {
    console.error(`unknown step "${unknown.join(', ')}". Available: ${steps.map((s) => s.name).join(', ')}`)
    return 2
  }

  // `payload` and the config load here, once, before any step touches @payloadcms/richtext-lexical (see lib/lexical.ts).
  const { getPayload } = await import('payload')
  const { default: config } = await import('../../src/payload.config')
  const payload = await getPayload({ config: await config })

  let code = 0
  for (const step of wanted) {
    const report = newReport(step.name, args.dry)
    const ctx: ImportContext = {
      payload, args, dry: args.dry, report,
      opts: { context: { importing: true }, overrideAccess: true },
      log: (m) => console.log(`[${step.name}] ${m}`),
      wanted: (...keys) => !args.only || keys.some((k) => args.only!.has(String(k))),
    }
    try {
      const extra = await step.run(ctx)
      if (extra) {
        // a step may return counters of its own, but never replace the contract arrays/numbers with something else
        const { failed, reviewQueue, ...rest } = extra
        Object.assign(report, rest)
        if (Array.isArray(failed)) {
          if (failed !== report.failed) report.failed.push(...failed)
        }
        else if (failed !== undefined) report.failedReported = failed
        if (Array.isArray(reviewQueue) && reviewQueue !== report.reviewQueue) report.reviewQueue.push(...reviewQueue)
      }
    } catch (e) {
      report.failed.push({ id: 'step', reason: e instanceof Error ? e.stack ?? e.message : String(e) })
      code = 1
    }
    writeReport(report)
    console.log(line(report))
    if (!args.dry) await clearSiteCache(step.name)
    for (const f of report.failed.slice(0, 5)) console.log(`  failed ${f.id}: ${f.reason.split('\n')[0]}`)
    if (report.failed.some((f) => f.id === 'step')) code = 1
  }
  await payload.destroy?.()
  return code
}

main()
  .then((code) => process.stdout.write('', () => process.exit(code)))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

// Imports run outside Next and skip the publish hooks, so clear the page cache afterwards (00-architecture §3).
async function clearSiteCache(step: string): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET
  const base = process.env.NEXT_PUBLIC_SITE_URL || DEV_SITE_URL
  if (!secret) { console.warn('[import] REVALIDATE_SECRET not set; page cache not cleared'); return }
  try {
    const res = await fetch(`${base}/api/revalidate/`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ all: true }), signal: AbortSignal.timeout(10_000),
    })
    console.log(`[import] cache cleared after ${step}: ${res.status}`)
  } catch (e) {
    console.warn(`[import] cache not cleared after ${step} (${e instanceof Error ? e.message : e}); the dev server may be down`)
  }
}
