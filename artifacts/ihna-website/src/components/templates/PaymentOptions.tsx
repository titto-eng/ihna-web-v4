import Link from 'next/link'
import { Section } from '@/components/layout/Section'
import { Card, CardContent } from '@/components/ui/card'
import { paymentSite } from '@/content/payments'
import { formatAud } from '@/lib/payments/money'
import { LeadHero } from './pageParts'

// PaymentOptions (05 §4.4, 45 §4): the chooser at /payment-options/. PayWay, SecurePay and Airwallex go to the pay form (paymentSite.payPath) with the gateway
// preselected; Convera and Flywire stay plain external links (T/footer.php:3322-3372). `?e2btn=N` keeps the old product links alive: a product
// offers only the gateways its record allows, and Convera and Flywire are hidden for it (they cannot take an E2 order).
export type ChooserProduct = { name: string; priceCents: number; gateways: string[]; legacyE2Btn: number | null } | null


type Option = { key: string; title: string; text: string; href: string; external?: boolean; gateway?: string }
const OPTIONS: Option[] = [
  { key: 'payway', gateway: 'payway', title: 'PayWay', text: 'Pay by Visa or Mastercard through our Australian bank.', href: paymentSite.payPath },
  { key: 'securepay', gateway: 'securepay', title: 'SecurePay', text: 'Pay by card with Australia Post SecurePay.', href: paymentSite.payPath },
  { key: 'airwallex', gateway: 'airwallex', title: 'Airwallex', text: 'Pay by card or wallet, including from overseas.', href: paymentSite.payPath },
  { key: 'convera', title: 'Convera', text: 'International students: send money from your home country in your own currency.', href: paymentSite.converaUrl, external: true },
  { key: 'flywire', title: 'Flywire', text: 'International students: pay your fees with Flywire.', href: paymentSite.flywireUrl, external: true },
]

/** A portal-signed invoice link (`invoice_id`, `exp`, `sig`), format-checked; the pay form verifies it (50 §4 Q12). */
export type SignedInvoiceLink = { invoice_id: string; exp: string; sig: string } | null

export function PaymentOptionsView({ page, product, e2btn, invoiceId, invoiceLink }: { page: { title: string; path: string }; contact?: { phone?: string | null; email?: string | null }; product: ChooserProduct; e2btn?: number | null; invoiceId?: string | null; invoiceLink?: SignedInvoiceLink }) {
  const options = OPTIONS.filter((o) => (product ? Boolean(o.gateway) && product.gateways.includes(o.gateway as string) : true))
  const href = (o: Option) => {
    if (o.external) return o.href
    const q = new URLSearchParams({ gateway: o.gateway as string })
    if (product && e2btn) q.set('e2btn', String(e2btn))
    else if (invoiceLink) for (const [k, v] of Object.entries(invoiceLink)) q.set(k, v) // the signature travels on, so the prefill survives
    else if (invoiceId) q.set('invoice_id', invoiceId)
    return `${o.href}?${q.toString()}`
  }
  return (
    <>
      <LeadHero hero={{ variant: 'compact', heading: page.title, eyebrow: 'Payments' }} />
      <Section tone="muted" anchorId="payment-options">
        {product && (
          <p className="mb-8 max-w-2xl text-lg" data-testid="chooser-product">
            You are paying for <strong>{product.name}</strong> ({formatAud(product.priceCents)}). Choose how to pay.
          </p>
        )}
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="payment-options">
          {options.map((o) => (
            <li key={o.key}>
              <Card className="h-full gap-0 py-0">
                <CardContent className="flex h-full flex-col gap-3 p-8">
                  <h2 className="display text-2xl">{o.title}</h2>
                  <p className="flex-1 text-muted-foreground">{o.text}</p>
                  {o.external ? (
                    <a href={href(o)} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-strong underline underline-offset-4">Continue to {o.title}</a>
                  ) : (
                    <Link href={href(o)} prefetch={false} className="font-semibold text-primary-strong underline underline-offset-4" data-gateway={o.gateway}>Pay with {o.title}</Link>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
