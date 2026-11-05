// The request-level logic of every payment endpoint other than `start` (45 §6). Routes in src/app/** only adapt Request/Response.
import type { Payload } from 'payload'
import { paymentSite } from '@/content/payments'
import { clientIp } from '@/lib/enquiries/request'
import { rateLimit } from '@/lib/enquiries/rateLimit'
import { envValue, gatewayMode, isDryRun, isProduction } from './config'
import { getGateway } from './gateways'
import { fakeGateway, type FakeDecision } from './gateways/fake'
import { mapAirwallexEvent, verifyAirwallexWebhook, type AirwallexEvent } from './gateways/airwallex'
import { verifyPaywayNotification, verifyPaywayReturn } from './gateways/payway'
import { chargeToken } from './gateways/securepay'
import { chargeSchema, fieldErrors } from './schema'
import { derivePaymentId, isUuid, safeEqual, signAmount } from './sign'
import { createPayment, findPayment, findPaymentByGatewayRef, patchPayment } from './store'
import { settle, type SettleDeps } from './settle'
import { GatewayError, SignatureError, type PaymentRow } from './types'

export type JsonResponse = { status: number; body: Record<string, unknown>; headers?: Record<string, string> }
const json = (status: number, body: Record<string, unknown>, headers?: Record<string, string>): JsonResponse => ({ status, body, headers })
export const resultPath = (paymentId: string) => `/pay/result/${paymentId}/`

// ---- PayWay return: GET /pay/return/payway/ -----------------------------------------------------------------------------

export type ReturnResponse = { redirect: string } | { status: number; message: string }

/**
 * Decrypt + verify the signed parameters, compare the returned amount with the stored row, settle once (a replay changes nothing).
 * Bad signature: 400 and nothing is trusted. Payments the portals started themselves (their own ids, no row of ours) are stored
 * as `portalReturn` and only forwarded to the portal callback (45 §6 afterPaid step 2).
 */
export async function handlePaywayReturn(payload: Payload, query: Record<string, string | undefined>, deps: SettleDeps = {}): Promise<ReturnResponse> {
  let v
  try {
    v = verifyPaywayReturn(query)
  } catch (e) {
    if (e instanceof SignatureError) return { status: 400, message: 'The payment response could not be verified.' }
    throw e
  }
  if (v.outcome === 'pending') return { status: 400, message: 'Unexpected payment response.' }

  let paymentId = v.paymentId
  if (isUuid(paymentId)) {
    if (!(await findPayment(payload, paymentId))) return { status: 400, message: 'Unknown payment.' }
  } else {
    // Portal-originated payment: PaymentID is the portal's own row id.
    const amount = v.amountCents
    if (!paymentId || amount === null || amount <= 0) return { status: 400, message: 'Unexpected payment response.' }
    paymentId = derivePaymentId(`portal-return:${paymentId}`)
    if (!(await findPayment(payload, paymentId))) {
      try {
        await createPayment(payload, {
          paymentId, kind: 'portalReturn', gateway: 'payway', amountCents: amount, baseCents: amount, surchargeCents: 0,
          payerName: v.params?.StudentName ?? v.params?.Name ?? '', payerEmail: v.params?.StudentEmail ?? v.params?.Email ?? '',
          paymentFor: v.params?.PaymentPurpose ?? 'Portal payment', invoiceNo: v.params?.payment_reference ?? null,
          flags: { amountSig: signAmount({ paymentId, amountCents: amount, currency: 'AUD', kind: 'portalReturn' }), portalOnly: true, payway: { type: v.params?.type, provider: Number(v.params?.provider) || undefined, autoenrol: paymentSite.autoEnrolTypes.includes(v.params?.type ?? ''), params: v.params } },
        })
        const row = await findPayment(payload, paymentId)
        if (row) await patchPayment(payload, row, { portalPaymentId: v.params?.PaymentID ?? '' })
      } catch { /* a concurrent replay created it first */ }
    }
  }

  await settle(payload, { paymentId, outcome: v.outcome, amountCents: v.amountCents, ref: v.ref, eventId: v.eventId, source: 'return', facts: v.facts, params: v.params }, deps)
  const skilldemy = v.params?.type === 'skilldemy' ? skilldemyReturnUrl(v.params?.payment_status) : null
  return { redirect: skilldemy ?? resultPath(paymentId) }
}

/**
 * Skilldemy-started PayWay payments send the browser back to Skilldemy with the PayWay status (template-payway-response.php:1182-1183).
 * Only when the site handles Skilldemy and SKILLDEMY_RETURN_URL is an https URL; else the payer sees our result page.
 */
export function skilldemyReturnUrl(status: string | undefined, env: Record<string, string | undefined> = process.env): string | null {
  const base = envValue('SKILLDEMY_RETURN_URL', env)
  if (!paymentSite.skilldemy || !base || !/^https:\/\/[^\s]+$/.test(base)) return null
  const u = new URL(base)
  u.searchParams.set('status', /^[a-z_]{1,20}$/i.test(status ?? '') ? String(status) : 'unknown')
  return u.toString()
}

// ---- SecurePay: POST /api/payments/securepay/charge/ and GET /pay/return/securepay/ -------------------------------------

/** Charges the tokenised card for the STORED amount. The request carries a payment uuid and a card token, never an amount. */
export async function handleSecurepayCharge(args: { payload: Payload; rawBody: string; headers: Headers }, deps: SettleDeps = {}): Promise<JsonResponse> {
  const { payload, headers } = args
  if (Buffer.byteLength(args.rawBody) > 4096) return json(413, { ok: false, error: 'too_large' })
  let body: unknown
  try { body = JSON.parse(args.rawBody) } catch { return json(400, { ok: false, error: 'validation' }) }
  const parsed = chargeSchema.safeParse(body)
  if (!parsed.success) return json(400, { ok: false, error: 'validation', fieldErrors: fieldErrors(parsed.error) })
  const ip = clientIp(headers)
  const rate = await rateLimit(payload, ip, 'payments-charge', { limit: 10 })
  if (!rate.allowed) return json(429, { ok: false, error: 'rate_limited' }, { 'Retry-After': String(rate.retryAfterSeconds) })

  // fake mode has no SecurePay session: the FakeGateway page settles payments, and this endpoint must never reach a gateway host.
  if (gatewayMode() === 'fake') return json(404, { ok: false, error: 'unknown_payment' })
  // A DRY_RUN charge is simulated and "succeeds": it must never be reachable in production (DRY_RUN=1 there means no payment can be taken).
  if (isDryRun() && isProduction()) return json(503, { ok: false, error: 'gateway_unavailable' })
  const row = await findPayment(payload, parsed.data.paymentId)
  if (!row || row.gateway !== 'securepay') return json(404, { ok: false, error: 'unknown_payment' })
  if (row.status !== 'pending') return json(200, { ok: true, status: row.status, redirectUrl: resultPath(row.paymentId) })

  await patchPayment(payload, row, { flags: { ...row.flags, chargeAttempted: true } })
  try {
    const charge = await chargeToken(row, parsed.data.token, ip)
    if (charge.outcome === 'unknown') {
      // SecurePay could not determine the result (Payment Object status `unknown`). Not a decline: the row stays pending with chargeAttempted,
      // and reconcilePending flags it needs-manual-check (SecurePay has no status query). The customer is told the result is being confirmed.
      await patchPayment(payload, row, { flags: { ...row.flags, chargeAttempted: true, gateway: { ...row.flags.gateway, ...charge.facts } } })
      return json(200, { ok: true, status: 'pending', redirectUrl: resultPath(row.paymentId) })
    }
    const paid = charge.outcome === 'paid'
    const res = await settle(payload, {
      paymentId: row.paymentId, outcome: paid ? 'paid' : 'failed', amountCents: paid ? (charge.amountCents ?? (charge.dryRun ? row.amountCents : null)) : null,
      ref: charge.facts.orderId ?? null, source: 'charge', facts: charge.facts,
    }, deps)
    return json(200, { ok: true, status: res.status, redirectUrl: resultPath(row.paymentId) })
  } catch (e) {
    const retryable = e instanceof GatewayError ? e.retryable : true
    console.error(`[payments] securepay charge error for ${row.paymentId}: ${e instanceof Error ? e.message : 'error'}`)
    // The Idempotency-Key is the payment uuid, so the customer can safely try again; reconcilePending flags a charged-but-unsettled row.
    return json(502, { ok: false, error: 'gateway_unavailable', retryable })
  }
}

// ---- PayWay server-to-server notification: POST /api/payments/webhook/payway/ -------------------------------------------------------------

/**
 * The reliable PayWay signal (the browser return is "far less reliable", hand-off guide). Credentials checked first (401, nothing trusted), then
 * settled once per receipt number. "must return an HTTP status of 200 ... only ... if you have successfully processed the response and saved the
 * payment", otherwise PayWay retries (three times, then emails): a storage error therefore throws (500) instead of answering 200.
 * Payments started by the portals (no uuid of ours) are answered 200 and left to the browser return, which forwards them as today.
 */
export async function handlePaywayNotification(payload: Payload, args: { rawBody: string; authorization: string | null; contentType: string | null }, deps: SettleDeps = {}): Promise<JsonResponse> {
  if (Buffer.byteLength(args.rawBody) > 32_768) return json(413, { ok: false, error: 'too_large' })
  let n
  try {
    n = verifyPaywayNotification(args)
  } catch (e) {
    if (e instanceof SignatureError) return json(401, { ok: false, error: 'invalid_credentials' })
    throw e
  }
  if (!isUuid(n.paymentId)) return json(200, { ok: true, ignored: 'not a payment started here' })
  const row = await findPayment(payload, n.paymentId)
  if (!row || row.gateway !== 'payway') return json(200, { ok: true, ignored: 'unknown payment' })
  const res = await settle(payload, { paymentId: row.paymentId, outcome: n.outcome, amountCents: n.amountCents, ref: n.ref, eventId: n.eventId, source: 'webhook', facts: n.facts, params: n.params, note: 'payway notification' }, deps)
  return json(200, { ok: true, result: res.result, status: res.status })
}

// ---- Airwallex webhook: POST /api/payments/webhook/airwallex/ -----------------------------------------------------------

/** Raw body in, HMAC + timestamp verified, idempotent on the event id. Unknown payments still answer 200 so Airwallex stops retrying. */
export async function handleAirwallexWebhook(payload: Payload, args: { rawBody: string; timestamp: string | null; signature: string | null; nowMs?: number }, deps: SettleDeps = {}): Promise<JsonResponse> {
  try {
    verifyAirwallexWebhook({ secret: envValue('AIRWALLEX_WEBHOOK_SECRET'), timestamp: args.timestamp, signature: args.signature, rawBody: args.rawBody, nowMs: args.nowMs })
  } catch (e) {
    if (e instanceof SignatureError) return json(401, { ok: false, error: 'invalid_signature' })
    throw e
  }
  let event: AirwallexEvent
  try { event = JSON.parse(args.rawBody) as AirwallexEvent } catch { return json(400, { ok: false, error: 'invalid_json' }) }
  const mapped = mapAirwallexEvent(event)
  if (mapped.kind === 'ignore') return json(200, { ok: true, ignored: mapped.reason })

  let row: PaymentRow | null = null
  if (mapped.paymentId && isUuid(mapped.paymentId)) row = await findPayment(payload, mapped.paymentId)
  if (!row && mapped.intentId) row = await findPaymentByGatewayRef(payload, mapped.intentId)
  if (!row) return json(200, { ok: true, ignored: 'unknown payment' })

  const res = await settle(payload, {
    paymentId: row.paymentId, outcome: mapped.outcome, amountCents: mapped.amountCents, ref: mapped.intentId, eventId: mapped.eventId,
    source: 'webhook', facts: { intentId: mapped.intentId ?? undefined },
    note: mapped.outcome === 'refunded' && mapped.amountCents != null ? `${event.name} (${mapped.amountCents} cents refunded)` : event.name,
  }, deps)
  return json(200, { ok: true, result: res.result, status: res.status })
}

// ---- fake gateway: POST /api/payments/fake/[uuid]/ (dev and tests only) --------------------------------------------------

export const fakeEnabled = (): boolean => !isProduction() && (gatewayMode() === 'fake' || isDryRun())

export async function handleFakeDecision(payload: Payload, paymentId: string, decision: FakeDecision, opts: { amountCents?: number } = {}, deps: SettleDeps = {}): Promise<JsonResponse> {
  if (!fakeEnabled() || !isUuid(paymentId)) return json(404, { ok: false, error: 'not_found' })
  const row = await findPayment(payload, paymentId)
  if (!row) return json(404, { ok: false, error: 'not_found' })
  const d = fakeGateway.decide(paymentId, decision, { amountCents: opts.amountCents, fallbackAmountCents: row.amountCents })
  if (decision === 'abandon') return json(200, { ok: true, status: row.status })
  const res = await settle(payload, {
    paymentId, outcome: decision === 'approve' ? 'paid' : 'failed', amountCents: decision === 'approve' ? d.amountCents : null,
    ref: `fake_${paymentId.slice(0, 8)}`, source: 'fake', eventId: null, facts: { responseCode: decision === 'approve' ? '00' : '05', paymentStatus: decision },
  }, deps)
  return json(200, { ok: true, result: res.result, status: res.status })
}

// ---- results and receipts -----------------------------------------------------------------------------------------------

export type PublicResult = { paymentId: string; status: PaymentRow['status']; kind: PaymentRow['kind']; amountCents: number; gateway: string; paymentFor: string | null; createdAt: string }

/**
 * The GA4 `purchase` for a paid result (80 §4, `PurchaseEvent`): server values only. The item is the payment kind; a product also carries its
 * name, which the server set. An invoice's typed "payment for" text never leaves (it may hold personal details).
 */
export function purchaseEventFor(r: PublicResult): { transactionId: string; value: number; paymentType: string; items: { itemId: string; itemName: string; price: number }[] } | null {
  if (r.status !== 'paid') return null
  const value = r.amountCents / 100
  return { transactionId: r.paymentId, value, paymentType: r.gateway, items: [{ itemId: r.kind, itemName: r.kind === 'product' && r.paymentFor ? r.paymentFor : r.kind, price: value }] }
}

/** What the result page may show: no email, no name. A pending payment gets ONE status query (45 §4 Returns). */
export async function loadResult(payload: Payload, paymentId: string, deps: SettleDeps = {}): Promise<PublicResult | null> {
  if (!isUuid(paymentId)) return null
  let row = await findPayment(payload, paymentId)
  if (!row) return null
  if (row.status === 'pending' && row.gateway && Date.now() - Date.parse(row.createdAt) > 20_000) {
    try {
      const gw = getGateway(row.gateway as 'payway' | 'securepay' | 'airwallex')
      const ans = await gw.queryStatus(row)
      if (ans.state === 'paid' || ans.state === 'failed') {
        await settle(payload, { paymentId, outcome: ans.state === 'paid' ? 'paid' : 'failed', amountCents: ans.amountCents ?? null, ref: ans.ref ?? null, source: 'return', facts: ans.facts, note: 'status query' }, deps)
        row = (await findPayment(payload, paymentId)) ?? row
      }
    } catch { /* leave it pending; reconcilePending covers it */ }
  }
  return { paymentId: row.paymentId, status: row.status, kind: row.kind, amountCents: row.amountCents, gateway: String(row.gateway), paymentFor: row.paymentFor ?? null, createdAt: row.createdAt }
}

export type Receipt = { paymentId: string; status: PaymentRow['status']; amountCents: number; currency: string; paymentFor: string | null; invoiceNo: string | null; payerName: string | null; gateway: string; paidAt: string | null; kind: PaymentRow['kind'] }

/** Only when the email matches the stored payer email. Anything else is null, so the page answers the same 404 for "no such payment" and "wrong email". */
export async function loadReceipt(payload: Payload, paymentId: string, email: string | undefined): Promise<Receipt | null> {
  if (!isUuid(paymentId) || !email) return null
  const row = await findPayment(payload, paymentId)
  const stored = row?.payerEmail?.trim().toLowerCase()
  const given = email.trim().toLowerCase()
  const ok = Boolean(row && stored) && safeEqual(stored ?? '', given) // compare even when the row is missing, to keep timing flat
  if (!ok || !row) return null
  return {
    paymentId: row.paymentId, status: row.status, amountCents: row.amountCents, currency: row.currency, paymentFor: row.paymentFor ?? null, invoiceNo: row.invoiceNo ?? null,
    payerName: row.payerName ?? null, gateway: String(row.gateway), paidAt: row.settledAt ?? null, kind: row.kind,
  }
}

export const RECEIPT_RATE = 10 // per minute per IP (45 §4)
export const receiptAllowed = async (payload: Payload, ip: string): Promise<boolean> => (await rateLimit(payload, ip, 'payments-receipt', { limit: RECEIPT_RATE })).allowed

