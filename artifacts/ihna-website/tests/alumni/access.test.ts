import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import { Cleanup, boot, loginAlumnus, newAlumnus, nonce, rest, strongPassword } from './helpers'

// What an alumni token can reach through Payload's REST API (the same API the dashboard form uses).
let payload: Payload
const cleanup = new Cleanup()
let me: Awaited<ReturnType<typeof newAlumnus>>
let other: Awaited<ReturnType<typeof newAlumnus>>
let token: string

beforeAll(async () => {
  payload = await boot()
  me = await newAlumnus(payload, cleanup)
  other = await newAlumnus(payload, cleanup)
  token = (await loginAlumnus(me.email, me.password)).token!
})
afterAll(async () => {
  await cleanup.run(payload)
})

describe('alumni token', () => {
  it('cannot read staff data: users, enquiries, payments', async () => {
    for (const path of ['users/', 'users/1/', 'enquiries/', 'payments/']) {
      const r = await rest('GET', path, { token })
      expect([401, 403, 404], `GET /api/${path} -> ${r.status}`).toContain(r.status)
      expect(r.body.docs?.length ?? 0, path).toBe(0)
    }
  })

  it('lists only its own alumni document and cannot read or change another', async () => {
    const list = await rest('GET', 'alumni/?limit=100', { token })
    expect(list.status).toBe(200)
    expect(list.body.docs.map((d: { id: unknown }) => d.id)).toEqual([me.doc.id])

    expect([403, 404]).toContain((await rest('GET', `alumni/${other.doc.id}/`, { token })).status)
    const patch = await rest('PATCH', `alumni/${other.doc.id}/`, { token, body: { firstName: 'Hijacked' } })
    expect([403, 404]).toContain(patch.status)
    const after = await payload.findByID({ collection: 'alumni', id: other.doc.id, overrideAccess: true })
    expect(after.firstName).toBe('Test')
  })

  it('cannot create, delete or unlock alumni accounts', async () => {
    const created = await rest('POST', 'alumni/', { token, body: { email: `t-${nonce()}@example.test`, password: strongPassword(), firstName: 'A', lastName: 'B' } })
    expect([401, 403]).toContain(created.status)
    const del = await payload.find({ collection: 'alumni', where: { email: { equals: other.email } }, overrideAccess: true })
    expect(del.totalDocs).toBe(1)
  })

  it('updates its own editable fields, but not email, verification or staff-only fields', async () => {
    const r = await rest('PATCH', `alumni/${me.doc.id}/`, {
      token,
      body: { firstName: 'Renamed', graduationYear: 2019, course: 'Bachelor of Nursing', marketingConsent: true, email: `changed-${nonce()}@example.test`, _verified: false, legacyId: 999999 },
    })
    expect(r.status, JSON.stringify(r.body)).toBe(200)
    const doc = await payload.findByID({ collection: 'alumni', id: me.doc.id, overrideAccess: true })
    expect(doc).toMatchObject({ firstName: 'Renamed', graduationYear: 2019, course: 'Bachelor of Nursing', marketingConsent: true, email: me.email, _verified: true })
    expect(doc.legacyId ?? null).toBeNull()
  })

  it('cannot set a weak password on its own document', async () => {
    const r = await rest('PATCH', `alumni/${me.doc.id}/`, { token, body: { password: 'Password123456' } })
    expect(r.status).toBe(400)
    expect((await loginAlumnus(me.email, me.password)).status).toBe(200) // unchanged
  })

  it('is refused by the admin panel (access.admin is false and the user is not staff)', async () => {
    const r = await rest('GET', 'users/me/', { token })
    expect(r.body.user ?? null).toBeNull() // /api/users/me answers for staff sessions only
  })
})
