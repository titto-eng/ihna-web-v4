import crypto from 'node:crypto'
import type { Payload } from 'payload'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { seedProducts } from '@/collections/seed/products'
import { resetPortalPool } from '@/lib/portal/client'
import { handleStart, type StartDeps } from '@/lib/payments/start'
import { derivePaymentId } from '@/lib/payments/sign'
import { resetRateLimit } from '@/lib/enquiries/rateLimit'
import { encryptPaywayParameters } from '@/lib/payments/gateways/payway-crypto'

export const nonce = () => Math.random().toString(36).slice(2, 10)
export const uuid = () => crypto.randomUUID()

// Throwaway fixture credentials: the Docker portal-mysql container of docker-compose.yml (docker/portal-fixtures/load.sh creates the users).
export const PAYWAY_TEST_KEY = Buffer.from('0123456789abcdef').toString('base64') // a test key; no real PayWay key is ever used here
export const AIRWALLEX_TEST_SECRET = 'whsec_test_not_a_real_secret'

export function usePaymentsEnv() {
  Object.assign(process.env, {
    PORTAL_DB_HOST: '127.0.0.1', PORTAL_DB_PORT: '3308', PORTAL_DB_NAME: 'ihna_portal', // ihna-web's portal-mysql (3307 is ihm-web's)
    PORTAL_DB_PAY_USER: 'portal_pay', PORTAL_DB_PAY_PASSWORD: 'portal_pay',
    PORTAL_DB_RO_USER: 'portal_ro', PORTAL_DB_RO_PASSWORD: 'portal_ro',
    PORTAL_QUERY_TIMEOUT_MS: '5000',
    PAYMENTS_GATEWAY_MODE: 'fake', DRY_RUN: '1', ENQUIRY_AUTORUN: '0',
    PAYWAY_ENCRYPTION_KEY: PAYWAY_TEST_KEY, AIRWALLEX_WEBHOOK_SECRET: AIRWALLEX_TEST_SECRET,
    PAYMENTS_FINANCE_TO: 'finance@example.test',
  })
  delete process.env.PAYMENTS_MAX_INVOICE_AMOUNT
  delete process.env.NODE_ENV_PAYMENTS
  resetRateLimit()
}

export const closePortal = () => resetPortalPool()

export async function boot(): Promise<Payload> {
  const payload = await getPayload({ config: await config })
  await seedProducts(payload)
  return payload
}

export const headersFor = (ip: string) => new Headers({ 'content-type': 'application/json', 'x-forwarded-for': ip })
export const uniqueIp = () => `198.51.100.${Math.floor(Math.random() * 250)}-${nonce()}`

export const invoiceBody = (over: Record<string, unknown> = {}) => ({
  kind: 'invoice', gateway: 'payway', payerName: 'Test Payer', payerEmail: `payer-${nonce()}@example.test`, submissionId: uuid(),
  invoiceNumber: `INV-${nonce()}`, paymentFor: 'Tuition', amount: '1250.00', ...over,
})
export const productBody = (over: Record<string, unknown> = {}) => ({
  kind: 'product', gateway: 'securepay', payerName: 'E2 Buyer', payerEmail: `e2-${nonce()}@example.test`, submissionId: uuid(), e2btn: 1, ...over,
})

export type Started = { status: number; body: Record<string, unknown>; paymentId: string }

/** Drives the real start pipeline (no HTTP). Rows it creates are remembered so afterAll can delete the mirror rows. */
export async function start(payload: Payload, body: Record<string, unknown>, deps: StartDeps = {}, ip = uniqueIp(), created?: string[]): Promise<Started> {
  const out = await handleStart({ payload, rawBody: JSON.stringify(body), headers: headersFor(ip) }, deps)
  const paymentId = typeof body.submissionId === 'string' ? derivePaymentId(body.submissionId) : ''
  if (created && out.status < 500) created.push(paymentId)
  return { status: out.status, body: out.body, paymentId }
}

/** The mirror collection grants nobody delete; tests use overrideAccess. The portal user has no DELETE either, so fixture portal rows stay. */
export async function removePayments(payload: Payload, paymentIds: string[]) {
  if (!paymentIds.length) return
  await payload.delete({ collection: 'payments', where: { paymentId: { in: paymentIds } }, overrideAccess: true }).catch(() => {})
}

export async function backdate(payload: Payload, paymentId: string, ageMs: number) {
  const pool = (payload.db as unknown as { pool: { query: (t: string, v: unknown[]) => Promise<unknown> } }).pool
  await pool.query('UPDATE payments SET created_at = $2 WHERE payment_id = $1', [paymentId, new Date(Date.now() - ageMs).toISOString()])
}

export const paywayReturn = (params: Record<string, string>) => encryptPaywayParameters(PAYWAY_TEST_KEY, params)

export function airwallexSigned(body: unknown, opts: { secret?: string; timestamp?: number } = {}) {
  const rawBody = typeof body === 'string' ? body : JSON.stringify(body)
  const timestamp = String(opts.timestamp ?? Date.now())
  const signature = crypto.createHmac('sha256', opts.secret ?? AIRWALLEX_TEST_SECRET).update(timestamp + rawBody).digest('hex')
  return { rawBody, timestamp, signature }
}

export const mailpit = 'http://localhost:8025/api/v1'
export async function mailpitUp(): Promise<boolean> {
  try { return (await fetch(`${mailpit}/info`, { signal: AbortSignal.timeout(2000) })).ok } catch { return false }
}
export async function mailpitFind(query: string): Promise<{ Subject: string; To: { Address: string }[] }[]> {
  const res = await fetch(`${mailpit}/search?query=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(5000) })
  return ((await res.json()) as { messages?: { Subject: string; To: { Address: string }[] }[] }).messages ?? []
}
