import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { runAfterPaid } from '@/lib/payments/after'
import { handlePaywayReturn } from '@/lib/payments/handlers'
import { fakeGateway, getGateway } from '@/lib/payments/gateways'
import { paywayGateway } from '@/lib/payments/gateways/payway'
import { reconcilePending } from '@/lib/payments/reconcile'
import { findPayment } from '@/lib/payments/store'
import type { GatewayName } from '@/lib/payments/config'
import { readPortalPayment } from '@/lib/portal/payments-write'
import { backdate, boot, closePortal, invoiceBody, mailpitFind, mailpitUp, paywayReturn, removePayments, start, usePaymentsEnv } from './helpers'

// 45 §8 check 12: a payment pending for 11 minutes whose fake status says paid is settled by reconcilePending, then the receipt goes out.
let payload: Payload
const created: string[] = []
const queued: string[] = []
const deps = { queueAfter: async (_p: Payload, id: string) => { queued.push(id) } }
const MIN = 60_000

beforeAll(async () => { usePaymentsEnv(); payload = await boot() })
beforeEach(() => { usePaymentsEnv(); queued.length = 0 })
afterAll(async () => { await removePayments(payload, created); await closePortal() })

const pending = async (gateway: 'payway' | 'securepay' | 'airwallex', ageMin: number, amount = '200.00') => {
  const r = await start(payload, invoiceBody({ gateway, amount }), {}, undefined, created)
  await backdate(payload, r.paymentId, ageMin * MIN)
  return r.paymentId
}

describe('reconcilePending', () => {
  it('settles a row pending for 11 minutes whose gateway says paid: paid, afterPaid queued, portal row paid, receipt sent', async () => {
    const id = await pending('airwallex', 11)
    fakeGateway.decide(id, 'approve') // the customer paid, but no return or webhook ever arrived
    const r = await reconcilePending(payload, deps)
    expect(r.paid).toBeGreaterThanOrEqual(1)
    expect((await findPayment(payload, id))?.status).toBe('paid')
    expect(queued).toContain(id)
    await runAfterPaid(payload, id)
    const row = (await findPayment(payload, id))!
    expect((await readPortalPayment(row.portalPaymentId!))?.status).toBe(1)
    if (await mailpitUp()) expect((await mailpitFind(id)).some((m) => m.Subject.startsWith('Your payment receipt'))).toBe(true)
    expect(row.statusHistory.at(-1)?.note).toContain('reconcile')
  })

  it('leaves a row younger than 10 minutes alone', async () => {
    const id = await pending('airwallex', 5)
    fakeGateway.decide(id, 'approve')
    await reconcilePending(payload, deps)
    expect((await findPayment(payload, id))?.status).toBe('pending')
  })

  it('a declined fake payment becomes failed', async () => {
    const id = await pending('securepay', 12)
    fakeGateway.decide(id, 'decline')
    await reconcilePending(payload, deps)
    expect((await findPayment(payload, id))?.status).toBe('failed')
  })

  it('a row with no answer after 24 h expires', async () => {
    const id = await pending('securepay', 25 * 60)
    fakeGateway.decide(id, 'abandon')
    const r = await reconcilePending(payload, deps)
    expect(r.expired).toBeGreaterThanOrEqual(1)
    expect((await findPayment(payload, id))?.status).toBe('expired')
  })

  it('is safe to run twice: the second run settles nothing new and queues nothing', async () => {
    const id = await pending('airwallex', 11)
    fakeGateway.decide(id, 'approve')
    await reconcilePending(payload, deps)
    const n = queued.filter((q) => q === id).length
    await reconcilePending(payload, deps)
    expect(queued.filter((q) => q === id).length).toBe(n)
    expect(n).toBe(1)
  })

  it('PayWay has no status API: the row is flagged needs-manual-check (listed in the Payments admin), and a later valid return still settles it', async () => {
    const id = await pending('payway', 11, '150.00')
    const gatewayFor = (name: GatewayName) => (name === 'payway' ? paywayGateway : getGateway(name))
    const r = await reconcilePending(payload, { ...deps, gatewayFor })
    expect(r.flagged).toBeGreaterThanOrEqual(1)
    const row = (await findPayment(payload, id))!
    expect(row.status).toBe('flagged')
    expect(row.flags.reason).toBe('needs-manual-check')
    const out = await handlePaywayReturn(payload, paywayReturn({ PaymentID: id, payment_amount: '150.00', response_code: '00', payment_number: 'LATE1' }), deps)
    expect('redirect' in out).toBe(true)
    expect((await findPayment(payload, id))?.status).toBe('paid')
  })

  it('a gateway error on one row does not stop the rest', async () => {
    const bad = await pending('airwallex', 11)
    const good = await pending('securepay', 11)
    fakeGateway.decide(good, 'approve')
    const gatewayFor = (name: GatewayName) => name === 'airwallex' ? { name: 'fake' as const, createSession: fakeGateway.createSession, queryStatus: async () => { throw new Error('gateway down') } } : fakeGateway
    const r = await reconcilePending(payload, { ...deps, gatewayFor })
    expect(r.errors).toBeGreaterThanOrEqual(1)
    expect((await findPayment(payload, bad))?.status).toBe('pending')
    expect((await findPayment(payload, good))?.status).toBe('paid')
  })
})
