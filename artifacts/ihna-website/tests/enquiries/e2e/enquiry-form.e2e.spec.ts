import { expect, test } from '@playwright/test'
import type { Payload } from 'payload'
import { boot, nonce, seed } from '../helpers'

// Submits the real EnquiryForm on the /contact/ page (the IHNA quick-enquiry form) and asserts the `enquiries` row and its deliveries
// (40 §8 check 8). Localhost only, DRY_RUN=1: the three quick-enquiry destinations (HubSpot, enquiries and admissions mail) are recorded, never sent.
let payload: Payload
const tag = nonce()
const path = '/contact/'
const emails: string[] = []

type Row = { id: number; status: string; formKey: string; email?: string; campaignCode?: string; pageUrl?: string; hutk?: string; utm?: Record<string, string | null>; deliveries?: { adapter: string; target: string; status: string; attempts: number; dryRunRequest?: unknown }[] }
const rowByEmail = async (email: string) => (await payload.find({ collection: 'enquiries', where: { email: { equals: email } }, limit: 1, depth: 0, overrideAccess: true })).docs[0] as unknown as Row | undefined

test.beforeAll(async () => {
  expect(process.env.DRY_RUN ?? '1', 'e2e must run with DRY_RUN=1').toBe('1')
  payload = await boot()
  await seed(payload)
  // The dev server may have a stale view of the form; make sure it sees the current definition.
  await fetch(`${process.env.PLAYWRIGHT_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'}/api/revalidate/`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-revalidate-secret': process.env.REVALIDATE_SECRET ?? '' }, body: JSON.stringify({ tags: ['form:quick-enquiry'] }) }).catch(() => {})
})

test.afterAll(async () => {
  if (!payload) return
  for (const email of emails) await payload.delete({ collection: 'enquiries', where: { email: { equals: email } }, overrideAccess: true }).catch(() => {})
})

test('required fields show inline errors and nothing is posted', async ({ page }) => {
  let posted = 0
  page.on('request', (r) => { if (r.url().includes('/api/enquire/')) posted++ })
  await page.goto(path, { timeout: 120_000 })
  await expect(page.getByRole('heading', { name: 'Send us a message' })).toBeVisible({ timeout: 120_000 })
  await page.getByRole('button', { name: 'Send enquiry' }).click()
  await expect(page.getByText('First name is required')).toBeVisible()
  await expect(page.getByText('Email is required')).toBeVisible()
  await expect(page.getByText('Phone is required')).toBeVisible()
  await expect(page.getByText('Choose a valid campus')).toBeVisible()
  expect(posted).toBe(0)
  expect(page.url()).toContain(path)
})

test('the honeypot field exists, sits off-screen, is aria-hidden and not focusable', async ({ page }) => {
  await page.goto(path)
  const hp = page.locator('input[name="_hp_url"]')
  await expect(hp).toHaveCount(1)
  const box = await hp.boundingBox()
  expect(box === null || box.x < -1000).toBe(true) // off-screen: a person never sees or reaches it
  await expect(hp).toHaveAttribute('tabindex', '-1')
  expect(await hp.evaluate((el) => !!el.closest('[aria-hidden="true"]'))).toBe(true)
})

test('a save failure shows a user-safe error and keeps the visitor on the form', async ({ page }) => {
  await page.route('**/api/enquire/', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'save_failed', message: 'We could not save your enquiry. Please try again in a moment, or contact us by phone or email.' }) }))
  await page.goto(path)
  const email = `e2e-fail-${tag}@example.test`
  await fillValid(page, email)
  await page.getByRole('button', { name: 'Send enquiry' }).click()
  await expect(page.getByTestId('enquiry-error')).toContainText('could not save your enquiry')
  expect(page.url()).toContain(path)
  expect(await rowByEmail(email)).toBeUndefined()
})

test('submitting the EnquiryForm stores one row, carries attribution, delivers, and navigates to the server-returned thank-you', async ({ page }) => {
  const email = `e2e-${tag}@example.test`
  emails.push(email)
  let request: { postData: string } | null = null
  let response: { status: number; body: { ok: boolean; thankYouPath: string; enquiryId: string } } | null = null
  page.on('request', (r) => { if (r.url().includes('/api/enquire/') && r.method() === 'POST') request = { postData: r.postData() ?? '' } })
  page.on('response', async (r) => { if (r.url().includes('/api/enquire/') && r.request().method() === 'POST') response = { status: r.status(), body: await r.json() } })

  await page.goto(`${path}?campaign=z29vz2fkcw&utm_source=google&utm_medium=cpc&gclid=t1`, { timeout: 120_000 })
  await fillValid(page, email)
  await page.getByRole('button', { name: 'Send enquiry' }).click()

  await page.waitForURL(/\/quick-enquiry-thanks\//, { timeout: 60_000 })
  expect(new URL(page.url()).searchParams.get('campaign_id')).toBe('z29vz2fkcw')

  const sent = JSON.parse((request as unknown as { postData: string }).postData) as Record<string, unknown>
  expect(sent).toMatchObject({ formKey: 'quick-enquiry', campaign: 'z29vz2fkcw', utm_source: 'google', utm_medium: 'cpc', gclid: 't1', _hp_url: '' })
  expect(sent.submissionId).toMatch(/^[0-9a-f-]{36}$/)
  expect(sent.pageUrl).toContain(path)
  expect(sent).not.toHaveProperty('thankYouPath')
  expect(response).toMatchObject({ status: 200, body: { ok: true } })

  const row = await rowByEmail(email)
  expect(row, 'an enquiries row exists').toBeTruthy()
  expect(row).toMatchObject({ formKey: 'quick-enquiry', campaignCode: 'z29vz2fkcw' })
  expect(row!.utm).toMatchObject({ utmSource: 'google', utmMedium: 'cpc', gclid: 't1' })
  expect(row!.pageUrl).toContain(path)

  // N deliveries = the form's unconditional destinations (an ordinary course). The dev server runs the job right after the response.
  await expect.poll(async () => (await rowByEmail(email))?.deliveries?.filter((d) => d.status === 'dry_run').length, { timeout: 90_000, intervals: [1000, 2000, 3000] }).toBe(3)
  const done = (await rowByEmail(email))!
  expect(done.status).toBe('delivered')
  expect(done.deliveries!.map((d) => `${d.adapter}:${d.target}`).sort()).toEqual(['email:admissions', 'email:enquiries', 'hubspot:contacts'])
  const hs = done.deliveries!.find((d) => d.adapter === 'hubspot')!.dryRunRequest as { requests: { body: { inputs: { properties: Record<string, string> }[] } }[] }
  // gaperth-style codes come from the campaign table; an unknown code falls back to the form's `default` row ("IHNA Website")
  expect(hs.requests[0].body.inputs[0].properties).toMatchObject({ email, course: ';HLT54121', campaign_source: 'IHNA Website' })

  // the same submission posted again is one row (idempotent)
  const again = await page.request.post('/api/enquire/', { data: { ...sent, submissionId: sent.submissionId }, headers: { 'content-type': 'application/json' } })
  expect((await again.json()).duplicate).toBe(true)
  const all = await payload.find({ collection: 'enquiries', where: { email: { equals: email } }, overrideAccess: true, limit: 5 })
  expect(all.totalDocs).toBe(1)
})

async function fillValid(page: import('@playwright/test').Page, email: string) {
  await page.getByLabel('First name').fill('Playwright')
  await page.getByLabel('Last name').fill('Tester')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Phone').fill('+61 400 000 000')
  await pick(page, /^Campus/, /Melbourne/)
  await pick(page, /^Course of interest/, /^HLT54121 – Diploma of Nursing$/)
  await pick(page, /^Where did you hear about us/, /.+/)
}

/** A shadcn (Radix) select: open the combobox, choose the first option matching `option`. */
async function pick(page: import('@playwright/test').Page, label: RegExp, option: RegExp) {
  await page.getByRole('combobox', { name: label }).click()
  await page.getByRole('option', { name: option }).first().click()
}
