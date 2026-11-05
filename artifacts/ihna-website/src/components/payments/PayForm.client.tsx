'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatAud } from '@/lib/payments/money'
import { paymentSite } from '@/content/payments'
import { site } from '@/content/site'

// The pay page form (45 §4; the path is paymentSite.payPath). It never sends an amount for a product, and an invoice amount is only what the payer typed:
// the server parses it, stores it and signs it. Product prices shown here are display only and are re-read on the server.
export type PayProduct = { id: number; sku: string; name: string; kind: 'prep-package' | 'mock-test'; priceCents: number; legacyE2Btn: number | null; gateways: string[] }
type Gateway = 'payway' | 'securepay' | 'airwallex'
const GATEWAY_LABEL: Record<Gateway, string> = { payway: 'PayWay (card)', securepay: 'SecurePay (card)', airwallex: 'Airwallex (card and wallets)' }
const PAYMENT_FOR = paymentSite.paymentFor

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
declare global {
  interface Window { grecaptcha?: { ready: (cb: () => void) => void; execute: (key: string, o: { action: string }) => Promise<string> } }
}
function loadRecaptcha() {
  if (!SITE_KEY || typeof document === 'undefined' || document.getElementById('recaptcha-v3')) return
  const s = document.createElement('script')
  s.id = 'recaptcha-v3'
  s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(SITE_KEY)}`
  s.async = true
  document.head.appendChild(s)
}
async function captchaToken(): Promise<string | undefined> {
  if (!SITE_KEY || !window.grecaptcha) return undefined
  try {
    return await new Promise<string>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('captcha timeout')), 4000)
      window.grecaptcha!.ready(() => window.grecaptcha!.execute(SITE_KEY, { action: 'enquire' }).then((v) => { clearTimeout(t); resolve(v) }, reject))
    })
  } catch { return undefined }
}

/** Only a same-site path or an https URL (the hosted gateway page) may be followed. The server chose it; this is a second lock. */
export function safeNext(url: unknown): string | null {
  if (typeof url !== 'string') return null
  if (/^\/(?!\/)[^\s\\]*$/.test(url)) return url
  return /^https:\/\/[^\s\\]+$/.test(url) ? url : null
}

/** `initialAmount`: the amount due from a portal-signed invoice link (server-read); the payer can still change it, and the server re-parses it. */
type Props = { products: PayProduct[]; initialGateway?: string; initialE2btn?: number | null; initialInvoice?: string; initialAmount?: string; className?: string }

export function PayForm({ products, initialGateway, initialE2btn, initialInvoice, initialAmount, className }: Props) {
  const router = useRouter()
  // `?e2btn=N` presets the product with that old button number; without it (or a product without a number) nothing is preset
  const preset = initialE2btn != null ? (products.find((p) => p.legacyE2Btn != null && p.legacyE2Btn === initialE2btn) ?? null) : null
  const [mode, setMode] = useState<'invoice' | 'product'>(preset ? 'product' : 'invoice')
  const [productSku, setProductSku] = useState(preset?.sku ?? '')
  const [chosen, setGateway] = useState<Gateway>(initialGateway === 'securepay' || initialGateway === 'airwallex' || initialGateway === 'payway' ? initialGateway : 'payway')
  const [v, setV] = useState({ payerName: '', payerEmail: '', invoiceNumber: initialInvoice ?? '', studentId: '', paymentFor: '', amount: initialAmount ?? '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // Kept for retries so a double click is one payment; replaced after a failure so a new attempt is a new payment.
  const [submissionId, setSubmissionId] = useState(() => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : ''))
  useEffect(() => { loadRecaptcha() }, [])

  const product = products.find((p) => p.sku === productSku) ?? null
  const allowed: Gateway[] = useMemo(() => (mode === 'product' && product ? (product.gateways.filter((g) => g === 'payway' || g === 'securepay' || g === 'airwallex') as Gateway[]) : ['payway', 'securepay', 'airwallex']), [mode, product])
  const gateway: Gateway = allowed.includes(chosen) ? chosen : (allowed[0] ?? 'securepay')

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV((s) => ({ ...s, [k]: e.target.value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({}); setFormError(null); setBusy(true)
    const common = { gateway, payerName: v.payerName, payerEmail: v.payerEmail, submissionId: submissionId || crypto.randomUUID(), captchaToken: await captchaToken() }
    const body = mode === 'invoice'
      ? { kind: 'invoice', ...common, invoiceNumber: v.invoiceNumber, studentId: v.studentId || undefined, paymentFor: v.paymentFor, amount: v.amount }
      : { kind: 'product', ...common, productId: product?.sku, studentId: v.studentId || undefined } // no amount: the server prices it
    try {
      const res = await fetch('/api/payments/start/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; redirectUrl?: string; error?: string; message?: string; fieldErrors?: Record<string, string> }
      const target = safeNext(json.redirectUrl)
      if (res.status === 202 && target) {
        if (target.startsWith('/')) router.push(target)
        else window.location.assign(target)
        return
      }
      if (res.status === 400 && json.fieldErrors) { setErrors(json.fieldErrors); setFormError('Please check the highlighted fields.') } else setFormError(json.message ?? 'Something went wrong. Nothing has been charged. Please try again.')
      setSubmissionId(crypto.randomUUID())
    } catch {
      setFormError('We could not reach the server. Nothing has been charged. Check your connection and try again.')
      setSubmissionId(crypto.randomUUID())
    } finally {
      setBusy(false)
    }
  }

  const field = (id: keyof typeof v, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="min-w-0">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} value={v[id]} onChange={set(id)} aria-invalid={Boolean(errors[id])} aria-describedby={errors[id] ? `${id}-err` : undefined} className="mt-2" {...props} />
      {errors[id] && <p id={`${id}-err`} className="mt-1 text-sm font-medium text-destructive">{errors[id]}</p>}
    </div>
  )

  return (
    <form onSubmit={onSubmit} noValidate className={className} aria-label="Make a payment" data-testid="pay-form">
      <fieldset className="mb-8">
        <legend className="label-mono mb-3 text-accent">What are you paying for?</legend>
        <div className="flex flex-wrap gap-3">
          {([['invoice', 'An invoice or fee'], ['product', 'An English test product']] as const).map(([val, text]) => (
            <label key={val} className={`cursor-pointer rounded-full border px-5 py-2 text-sm font-semibold ${mode === val ? 'border-foreground bg-foreground text-background' : 'border-border'}`}>
              <input type="radio" name="mode" value={val} checked={mode === val} onChange={() => setMode(val)} className="sr-only" />{text}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {field('payerName', 'Full name *', { required: true, autoComplete: 'name', maxLength: 120 })}
        {field('payerEmail', 'Email *', { required: true, type: 'email', autoComplete: 'email', maxLength: 254 })}
        {mode === 'invoice' ? (
          <>
            {field('invoiceNumber', 'Invoice number *', { required: true, maxLength: 40 })}
            {field('studentId', 'Student ID (if you have one)', { maxLength: 20, inputMode: 'numeric' })}
            <div className="min-w-0">
              <Label htmlFor="paymentFor">Payment for *</Label>
              <Input id="paymentFor" name="paymentFor" list="payment-for-options" value={v.paymentFor} onChange={set('paymentFor')} required maxLength={100} className="mt-2" aria-invalid={Boolean(errors.paymentFor)} />
              <datalist id="payment-for-options">{PAYMENT_FOR.map((o) => <option key={o} value={o} />)}</datalist>
              {errors.paymentFor && <p className="mt-1 text-sm font-medium text-destructive">{errors.paymentFor}</p>}
            </div>
            {field('amount', 'Amount to pay (AUD) *', { required: true, inputMode: 'decimal', placeholder: '0.00', maxLength: 12 })}
          </>
        ) : (
          <>
            <div className="min-w-0 md:col-span-2">
              <Label htmlFor="product">Product *</Label>
              <select id="product" name="product" value={productSku} onChange={(e) => setProductSku(e.target.value)} required className="mt-2 h-12 w-full rounded-input border border-input bg-background px-4 text-base">
                <option value="">Choose a product…</option>
                {products.map((p) => <option key={p.sku} value={p.sku}>{p.name} ({formatAud(p.priceCents)})</option>)}
              </select>
              {errors.productId && <p className="mt-1 text-sm font-medium text-destructive">{errors.productId}</p>}
            </div>
            {product && <p className="md:col-span-2 text-sm text-muted-foreground" data-testid="product-price">Price: <strong>{formatAud(product.priceCents)}</strong> (set by {site.shortName}, not editable).</p>}
            {field('studentId', 'Student ID (if you have one)', { maxLength: 20, inputMode: 'numeric' })}
          </>
        )}
      </div>

      <fieldset className="mt-8">
        <legend className="label-mono mb-3 text-accent">Pay with</legend>
        <div className="flex flex-wrap gap-3">
          {allowed.map((g) => (
            <label key={g} className={`cursor-pointer rounded-full border px-5 py-2 text-sm font-semibold ${gateway === g ? 'border-foreground bg-foreground text-background' : 'border-border'}`}>
              <input type="radio" name="gateway" value={g} checked={gateway === g} onChange={() => setGateway(g)} className="sr-only" />{GATEWAY_LABEL[g]}
            </label>
          ))}
        </div>
      </fieldset>

      {formError && <p role="alert" data-testid="pay-error" className="mt-6 text-sm font-medium text-destructive">{formError}</p>}
      <Button type="submit" size="lg" className="mt-8" disabled={busy || (mode === 'product' && !product)}>{busy ? 'Starting payment…' : 'Continue to payment'}</Button>
      <p className="mt-4 text-xs text-muted-foreground">You will pay on the next screen. The amount is fixed on our server before you are sent to the payment provider.</p>
    </form>
  )
}
