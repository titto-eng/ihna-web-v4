import type { Payload } from 'payload'
import type { TaskConfig } from 'payload'
import { runAdapter, deliveryKey, destinationForRow, type AdapterInput, type DeliveryResult, type EnquiryRecord } from '@/lib/adapters'
import { sendInternalMail } from '@/lib/adapters/email'
import { site } from '@/content/site'
import { notifyFallback } from '@/lib/enquiries/config'
import { campaignAttribution, resolveSourceId } from '@/lib/enquiries/campaign'
import { findCampus, findCourse, findLandingByPageUrl, loadFormDefinition, loadRouting } from '@/lib/enquiries/lookups'
import { MAX_DELIVERY_ATTEMPTS, type DeliveryRow } from '@/lib/enquiries/types'

type EnquiryDoc = Record<string, unknown> & {
  id: number | string
  status?: string
  formKey: string
  deliveries?: DeliveryRow[] | null
  course?: number | { id: number } | null
  campus?: number | { id: number } | null
}

export type DeliveryRunResult = {
  status: string
  /** Rows still `failed` after this run: the job must throw so Payload retries it with backoff. */
  retryNeeded: boolean
  newlyDead: DeliveryRow[]
  attempted: number
}

export type RunDeps = { run?: (input: AdapterInput) => Promise<DeliveryResult>; env?: Record<string, string | undefined>; now?: () => Date }

const idOf = (v: number | { id: number } | null | undefined): number | null => (typeof v === 'object' && v ? v.id : (v as number | null | undefined) ?? null)

/** Enquiry status derived from its deliveries (40 §2). `held` and `spam` are set at insert and left alone here. */
export function deriveStatus(deliveries: Pick<DeliveryRow, 'status'>[], current?: string): string {
  if (current === 'spam' || current === 'held') return current
  if (!deliveries.length) return 'delivered'
  const s = deliveries.map((d) => d.status ?? 'pending')
  if (s.some((x) => x === 'pending' || x === 'failed')) return 'delivering'
  if (s.some((x) => x === 'held')) return 'held'
  const dead = s.filter((x) => x === 'dead').length
  if (dead === 0) return 'delivered'
  return dead === s.length ? 'dead' : 'partial'
}

/**
 * The job body (40 §6). Sends only `pending` and `failed` deliveries; a `sent`/`dry_run` row is never touched again.
 * Every row is persisted right after its attempt, so a crash loses nothing. A failure that is not retryable, or the 5th
 * failure of a row, makes it `dead`; dead rows alert the tech role (no personal data in the mail).
 */
export async function runDelivery(payload: Payload, enquiryId: number | string, deps: RunDeps = {}): Promise<DeliveryRunResult> {
  const doc = (await payload.findByID({ collection: 'enquiries', id: enquiryId, depth: 0, overrideAccess: true })) as unknown as EnquiryDoc
  const rows: DeliveryRow[] = (doc.deliveries ?? []).map((r) => ({ ...r }))
  const result: DeliveryRunResult = { status: doc.status ?? 'received', retryNeeded: false, newlyDead: [], attempted: 0 }
  if (doc.status === 'spam' || doc.status === 'held') return result

  const def = await loadFormDefinition(payload, doc.formKey, { includeInactive: true })
  const routing = await loadRouting(payload)
  const [course, campus] = await Promise.all([findCourse(payload, idOf(doc.course)), findCampus(payload, idOf(doc.campus))])
  // Landing row and campaign table rows (41): derived again from the stored pageUrl and campaignCode, never from the visitor.
  const landing = await findLandingByPageUrl(payload, typeof doc.pageUrl === 'string' ? doc.pageUrl : null, doc.formKey)
  const campaign = def ? campaignAttribution(typeof doc.campaignCode === 'string' ? doc.campaignCode : null, def, landing) : null

  const persist = async () => {
    const status = deriveStatus(rows, doc.status)
    result.status = status
    await payload.update({ collection: 'enquiries', id: doc.id, data: { deliveries: rows as never, status: status as never }, overrideAccess: true })
  }

  const enquiry = toRecord(doc)
  const run = deps.run ?? runAdapter
  const now = deps.now ?? (() => new Date())

  for (const row of rows) {
    if (row.status !== 'pending' && row.status !== 'failed') continue
    if (!def) {
      markDead(row, 'form definition no longer exists', now())
      result.newlyDead.push(row)
      continue
    }
    const destination = destinationForRow(def, row)
    if (!destination) {
      markDead(row, `no destination for ${deliveryKey(row)} on form ${def.key}`, now())
      result.newlyDead.push(row)
      continue
    }
    const attempts = (row.attempts ?? 0) + 1
    result.attempted++
    const outcome = await run({
      payload, enquiry, form: def, destination, target: row.target ?? '', course, campus, routing,
      sourceId: resolveSourceId(destination.config, routing, campaign), landing, campaign, existing: row, env: deps.env,
    })
    row.attempts = attempts
    row.at = now().toISOString()
    if (outcome.responseCode !== undefined) row.responseCode = outcome.responseCode
    if (outcome.externalId) row.externalId = outcome.externalId
    if (outcome.hsSourceFallback !== undefined) row.hsSourceFallback = outcome.hsSourceFallback

    if (outcome.status === 'sent' || outcome.status === 'dry_run') {
      row.status = outcome.status
      row.lastError = outcome.status === 'dry_run' ? (outcome.note ?? null)?.slice(0, 500) ?? null : null // why it only recorded
      if (outcome.dryRunRequest !== undefined) row.dryRunRequest = outcome.dryRunRequest
    } else {
      row.lastError = (outcome.lastError ?? 'delivery failed').slice(0, 500)
      if (outcome.dryRunRequest !== undefined) row.dryRunRequest = outcome.dryRunRequest
      row.status = outcome.status === 'dead' || attempts >= MAX_DELIVERY_ATTEMPTS ? 'dead' : 'failed'
      if (row.status === 'dead') result.newlyDead.push(row)
    }
    await persist()
  }
  await persist() // also covers rows that were dead-marked without an attempt

  result.retryNeeded = rows.some((r) => r.status === 'failed')
  if (result.newlyDead.length) await alertDead(payload, doc, result.newlyDead, routing.alertTo, deps.env)
  return result
}

function markDead(row: DeliveryRow, reason: string, at: Date) {
  row.status = 'dead'
  row.lastError = reason.slice(0, 500)
  row.at = at.toISOString()
}

function toRecord(doc: EnquiryDoc): EnquiryRecord {
  return { ...(doc as unknown as EnquiryRecord), data: (doc.data as Record<string, unknown> | null | undefined) ?? {} }
}

/** Mail to the tech role (`enquiryRouting.alertTo` in src/content/enquiry-routing.ts, else ENQUIRY_NOTIFY_TO). Reference, form and adapter only: no PII. */
async function alertDead(payload: Payload, doc: EnquiryDoc, dead: DeliveryRow[], alertTo: string[], env?: Record<string, string | undefined>) {
  const to = alertTo.length ? alertTo : notifyFallback(env ?? process.env)
  const ref = String(doc.publicId ?? doc.id)
  const lines = dead.map((d) => `- ${d.adapter} / ${d.target ?? '-'}: ${d.lastError ?? 'failed'} (attempts: ${d.attempts ?? 0})`)
  const base = (env ?? process.env).NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? ''
  try {
    const outcome = await sendInternalMail(payload, {
      to,
      subject: `[${site.shortName} enquiries] ${dead.length} dead delivery(ies): ${doc.formKey} ${ref}`,
      text: `Enquiry ${ref} (form ${doc.formKey}) has deliveries that will not be retried:\n\n${lines.join('\n')}\n\nThe enquiry itself is saved. Open ${base}/admin/collections/enquiries/${doc.id} and use "Retry dead" after fixing the cause.`,
    }, env)
    if (outcome === 'skipped') console.warn(`[deliverEnquiry] dead delivery on ${ref}; alert not sent (${to.length ? 'DRY_RUN with a non-SMTP transport' : 'no alertTo configured'})`)
  } catch (e) {
    console.error(`[deliverEnquiry] dead delivery on ${ref}; alert failed`, e instanceof Error ? e.message : e)
  }
}

export const deliverEnquiryTask = {
  slug: 'deliverEnquiry',
  inputSchema: [{ name: 'enquiryId', type: 'number', required: true }],
  outputSchema: [{ name: 'status', type: 'text', required: true }],
  retries: { attempts: 5, backoff: { type: 'exponential', delay: 60_000 } },
  handler: async ({ input, req }) => {
    const result = await runDelivery(req.payload, input.enquiryId)
    // Throwing makes Payload re-queue the job with the backoff above; rows already `sent` are skipped next time.
    if (result.retryNeeded) throw new Error(`deliverEnquiry ${input.enquiryId}: retry needed (status ${result.status})`)
    return { output: { status: result.status } }
  },
} as TaskConfig<'deliverEnquiry'>
