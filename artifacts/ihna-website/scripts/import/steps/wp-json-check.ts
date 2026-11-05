import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { LEGACY_BASE_URL, LEGACY_ROOT } from '../lib/config'
import { type ImportContext } from '../lib/context'

// `wp-json-check`: what does the live WordPress expose under /wp-json/ that an outside system could be calling? (DEC-58)
// GET only, no credentials. Lists the REST namespaces and routes, flags everything that is not WordPress core, probes the one
// custom route the old theme mentions (`/wp-json/stripe/v1/subscriptions`, GET so nothing is created), and counts
// `register_rest_route` calls in the old repo. The proxy keeps answering 410 for /wp-json/*; any non-core route found here needs an
// equivalent route here (or an external config change).
export const name = 'wp-json-check'
export const order = 200

const CORE_NAMESPACES = new Set(['wp/v2', 'wp-site-health/v1', 'wp-block-editor/v1', 'oembed/1.0', 'wp-abilities/v1'])
const CORE_ROOT_ROUTES = new Set(['/', '/batch/v1'])
const KNOWN_PROBES = ['/wp-json/stripe/v1/subscriptions', '/?rest_route=/stripe/v1/subscriptions']

type Index = { namespaces?: string[]; routes?: Record<string, { namespace?: string; endpoints?: { methods?: string[] }[] }> }

export function nonCoreRoutes(index: Index): { route: string; namespace: string; methods: string[] }[] {
  return Object.entries(index.routes ?? {})
    .filter(([route, v]) => !CORE_ROOT_ROUTES.has(route) && !CORE_NAMESPACES.has(v.namespace ?? ''))
    .map(([route, v]) => ({ route, namespace: v.namespace ?? '', methods: [...new Set((v.endpoints ?? []).flatMap((e) => e.methods ?? []))] }))
}

function scanRepo(root: string, hits: { file: string; line: number; text: string }[] = []) {
  for (const entry of readdirSync(root)) {
    if (entry === 'node_modules' || entry === '.git') continue
    const p = join(root, entry)
    const st = statSync(p)
    if (st.isDirectory()) scanRepo(p, hits)
    else if (/\.php$/.test(entry) && st.size < 2_000_000) {
      readFileSync(p, 'utf8').split('\n').forEach((text, i) => {
        if (/^\s*(?!\/\/)(?!\*).*register_rest_route\s*\(/.test(text)) hits.push({ file: p.slice(root.length), line: i + 1, text: text.trim().slice(0, 140) })
      })
    }
  }
  return hits
}

const get = (path: string) => fetch(`${LEGACY_BASE_URL}${path}`, { headers: { 'user-agent': 'ihm-web-import/1.0', accept: 'application/json' }, signal: AbortSignal.timeout(30_000) })

export async function run(ctx: ImportContext) {
  const { report } = ctx
  const res = await get('/wp-json/')
  if (!res.ok) throw new Error(`/wp-json/ answered ${res.status}`)
  const index = (await res.json()) as Index
  const namespaces = index.namespaces ?? []
  const custom = nonCoreRoutes(index)
  const customNamespaces = namespaces.filter((n) => !CORE_NAMESPACES.has(n))
  const probes: Record<string, number> = {}
  for (const p of KNOWN_PROBES) probes[p] = (await get(p)).status
  const oldRepo = LEGACY_ROOT
  let registeredInOldRepo: { file: string; line: number; text: string }[] = []
  try {
    registeredInOldRepo = scanRepo(oldRepo)
  } catch {
    report.oldRepo = 'not readable'
  }
  for (const n of customNamespaces) report.reviewQueue.push({ id: n, reasons: ['custom REST namespace on the live site: needs a compatible route or an external config change'] })
  for (const r of custom) report.reviewQueue.push({ id: r.route, reasons: [`non-core route ${r.methods.join(',')}`] })
  ctx.log(`namespaces: ${namespaces.join(', ')}; custom namespaces: ${customNamespaces.length}; custom routes: ${custom.length}; register_rest_route in old repo: ${registeredInOldRepo.length}`)
  return { namespaces, customNamespaces, customRoutes: custom, probes, registeredInOldRepo, routeCount: Object.keys(index.routes ?? {}).length }
}
