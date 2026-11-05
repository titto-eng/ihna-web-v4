import type { Payload } from 'payload'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { runAfterPaid, type StepFn } from '@/lib/payments/after'
import { handleFakeDecision } from '@/lib/payments/handlers'
import { retryDeadSteps } from '@/lib/payments/retry'
import { findPayment } from '@/lib/payments/store'
import { boot, closePortal, invoiceBody, removePayments, start, usePaymentsEnv } from './helpers'

// 45 §3: dead afterPaid steps are re-run through POST /api/payments/retry/ (admin, finance), since `payments` has no update access (DEC-3).
let payload: Payload
const created: string[] = []
const deps = { queueAfter: async () => {} }
const { POST: RETRY } = await import('@/app/api/payments/retry/route')

beforeAll(async () => { usePaymentsEnv(); payload = await boot() })
beforeEach(() => usePaymentsEnv())
afterEach(() => vi.restoreAllMocks())
afterAll(async () => { await removePayments(payload, created); await closePortal() })

const deadPayment = async () => {
  const r = await start(payload, invoiceBody(), {}, undefined, created)
  await handleFakeDecision(payload, r.paymentId, 'approve', {}, deps)
  const always: StepFn = async () => { throw new Error('portal down') }
  for (let i = 0; i < 5; i++) await runAfterPaid(payload, r.paymentId, { steps: { portalCallback: always } })
  return r.paymentId
}
const step = async (id: string, name: string) => (await findPayment(payload, id))!.steps.find((s) => s.step === name)

describe('retry dead afterPaid steps', () => {
  it('resets only the dead step, records the request and queues afterPaid once; the step then runs again', async () => {
    const id = await deadPayment()
    expect(await step(id, 'portalCallback')).toMatchObject({ status: 'dead', attempts: 5 })
    const queued: string[] = []
    const r = await retryDeadSteps(payload, { paymentIds: [id], by: 'user 1', queue: async (_p, pid) => { queued.push(pid) } })
    expect(r).toEqual({ requeued: 1, paymentIds: [id] })
    expect(queued).toEqual([id])
    expect(await step(id, 'portalCallback')).toMatchObject({ status: 'failed', attempts: 0 })
    expect(await step(id, 'receiptEmail')).toMatchObject({ status: 'done', attempts: 1 })
    const row = (await findPayment(payload, id))!
    expect(row.status).toBe('paid')
    expect(row.statusHistory.at(-1)?.note).toContain('retry dead steps (portalCallback) by user 1')
    let calls = 0
    await runAfterPaid(payload, id, { steps: { portalCallback: async () => { calls++; return 'done' } } })
    expect(calls).toBe(1)
    expect(await step(id, 'portalCallback')).toMatchObject({ status: 'done', attempts: 1 })
    expect((await retryDeadSteps(payload, { paymentIds: [id], queue: async () => {} })).requeued).toBe(0)
  })

  it('the route is for admin and finance only', async () => {
    const id = await deadPayment()
    const as = (role: 'finance' | 'marketing' | null) => vi.spyOn(payload, 'auth').mockResolvedValue({ user: role ? { id: 7, collection: 'users', email: `${role}@example.test`, roles: [role] } : null, permissions: {} } as never)
    const call = () => RETRY(new Request('http://localhost:3000/api/payments/retry/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ paymentIds: [id] }) }))
    as(null)
    expect((await call()).status).toBe(401)
    as('marketing')
    expect((await call()).status).toBe(403)
    expect(await step(id, 'portalCallback')).toMatchObject({ status: 'dead' })
    as('finance')
    const ok = await call()
    expect(ok.status).toBe(200)
    expect(await ok.json()).toMatchObject({ ok: true, requeued: 1, paymentIds: [id] })
    expect((await step(id, 'portalCallback'))?.status).not.toBe('dead')
  })
})
