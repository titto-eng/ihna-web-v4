import { expect, test, type Page } from '@playwright/test'
import type { Payload } from 'payload'
import { handleAirwallexWebhook, handlePaywayReturn } from '@/lib/payments/handlers'
import { findPayment } from '@/lib/payments/store'
import { airwallexSigned, boot, closePortal, nonce, paywayReturn, removePayments, usePaymentsEnv } from '../../payments/helpers'

// IHNA payment URLs end to end (45-payments §5, §8): every live payment URL answers its status; payments are created through the IHNA pay
// form on the dev server (PAYMENTS_GATEWAY_MODE=fake, DRY_RUN=1). The PayWay return and the Airwallex webhook need the gateway secrets,
// which the dev server's `.env` does not hold: as in the other payment tests, the test process sets the test PAYWAY_ENCRYPTION_KEY and
// AIRWALLEX_WEBHOOK_SECRET (usePaymentsEnv) and settles through the same handlers in-process, while the requests to the dev server
// prove the old URLs (/payway-response/, /airwallex-webhook with and without the slash) reach those handlers.
let payload: Payload
const ids: string[] = []
const noQueue = { queueAfter: async () => {} } // afterPaid is not run by the test process

test.beforeAll(async () => { usePaymentsEnv(); payload = await boot() })
test.beforeEach(async ({ page }) => { await page.setExtraHTTPHeaders({ 'x-forwarded-for': `192.0.2.${Math.floor(Math.random() * 200)}-${nonce()}` }) })
test.afterAll(async () => { await removePayments(payload, ids); await closePortal() })

const idFrom = (url: string) => /\/pay\/[a-z]+\/([0-9a-f-]{36})\//.exec(url)![1]

async function payInvoice(page: Page, path: string, o: { email: string; amount: string }) {
  await page.goto(path)
  await page.getByLabel('Full name').fill('IHNA E2E Payer')
  await page.getByLabel('Email').fill(o.email)
  await page.getByLabel('Invoice number').fill(`IHNA-${nonce()}`)
  await page.getByLabel('Payment for').fill('Diploma Program')
  await page.getByLabel('Amount to pay').fill(o.amount)
  await page.getByRole('button', { name: 'Continue to payment' }).click()
  await page.waitForURL(/\/pay\/fake\/[0-9a-f-]{36}\//)
  const id = idFrom(page.url())
  ids.push(id)
  return id
}

test('every IHNA payment URL answers its status (no IHM 301s; /makepayment/ stays 404)', async ({ request }) => {
  const expected: [string, number][] = [
    ['/pay-online/', 200], ['/payment-options/', 200], ['/secure-pay/', 200], ['/airwallex/', 200], ['/secure-pay-card-dcc/', 200],
    ['/airwallex-checkout/', 200], ['/secure-pay-response/', 200], ['/payway-response/', 200], ['/airwallex-webhook/', 200],
    ['/pay-online-error/', 200], ['/commonwealth-prac-payment/', 200], ['/makepayment/', 404],
    ['/secure-pay-card-dcc/?id=1&data=eyJ4IjoxfQ==', 200], ['/secure-pay-response/?id=1', 200],
  ]
  for (const [path, status] of expected) {
    const res = await request.get(path, { maxRedirects: 0 })
    expect(res.status(), path).toBe(status)
  }
})

test('/secure-pay/ preselects SecurePay: fake -> approve -> paid -> receipt (right email 200, wrong email 404)', async ({ page }) => {
  await page.goto('/secure-pay/')
  await expect(page.locator('input[name="gateway"][value="securepay"]')).toBeChecked()
  const email = `ihna-sp-${nonce()}@example.test`
  const id = await payInvoice(page, '/secure-pay/', { email, amount: '210.00' })
  const row = await findPayment(payload, id)
  expect(row).toMatchObject({ status: 'pending', gateway: 'securepay', amountCents: 21000 })
  await page.getByRole('button', { name: 'Approve' }).click()
  await page.waitForURL(`**/pay/result/${id}/`)
  await expect(page.getByTestId('payment-result')).toHaveAttribute('data-status', 'paid')
  expect((await page.goto(`/pay/receipt/${id}/?e=${encodeURIComponent(email)}`))?.status()).toBe(200)
  await expect(page.getByTestId('receipt')).toContainText('$210.00')
  expect((await page.goto(`/pay/receipt/${id}/?e=${encodeURIComponent('other@example.test')}`))?.status()).toBe(404)
})

test('/airwallex/ preselects Airwallex; /airwallex-webhook (with and without the slash) reaches the webhook; settles once; a tampered amount is flagged', async ({ page, request }) => {
  await page.goto('/airwallex/')
  await expect(page.locator('input[name="gateway"][value="airwallex"]')).toBeChecked()
  const id = await payInvoice(page, '/airwallex/', { email: `ihna-aw-${nonce()}@example.test`, amount: '99.95' })
  expect(await findPayment(payload, id)).toMatchObject({ status: 'pending', gateway: 'airwallex', amountCents: 9995 })

  // The old URL is the webhook for POST, also without the trailing slash (no 308: a webhook sender does not follow it). A wrongly
  // signed event is refused by the handler itself, whatever secret the dev server holds.
  const bad = airwallexSigned({ id: `evt_${nonce()}`, name: 'payment_intent.succeeded' }, { secret: 'not-the-secret' })
  for (const path of ['/airwallex-webhook/', '/airwallex-webhook']) {
    const res = await request.post(path, { data: bad.rawBody, headers: { 'content-type': 'application/json', 'x-timestamp': bad.timestamp, 'x-signature': bad.signature }, maxRedirects: 0 })
    expect(res.status(), path).toBe(401)
    expect(await res.json()).toMatchObject({ error: 'invalid_signature' })
  }
  expect((await request.get('/airwallex-webhook', { maxRedirects: 0 })).status()).toBe(308) // other methods keep the slash redirect

  const event = { id: `evt_${crypto.randomUUID()}`, name: 'payment_intent.succeeded', created_at: new Date().toISOString(), data: { object: { id: `int_${nonce()}`, merchant_order_id: id, status: 'SUCCEEDED', amount: 99.95, captured_amount: 99.95, metadata: { paymentId: id } } } }
  const hook = (e: unknown) => handleAirwallexWebhook(payload, airwallexSigned(e), noQueue)
  expect((await hook(event)).status).toBe(200)
  expect((await hook(event)).status).toBe(200) // replay: no second transition
  expect((await findPayment(payload, id))?.status).toBe('paid')

  // The browser cannot change what is charged: a gateway report for another amount is flagged, never paid.
  const id2 = await payInvoice(page, '/airwallex/', { email: `ihna-aw2-${nonce()}@example.test`, amount: '500.00' })
  const low = { ...event, id: `evt_${crypto.randomUUID()}`, data: { object: { ...event.data.object, merchant_order_id: id2, amount: 1, captured_amount: 1, metadata: { paymentId: id2 } } } }
  expect((await hook(low)).status).toBe(200)
  expect(await findPayment(payload, id2)).toMatchObject({ status: 'flagged', amountCents: 50000 })
})

test('PayWay: /pay-online/?gateway=payway -> the return at /payway-response/ reaches the handler -> paid; bad signature 400', async ({ page, request }) => {
  const id = await payInvoice(page, '/pay-online/?gateway=payway', { email: `ihna-pw-${nonce()}@example.test`, amount: '150.00' })
  const row = await findPayment(payload, id)
  expect(row).toMatchObject({ status: 'pending', gateway: 'payway', amountCents: 15000 })
  expect(row?.flags.payway?.provider).toBeUndefined() // IHNA sends no provider: callbacks go to PORTAL_IHNA_URL
  const q = paywayReturn({ PaymentID: id, payment_amount: '150.00', response_code: '08', payment_number: `PN${nonce()}`, payment_status: 'approved', type: 'general', StudentName: 'IHNA E2E Payer' })
  const tampered = { ...q, Signature: `${q.Signature.slice(0, -4)}AAAA` }

  // With signed parameters /payway-response/ is the return handler, not the info page (200): a tampered signature is 400 there.
  const routed = await request.get(`/payway-response/?${new URLSearchParams(tampered).toString()}`, { maxRedirects: 0 })
  expect(routed.status()).toBe(400)
  expect(await routed.text()).toMatch(/could not be verified/i)
  expect((await request.get('/payway-response/', { maxRedirects: 0 })).status()).toBe(200)

  // The same handler with the test key settles it and sends the browser to the result page.
  const out = await handlePaywayReturn(payload, q, noQueue)
  expect(out).toEqual({ redirect: `/pay/result/${id}/` })
  expect((await findPayment(payload, id))?.status).toBe('paid')
  expect(await handlePaywayReturn(payload, tampered, noQueue)).toMatchObject({ status: 400 })
  await page.goto(`/pay/result/${id}/`)
  await expect(page.getByTestId('payment-result')).toHaveAttribute('data-status', 'paid')
})
