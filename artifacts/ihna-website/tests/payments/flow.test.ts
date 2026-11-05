import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { runAfterPaid } from '@/lib/payments/after'
import { handleFakeDecision, loadReceipt } from '@/lib/payments/handlers'
import { findPayment } from '@/lib/payments/store'
import { readPortalPayment } from '@/lib/portal/payments-write'
import { verifyAmountSignature } from '@/lib/payments/sign'
import { boot, closePortal, invoiceBody, mailpitFind, mailpitUp, productBody, removePayments, start, usePaymentsEnv } from './helpers'

// End to end with the FakeGateway (plan §8): start -> pending row (Postgres mirror + portal row) -> fake approval -> paid -> afterPaid -> receipt.
let payload: Payload
const created: string[] = []
const queued: string[] = []
const deps = { queueAfter: async (_p: Payload, id: string) => { queued.push(id) } }

beforeAll(async () => { usePaymentsEnv(); payload = await boot() })
beforeEach(() => { usePaymentsEnv(); queued.length = 0 })
afterAll(async () => { await removePayments(payload, created); await closePortal() })

describe('invoice: start -> pending -> fake approve -> paid -> receipt', () => {
  it('creates a pending mirror row and a pending portal row BEFORE anything is paid, answers 202 with a redirect to the fake gateway', async () => {
    const body = invoiceBody({ amount: '1250.00' })
    const r = await start(payload, body, {}, undefined, created)
    expect(r.status).toBe(202)
    expect(r.body).toMatchObject({ ok: true, paymentId: r.paymentId, redirectUrl: `/pay/fake/${r.paymentId}/` })
    expect(r.paymentId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(r.paymentId).not.toBe(body.submissionId) // the client does not choose the id

    const row = await findPayment(payload, r.paymentId)
    expect(row).toMatchObject({ status: 'pending', kind: 'invoice', gateway: 'payway', amountCents: 125000, payerEmail: body.payerEmail })
    expect(row?.portalPaymentId).toMatch(/^\d+$/)
    const portal = await readPortalPayment(row!.portalPaymentId!)
    expect(portal).toMatchObject({ status: 0, invoice_number: body.invoiceNumber })
    expect(Number(portal!.amount)).toBe(1250)
  })

  it('approve settles once, afterPaid marks the portal row paid, sends the receipt, and the receipt page data needs the right email', async () => {
    const body = invoiceBody({ amount: '80.50', gateway: 'airwallex' })
    const r = await start(payload, body, {}, undefined, created)
    const res = await handleFakeDecision(payload, r.paymentId, 'approve', {}, deps)
    expect(res.body).toMatchObject({ result: 'applied', status: 'paid' })
    expect(queued).toEqual([r.paymentId])

    const after = await runAfterPaid(payload, r.paymentId)
    expect(after).toMatchObject({ failed: [], dead: [] })
    const row = (await findPayment(payload, r.paymentId))!
    expect(row.status).toBe('paid')
    expect(Object.fromEntries(row.steps.map((s) => [s.step, s.status]))).toEqual({ portalRow: 'done', portalCallback: 'skipped', receiptEmail: 'done', e2Fulfilment: 'skipped', saeProvision: 'skipped' })

    const portal = await readPortalPayment(row.portalPaymentId!)
    expect(portal).toMatchObject({ status: 1, payment_gateway: 'airwallex' })
    expect(Number(portal!.paid_amount)).toBe(80.5)

    expect(await loadReceipt(payload, r.paymentId, body.payerEmail)).toMatchObject({ status: 'paid', amountCents: 8050, payerName: 'Test Payer' })
    if (await mailpitUp()) {
      const mails = await mailpitFind(r.paymentId)
      expect(mails.some((m) => m.To.some((t) => t.Address === body.payerEmail))).toBe(true) // the payer's receipt
      expect(mails.some((m) => m.To.some((t) => t.Address === 'finance@example.test'))).toBe(true) // the finance notice
    }
  })

  it('a decline leaves the portal row at status 0 and records the response', async () => {
    const r = await start(payload, invoiceBody({ amount: '10.00' }), {}, undefined, created)
    const res = await handleFakeDecision(payload, r.paymentId, 'decline', {}, deps)
    expect(res.body).toMatchObject({ status: 'failed' })
    await runAfterPaid(payload, r.paymentId)
    const row = (await findPayment(payload, r.paymentId))!
    expect((await readPortalPayment(row.portalPaymentId!))?.status).toBe(0)
  })

  it('abandon leaves the row pending', async () => {
    const r = await start(payload, invoiceBody({ amount: '10.00' }), {}, undefined, created)
    await handleFakeDecision(payload, r.paymentId, 'abandon', {}, deps)
    expect((await findPayment(payload, r.paymentId))?.status).toBe('pending')
  })
})

describe('product: E2 fulfilment', () => {
  it('pays the server price (150.00 for item 1), then the E2 step runs (monday item logged, not sent in DRY_RUN)', async () => {
    const r = await start(payload, productBody({ e2btn: 1, gateway: 'securepay' }), {}, undefined, created)
    expect(r.status).toBe(202)
    const row0 = (await findPayment(payload, r.paymentId))!
    expect(row0).toMatchObject({ kind: 'product', amountCents: 15000, flags: expect.objectContaining({ e2payment: true }) })
    expect(verifyAmountSignature({ paymentId: r.paymentId, amountCents: 15000, currency: 'AUD', kind: 'product' }, row0.flags.amountSig)).toBe(true)
    await handleFakeDecision(payload, r.paymentId, 'approve', {}, deps)
    const after = await runAfterPaid(payload, r.paymentId)
    expect(after.failed).toEqual([])
    const row = (await findPayment(payload, r.paymentId))!
    expect(row.steps.find((s) => s.step === 'e2Fulfilment')?.status).toBe('done')
    expect(Number((await readPortalPayment(row.portalPaymentId!))?.paid_amount)).toBe(150)
  })
})
