import 'dotenv/config'
process.env.DISABLE_DB_PUSH ??= '1' // the dev server owns schema push; a standalone step only reads/writes rows (DEC-46)
import { newReport, writeReport, type ImportContext, type StepReport } from './context'

/**
 * Runs one step without cli.ts (used by `npx tsx scripts/import/steps/<step>.ts`): same context the CLI builds.
 * Flags: --dry, --force, --only=a,b. Writes scripts/import/out/ihm-<step>.report.json.
 */
export async function runStandalone(step: string, run: (ctx: ImportContext) => Promise<void | Partial<StepReport>>): Promise<void> {
  const argv = process.argv.slice(2)
  const flag = (k: string) => argv.find((a) => a === `--${k}` || a.startsWith(`--${k}=`))
  const dry = Boolean(flag('dry') || flag('dry-run'))
  const onlyArg = flag('only')?.split('=')[1]
  const flags: Record<string, string | true> = {}
  for (const a of argv) if (a.startsWith('--')) { const [k, ...v] = a.slice(2).split('='); flags[k] = v.length ? v.join('=') : true }
  const only = onlyArg ? new Set(onlyArg.split(',').map((s) => s.trim()).filter(Boolean)) : null
  const { getPayload } = await import('payload')
  const { default: config } = await import('../../../src/payload.config')
  const payload = await getPayload({ config: await config })
  const report = newReport(step, dry)
  const ctx: ImportContext = {
    payload, args: { step, only, dry, force: Boolean(flag('force')), flags }, dry, report,
    opts: { context: { importing: true }, overrideAccess: true },
    log: (m) => console.log(`[${step}] ${m}`),
    wanted: (...keys) => !only || keys.some((k) => only.has(String(k))),
  }
  let code = 0
  try {
    const extra = await run(ctx)
    if (extra) Object.assign(report, extra)
  } catch (e) {
    report.failed.push({ id: 'step', reason: e instanceof Error ? e.stack ?? e.message : String(e) })
    code = 1
  }
  writeReport(report)
  console.log(`${step}: created=${report.created} updated=${report.updated} skipped=${report.skipped} failed=${report.failed.length}${dry ? ' (dry run)' : ''}`)
  for (const f of report.failed.slice(0, 5)) console.log(`  failed ${f.id}: ${f.reason.split('\n')[0]}`)
  await payload.destroy?.()
  process.stdout.write('', () => process.exit(code))
}
