// POST /api/payments/start/ (45 §6, plan §6). The pipeline lives here so tests can drive it without HTTP; the route only adapts Request/Response.
// Order of events: validate -> price on the SERVER -> Postgres row (pending) -> portal row (status 0) -> gateway session -> 202.
// Any failure before the gateway call means no gateway call (rule 2: the record exists first; rule 6: the browser never sets money).
import type { Payload, Where } from 'payload'
import { verifyCaptcha } from '@/lib/enquiries/captcha'
import { rateLimit } from '@/lib/enquiries/rateLimit'
import { clientIp } from '@/lib/enquiries/request'
import { insertPendingPayment } from '@/lib/portal/payments-write'
import { PortalUnavailable } from '@/lib/portal/client'
import { PaymentsConfigError, MIN_INVOICE_CENTS, maxInvoiceCents, surchargePercent, type GatewayName } from './config'
import { getGateway } from './gateways'
import { paywayProvider } from './gateways/payway'
import { parseAmountToCents, surchargeCents } from './money'
import { fieldErrors, startSchema, type StartRequest } from './schema'
import { derivePaymentId, signAmount } from './sign'
import { casStatus, createPayment, findPayment, patchPayment } from './store'
import type { Gateway, PaymentFlags, PaymentRow } from './types'

export type StartResponse = { status: number; body: Record<string, unknown>; headers?: Record<string, string> }

export type StartDeps = {
  gatewayFor?: (name: GatewayName) => Gateway
  insertPortal?: typeof insertPendingPayment
}

export const START_RATE_LIMIT = 5 // per minute per IP (45 §6)
export const MAX_START_BYTES = 8 * 1024

const fail = (status: number, error: string, extra: Record<string, unknown> = {}, headers?: Record<string, string>): StartResponse => ({ status, body: { ok: false, error, ...extra }, headers })

type Priced = { baseCents: number; paymentFor: string; invoiceNo: string; productId: number | null; e2payment: boolean }

async function priceRequest(payload: Payload, req: StartRequest, paymentId: string): Promise<Priced | StartResponse> {
  if (req.kind === 'invoice') {
    const cents = parseAmountToCents(req.amount)
    if (cents === null) return fail(400, 'validation', { fieldErrors: { amount: 'Enter an amount in dollars, for example 1250.00' } })
    if (cents < MIN_INVOICE_CENTS) return fail(400, 'validation', { fieldErrors: { amount: 'The amount is below the minimum payment.' } })
    if (cents > maxInvoiceCents()) return fail(400, 'validation', { fieldErrors: { amount: 'The amount is above the maximum for an online payment. Please contact us.' } })
    return { baseCents: cents, paymentFor: req.paymentFor, invoiceNo: req.invoiceNumber, productId: null, e2payment: false }
  }
  if (req.kind === 'product') {
    const where: Where =
      typeof req.productId === 'number' ? { id: { equals: req.productId } }
      : typeof req.productId === 'string' ? { sku: { equals: req.productId } }
      : { legacyE2Btn: { equals: req.e2btn as number } }
    const { docs } = await payload.find({ collection: 'products', where: { and: [where, { active: { equals: true } }] }, limit: 1, depth: 0, overrideAccess: true })
    const product = docs[0]
    if (!product) return fail(404, 'unknown_product')
    // The price is whatever `products` says right now. Nothing price-like is accepted from the request (the schema is strict).
    const allowed = (product.gateways ?? ['securepay', 'airwallex']) as string[]
    if (!allowed.includes(req.gateway)) return fail(400, 'gateway_not_allowed', { message: 'That payment method is not available for this product.' })
    return {
      baseCents: Math.round(product.priceCents), paymentFor: product.name,
      invoiceNo: `E2-${product.legacyE2Btn ?? product.sku}-${paymentId.slice(0, 8)}`, productId: product.id, e2payment: true,
    }
  }
  // sae: the amount is the course fee from `saeApplications` (45 §2). That collection is not built yet.
  return fail(501, 'sae_not_available', { message: 'Short-course payments are not available online yet.' })
}

export async function handleStart(args: { payload: Payload; rawBody: string; headers: Headers }, deps: StartDeps = {}): Promise<StartResponse> {
  const { payload, headers } = args
  if (Buffer.byteLength(args.rawBody) > MAX_START_BYTES) return fail(413, 'too_large')

  let json: unknown
  try { json = JSON.parse(args.rawBody) } catch { return fail(400, 'validation', { message: 'The request body is not valid JSON.' }) }
  const parsed = startSchema.safeParse(json)
  if (!parsed.success) return fail(400, 'validation', { fieldErrors: fieldErrors(parsed.error) })
  const req = parsed.data
  const ip = clientIp(headers)

  const rate = await rateLimit(payload, ip, 'payments-start', { limit: START_RATE_LIMIT })
  if (!rate.allowed) return fail(429, 'rate_limited', { message: 'Too many attempts. Please wait a minute and try again.' }, { 'Retry-After': String(rate.retryAfterSeconds) })

  const captcha = await verifyCaptcha({ required: true, token: req.captchaToken, ip })
  if (captcha.held) return fail(400, 'captcha', { message: 'We could not verify that you are not a robot. Please reload the page and try again.' })

  const paymentId = derivePaymentId(req.submissionId)
  const gatewayFor = deps.gatewayFor ?? getGateway
  let row: PaymentRow | null = await findPayment(payload, paymentId)

  if (!row) {
    const priced = await priceRequest(payload, req, paymentId)
    if ('status' in priced) return priced
    const pct = surchargePercent(req.gateway)
    const sur = surchargeCents(priced.baseCents, pct)
    const total = priced.baseCents + sur
    const flags: PaymentFlags = {
      amountSig: signAmount({ paymentId, amountCents: total, currency: 'AUD', kind: req.kind }),
      submissionId: req.submissionId,
      e2payment: priced.e2payment,
      ...(req.gateway === 'payway' ? { payway: { type: 'general', provider: paywayProvider() } } : {}),
    }
    try {
      row = await createPayment(payload, {
        paymentId, kind: req.kind, gateway: req.gateway, amountCents: total, baseCents: priced.baseCents, surchargeCents: sur,
        payerName: req.payerName, payerEmail: req.payerEmail, paymentFor: priced.paymentFor, invoiceNo: priced.invoiceNo,
        studentId: req.kind === 'sae' ? null : (req.studentId ?? null), productId: priced.productId, ip, flags,
      })
    } catch (e) {
      row = await findPayment(payload, paymentId) // a concurrent retry of the same submission created it first
      if (!row) {
        console.error('[payments] could not record the payment; no gateway call', e instanceof Error ? e.message : e)
        return fail(500, 'could_not_record', { message: 'We could not start your payment. Nothing has been charged. Please try again.' })
      }
    }
  }

  if (row.status !== 'pending') return fail(409, 'already_processed', { paymentId, status: row.status })

  // Portal row (status 0) before any gateway call. A failure here fails the whole start: the gateway is never called.
  if (!row.portalPaymentId) {
    try {
      const portalId = await (deps.insertPortal ?? insertPendingPayment)({
        studentName: row.payerName ?? '', studentId: row.studentId, invoiceNumber: row.invoiceNo ?? '', email: row.payerEmail ?? '',
        paymentFor: row.paymentFor ?? '', e2payment: row.flags.e2payment === true, amountCents: row.amountCents, gateway: String(row.gateway), ip: row.ip,
      })
      row = await patchPayment(payload, row, { portalPaymentId: portalId, history: { status: 'pending', note: 'portal row created' } })
    } catch (e) {
      const code = e instanceof PortalUnavailable ? e.code : 'error'
      console.error(`[payments] portal row not created (${code}); no gateway call`)
      await casStatus(payload, row.paymentId, ['pending'], 'failed')
      await patchPayment(payload, row, { history: { status: 'failed', note: `portal insert failed: ${code}` } }).catch(() => {})
      return fail(500, 'could_not_record', { message: 'We could not start your payment. Nothing has been charged. Please try again.' })
    }
  }

  try {
    const gateway = gatewayFor(row.gateway as GatewayName)
    const session = await gateway.createSession({
      paymentId: row.paymentId, amountCents: row.amountCents, currency: row.currency, kind: row.kind, payerName: row.payerName ?? '', payerEmail: row.payerEmail ?? '',
      invoiceNo: row.invoiceNo, paymentFor: row.paymentFor, portalPaymentId: row.portalPaymentId ?? '', productName: row.kind === 'product' ? row.paymentFor : null, ip: row.ip,
    })
    row = await patchPayment(payload, row, {
      ...(session.gatewayRef ? { gatewayRef: session.gatewayRef } : {}),
      ...(session.facts ? { flags: { ...row.flags, gateway: { ...row.flags.gateway, ...session.facts } } } : {}),
    })
    return {
      status: 202,
      body: {
        ok: true, paymentId: row.paymentId, redirectUrl: session.url,
        ...(session.type === 'airwallex' && session.clientSecret ? { clientSecret: session.clientSecret, intentId: session.intentId } : {}),
      },
      headers: { 'Cache-Control': 'no-store' },
    }
  } catch (e) {
    const config = e instanceof PaymentsConfigError
    console.error(`[payments] gateway session failed for ${row.paymentId}: ${e instanceof Error ? e.message : 'error'}`)
    await casStatus(payload, row.paymentId, ['pending'], 'failed')
    await patchPayment(payload, row, { history: { status: 'failed', note: `gateway session failed${config ? ' (configuration)' : ''}` } }).catch(() => {})
    return fail(config ? 503 : 502, 'gateway_unavailable', { message: 'The payment provider is not available right now. Nothing has been charged. Please try again shortly.' })
  }
}
