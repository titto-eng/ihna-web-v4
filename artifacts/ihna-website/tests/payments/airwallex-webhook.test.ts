import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { handleAirwallexWebhook } from '@/lib/payments/handlers'
import { findPayment, patchPayment } from '@/lib/payments/store'
import { runAfterPaid } from '@/lib/payments/after'
import { POST as webhookRoute } from '@/app/api/payments/webhook/airwallex/route'
import { airwallexSigned, boot, closePortal, invoiceBody, mailpitFind, mailpitUp, removePayments, start, usePaymentsEnv } from './helpers'

// 45 §8 check 2: valid -> paid; altered body or stale timestamp -> 401; duplicate event -> one transition and one receipt.
let payload: Payload
const created: string[] = []
const queued: string[] = []
const deps = { queueAfter: async (_p: Payload, id: string) => { queued.push(id) } }

beforeAll(async () => { usePaymentsEnv(); payload = await boot() })
beforeEach(() => { usePaymentsEnv(); queued.length = 0 })
afterAll(async () => { await removePayments(payload, created); await closePortal() })

const event = (paymentId: string, over: Record<string, unknown> = {}, objOver: Record<string, unknown> = {}) => ({
  id: `evt_${crypto.randomUUID()}`, name: 'payment_intent.succeeded', created_at: new Date().toISOString(),
  data: { object: { id: 'int_test', merchant_order_id: paymentId, status: 'SUCCEEDED', amount: 1250, captured_amount: 1250, metadata: { paymentId }, ...objOver } }, ...over,
})
const newPayment = async (amount = '1250.00') => (await start(payload, invoiceBody({ gateway: 'airwallex', amount }), {}, undefined, created)).paymentId

describe('Airwallex webhook', () => {
  it('a valid, signed succeeded event marks the payment paid and queues afterPaid once', async () => {
    const id = await newPayment()
    const res = await handleAirwallexWebhook(payload, airwallexSigned(event(id)), deps)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ result: 'applied', status: 'paid' })
    expect(queued).toEqual([id])
    expect((await findPayment(payload, id))?.status).toBe('paid')
  })

  it('an altered body is 401 and changes nothing', async () => {
    const id = await newPayment()
    const s = airwallexSigned(event(id))
    const tampered = s.rawBody.replace('1250', '1')
    const res = await handleAirwallexWebhook(payload, { ...s, rawBody: tampered }, deps)
    expect(res.status).toBe(401)
    expect((await findPayment(payload, id))?.status).toBe('pending')
    expect(queued).toEqual([])
  })

  it('a wrong secret, a missing header and a stale or future timestamp are all 401', async () => {
    const id = await newPayment()
    const body = event(id)
    expect((await handleAirwallexWebhook(payload, airwallexSigned(body, { secret: 'someone-elses-secret' }), deps)).status).toBe(401)
    expect((await handleAirwallexWebhook(payload, { ...airwallexSigned(body), signature: null }, deps)).status).toBe(401)
    expect((await handleAirwallexWebhook(payload, airwallexSigned(body, { timestamp: Date.now() - 6 * 60_000 }), deps)).status).toBe(401)
    expect((await handleAirwallexWebhook(payload, airwallexSigned(body, { timestamp: Date.now() + 6 * 60_000 }), deps)).status).toBe(401)
    expect((await findPayment(payload, id))?.status).toBe('pending')
  })

  it('an unconfigured webhook secret is 401, never an open door', async () => {
    delete process.env.AIRWALLEX_WEBHOOK_SECRET
    const id = await newPayment()
    expect((await handleAirwallexWebhook(payload, airwallexSigned(event(id)), deps)).status).toBe(401)
  })

  it('a replayed event is ignored: one transition, one afterPaid job, one receipt', async () => {
    const id = await newPayment()
    const signed = airwallexSigned(event(id))
    const first = await handleAirwallexWebhook(payload, signed, deps)
    const second = await handleAirwallexWebhook(payload, signed, deps)
    expect(first.body.result).toBe('applied')
    expect(second.body).toMatchObject({ result: 'ignored' })
    expect(queued).toEqual([id])
    await runAfterPaid(payload, id)
    await runAfterPaid(payload, id) // a duplicate job run does not repeat finished steps
    if (await mailpitUp()) {
      const receipts = (await mailpitFind(id)).filter((m) => m.Subject.startsWith('Your payment receipt'))
      expect(receipts).toHaveLength(1)
    }
    const row = (await findPayment(payload, id))!
    expect(row.steps.find((s) => s.step === 'receiptEmail')?.attempts).toBe(1)
    expect(row.flags.eventIds).toHaveLength(1)
  })

  it('the same payment confirmed by a DIFFERENT event id is still one transition (the compare-and-set on status)', async () => {
    const id = await newPayment()
    await handleAirwallexWebhook(payload, airwallexSigned(event(id)), deps)
    const again = await handleAirwallexWebhook(payload, airwallexSigned(event(id)), deps)
    expect(again.body).toMatchObject({ result: 'ignored' })
    expect(queued).toEqual([id])
  })

  it('captured_amount that differs from the stored amount flags the payment instead of paying it', async () => {
    const id = await newPayment('1250.00')
    const res = await handleAirwallexWebhook(payload, airwallexSigned(event(id, {}, { captured_amount: 12.5 })), deps)
    expect(res.body).toMatchObject({ result: 'flagged', status: 'flagged' })
    const row = (await findPayment(payload, id))!
    expect(row.status).toBe('flagged')
    expect(row.flags.reason).toBe('amount-mismatch')
    expect(queued).toEqual([])
  })

  it('a single failed attempt is informational; a cancelled intent fails the payment; a later success still wins', async () => {
    const id = await newPayment()
    const attempt = await handleAirwallexWebhook(payload, airwallexSigned(event(id, { name: 'payment_attempt.failed_to_process' })), deps)
    expect(attempt.body.ignored).toBeTruthy()
    expect((await findPayment(payload, id))?.status).toBe('pending')
    await handleAirwallexWebhook(payload, airwallexSigned(event(id, { name: 'payment_intent.cancelled' }, { status: 'CANCELLED' })), deps)
    expect((await findPayment(payload, id))?.status).toBe('failed')
    await handleAirwallexWebhook(payload, airwallexSigned(event(id)), deps)
    expect((await findPayment(payload, id))?.status).toBe('paid')
  })

  it('a refund moves a paid payment to refunded and never a pending one', async () => {
    const id = await newPayment()
    const intentId = `int_${crypto.randomUUID()}`
    await patchPayment(payload, (await findPayment(payload, id))!, { gatewayRef: intentId }) // what a real createSession stores
    // documented refund events: refund.received (not final, ignored), refund.accepted / refund.settled (refunded). The Refund object carries
    // payment_intent_id, never our metadata: the payment is found by its intent id.
    const refund = (over: Record<string, unknown> = {}, name = 'refund.accepted') => ({ id: `evt_${crypto.randomUUID()}`, name, data: { object: { id: 'rfd_1', payment_intent_id: intentId, amount: 1250, ...over } } })
    expect((await handleAirwallexWebhook(payload, airwallexSigned(refund({}, 'refund.received')), deps)).body).toMatchObject({ ignored: expect.any(String) })
    expect((await handleAirwallexWebhook(payload, airwallexSigned(refund()), deps)).body).toMatchObject({ result: 'ignored' })
    await handleAirwallexWebhook(payload, airwallexSigned(event(id)), deps)
    expect((await handleAirwallexWebhook(payload, airwallexSigned(refund()), deps)).body).toMatchObject({ result: 'applied', status: 'refunded' })
  })

  it('an unknown payment answers 200 so Airwallex stops retrying, and nothing is created', async () => {
    const res = await handleAirwallexWebhook(payload, airwallexSigned(event(crypto.randomUUID())), deps)
    expect(res).toMatchObject({ status: 200, body: { ok: true, ignored: 'unknown payment' } })
  })

  it('the Next route reads the raw body: valid -> 200, one byte different -> 401', async () => {
    const id = await newPayment()
    const s = airwallexSigned(event(id))
    // the route queues through the real job queue; the default queueAfter is used, so only the status code and the row are asserted
    const bad = await webhookRoute(new Request('http://localhost:3000/api/payments/webhook/airwallex/', { method: 'POST', headers: { 'x-timestamp': s.timestamp, 'x-signature': s.signature }, body: s.rawBody + ' ' }))
    expect(bad.status).toBe(401)
    const ok = await webhookRoute(new Request('http://localhost:3000/api/payments/webhook/airwallex/', { method: 'POST', headers: { 'x-timestamp': s.timestamp, 'x-signature': s.signature }, body: s.rawBody }))
    expect(ok.status).toBe(200)
    expect((await findPayment(payload, id))?.status).toBe('paid')
  })
})
