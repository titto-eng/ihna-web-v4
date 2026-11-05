import { expect, test } from '@playwright/test'
import type { Payload } from 'payload'
import { boot, nonce, uuid } from '../helpers'

// 40 §8 check 8: the enquiries list filters (formKey, campaignCode, dead deliveries) through the same REST query the admin list view
// uses, as a real marketing user logged in against the dev server. Rows are read-only for everyone (DEC-3).
let payload: Payload
const tag = nonce()
const ids: (number | string)[] = []
const subs: string[] = []
const users: (number | string)[] = []
const creds = (role: string) => ({ email: `t-${tag}-${role}@example.test`, password: `Pw-${tag}-${role}-0123456789` })

test.beforeAll(async () => {
  payload = await boot()
  for (const role of ['marketing', 'viewer']) {
    const u = await payload.create({ collection: 'users', data: { ...creds(role), roles: [role] } as never, overrideAccess: true })
    users.push(u.id)
  }
  const mk = async (formKey: string, extra: Record<string, unknown>, delivery: Record<string, unknown>) => {
    const submissionId = uuid()
    subs.push(submissionId)
    const d = await payload.create({ collection: 'enquiries', overrideAccess: true, data: { submissionId, formKey, status: 'received', email: `${formKey}-${tag}@example.test`, ...extra, deliveries: [{ adapter: 'hubspot', target: 'contacts', attempts: 1, ...delivery }] } as never })
    ids.push(d.id)
  }
  await mk(`zz-filter-a-${tag}`, { campaignCode: 'zmniywrz', status: 'dead' }, { status: 'dead', lastError: 'HTTP 400' })
  await mk(`zz-filter-b-${tag}`, { campaignCode: 'unknown_code' }, { status: 'dry_run' })
})
test.afterAll(async () => {
  if (!payload) return
  await payload.delete({ collection: 'enquiries', where: { submissionId: { in: subs } }, overrideAccess: true }).catch(() => {})
  for (const id of users) await payload.delete({ collection: 'users', id, overrideAccess: true }).catch(() => {})
})

type Api = import('@playwright/test').APIRequestContext
// Real REST login against the dev server; the JWT from the Set-Cookie header is sent as `Authorization: JWT <token>` (Payload accepts
// both, and a bare Cookie header is not read back reliably by this app's /api/users/me).
const login = async (request: Api, role: string): Promise<Record<string, string>> => {
  const res = await request.post('/api/users/login', { data: creds(role) })
  expect(res.status()).toBe(200)
  const token = /payload-token=([^;]+)/.exec(res.headers()['set-cookie'] ?? '')?.[1]
  expect(token, 'login sets a token').toBeTruthy()
  return { authorization: `JWT ${token}` }
}
const list = async (request: Api, query: string, headers: Record<string, string> = {}) => {
  const res = await request.get(`/api/enquiries?limit=100&depth=0&${query}`, { headers })
  return { status: res.status(), body: await res.json() as { docs?: { formKey: string; campaignCode?: string }[]; totalDocs?: number } }
}

test('marketing can filter the enquiries list by formKey, campaignCode and dead deliveries', async ({ request }) => {
  const auth = await login(request, 'marketing')
  const get = (q: string) => list(request, q, auth)

  const byKey = await get(`where[formKey][equals]=zz-filter-a-${tag}`)
  expect(byKey.status).toBe(200)
  expect(byKey.body.docs!.map((d) => d.formKey)).toEqual([`zz-filter-a-${tag}`])

  const both = await get(`where[formKey][like]=zz-filter-&where[createdAt][greater_than]=${new Date(Date.now() - 600_000).toISOString()}`)
  expect(both.body.docs!.map((d) => d.formKey).sort()).toEqual([`zz-filter-a-${tag}`, `zz-filter-b-${tag}`])

  const byCode = await get(`where[campaignCode][equals]=zmniywrz&where[formKey][like]=zz-filter-`)
  expect(byCode.body.docs!.map((d) => d.formKey)).toEqual([`zz-filter-a-${tag}`])

  const dead = await get(`where[deliveries.status][equals]=dead&where[formKey][like]=zz-filter-`)
  expect(dead.body.docs!.map((d) => d.formKey)).toEqual([`zz-filter-a-${tag}`])

  const unknownCodes = await get(`where[campaignCode][equals]=unknown_code&where[formKey][like]=zz-filter-`)
  expect(unknownCodes.body.docs!.map((d) => d.campaignCode)).toEqual(['unknown_code'])
})

test('rows are read-only: marketing cannot create, update or delete; a viewer cannot read; anonymous cannot read', async ({ request, playwright, baseURL }) => {
  const auth = await login(request, 'marketing')
  expect((await request.post('/api/enquiries', { headers: auth, data: { submissionId: uuid(), formKey: 'x' } })).status()).toBeGreaterThanOrEqual(400)
  expect((await request.patch(`/api/enquiries/${ids[0]}`, { headers: auth, data: { status: 'delivered' } })).status()).toBeGreaterThanOrEqual(400)
  expect((await request.delete(`/api/enquiries/${ids[0]}`, { headers: auth })).status()).toBeGreaterThanOrEqual(400)
  expect((await payload.findByID({ collection: 'enquiries', id: ids[0], depth: 0, overrideAccess: true })).status).toBe('dead')

  const viewer = await playwright.request.newContext({ baseURL })
  const vAuth = await login(viewer, 'viewer')
  expect((await list(viewer, `where[formKey][equals]=zz-filter-a-${tag}`, vAuth)).status).toBe(403)
  const anon = await playwright.request.newContext({ baseURL })
  expect((await list(anon, '')).status).toBeGreaterThanOrEqual(401)
})
