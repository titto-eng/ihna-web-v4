import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { runAfterPaid, type StepFn } from '@/lib/payments/after'
import { handleFakeDecision } from '@/lib/payments/handlers'
import { findPayment } from '@/lib/payments/store'
import { readPortalPayment } from '@/lib/portal/payments-write'
import { boot, closePortal, invoiceBody, productBody, removePayments, start, usePaymentsEnv } from './helpers'

// 45 §8 check 7: two failures, then success -> attempts=3. Plus: a failing step does not block the others, and the 5th failure is `dead`.
let payload: Payload
const created: string[] = []
const deps = { queueAfter: async () => {} }

beforeAll(async () => { usePaymentsEnv(); payload = await boot() })
beforeEach(() => usePaymentsEnv())
afterAll(async () => { await removePayments(payload, created); await closePortal() })

const paidPayment = async (body = invoiceBody()) => {
  const r = await start(payload, body, {}, undefined, created)
  await handleFakeDecision(payload, r.paymentId, 'approve', {}, deps)
  return r.paymentId
}
const stepsOf = async (id: string) => Object.fromEntries((await findPayment(payload, id))!.steps.map((s) => [s.step, { status: s.status, attempts: s.attempts }]))

describe('afterPaid', () => {
  it('two failures, then success -> attempts = 3; the other steps ran once and are not repeated', async () => {
    const id = await paidPayment()
    let calls = 0
    const flaky: StepFn = async () => { calls++; if (calls <= 2) throw new Error('portal timeout'); return 'done' }
    const r1 = await runAfterPaid(payload, id, { steps: { portalCallback: flaky } })
    expect(r1.failed).toEqual(['portalCallback'])
    expect((await stepsOf(id)).portalRow).toEqual({ status: 'done', attempts: 1 }) // not blocked by the failing step
    expect((await stepsOf(id)).receiptEmail).toEqual({ status: 'done', attempts: 1 })
    const r2 = await runAfterPaid(payload, id, { steps: { portalCallback: flaky } })
    expect(r2.failed).toEqual(['portalCallback'])
    const r3 = await runAfterPaid(payload, id, { steps: { portalCallback: flaky } })
    expect(r3.failed).toEqual([])
    const s = await stepsOf(id)
    expect(s.portalCallback).toEqual({ status: 'done', attempts: 3 })
    expect(s.portalRow.attempts).toBe(1)
    expect(s.receiptEmail.attempts).toBe(1)
    expect(calls).toBe(3)
  })

  it('the 5th failure makes the step dead (and it is not retried again)', async () => {
    const id = await paidPayment()
    let calls = 0
    const always: StepFn = async () => { calls++; throw new Error('portal down') }
    for (let i = 1; i <= 4; i++) expect((await runAfterPaid(payload, id, { steps: { portalCallback: always } })).failed).toEqual(['portalCallback'])
    const last = await runAfterPaid(payload, id, { steps: { portalCallback: always } })
    expect(last).toMatchObject({ failed: [], dead: ['portalCallback'] })
    expect((await stepsOf(id)).portalCallback).toEqual({ status: 'dead', attempts: 5 })
    await runAfterPaid(payload, id, { steps: { portalCallback: always } })
    expect(calls).toBe(5)
  })

  it('portalRow is idempotent: marking the portal row paid twice changes nothing the second time', async () => {
    const id = await paidPayment(invoiceBody({ amount: '42.00' }))
    await runAfterPaid(payload, id)
    const row = (await findPayment(payload, id))!
    const first = await readPortalPayment(row.portalPaymentId!)
    expect(first).toMatchObject({ status: 1 })
    await runAfterPaid(payload, id)
    expect(await readPortalPayment(row.portalPaymentId!)).toEqual(first)
  })

  it('E2: the monday item id is stored once and a retry does not create a second item', async () => {
    const id = await paidPayment(productBody() as never)
    let created = 0
    const e2: StepFn = async ({ row, payload: p }) => {
      if (row.flags.monday?.itemId) return 'done'
      created++
      const { patchPayment } = await import('@/lib/payments/store')
      await patchPayment(p, row, { flags: { ...row.flags, monday: { itemId: 'item-1' } } })
      throw new Error('crash after creating the item')
    }
    await runAfterPaid(payload, id, { steps: { e2Fulfilment: e2 } })
    await runAfterPaid(payload, id, { steps: { e2Fulfilment: e2 } })
    expect(created).toBe(1)
    expect((await stepsOf(id)).e2Fulfilment.status).toBe('done')
  })

  it('SAE provisioning is a retried step that only plans (DRY_RUN) until Graph and Canvas credentials exist', async () => {
    const { saeProvisionStep } = await import('@/lib/payments/after')
    const row = { kind: 'sae', status: 'paid', flags: {}, steps: [] } as never
    expect(await saeProvisionStep({ payload, row })).toBe('done')
    const { dryRunLog } = await import('@/lib/payments/external')
    expect(dryRunLog.some((l) => l.service === 'graph') && dryRunLog.some((l) => l.service === 'canvas')).toBe(true)
  })
})
