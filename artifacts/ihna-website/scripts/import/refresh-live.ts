/**
 * npm run import:refresh [-- --dry] [--resume] [--force] [--lazy] [--no-import] [--no-recover] [--no-content-diff]
 *
 * Makes the CMS current with the live site (`LEGACY_BASE_URL`) and keeps the next refresh repeatable (30-import "Refresh"):
 *  1. fetches pages, posts and courses from the live WordPress REST API (same endpoints and fields as ../inventory/data/fetch_wp.py;
 *     public, GET only, <= 3 requests/s, UA "Mozilla/5.0 (inventory script)") into ../inventory/data/<site>/, keeping the files that were there as *.prev.json;
 *  2. diffs by id + modified: new, changed, deleted -> ../inventory/data/<site>/refresh-<date>.report.json, with a printed summary;
 *  3. re-imports only new/changed items (`--only=<ids>`: media, wp-posts, wp-courses, staff). A doc whose import.reviewStatus is `ok`
 *     (set by a person) is skipped and listed. A deleted item is never deleted: its doc gets reviewStatus `check` (rule 1) and is listed.
 *     Pages are code (DEC-61): a new, changed or deleted WordPress page that is not a staff profile is listed in the report
 *     (`import.pagesChangedOnLive`, `import.pagesDeletedOnLive`) for a developer to update the route file, and nothing is imported for it.
 *     Posts are imported only where the site imports them (`WP_POSTS_IMPORTED`); on IHNA they are route files at the site root
 *     (DEC-42) and are listed like pages (`import.postsChangedOnLive`, `import.postsDeletedOnLive`);
 *  4. clears the page cache (POST /api/revalidate/ with x-revalidate-secret on NEXT_PUBLIC_SITE_URL, else `DEV_SITE_URL`) and
 *     re-checks the files the last runs could not fetch (<site>-missing-uploads.json, <site>-recovered.json).
 *
 * `--dry` fetches and prints the diff, writes nothing. If a run stops before the import finished, the report says `importPending`;
 * the next run refuses to fetch again (it would diff the new data against itself) until you `--resume` it.
 * `--lazy` re-fetches the body only of new/modified items (default: every body, so a changed rendering is noticed too).
 * `--no-content-diff` ignores bodies that changed while `modified` did not.
 */
import 'dotenv/config'
process.env.DISABLE_DB_PUSH ??= '1' // the dev server owns schema push; this script only reads/writes rows
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { DEV_SITE_URL, LEGACY_BASE_URL, OUT_DIR, ROOT, INVENTORY_DIR, outPath, reportPath, SITE, WP_POSTS_IMPORTED } from './lib/config'
import { loadPageRows, type WpItem } from './lib/data'
import { diffSnapshots, onlyArg, partitionByReview, planSteps, type DiffEntry, type DocState, type SnapshotDiff, type WpKind } from './lib/refresh'
import { candidateUploads, probeUploads, recoverStatic, saveMissingUploads, staticTargets, type LiveGet } from './lib/recover-missing'
import { collectReferences } from './steps/media'

const KINDS: WpKind[] = ['pages', 'posts', 'courses']
/**
 * The kinds that have a collection with an `import` group; WordPress pages are code (DEC-61) and are only diffed and reported, and so
 * are posts on a site that does not import them (IHNA: route files at the site root, DEC-42).
 */
type ImportedKind = 'posts' | 'courses'
const IMPORTED: readonly ImportedKind[] = WP_POSTS_IMPORTED ? ['posts', 'courses'] : ['courses']
const DATA_DIR = resolve(INVENTORY_DIR, `data/${SITE}`)
const UA = 'Mozilla/5.0 (inventory script)'
const META = 'id,slug,link,status,type,title,template,parent,menu_order,date,modified'
const MIN_GAP_MS = 400 // 2.5 requests/s: under the 3/s ceiling

type Args = { dry: boolean; resume: boolean; force: boolean; lazy: boolean; noImport: boolean; noRecover: boolean; contentDiff: boolean }
const parseArgv = (argv: string[]): Args => ({
  dry: argv.includes('--dry') || argv.includes('--dry-run'),
  resume: argv.includes('--resume'),
  force: argv.includes('--force'),
  lazy: argv.includes('--lazy'),
  noImport: argv.includes('--no-import'),
  noRecover: argv.includes('--no-recover'),
  contentDiff: !argv.includes('--no-content-diff'),
})

// ---- the only way this script talks to the live site: GET, one request at a time, at most 2.5 per second
let last = 0
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
export const liveGet: LiveGet = async (url) => {
  for (let attempt = 1; ; attempt++) {
    const wait = last + MIN_GAP_MS - Date.now()
    if (wait > 0) await sleep(wait)
    last = Date.now()
    try {
      const res = await fetch(url, { method: 'GET', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(60_000) })
      if ((res.status === 429 || res.status >= 500) && attempt < 3) {
        await sleep(Number(res.headers.get('retry-after') ?? 0) * 1000 || 1500 * attempt)
        continue
      }
      return { status: res.status, type: res.headers.get('content-type') ?? '', buf: Buffer.from(await res.arrayBuffer()), finalUrl: res.url, headers: res.headers }
    } catch (e) {
      if (attempt >= 3) throw e
      await sleep(1500 * attempt)
    }
  }
}
async function getJson<T>(url: string): Promise<{ data: T; totalPages: number }> {
  const res = await liveGet(url)
  if (res.status !== 200) throw new Error(`HTTP ${res.status} ${url}`)
  return { data: JSON.parse(res.buf.toString('utf8')) as T, totalPages: Number(res.headers.get('x-wp-totalpages') ?? '1') }
}
async function listAll(kind: WpKind): Promise<WpItem[]> {
  const items: WpItem[] = []
  for (let page = 1; ; page++) {
    const { data, totalPages } = await getJson<WpItem[]>(`${LEGACY_BASE_URL}/wp-json/wp/v2/${kind}?per_page=100&page=${page}&_fields=${META}`)
    items.push(...data)
    if (page >= totalPages) return items
  }
}

const readJson = <T>(file: string): T => JSON.parse(readFileSync(file, 'utf8')) as T
const dataFile = (kind: WpKind, suffix = '') => resolve(DATA_DIR, `${kind}${suffix}.json`)
const today = () => new Date().toISOString().slice(0, 10)
const reportFile = (date: string) => resolve(DATA_DIR, `refresh-${date}.report.json`)
function writeAtomic(file: string, text: string) {
  const tmp = `${file}.tmp`
  writeFileSync(tmp, text)
  renameSync(tmp, file)
}

type Report = {
  generatedAt: string
  date: string
  site: string
  importPending: boolean
  options: Args
  counts: Record<WpKind, { before: number; after: number; new: number; changed: number; deleted: number; unchanged: number }>
  new: Record<WpKind, DiffEntry[]>
  changed: Record<WpKind, DiffEntry[]>
  deleted: Record<WpKind, DiffEntry[]>
  fetchErrors: { kind: WpKind; id: number; reason: string }[]
  import?: Record<string, unknown>
  recovery?: Record<string, unknown>
  revalidate?: Record<string, unknown>
}

// ---- 1+2: fetch and diff
async function fetchAll(prev: Record<WpKind, WpItem[]>, args: Args) {
  const next = {} as Record<WpKind, WpItem[]>
  const fetchErrors: Report['fetchErrors'] = []
  for (const kind of KINDS) {
    const list = await listAll(kind)
    const before = new Map(prev[kind].map((i) => [i.id, i]))
    const items: WpItem[] = []
    for (const it of list) {
      const old = before.get(it.id)
      if (args.lazy && old && old.modified === it.modified && old.content != null) {
        items.push({ ...it, content: old.content, excerpt: old.excerpt })
        continue
      }
      try {
        const { data } = await getJson<{ content?: { rendered?: string }; excerpt?: { rendered?: string } }>(`${LEGACY_BASE_URL}/wp-json/wp/v2/${kind}/${it.id}?_fields=content,excerpt`)
        items.push({ ...it, content: data.content?.rendered ?? '', excerpt: data.excerpt?.rendered ?? '' })
      } catch (e) {
        // never import a body we could not read: keep what we had (or leave a new item out) and say so
        fetchErrors.push({ kind, id: it.id, reason: e instanceof Error ? e.message : String(e) })
        if (old) items.push(old)
      }
    }
    next[kind] = items
    console.log(`[refresh] fetched ${kind}: ${items.length} (live lists ${list.length})`)
  }
  return { next, fetchErrors }
}

function summary(report: Report): string {
  const lines: string[] = []
  for (const k of KINDS) {
    const c = report.counts[k]
    lines.push(`${k.padEnd(8)} live=${c.after} (was ${c.before})  new=${c.new} changed=${c.changed} deleted=${c.deleted} unchanged=${c.unchanged}`)
  }
  for (const [label, group] of [['NEW', report.new], ['CHANGED', report.changed], ['DELETED', report.deleted]] as const) {
    for (const k of KINDS) for (const e of group[k]) lines.push(`  ${label.padEnd(8)} ${k.slice(0, -1).padEnd(6)} ${String(e.id).padStart(5)} ${e.link}${e.reasons ? ` [${e.reasons.join(',')}]` : ''}`)
  }
  if (report.fetchErrors.length) lines.push(`fetch errors: ${report.fetchErrors.map((e) => `${e.kind}/${e.id}`).join(', ')}`)
  return lines.join('\n')
}

// ---- 3: the import
type StepRun = { step: string; only: string[]; exit: number; created: number; updated: number; skipped: number; failed: { id: string | number; reason: string }[]; conflicts: number; reviewQueue: { id: string | number; path?: string; reasons: string[] }[] }

function runStep(step: string, ids: (string | number)[], args: Args, date: string): StepRun | null {
  const only = onlyArg(ids)
  if (!only.arg) return null
  const file = reportPath(step)
  const archive = resolve(OUT_DIR, 'refresh', date)
  mkdirSync(archive, { recursive: true })
  if (existsSync(file)) copyFileSync(file, resolve(archive, `before-${step}.report.json`))
  const tsx = resolve(ROOT, 'node_modules/.bin/tsx')
  const argv = ['scripts/import/cli.ts', step, only.arg, ...(args.force ? ['--force'] : [])]
  console.log(`[refresh] npm run import -- ${step} ${only.arg.length > 120 ? `${only.arg.slice(0, 120)}…` : only.arg}`)
  const startedAt = Date.now()
  const r = spawnSync(tsx, argv, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, NODE_OPTIONS: '--no-deprecation' } })
  const rep = existsSync(file) ? readJson<Record<string, unknown> & { created: number; updated: number; skipped: number; failed: StepRun['failed']; reviewQueue: StepRun['reviewQueue']; finishedAt?: string }>(file) : null
  // a report written before this run started is not this run's
  const fresh = Boolean(rep?.finishedAt && Date.parse(rep.finishedAt) >= startedAt - 1000)
  if (rep && fresh) copyFileSync(file, resolve(archive, `${step}.report.json`))
  return {
    step, only: only.arg.slice('--only='.length).split(','), exit: r.status ?? 1,
    created: fresh ? rep!.created : 0, updated: fresh ? rep!.updated : 0, skipped: fresh ? rep!.skipped : 0,
    failed: fresh ? rep!.failed : [{ id: 'step', reason: `no fresh report (exit ${r.status})` }],
    conflicts: fresh ? Number(rep!.conflicts ?? 0) : 0, reviewQueue: fresh ? rep!.reviewQueue : [],
  }
}

async function openPayload() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../../src/payload.config')
  return getPayload({ config: await config })
}

type WpDoc = { id: number | string; _status?: string; import?: { wpId?: number; reviewStatus?: string | null; importReport?: Record<string, unknown> | null } & Record<string, unknown> }
const draftFlag = (kind: ImportedKind) => (kind === 'courses' ? { draft: true } : {})
/** A page entry as the report lists it for the developer: what changed and where the route file lives. */
const pageForReport = (e: DiffEntry, change: 'new' | 'changed' | 'deleted') => ({ id: e.id, path: e.path, title: e.title, modified: e.modified, change, ...(e.reasons ? { reasons: e.reasons } : {}), routeFile: `src/app/(site)${e.path.replace(/\/$/, '')}/page.tsx` })

async function main(): Promise<number> {
  const args = parseArgv(process.argv.slice(2))
  mkdirSync(DATA_DIR, { recursive: true })
  const date = today()

  // a previous run that did not finish its import must be resumed, not repeated
  const reports = readdirSync(DATA_DIR).filter((f) => /^refresh-.*\.report\.json$/.test(f)).sort()
  const pending = reports.length ? readJson<Report>(resolve(DATA_DIR, reports[reports.length - 1])) : null
  let report: Report
  let file = reportFile(date)

  if (args.resume) {
    if (!pending?.importPending) { console.error('[refresh] nothing to resume (the last report has importPending=false)'); return 2 }
    report = pending
    file = resolve(DATA_DIR, reports[reports.length - 1])
    console.log(`[refresh] resuming ${reports[reports.length - 1]}`)
  } else {
    if (pending?.importPending && !args.dry) {
      console.error(`[refresh] ${reports[reports.length - 1]} has importPending=true: its import did not finish. Run \`npm run import:refresh -- --resume\` (a new fetch would diff the new data against itself).`)
      return 2
    }
    for (const k of KINDS) if (!existsSync(dataFile(k))) { console.error(`[refresh] ${dataFile(k)} missing: nothing to diff against`); return 2 }
    const prev = Object.fromEntries(KINDS.map((k) => [k, readJson<WpItem[]>(dataFile(k))])) as Record<WpKind, WpItem[]>
    const { next, fetchErrors } = await fetchAll(prev, args)
    const diffs = Object.fromEntries(KINDS.map((k) => [k, diffSnapshots(prev[k], next[k], { compareContent: args.contentDiff })])) as Record<WpKind, SnapshotDiff>
    report = {
      generatedAt: new Date().toISOString(), date, site: LEGACY_BASE_URL, importPending: !args.noImport, options: args,
      counts: Object.fromEntries(KINDS.map((k) => [k, { before: prev[k].length, after: next[k].length, new: diffs[k].new.length, changed: diffs[k].changed.length, deleted: diffs[k].deleted.length, unchanged: diffs[k].unchanged }])) as Report['counts'],
      new: Object.fromEntries(KINDS.map((k) => [k, diffs[k].new])) as Report['new'],
      changed: Object.fromEntries(KINDS.map((k) => [k, diffs[k].changed])) as Report['changed'],
      deleted: Object.fromEntries(KINDS.map((k) => [k, diffs[k].deleted])) as Report['deleted'],
      fetchErrors,
    }
    console.log(`\n${summary(report)}\n`)
    if (args.dry) { console.log('[refresh] --dry: nothing written'); return 0 }
    // keep the old snapshot, then replace it (only after all three were fetched)
    for (const k of KINDS) {
      copyFileSync(dataFile(k), dataFile(k, '.prev'))
      writeAtomic(dataFile(k), JSON.stringify(next[k], null, 1))
    }
    writeAtomic(file, JSON.stringify(report, null, 2))
    console.log(`[refresh] wrote ${KINDS.map((k) => `${k}.json`).join(', ')} (previous kept as *.prev.json) and ${file}`)
  }

  if (!args.noImport) await importPhase(report, args, date, file)
  await recoverPhase(report, args)
  report.revalidate = await revalidate()
  report.importPending = false
  report.generatedAt = new Date().toISOString()
  writeAtomic(file, JSON.stringify(report, null, 2))
  console.log(`\n[refresh] report: ${file}`)
  return Object.values((report.import?.steps ?? []) as StepRun[]).some((s) => s.exit !== 0) ? 1 : 0
}

async function importPhase(report: Report, args: Args, date: string, file: string) {
  const data = Object.fromEntries(KINDS.map((k) => [k, readJson<WpItem[]>(dataFile(k))])) as Record<WpKind, WpItem[]>
  const candidates = Object.fromEntries(KINDS.map((k) => [k, [...report.new[k], ...report.changed[k]]])) as Record<WpKind, DiffEntry[]>

  // uploads that were 404 and may be back: probe now, so the posts that use them are re-converted in this run
  const uploadRec = args.noRecover ? null : await probeUploads(candidateUploads(), liveGet)
  const recoveredSet = new Set(uploadRec?.recovered ?? [])
  if (recoveredSet.size && WP_POSTS_IMPORTED) {
    const have = new Set(candidates.posts.map((e) => e.id))
    for (const it of data.posts) {
      if (have.has(it.id) || !it.content) continue
      if ([...collectReferences([it.content]).keys()].some((p) => recoveredSet.has(p))) {
        const e: DiffEntry = { id: it.id, link: it.link, path: new URL(it.link).pathname, title: String((it.title as { rendered?: string })?.rendered ?? ''), modified: it.modified, reasons: ['media-recovered' as never] }
        candidates.posts.push(e)
      }
    }
  }

  // what a person has marked ok, and what exists at all (posts and courses; staff docs have no review state and pages have no collection)
  const payload = await openPayload()
  const docs: Record<ImportedKind, Map<number, DocState>> = { posts: new Map(), courses: new Map() }
  const importable: Record<WpKind, DiffEntry[]> = { pages: candidates.pages, posts: [], courses: [] }
  const skippedOk: { kind: WpKind; id: number; path: string }[] = []
  const deletedMarked: { kind: WpKind; id: number; path: string; outcome: string }[] = []
  for (const k of IMPORTED) {
    const ids = candidates[k].map((e) => e.id)
    if (ids.length) {
      const found = await payload.find({ collection: k, where: { 'import.wpId': { in: ids } }, limit: ids.length + 5, depth: 0, pagination: false, overrideAccess: true, ...draftFlag(k) } as never)
      for (const d of found.docs as unknown as WpDoc[]) if (d.import?.wpId != null) docs[k].set(Number(d.import.wpId), { reviewStatus: d.import.reviewStatus })
    }
    const part = partitionByReview(candidates[k], docs[k])
    importable[k] = part.importable
    for (const s of part.skippedOk) skippedOk.push({ kind: k, id: s.id, path: s.path })

    // deleted on live: never deleted here; flagged for review so the URL does not disappear silently (rule 1)
    for (const del of report.deleted[k]) {
      const res = await payload.find({ collection: k, where: { 'import.wpId': { equals: del.id } }, limit: 1, depth: 0, overrideAccess: true, ...draftFlag(k) } as never)
      const doc = res.docs[0] as unknown as WpDoc | undefined
      if (!doc) { deletedMarked.push({ kind: k, id: del.id, path: del.path, outcome: 'no-doc-in-cms' }); continue }
      const reasons = [...new Set([...(((doc.import?.importReport?.reasons as string[] | undefined) ?? [])), 'deleted-on-live'])]
      await payload.update({
        collection: k, id: doc.id, draft: doc._status === 'draft', overrideAccess: true, context: { importing: true },
        data: { import: { ...doc.import, reviewStatus: 'check', importReport: { ...(doc.import?.importReport ?? {}), reasons, deletedOnLive: report.date } } },
      } as never)
      deletedMarked.push({ kind: k, id: del.id, path: del.path, outcome: 'reviewStatus=check' })
    }
  }
  await payload.destroy?.()

  const staff = new Set(loadPageRows().filter((r) => r.wp_type === 'page' && r.suggested_page_type === 'staff-profile').map((r) => Number(r.wp_id)))
  const plan = planSteps({ pages: importable.pages.map((e) => e.id), posts: importable.posts.map((e) => e.id), courses: importable.courses.map((e) => e.id) }, staff)

  // pages are code (DEC-61): new, changed and deleted WordPress pages other than staff profiles go to the developer, not to a step
  const codePages = new Set(plan.pages)
  const newIds = new Set(report.new.pages.map((e) => e.id))
  const pagesChangedOnLive = importable.pages.filter((e) => codePages.has(e.id)).map((e) => pageForReport(e, newIds.has(e.id) ? 'new' : 'changed'))
  const pagesDeletedOnLive = report.deleted.pages.filter((e) => !staff.has(e.id)).map((e) => pageForReport(e, 'deleted'))
  for (const e of report.deleted.pages.filter((p) => staff.has(p.id))) deletedMarked.push({ kind: 'pages', id: e.id, path: e.path, outcome: 'staff-profile-kept (rule 1)' })
  // posts the site does not import are route files too (IHNA, DEC-42): listed for the developer, never sent to wp-posts
  const postNewIds = new Set(report.new.posts.map((e) => e.id))
  const postsChangedOnLive = WP_POSTS_IMPORTED ? [] : candidates.posts.map((e) => pageForReport(e, postNewIds.has(e.id) ? 'new' : 'changed'))
  const postsDeletedOnLive = WP_POSTS_IMPORTED ? [] : report.deleted.posts.map((e) => pageForReport(e, 'deleted'))
  for (const p of [...pagesChangedOnLive, ...pagesDeletedOnLive, ...postsChangedOnLive, ...postsDeletedOnLive]) console.log(`[refresh] page ${p.change} on live, update the route file: ${p.path} (${p.routeFile})`)

  // uploads those items reference (the media step skips what the CMS already holds); courses are not scanned by the media step
  const byId = (k: WpKind) => new Map(data[k].map((i) => [i.id, i]))
  const staffPages = new Set(plan.staff)
  const htmls = [...importable.posts.map((e) => byId('posts').get(e.id)?.content ?? ''), ...importable.pages.filter((e) => staffPages.has(e.id)).map((e) => byId('pages').get(e.id)?.content ?? '')]
  const mediaPaths = [...new Set([...collectReferences(htmls).keys(), ...recoveredSet])]

  const steps: StepRun[] = []
  const run = (step: string, ids: (string | number)[]) => { const r = runStep(step, ids, args, date); if (r) steps.push(r) }
  run('media', mediaPaths)
  if (WP_POSTS_IMPORTED) run('wp-posts', plan.wpPosts)
  run('wp-courses', plan.wpCourses)
  run('staff', plan.staff)

  // uploads still missing after this run (new 404s join the list for the next refresh)
  const mediaStep = steps.find((s) => s.step === 'media')
  const still = [...(uploadRec?.stillMissing.map((m) => m.path) ?? []), ...(mediaStep?.failed ?? []).filter((f) => /HTTP 404/.test(f.reason)).map((f) => String(f.id))]
  if (!args.noRecover) saveMissingUploads(still)

  report.import = {
    reimportedIds: { staffPages: plan.staff, posts: WP_POSTS_IMPORTED ? plan.wpPosts : [], courses: plan.wpCourses },
    pagesChangedOnLive,
    pagesDeletedOnLive,
    ...(WP_POSTS_IMPORTED ? {} : { postsChangedOnLive, postsDeletedOnLive }),
    steps,
    skippedReviewOk: skippedOk,
    conflictsEditedInAdmin: steps.flatMap((s) => s.reviewQueue.filter((q) => q.reasons.includes('edited-in-admin')).map((q) => ({ step: s.step, id: q.id, path: q.path }))),
    deletedOnLive: deletedMarked,
    mediaRequested: mediaPaths.length,
  }
  report.recovery = { ...(report.recovery ?? {}), uploads: uploadRec ? { probed: uploadRec.probed.length, recovered: uploadRec.recovered, stillMissing: uploadRec.stillMissing } : 'skipped (--no-recover)' }
  writeAtomic(file, JSON.stringify(report, null, 2))
}

async function recoverPhase(report: Report, args: Args) {
  if (args.noRecover) return
  const rec = await recoverStatic(staticTargets(), liveGet)
  report.recovery = { ...(report.recovery ?? {}), static: rec }
  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(outPath('recovered.json'), JSON.stringify({ at: new Date().toISOString(), source: LEGACY_BASE_URL, ...rec }, null, 2))
  console.log(`[refresh] static files: recovered ${rec.recovered.length}, still missing ${rec.stillMissing.length}`)
  for (const m of rec.stillMissing) console.log(`  missing ${m.path}: ${m.reason}`)
}

async function revalidate(): Promise<Record<string, unknown>> {
  const secret = process.env.REVALIDATE_SECRET
  const base = (process.env.NEXT_PUBLIC_SITE_URL || DEV_SITE_URL).replace(/\/$/, '')
  if (!secret) return { ok: false, reason: 'REVALIDATE_SECRET not set' }
  try {
    const res = await fetch(`${base}/api/revalidate/`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret }, body: JSON.stringify({ all: true }), signal: AbortSignal.timeout(15_000),
    })
    console.log(`[refresh] cache cleared: ${res.status}`)
    return { ok: res.ok, status: res.status, url: `${base}/api/revalidate/` }
  } catch (e) {
    console.warn(`[refresh] cache not cleared (${e instanceof Error ? e.message : e}); is the dev server up?`)
    return { ok: false, reason: e instanceof Error ? e.message : String(e), url: `${base}/api/revalidate/` }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().then((code) => process.stdout.write('', () => process.exit(code)), (e) => { console.error(e); process.exit(1) })
}
