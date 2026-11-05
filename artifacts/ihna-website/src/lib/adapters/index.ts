import { admissionsApiAdapter } from './admissionsApi'
import { AUTORESPONDER_TARGET, emailAdapter, mailpitOnly } from './email'
import { dynamicsAdapter } from './dynamics'
import { hubspotAdapter } from './hubspot'
import { ihnaOnlineAdapter } from './ihnaOnline'
import { portalCrmAdapter } from './portalCrm'
import { portalStakeholderAdapter } from './portalStakeholder'
import { maskPlanned } from './util'
import { AdapterConfigError, type Adapter, type AdapterInput, type DeliveryResult, type Planned } from './types'
import { adapterMode } from './live'
import { autoresponderVariant, matchesWhen, type WhenCtx } from '@/lib/enquiries/conditions'
import type { AdapterName, DeliveryRow, DestinationDef, FormDef } from '@/lib/enquiries/types'

export { AUTORESPONDER_TARGET } from './email'
export { adapterMode, missingEnv, requiredEnv } from './live'
export type { Adapter, AdapterInput, DeliveryResult, EnquiryRecord, Planned } from './types'

// The shared adapters folder (SHARED-FILES.md). `dynamics` is registered but only enabled by DYNAMICS_ENABLED=1 (DEC-12).
export const adapters: Record<AdapterName, Adapter> = {
  email: emailAdapter,
  hubspot: hubspotAdapter,
  portalCrm: portalCrmAdapter,
  portalStakeholder: portalStakeholderAdapter,
  admissionsApi: admissionsApiAdapter,
  dynamics: dynamicsAdapter,
  ihnaOnline: ihnaOnlineAdapter,
}

export const deliveryKey = (d: Pick<DeliveryRow, 'adapter' | 'target'>): string => `${d.adapter}:${d.target ?? ''}`

/**
 * The `deliveries[]` rows written with the enquiry (status `pending`, or `held` when the captcha held it). One row per adapter
 * target: an `email` destination per recipient group, `portalStakeholder` per portal, plus the autoresponder.
 * Disabled adapters (`dynamics` without DYNAMICS_ENABLED) get no row. A destination with `when` is planned only when its condition
 * holds for `ctx` (course facts and field values at insert; no ctx = not planned). The autoresponder is skipped for held rows and when
 * `autoresponder: false` (the captcha did not verify on a site that fails closed, `autoresponderAllowed`; 40 §6).
 */
export function planDeliveryRows(def: FormDef, opts: { held?: boolean; env?: Record<string, string | undefined>; ctx?: WhenCtx | null; autoresponder?: boolean } = {}): DeliveryRow[] {
  const rows: DeliveryRow[] = []
  const seen = new Set<string>()
  const status = opts.held ? 'held' : 'pending'
  const add = (adapter: string, target: string) => {
    const k = `${adapter}:${target}`
    if (seen.has(k)) return
    seen.add(k)
    rows.push({ adapter, target, status, attempts: 0 })
  }
  for (const d of def.destinations) {
    const a = adapters[d.adapter]
    if (!a || !a.enabled(opts.env)) continue
    if (d.when && !(opts.ctx && matchesWhen(d.when, opts.ctx))) continue
    for (const t of a.targets(d)) add(d.adapter, t)
  }
  if ((def.autoresponder?.enabled || autoresponderVariant(def, opts.ctx)) && !opts.held && opts.autoresponder !== false) add('email', AUTORESPONDER_TARGET)
  return rows
}

/** The destination a stored delivery row belongs to: same adapter and a target that destination expands to. */
export function destinationForRow(def: FormDef, row: Pick<DeliveryRow, 'adapter' | 'target'>): DestinationDef | null {
  if (row.adapter === 'email' && row.target === AUTORESPONDER_TARGET) return { adapter: 'email', config: null }
  const same = def.destinations.filter((d) => d.adapter === row.adapter)
  return same.find((d) => adapters[d.adapter]?.targets(d).includes(row.target ?? '')) ?? same[0] ?? null
}

/**
 * One delivery attempt. Plans the request, then either records it (adapter not live, see live.ts: nothing is sent; email may still
 * reach a local Mailpit, never Resend or a real SMTP host) or sends it. Never throws: configuration errors come back as `dead`, everything else as `failed` or `dead`
 * according to the adapter's own retryable flag. The caller owns attempt counting and the retry cap.
 */
export async function runAdapter(input: AdapterInput): Promise<DeliveryResult> {
  const adapter = adapters[input.destination.adapter]
  if (!adapter) return { status: 'dead', lastError: `unknown adapter ${input.destination.adapter}` }

  let planned: Planned
  try {
    planned = await adapter.plan(input)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'plan failed'
    return { status: e instanceof AdapterConfigError ? 'dead' : 'failed', lastError: msg.slice(0, 500) }
  }
  const hsSourceFallback = planned.hsSourceFallback

  const env = input.env ?? process.env
  const mode = adapterMode(input.destination.adapter, input.target, env)
  if (!mode.live) {
    const record: Record<string, unknown> = { ...(maskPlanned(planned) as Record<string, unknown>), reason: mode.reason }
    if (planned.transport === 'email' && mailpitOnly(env) && planned.message.to.length) {
      const r = await adapter.send(planned, input)
      record.mailpit = r.ok ? 'delivered to Mailpit' : `not delivered: ${r.error}`
    }
    return { status: 'dry_run', dryRunRequest: record, hsSourceFallback, note: mode.reason }
  }

  const res = await adapter.send(planned, input)
  // The live response (code + a short text excerpt, never a credential) is kept with the row for audit and for the CRM's lead reference.
  const liveResponse = { live: true, response: { code: res.responseCode ?? null, body: res.responseBody ?? null } }
  if (res.ok) return { status: 'sent', responseCode: res.responseCode, externalId: res.externalId, hsSourceFallback, dryRunRequest: liveResponse }
  return {
    status: res.retryable ? 'failed' : 'dead',
    responseCode: res.responseCode, externalId: res.externalId,
    lastError: res.error.slice(0, 500), hsSourceFallback, dryRunRequest: liveResponse,
  }
}
