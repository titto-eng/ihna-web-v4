import type { Metadata } from 'next'
import Link from 'next/link'
import { ThankYouCard } from '@/components/page/showcase'
import { paymentSite } from '@/content/payments'
import { getInvoiceForLink } from '@/lib/portal/ihna'
import { centsToDecimal } from '@/lib/payments/money'
import { contactOf, gatewayParam, intParam, invoiceParam, loadPageOrStub, loadProducts } from '@/lib/payments/pages'
import { PayOnlineView } from './PayOnline'
import { LeadHero } from './pageParts'

// IHNA's payment URLs (45-payments §5, IHNA): every old WordPress payment page answers 200. `/pay-online/` is the pay form;
// `/secure-pay/` and `/airwallex/` are the same form with their gateway preselected; the old checkout and response pages explain
// where payments start now. All noindex; the pay forms also send no referrer.

type SP = Record<string, string | string[] | undefined>
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
/** An unsigned `?invoice_id=` that is a bare number is a portal row id, never shown as the invoice number. */
const unsignedInvoice = (v: string | null): string | null => (v && !/^\d+$/.test(v) ? v : null)

export const payFormMetadata = (title: string, path: string): Metadata => ({
  title, robots: { index: false, follow: false }, referrer: 'no-referrer', alternates: { canonical: path },
})

export const paymentInfoMetadata = (title: string, path: string): Metadata => ({
  title, robots: { index: false, follow: false }, alternates: { canonical: path },
})

/**
 * The pay form. `gateway` preselects one (the page's own gateway wins over `?gateway=`). `?invoice_id=&exp=&sig=` signed by the portal
 * (PORTAL_INVOICE_LINK_KEY, not expired) pre-fills the invoice number and amount due from `ihna_portal.invoices`; an unsigned
 * `?invoice_id=` pre-fills the invoice number field only when it is not a bare number (a bare number is the portal's row id, not the
 * invoice number the payer must quote). `?e2btn=1..12` opens the English-test product.
 */
export async function PayFormRoute({ path, title, searchParams, gateway }: { path: string; title: string; searchParams: SP; gateway?: 'payway' | 'securepay' | 'airwallex' }) {
  const sp = searchParams
  const [page, products, contact, invoice] = await Promise.all([
    loadPageOrStub(path, title), loadProducts(), contactOf(), getInvoiceForLink(first(sp.invoice_id), first(sp.exp), first(sp.sig)),
  ])
  const signed = invoice.data
  return (
    <PayOnlineView
      page={page} contact={contact} products={products}
      gateway={gateway ?? gatewayParam(sp.gateway)}
      e2btn={intParam(sp.e2btn, 1, 12)}
      invoiceId={signed ? signed.invoiceNumber : unsignedInvoice(invoiceParam(sp.invoice_id))}
      amount={signed && signed.dueCents > 0 ? centsToDecimal(signed.dueCents) : null}
    />
  )
}

/** The old gateway checkout / response pages: payments no longer start or end here. */
export function PaymentInfoPage({ title, heading, children }: { title: string; heading?: string; children?: React.ReactNode }) {
  return (
    <>
      <LeadHero hero={{ variant: 'compact', heading: heading ?? title, eyebrow: 'Payments' }} />
      <ThankYouCard icon="card" links={[]}>
        {children}
        <p>
          To make a payment, start from <Link href="/payment-options/" prefetch={false}>Payment options</Link>{' '}
          or go straight to the <Link href={paymentSite.payPath} prefetch={false}>online payment form</Link>.
        </p>
        <p className="text-base text-muted-foreground">
          If you have just paid, your receipt has been emailed to you. For help with a payment, contact us and quote your invoice number.
        </p>
      </ThankYouCard>
    </>
  )
}
