import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { handlePaywayReturn, handleFakeDecision } from '@/lib/payments/handlers'
import { findPayment, patchPayment } from '@/lib/payments/store'
import { readPortalPayment } from '@/lib/portal/payments-write'
import { runAfterPaid } from '@/lib/payments/after'
import { verifyAmountSignature } from '@/lib/payments/sign'
import { boot, closePortal, invoiceBody, paywayReturn, removePayments, start, usePaymentsEnv } from './helpers'

// 45 §8 checks 5 and 6: a returned amount that differs from the stored row is rejected and flagged; a replayed return is one callback.
let payload: Payload
const created: string[] = []
const queued: string[] = []
const deps = { queueAfter: async (_p: Payload, id: string) => { queued.push(id) } }

beforeAll(async () => { usePaymentsEnv(); payload = await boot() })
beforeEach(() => { usePaymentsEnv(); queued.length = 0 })
afterAll(async () => { await removePayments(payload, created); await closePortal() })

const newPayway = async (amount = '150.00') => {
  const r = await start(payload, invoiceBody({ gateway: 'payway', amount }), {}, undefined, created)
  return r.paymentId
}
const params = (paymentId: string, over: Record<string, string> = {}) => ({
  PaymentID: paymentId, payment_amount: '150.00', response_code: '08', payment_number: `PN${Date.now()}`, payment_status: 'approved', type: 'general', provider: '2', StudentName: 'Test Payer', ...over,
})

describe('PayWay return', () => {
  it('a signed return with the stored amount settles the payment and redirects to the result page', async () => {
    const id = await newPayway()
    const out = await handlePaywayReturn(payload, paywayReturn(params(id)), deps)
    expect(out).toEqual({ redirect: `/pay/result/${id}/` })
    const row = (await findPayment(payload, id))!
    expect(row.status).toBe('paid')
    expect(row.flags.payway?.params?.response_code).toBe('08')
    expect(queued).toEqual([id])
  })

  it('amount mismatch: rejected, flagged, the portal row is NOT marked paid, no afterPaid job', async () => {
    const id = await newPayway('150.00')
    const out = await handlePaywayReturn(payload, paywayReturn(params(id, { payment_amount: '1.50' })), deps)
    expect('redirect' in out).toBe(true)
    const row = (await findPayment(payload, id))!
    expect(row.status).toBe('flagged')
    expect(row.flags.reason).toBe('amount-mismatch')
    expect(queued).toEqual([])
    await runAfterPaid(payload, id) // even if something ran afterPaid, a flagged row is not marked paid on the portal
    expect((await readPortalPayment(row.portalPaymentId!))?.status).toBe(0)
  })

  it('bad signature: 400 and the row is untouched', async () => {
    const id = await newPayway()
    const good = paywayReturn(params(id))
    const other = paywayReturn(params(id, { payment_amount: '0.01' }))
    const out = await handlePaywayReturn(payload, { EncryptedParameters: good.EncryptedParameters, Signature: other.Signature }, deps)
    expect(out).toMatchObject({ status: 400 })
    expect((await findPayment(payload, id))?.status).toBe('pending')
    expect(await handlePaywayReturn(payload, {}, deps)).toMatchObject({ status: 400 })
  })

  it('replay: the same return twice is one transition and one afterPaid job', async () => {
    const id = await newPayway()
    const q = paywayReturn(params(id))
    await handlePaywayReturn(payload, q, deps)
    await handlePaywayReturn(payload, q, deps)
    await handlePaywayReturn(payload, paywayReturn(params(id, { payment_number: 'DIFFERENT' })), deps) // a different return for the same payment
    expect(queued).toEqual([id])
    expect((await findPayment(payload, id))?.status).toBe('paid')
  })

  it('a declined return is `failed` and queues the PayWay cancel callback', async () => {
    const id = await newPayway()
    await handlePaywayReturn(payload, paywayReturn(params(id, { response_code: '51', payment_status: 'declined' })), deps)
    expect((await findPayment(payload, id))?.status).toBe('failed')
    expect(queued).toEqual([id])
  })

  it('an unknown payment uuid is refused', async () => {
    expect(await handlePaywayReturn(payload, paywayReturn(params(crypto.randomUUID())), deps)).toMatchObject({ status: 400 })
  })

  it('a payment the portal started itself (its own numeric id) is recorded as portalReturn and only forwarded', async () => {
    const portalId = String(900000 + Math.floor(Math.random() * 90000))
    const q = paywayReturn(params(portalId, { type: 'studenthub', provider: '3', payment_amount: '300.00', payment_reference: `PORTAL-${portalId}` }))
    const out = await handlePaywayReturn(payload, q, deps)
    expect('redirect' in out).toBe(true)
    const paymentId = (out as { redirect: string }).redirect.split('/')[3]
    created.push(paymentId)
    const row = (await findPayment(payload, paymentId))!
    expect(row).toMatchObject({ kind: 'portalReturn', status: 'paid', amountCents: 30000, portalPaymentId: portalId })
    const after = await runAfterPaid(payload, paymentId)
    expect(after.failed).toEqual([])
    const steps = Object.fromEntries((await findPayment(payload, paymentId))!.steps.map((s) => [s.step, s.status]))
    expect(steps).toMatchObject({ portalRow: 'skipped', portalCallback: 'done' }) // forwarded to the HCLA portal callback (logged in DRY_RUN)
  })
})

describe('signed amounts and the fake gateway', () => {
  it('a stored amount changed behind our back (signature mismatch) is flagged, not paid', async () => {
    const id = await newPayway('150.00')
    const row = (await findPayment(payload, id))!
    await payload.update({ collection: 'payments', id: row.id, data: { amountCents: 100 }, overrideAccess: true })
    const r = await handleFakeDecision(payload, id, 'approve', { amountCents: 100 }, deps)
    expect(r.body).toMatchObject({ result: 'flagged' })
    expect((await findPayment(payload, id))?.flags.reason).toBe('signature-mismatch')
    expect(queued).toEqual([])
  })

  it('a fake approval that reports a different amount is flagged like any gateway mismatch', async () => {
    const id = await newPayway('150.00')
    const r = await handleFakeDecision(payload, id, 'approve', { amountCents: 15 }, deps)
    expect(r.body).toMatchObject({ result: 'flagged' })
    expect(verifyAmountSignature({ paymentId: id, amountCents: 15000, currency: 'AUD', kind: 'invoice' }, (await findPayment(payload, id))?.flags.amountSig)).toBe(true)
    void patchPayment
  })
})
