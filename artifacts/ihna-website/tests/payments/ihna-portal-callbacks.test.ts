import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { portalCallbackTarget, runAfterPaid } from '@/lib/payments/after'
import { dryRunLog } from '@/lib/payments/external'
import { handlePaywayReturn, skilldemyReturnUrl } from '@/lib/payments/handlers'
import { findPayment } from '@/lib/payments/store'
import type { PaymentRow } from '@/lib/payments/types'
import { boot, closePortal, paywayReturn, removePayments, usePaymentsEnv } from './helpers'

// IHNA PayWay callbacks (45-payments §6 afterPaid step 2, §9): no provider = IHNA portal; autoenrol + ihnaonline -> autoEnrolIhnaOnline;
// skilldemy -> the Skilldemy portal and the browser back to Skilldemy. Settings: src/content/payments.ts.
const row = (status: PaymentRow['status'], payway: NonNullable<PaymentRow['flags']['payway']>) => ({ status, gateway: 'payway', flags: { payway } }) as unknown as PaymentRow

describe('portalCallbackTarget', () => {
  it('no provider is the IHNA portal; 2 IHM, 3 HCLA', () => {
    expect(portalCallbackTarget(row('paid', { type: 'general' }))).toEqual({ portal: 'ihna', path: '/academic/GenerateAutoEnrolInvoices/updatePayway' })
    expect(portalCallbackTarget(row('paid', { type: 'general', provider: 2 }))?.portal).toBe('ihm')
    expect(portalCallbackTarget(row('failed', { type: 'general', provider: 3 }))).toEqual({ portal: 'hcla', path: '/academic/GenerateAutoEnrolInvoices/paywayPaymentCancel' })
  })
  it('autoenrol rows (autoenrol, ihnaonline) call autoEnrolIhnaOnline when paid', () => {
    expect(portalCallbackTarget(row('paid', { type: 'ihnaonline', autoenrol: true }))?.path).toBe('/crm/IhnaOnlineAutoEnrolCourses/autoEnrolIhnaOnline')
  })
  it('skilldemy: paid -> Skilldemy portal enrol; failed -> the provider portal cancel, as before', () => {
    expect(portalCallbackTarget(row('paid', { type: 'skilldemy', provider: 2 }))).toEqual({ portal: 'skilldemy', path: '/crm/SkilldemyApplications/multipleSkilldemyCourseEnrol' })
    expect(portalCallbackTarget(row('failed', { type: 'skilldemy', provider: 2 }))).toEqual({ portal: 'ihm', path: '/academic/GenerateAutoEnrolInvoices/paywayPaymentCancel' })
    expect(portalCallbackTarget(row('pending', { type: 'skilldemy' }))).toBeNull()
  })
})

describe('skilldemyReturnUrl', () => {
  it('https only, status passed through when plain, else unknown', () => {
    expect(skilldemyReturnUrl('approved', { SKILLDEMY_RETURN_URL: 'https://skilldemy.example.test/payment-response' })).toBe('https://skilldemy.example.test/payment-response?status=approved')
    expect(skilldemyReturnUrl('"><script>', { SKILLDEMY_RETURN_URL: 'https://skilldemy.example.test/payment-response' })).toBe('https://skilldemy.example.test/payment-response?status=unknown')
    expect(skilldemyReturnUrl('approved', { SKILLDEMY_RETURN_URL: 'http://skilldemy.example.test/' })).toBeNull()
    expect(skilldemyReturnUrl('approved', {})).toBeNull()
  })
})

describe('portal-started PayWay returns on IHNA (fixture DB, DRY_RUN)', () => {
  let payload: Payload
  const created: string[] = []
  const queued: string[] = []
  const deps = { queueAfter: async (_p: Payload, id: string) => { queued.push(id) } }
  beforeAll(async () => { usePaymentsEnv(); payload = await boot() })
  beforeEach(() => { usePaymentsEnv(); queued.length = 0 })
  afterAll(async () => { delete process.env.SKILLDEMY_RETURN_URL; await removePayments(payload, created); await closePortal() })

  const portalReturn = (over: Record<string, string>) => {
    const portalId = String(800000 + Math.floor(Math.random() * 90000))
    return paywayReturn({ PaymentID: portalId, payment_amount: '120.00', response_code: '00', payment_number: `PN${Date.now()}${Math.random()}`, payment_status: 'approved', StudentName: 'Portal Payer', payment_reference: `P-${portalId}`, ...over })
  }

  it('type=ihnaonline is an autoenrol row; its callback goes to the IHNA portal (no provider)', async () => {
    const out = await handlePaywayReturn(payload, portalReturn({ type: 'ihnaonline' }), deps)
    const id = (out as { redirect: string }).redirect.split('/')[3]
    created.push(id)
    const r = (await findPayment(payload, id))!
    expect(r).toMatchObject({ kind: 'portalReturn', status: 'paid' })
    expect(r.flags.payway).toMatchObject({ type: 'ihnaonline', autoenrol: true })
    const before = dryRunLog.length
    expect((await runAfterPaid(payload, id)).failed).toEqual([])
    const call = dryRunLog.slice(before).find((e) => e.service === 'portal')
    expect(call?.path).toBe('/crm/IhnaOnlineAutoEnrolCourses/autoEnrolIhnaOnline')
  })

  it('type=skilldemy sends the browser back to Skilldemy and calls the Skilldemy portal', async () => {
    process.env.SKILLDEMY_RETURN_URL = 'https://skilldemy.example.test/payment-response'
    process.env.PORTAL_SKILLDEMY_URL = 'https://portal.skilldemy.example.test'
    const out = await handlePaywayReturn(payload, portalReturn({ type: 'skilldemy', provider: '2' }), deps)
    expect(out).toEqual({ redirect: 'https://skilldemy.example.test/payment-response?status=approved' })
    const rows = await payload.find({ collection: 'payments', where: { kind: { equals: 'portalReturn' } }, sort: '-createdAt', limit: 1, overrideAccess: true })
    const id = rows.docs[0].paymentId as string
    created.push(id)
    const before = dryRunLog.length
    expect((await runAfterPaid(payload, id)).failed).toEqual([])
    const call = dryRunLog.slice(before).find((e) => e.service === 'portal')
    expect(call).toMatchObject({ host: 'portal.skilldemy.example.test', path: '/crm/SkilldemyApplications/multipleSkilldemyCourseEnrol' })
    delete process.env.PORTAL_SKILLDEMY_URL
  })
})
