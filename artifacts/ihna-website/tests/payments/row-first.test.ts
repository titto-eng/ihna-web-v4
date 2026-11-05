import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { findPayment } from '@/lib/payments/store'
import { PortalUnavailable } from '@/lib/portal/client'
import { readPortalPayment } from '@/lib/portal/payments-write'
import type { Gateway } from '@/lib/payments/types'
import { fakeGateway } from '@/lib/payments/gateways'
import { boot, closePortal, invoiceBody, removePayments, start, usePaymentsEnv } from './helpers'

// 45 §8 check 4: the portal row exists before any gateway call; if the portal insert fails, the answer is 500 and the gateway is never called (rule 2).
let payload: Payload
const created: string[] = []

beforeAll(async () => { usePaymentsEnv(); payload = await boot() })
beforeEach(() => usePaymentsEnv())
afterAll(async () => { await removePayments(payload, created); await closePortal() })

describe('row first, gateway second', () => {
  it('portal insert fails -> 500, createSession never called, the mirror row is `failed` (the attempt is still on record)', async () => {
    const createSession = vi.fn()
    const gateway = { ...fakeGateway, createSession } as unknown as Gateway
    const r = await start(payload, invoiceBody(), { gatewayFor: () => gateway, insertPortal: async () => { throw new PortalUnavailable('ECONNREFUSED') } }, undefined, created)
    expect(r.status).toBe(500)
    expect(r.body.error).toBe('could_not_record')
    expect(createSession).not.toHaveBeenCalled()
    expect(await findPayment(payload, r.paymentId)).toMatchObject({ status: 'failed', portalPaymentId: null })
  })

  it('a real portal outage (wrong PAY user) behaves the same', async () => {
    process.env.PORTAL_DB_PAY_PASSWORD = 'wrong-password'
    await closePortal()
    const createSession = vi.fn()
    const gateway = { ...fakeGateway, createSession } as unknown as Gateway
    try {
      const r = await start(payload, invoiceBody(), { gatewayFor: () => gateway }, undefined, created)
      expect(r.status).toBe(500)
      expect(createSession).not.toHaveBeenCalled()
    } finally {
      usePaymentsEnv()
      await closePortal()
    }
  })

  it('on success the portal row (status 0) already exists when the gateway is called', async () => {
    let seen: { status: number } | null = null
    let portalId = ''
    const gateway: Gateway = {
      name: 'fake',
      queryStatus: async () => ({ state: 'pending' }),
      createSession: async (input) => {
        portalId = input.portalPaymentId
        seen = await readPortalPayment(input.portalPaymentId)
        return { type: 'redirect', url: `/pay/fake/${input.paymentId}/` }
      },
    }
    const r = await start(payload, invoiceBody(), { gatewayFor: () => gateway }, undefined, created)
    expect(r.status).toBe(202)
    expect(portalId).toMatch(/^\d+$/)
    expect(seen).toMatchObject({ status: 0 })
    expect((await findPayment(payload, r.paymentId))?.status).toBe('pending')
  })
})
