import 'dotenv/config' // the happy-dom config has no setup file that loads .env; Payload needs DATABASE_URL and PAYLOAD_SECRET
import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { html } from '../templates/html'
import { handleFakeDecision } from '@/lib/payments/handlers'
import { boot, closePortal, invoiceBody, removePayments, start, usePaymentsEnv } from './helpers'

// The payment pages rendered with real data (Payload + products) but without a server: page modules are called directly and their
// markup inspected. Runs under tests/blocks/vitest.config.mts (happy-dom). The data layer is covered by the node tests next to it.
vi.mock('@/components/data/globals', () => ({ getAllowedEmbedHosts: async () => [], getHeader: async () => ({}), getFooter: async () => ({}), getSiteSettings: async () => ({ phone: '1800 000 000', email: 'hello@example.test' }) }))
vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.200' }) }))
vi.mock('next/navigation', async (orig) => ({ ...(await orig<typeof import('next/navigation')>()), redirect: (to: string) => { throw new Error(`REDIRECT:${to}`) }, useRouter: () => ({ push: () => {}, replace: () => {} }) }))
vi.mock('@/blocks/enquiryForm/Component', () => ({ EnquiryForm: () => <div /> }))

const created: string[] = []
let payload: Payload
const deps = { queueAfter: async () => {} }

beforeAll(async () => { usePaymentsEnv(); payload = await boot() })
beforeEach(() => usePaymentsEnv())
afterAll(async () => { await removePayments(payload, created); await closePortal() })

const sp = (o: Record<string, string> = {}) => Promise.resolve(o)

describe('/pay-online/ (the pay form)', () => {
  it('renders the invoice form (amount field, one h1); products are offered in the product mode', async () => {
    const { default: Page } = await import('@/app/(site)/pay-online/page')
    const out = await html(await Page({ searchParams: sp() }))
    expect(out).toContain('data-testid="pay-form"')
    expect(out).toContain('name="amount"')
    const options = [...out.matchAll(/<option value="(e2-[a-z0-9-]+)"/g)].map((m) => m[1])
    expect(options).toHaveLength(0) // products are in the select only after the product mode is chosen
    expect((out.match(/<h1[ >]/g) ?? []).length).toBe(1)
  })

  it('?e2btn=1&gateway=securepay opens the product mode with the product, its price and no amount field', async () => {
    const { default: Page } = await import('@/app/(site)/pay-online/page')
    const out = await html(await Page({ searchParams: sp({ e2btn: '1', gateway: 'securepay' }) }))
    expect(out).toContain('IELTS Academic preparation package ($150.00)')
    expect(out.match(/<option value="e2-/g)).toHaveLength(12)
    expect(out).toContain('data-testid="product-price"')
    expect(out).not.toContain('name="amount"')
  })

  it('invoice_id pre-fills the invoice number only', async () => {
    const { default: Page } = await import('@/app/(site)/pay-online/page')
    const out = await html(await Page({ searchParams: sp({ invoice_id: 'INV-123' }) }))
    expect(out).toContain('value="INV-123"')
    expect((await html(await Page({ searchParams: sp({ invoice_id: '<script>' }) }))).includes('<script>alert')).toBe(false)
  })

  it('is noindex and never cached', async () => {
    const mod = await import('@/app/(site)/pay-online/page')
    expect(mod.dynamic).toBe('force-dynamic')
    expect(mod.metadata.robots).toEqual({ index: false, follow: false })
  })

  it('a portal-signed invoice link pre-fills the invoice number and amount due; a bad signature only the raw value', async () => {
    const { invoiceLinkSignature } = await import('@/lib/portal/ihna')
    Object.assign(process.env, { PORTAL_ENABLED: '1', PORTAL_INVOICE_LINK_KEY: 'pages-test-key' })
    try {
      const { default: Page } = await import('@/app/(site)/pay-online/page')
      const exp = Math.floor(Date.now() / 1000) + 3600
      const ok = await html(await Page({ searchParams: sp({ invoice_id: '9901', exp: String(exp), sig: invoiceLinkSignature(9901, exp, 'pages-test-key') }) }))
      expect(ok).toContain('value="FIX-INV-9901"')
      expect(ok).toContain('value="1218.51"')
      const bad = await html(await Page({ searchParams: sp({ invoice_id: '9901', exp: String(exp), sig: invoiceLinkSignature(9902, exp, 'pages-test-key') }) }))
      expect(bad).not.toContain('FIX-INV-9901')
      expect(bad).not.toContain('1218.51')
      expect(bad).not.toContain('value="9901"') // an unsigned bare number is a portal row id, never the invoice number
      const expired = Math.floor(Date.now() / 1000) - 60
      const old = await html(await Page({ searchParams: sp({ invoice_id: '9901', exp: String(expired), sig: invoiceLinkSignature(9901, expired, 'pages-test-key') }) }))
      expect(old).not.toContain('FIX-INV-9901')
      const typed = await html(await Page({ searchParams: sp({ invoice_id: 'INV-2026-77' }) }))
      expect(typed).toContain('value="INV-2026-77"')

      // the chooser passes the signed link on to the pay form, so the prefill survives /payment-options/
      const { default: Chooser } = await import('@/app/(site)/payment-options/page')
      const sig = invoiceLinkSignature(9901, exp, 'pages-test-key')
      const chooser = await html(await Chooser({ searchParams: Promise.resolve({ invoice_id: '9901', exp: String(exp), sig }) }))
      expect(chooser).toContain(`invoice_id=9901&amp;exp=${exp}&amp;sig=${sig}`)
    } finally {
      process.env.PORTAL_ENABLED = '0'
      delete process.env.PORTAL_INVOICE_LINK_KEY
    }
  })
})

describe('IHNA payment URLs (45-payments §5)', () => {
  it('/secure-pay/ and /airwallex/ are the pay form with their gateway preselected', async () => {
    for (const [route, gw] of [['secure-pay', 'securepay'], ['airwallex', 'airwallex']] as const) {
      const mod = await import(`@/app/(site)/${route}/page`)
      const out = await html(await mod.default({ searchParams: sp() }))
      expect(out).toContain('data-testid="pay-form"')
      expect(out).toMatch(new RegExp(`value="${gw}"[^>]*checked|checked[^>]*value="${gw}"`))
      expect(mod.metadata.robots).toEqual({ index: false, follow: false })
    }
  })

  it.each(['secure-pay-card-dcc', 'airwallex-checkout', 'secure-pay-response', 'payway-response'])('/%s/ is an info page pointing at Payment options', async (route) => {
    const mod = await import(`@/app/(site)/${route}/page`)
    const out = await html(await mod.default())
    expect(out).toContain('href="/payment-options/"')
    expect(out).toContain('href="/pay-online/"')
    expect(mod.metadata.robots).toEqual({ index: false, follow: false })
  })

  it('/makepayment/ is not an IHNA page (404 on the live site)', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    expect(fs.existsSync(path.resolve(__dirname, '../../src/app/(site)/makepayment'))).toBe(false)
  })
})

describe('/payment-options/', () => {
  it('lists PayWay, SecurePay and Airwallex into /pay-online/ and Convera and Flywire as plain links', async () => {
    const { default: Page } = await import('@/app/(site)/payment-options/page')
    const out = await html(await Page({ searchParams: sp({ invoice_id: 'INV-9' }) }))
    expect(out).toContain('href="/pay-online/?gateway=payway&amp;invoice_id=INV-9"')
    expect(out).toContain('href="/pay-online/?gateway=securepay&amp;invoice_id=INV-9"')
    expect(out).toContain('href="/pay-online/?gateway=airwallex&amp;invoice_id=INV-9"')
    expect(out).toContain('href="https://students.convera.com/ihna#!/"')
    expect(out).toContain('href="https://ihna.flywire.com"')
  })

  it.each([1, 6, 7, 12])('?e2btn=%i is 200, names the product, offers only its gateways and hides Convera and Flywire and PayWay', async (n) => {
    const { default: Page } = await import('@/app/(site)/payment-options/page')
    const out = await html(await Page({ searchParams: sp({ e2btn: String(n) }) }))
    expect(out).toContain('data-testid="chooser-product"')
    expect(out).toContain(`e2btn=${n}`)
    expect(out).toContain('gateway=securepay')
    expect(out).toContain('gateway=airwallex')
    expect(out).not.toContain('gateway=payway')
    expect(out).not.toContain('convera')
    expect(out).not.toContain('flywire')
  })

  it('ignores a bad e2btn and a bad invoice_id', async () => {
    const { default: Page } = await import('@/app/(site)/payment-options/page')
    const out = await html(await Page({ searchParams: sp({ e2btn: '99', invoice_id: '../../etc' }) }))
    expect(out).not.toContain('data-testid="chooser-product"')
    expect(out).not.toContain('invoice_id=')
  })
})

describe('/pay/* pages', () => {
  it('the receipt page: right email shows it with the amount; a wrong email, an unknown id and a bad id are all the same 404', async () => {
    const { default: Receipt } = await import('@/app/(site)/pay/receipt/[uuid]/page')
    const body = invoiceBody({ gateway: 'securepay', amount: '77.00', payerEmail: 'receipt.page@example.test' })
    const r = await start(payload, body, {}, undefined, created)
    await handleFakeDecision(payload, r.paymentId, 'approve', {}, deps)
    const ok = await html(await Receipt({ params: Promise.resolve({ uuid: r.paymentId }), searchParams: Promise.resolve({ e: 'receipt.page@example.test' }) }))
    expect(ok).toContain('data-testid="receipt"')
    expect(ok).toContain('$77.00')
    for (const [uuid, e] of [[r.paymentId, 'wrong@example.test'], [crypto.randomUUID(), 'receipt.page@example.test'], ['12', 'receipt.page@example.test'], [r.paymentId, undefined]] as const) {
      await expect(Receipt({ params: Promise.resolve({ uuid }), searchParams: Promise.resolve({ e }) })).rejects.toMatchObject({ digest: expect.stringContaining('404') })
    }
    const mod = await import('@/app/(site)/pay/receipt/[uuid]/page')
    expect(mod.metadata.robots).toEqual({ index: false, follow: false })
    expect(mod.dynamic).toBe('force-dynamic')
  })

  it('the result page shows the status and no personal data', async () => {
    const { default: Result } = await import('@/app/(site)/pay/result/[uuid]/page')
    const body = invoiceBody({ gateway: 'securepay', amount: '31.00', payerEmail: 'result.page@example.test', payerName: 'Zed Resultpage' })
    const r = await start(payload, body, {}, undefined, created)
    const out = await html(await Result({ params: Promise.resolve({ uuid: r.paymentId }) }))
    expect(out).toContain('data-status="pending"')
    expect(out).not.toContain('result.page@example.test')
    expect(out).not.toContain('Zed Resultpage')
    await expect(Result({ params: Promise.resolve({ uuid: 'nope' }) })).rejects.toMatchObject({ digest: expect.stringContaining('404') })
  })

  it('the fake gateway page shows Approve, Decline and Abandon in dev and is a 404 in production', async () => {
    const { default: Fake } = await import('@/app/(site)/pay/fake/[uuid]/page')
    const r = await start(payload, invoiceBody({ amount: '12.00' }), {}, undefined, created)
    const out = await html(await Fake({ params: Promise.resolve({ uuid: r.paymentId }) }))
    expect(out).toContain('value="approve"')
    expect(out).toContain('value="decline"')
    expect(out).toContain('value="abandon"')
    expect(out).toContain('$12.00')
    const env = process.env as Record<string, string | undefined>
    const prev = env.NODE_ENV
    env.NODE_ENV = 'production'
    env.PAYMENTS_GATEWAY_MODE = 'real'
    try {
      await expect(Fake({ params: Promise.resolve({ uuid: r.paymentId }) })).rejects.toMatchObject({ digest: expect.stringContaining('404') })
    } finally { env.NODE_ENV = prev }
  })

  it('the SecurePay and Airwallex pages send a settled payment to its result and a fake-mode payment to the fake gateway', async () => {
    const { default: Sp } = await import('@/app/(site)/pay/securepay/[uuid]/page')
    const { default: Aw } = await import('@/app/(site)/pay/airwallex/[uuid]/page')
    const a = await start(payload, invoiceBody({ gateway: 'securepay' }), {}, undefined, created)
    await expect(Sp({ params: Promise.resolve({ uuid: a.paymentId }) })).rejects.toThrow(`REDIRECT:/pay/fake/${a.paymentId}/`)
    const b = await start(payload, invoiceBody({ gateway: 'airwallex' }), {}, undefined, created)
    await handleFakeDecision(payload, b.paymentId, 'approve', {}, deps)
    await expect(Aw({ params: Promise.resolve({ uuid: b.paymentId }) })).rejects.toThrow(`REDIRECT:/pay/result/${b.paymentId}/`)
    await expect(Sp({ params: Promise.resolve({ uuid: b.paymentId }) })).rejects.toMatchObject({ digest: expect.stringContaining('404') }) // an airwallex payment is not a securepay page
  })
})
