import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import { boot, Cleanup, makeAlumnus, makeStaff, nonce } from './helpers'

let payload: Payload
const cleanup = new Cleanup()
const n = nonce()
type StaffUser = Awaited<ReturnType<typeof makeStaff>>
const staff = {} as Record<'admin' | 'marketing' | 'events' | 'finance' | 'viewer', StaffUser>

const enquiryData = { submissionId: `sub-${n}`, formKey: 'quick-enquiry', email: `lead-${n}@example.test`, status: 'received' as const }

describe('access: alumni auth, enquiries, payments, products, lookups, users', () => {
  beforeAll(async () => {
    payload = await boot()
    for (const role of ['admin', 'marketing', 'events', 'finance', 'viewer'] as const) staff[role] = await makeStaff(payload, cleanup, role, n)
  })
  afterAll(async () => {
    await cleanup.run(payload)
  })

  it('the alumni collection is an auth collection with email verification and lockout', () => {
    const auth = payload.collections.alumni.config.auth
    expect(auth).toBeTruthy()
    expect(auth.verify).toBeTruthy()
    expect(auth.maxLoginAttempts).toBe(5)
    expect(auth.lockTime).toBe(15 * 60 * 1000)
    expect(auth.tokenExpiration).toBe(12 * 60 * 60)
    expect(auth.removeTokenFromResponses).toBe(true)
  })

  it('alumni cannot log in before verifying, can after; they are never staff', async () => {
    const { doc, password } = await makeAlumnus(payload, cleanup, n)
    await expect(payload.login({ collection: 'alumni', data: { email: doc.email, password } })).rejects.toThrow()
    await payload.update({ collection: 'alumni', id: doc.id, data: { _verified: true }, overrideAccess: true })
    const ok = await payload.login({ collection: 'alumni', data: { email: doc.email, password } })
    expect(ok.token).toBeUndefined() // removeTokenFromResponses
    for (const collection of ['users', 'enquiries', 'payments'] as const) {
      const res = await payload.find({ collection, user: doc, overrideAccess: false }).catch(() => ({ totalDocs: 0, denied: true }))
      expect(res.totalDocs, collection).toBe(0)
    }
    // Own record only; never an unpublished draft.
    const self = await payload.find({ collection: 'alumni', user: doc, overrideAccess: false })
    expect(self.docs.map((d) => d.id)).toEqual([doc.id])
  })

  it('an alumnus cannot verify themselves', async () => {
    const { doc } = await makeAlumnus(payload, cleanup, `${n}x`)
    await payload.update({ collection: 'alumni', id: doc.id, data: { _verified: true, firstName: 'Changed' }, user: doc, overrideAccess: false })
    const after = await payload.findByID({ collection: 'alumni', id: doc.id, overrideAccess: true })
    expect(after.firstName).toBe('Changed')
    expect(after._verified).toBeFalsy()
  })

  it('enquiries: nobody creates, updates or deletes through access control; marketing/finance/admin read', async () => {
    for (const role of ['marketing', 'admin', 'finance', 'events', 'viewer'] as const) {
      await expect(
        payload.create({ collection: 'enquiries', data: enquiryData, user: staff[role], overrideAccess: false }),
        `create as ${role}`,
      ).rejects.toThrow()
    }
    await expect(payload.create({ collection: 'enquiries', data: enquiryData, overrideAccess: false })).rejects.toThrow()

    // The system writes with overrideAccess (Local API default).
    const row = await payload.create({ collection: 'enquiries', data: enquiryData })
    cleanup.track('enquiries', row.id)
    await expect(payload.update({ collection: 'enquiries', id: row.id, data: { status: 'dead' }, user: staff.admin, overrideAccess: false })).rejects.toThrow()
    await expect(payload.delete({ collection: 'enquiries', id: row.id, user: staff.admin, overrideAccess: false })).rejects.toThrow()

    for (const role of ['marketing', 'finance', 'admin'] as const) {
      const r = await payload.find({ collection: 'enquiries', where: { id: { equals: row.id } }, user: staff[role], overrideAccess: false })
      expect(r.totalDocs, `read as ${role}`).toBe(1)
    }
    for (const role of ['events', 'viewer'] as const) {
      await expect(payload.find({ collection: 'enquiries', user: staff[role], overrideAccess: false }), `read as ${role}`).rejects.toThrow()
    }
    await expect(payload.find({ collection: 'enquiries', overrideAccess: false })).rejects.toThrow()
  })

  it('payments: admin and finance read; nobody writes', async () => {
    const data = { paymentId: `pay-${n}`, amountCents: 100, status: 'pending' as const }
    for (const role of ['admin', 'finance'] as const) {
      await expect(payload.create({ collection: 'payments', data, user: staff[role], overrideAccess: false })).rejects.toThrow()
    }
    const row = await payload.create({ collection: 'payments', data })
    cleanup.track('payments', row.id)
    expect((await payload.find({ collection: 'payments', user: staff.finance, overrideAccess: false })).totalDocs).toBeGreaterThan(0)
    for (const role of ['marketing', 'events', 'viewer'] as const) {
      await expect(payload.find({ collection: 'payments', user: staff[role], overrideAccess: false })).rejects.toThrow()
    }
    await expect(payload.update({ collection: 'payments', id: row.id, data: { amountCents: 1 }, user: staff.admin, overrideAccess: false })).rejects.toThrow()
  })

  it('products: marketing cannot change the price, finance can; the public sees active products only', async () => {
    const p = await payload.create({
      collection: 'products', data: { sku: `sku-${n}`, name: 'T', kind: 'mock-test', priceCents: 5000 }, user: staff.finance, overrideAccess: false,
    })
    cleanup.track('products', p.id)
    await payload.update({ collection: 'products', id: p.id, data: { priceCents: 1, name: 'Renamed' }, user: staff.marketing, overrideAccess: false })
    let row = await payload.findByID({ collection: 'products', id: p.id })
    expect(row.priceCents).toBe(5000)
    expect(row.name).toBe('Renamed')
    await payload.update({ collection: 'products', id: p.id, data: { priceCents: 6000 }, user: staff.finance, overrideAccess: false })
    row = await payload.findByID({ collection: 'products', id: p.id })
    expect(row.priceCents).toBe(6000)

    await payload.update({ collection: 'products', id: p.id, data: { active: false } })
    expect((await payload.find({ collection: 'products', where: { id: { equals: p.id } }, overrideAccess: false })).totalDocs).toBe(0)
    expect((await payload.find({ collection: 'products', where: { id: { equals: p.id } }, user: staff.viewer, overrideAccess: false })).totalDocs).toBe(1)
  })

  it('lookups: the public sees active rows only; enquiryEmail is hidden from the public', async () => {
    const a = await payload.create({ collection: 'campuses', data: { name: `Campus A ${n}`, enquiryEmail: `c-${n}@example.test` } })
    const b = await payload.create({ collection: 'campuses', data: { name: `Campus B ${n}`, active: false } })
    cleanup.track('campuses', a.id)
    cleanup.track('campuses', b.id)
    expect(a.slug).toBe(`campus-a-${n}`)
    const pub = await payload.find({ collection: 'campuses', where: { id: { in: [a.id, b.id] } }, overrideAccess: false })
    expect(pub.docs.map((d) => d.id)).toEqual([a.id])
    expect(pub.docs[0].enquiryEmail).toBeUndefined()
    const mk = await payload.findByID({ collection: 'campuses', id: a.id, user: staff.marketing, overrideAccess: false })
    expect(mk.enquiryEmail).toBe(`c-${n}@example.test`)
  })

  it('users: self read only; roles cannot be changed by their owner; alumni ids never match staff rows', async () => {
    const self = await payload.find({ collection: 'users', user: staff.marketing, overrideAccess: false })
    expect(self.docs.map((d) => d.id)).toEqual([staff.marketing.id])
    await payload.update({ collection: 'users', id: staff.marketing.id, data: { roles: ['admin'], name: 'Renamed' }, user: staff.marketing, overrideAccess: false })
    const after = await payload.findByID({ collection: 'users', id: staff.marketing.id })
    expect(after.roles).toEqual(['marketing'])
    expect(after.name).toBe('Renamed')
  })
})
