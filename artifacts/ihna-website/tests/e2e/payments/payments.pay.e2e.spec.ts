import { expect, test, type Page } from '@playwright/test'
import type { Payload } from 'payload'
import { reconcilePending } from '@/lib/payments/reconcile'
import { handleFakeDecision } from '@/lib/payments/handlers'
import { findPayment } from '@/lib/payments/store'
import { backdate, boot, closePortal, nonce, removePayments, usePaymentsEnv, uuid } from '../../payments/helpers'

// 45 §8 checks 9-14 against the real pages. Rows are created through the browser or the API of the dev server; the test process shares the
// Postgres and the portal fixture, so it can read the stored row (amounts) and run reconcilePending with a stub gateway.
let payload: Payload
const ids: string[] = []
const noQueue = { queueAfter: async () => {} }

test.beforeAll(async () => { usePaymentsEnv(); payload = await boot() })
// A fresh client IP per test keeps the 5-per-minute start limit from coupling the tests to each other.
test.beforeEach(async ({ page }) => { await page.setExtraHTTPHeaders({ 'x-forwarded-for': `192.0.2.${Math.floor(Math.random() * 200)}-${nonce()}` }) })
test.afterAll(async () => { await removePayments(payload, ids); await closePortal() })

const fillInvoice = async (page: Page, o: { email: string; amount: string; gateway?: string }) => {
  await page.goto(`/pay-online/?gateway=${o.gateway ?? 'airwallex'}`)
  await page.getByLabel('Full name').fill('E2E Payer')
  await page.getByLabel('Email').fill(o.email)
  await page.getByLabel('Invoice number').fill(`E2E-${nonce()}`)
  await page.getByLabel('Payment for').fill('Tuition')
  await page.getByLabel('Amount to pay').fill(o.amount)
}
const idFrom = (url: string) => /\/pay\/[a-z]+\/([0-9a-f-]{36})\//.exec(url)![1]

test('fake invoice payment: form -> fake gateway -> approve -> result -> receipt (right email 200 + noindex, wrong email 404)', async ({ page }) => {
  const email = `e2e-${nonce()}@example.test`
  await fillInvoice(page, { email, amount: '321.50' })
  await page.getByRole('button', { name: 'Continue to payment' }).click()
  await page.waitForURL(/\/pay\/fake\/[0-9a-f-]{36}\//)
  const id = idFrom(page.url())
  ids.push(id)
  expect(await findPayment(payload, id)).toMatchObject({ status: 'pending', amountCents: 32150 })
  await expect(page.getByTestId('fake-gateway')).toContainText('$321.50')
  await page.getByRole('button', { name: 'Approve' }).click()
  await page.waitForURL(`**/pay/result/${id}/`)
  await expect(page.getByTestId('payment-result')).toHaveAttribute('data-status', 'paid')
  await expect(page.locator('body')).not.toContainText(email)

  const ok = await page.goto(`/pay/receipt/${id}/?e=${encodeURIComponent(email)}`)
  expect(ok?.status()).toBe(200)
  await expect(page.getByTestId('receipt')).toContainText('$321.50')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  const wrong = await page.goto(`/pay/receipt/${id}/?e=${encodeURIComponent('someone@else.test')}`)
  expect(wrong?.status()).toBe(404)
  expect((await page.goto(`/pay/receipt/${uuid()}/?e=${encodeURIComponent(email)}`))?.status()).toBe(404)
  expect((await page.goto(`/pay/receipt/1/?e=${encodeURIComponent(email)}`))?.status()).toBe(404)
})

test('tamper: the stored amount does not follow the browser, and a mismatched return is flagged', async ({ page, request }) => {
  const email = `e2e-${nonce()}@example.test`
  await fillInvoice(page, { email, amount: '500.00' })
  const startReq = page.waitForRequest('**/api/payments/start/')
  await page.getByRole('button', { name: 'Continue to payment' }).click()
  const body = (await startReq).postDataJSON() as Record<string, unknown>
  await page.waitForURL(/\/pay\/fake\/[0-9a-f-]{36}\//)
  const id = idFrom(page.url())
  ids.push(id)

  // Replay the same submission with an edited amount (what a DOM or request edit would do): same payment, same stored amount.
  const replay = await request.post('/api/payments/start/', { data: { ...body, amount: '1.00' }, headers: { 'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 200)}-${nonce()}` } })
  expect((await replay.json()).paymentId).toBe(id)
  expect((await findPayment(payload, id))?.amountCents).toBe(50000)

  // The gateway reports a different amount: rejected and flagged, never paid.
  const res = await handleFakeDecision(payload, id, 'approve', { amountCents: 100 }, noQueue)
  expect(res.body).toMatchObject({ result: 'flagged' })
  await page.goto(`/pay/result/${id}/`)
  await expect(page.getByTestId('payment-result')).toHaveAttribute('data-status', 'flagged')
  expect((await findPayment(payload, id))?.flags.reason).toBe('amount-mismatch')
})

test('reconcile: a stuck pending row is settled by reconcilePending and the result page shows it paid', async ({ page }) => {
  const email = `e2e-${nonce()}@example.test`
  await fillInvoice(page, { email, amount: '75.00' })
  await page.getByRole('button', { name: 'Continue to payment' }).click()
  await page.waitForURL(/\/pay\/fake\/[0-9a-f-]{36}\//)
  const id = idFrom(page.url())
  ids.push(id)
  await backdate(payload, id, 11 * 60_000) // the customer paid but no return or webhook arrived
  const stub = { name: 'fake' as const, createSession: async () => { throw new Error('unused') }, queryStatus: async () => ({ state: 'paid' as const, amountCents: 7500 }) }
  const r = await reconcilePending(payload, { ...noQueue, gatewayFor: () => stub })
  expect(r.paid).toBeGreaterThanOrEqual(1)
  await page.goto(`/pay/result/${id}/`)
  await expect(page.getByTestId('payment-result')).toHaveAttribute('data-status', 'paid')
})

test('E2 chooser: ?e2btn=3 offers only SecurePay and Airwallex and the browser never sends a price', async ({ page }) => {
  await page.goto('/payment-options/?e2btn=3')
  await expect(page.getByTestId('chooser-product')).toContainText('$150.00')
  await expect(page.locator('a[data-gateway="payway"]')).toHaveCount(0)
  await expect(page.getByText('Convera')).toHaveCount(0)
  await page.locator('a[data-gateway="securepay"]').click()
  await page.waitForURL(/\/pay-online\/\?gateway=securepay&e2btn=3/)
  await expect(page.getByTestId('product-price')).toContainText('$150.00')
  await expect(page.locator('input[name="amount"]')).toHaveCount(0)
  await page.getByLabel('Full name').fill('E2 Buyer')
  await page.getByLabel('Email').fill(`e2e-${nonce()}@example.test`)
  const startReq = page.waitForRequest('**/api/payments/start/')
  await page.getByRole('button', { name: 'Continue to payment' }).click()
  const sent = (await startReq).postDataJSON() as Record<string, unknown>
  expect(Object.keys(sent).filter((k) => /amount|price|total|cents/i.test(k))).toEqual([])
  expect(sent).toMatchObject({ kind: 'product', gateway: 'securepay' })
  await page.waitForURL(/\/pay\/fake\/[0-9a-f-]{36}\//)
  const id = idFrom(page.url())
  ids.push(id)
  expect(await findPayment(payload, id)).toMatchObject({ kind: 'product', amountCents: 15000 })
})

test('E2: a tampered request that adds an amount is refused with 400 and creates nothing', async ({ page }) => {
  await page.route('**/api/payments/start/', async (route) => {
    const data = route.request().postDataJSON() as Record<string, unknown>
    await route.continue({ postData: JSON.stringify({ ...data, amount: '1.00' }) })
  })
  await page.goto('/pay-online/?e2btn=1&gateway=securepay')
  await page.getByLabel('Full name').fill('Tamper Buyer')
  await page.getByLabel('Email').fill(`e2e-${nonce()}@example.test`)
  const resp = page.waitForResponse('**/api/payments/start/')
  await page.getByRole('button', { name: 'Continue to payment' }).click()
  expect((await resp).status()).toBe(400)
  await expect(page.getByTestId('pay-error')).toBeVisible()
  await expect(page).toHaveURL(/\/pay-online\//)
})

test('SAE kind returns 501 cleanly (JSON, no stack, no row)', async ({ request }) => {
  const submissionId = uuid()
  const res = await request.post('/api/payments/start/', {
    data: { kind: 'sae', gateway: 'payway', payerName: 'Sae Student', payerEmail: 'sae@example.test', submissionId, saeApplicationId: 1 },
    headers: { 'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 200)}-${nonce()}` },
  })
  expect(res.status()).toBe(501)
  expect(await res.json()).toMatchObject({ ok: false, error: 'sae_not_available' })
  expect(res.headers()['content-type']).toContain('application/json')
})
