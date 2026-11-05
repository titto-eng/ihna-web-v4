import Link from 'next/link'
import { Section } from '@/components/layout/Section'
import type { Receipt } from '@/lib/payments/handlers'
import { formatAud } from '@/lib/payments/money'
import { site } from '@/content/site'

// Receipt (05 §4.4, 45 §4): rendered only for the payer's own email (the page 404s otherwise). Print-friendly.
const STATUS_TEXT: Record<string, string> = {
  paid: 'Paid', pending: 'Waiting for the payment provider', failed: 'Not paid', refunded: 'Refunded', flagged: 'Under review', cancelled: 'Cancelled', expired: 'Expired',
}

export function ReceiptView({ receipt }: { receipt: Receipt }) {
  const rows: [string, string][] = [
    ['Status', STATUS_TEXT[receipt.status] ?? receipt.status],
    ['Amount', `${formatAud(receipt.amountCents)} ${receipt.currency}`],
    ...(receipt.paymentFor ? [['For', receipt.paymentFor] as [string, string]] : []),
    ...(receipt.invoiceNo ? [['Invoice / reference', receipt.invoiceNo] as [string, string]] : []),
    ...(receipt.payerName ? [['Paid by', receipt.payerName] as [string, string]] : []),
    ['Payment method', receipt.gateway],
    ...(receipt.paidAt ? [['Date', new Date(receipt.paidAt).toLocaleString('en-AU', { dateStyle: 'long', timeStyle: 'short' })] as [string, string]] : []),
    ['Receipt number', receipt.paymentId],
  ]
  return (
    <Section spacing="default">
      <div className="mx-auto max-w-2xl rounded-card border border-border bg-card p-8 md:p-12" data-testid="receipt">
        <p className="label-mono mb-4 text-accent">Payment receipt</p>
        <h1 className="display text-4xl">{receipt.status === 'paid' ? 'Thank you for your payment' : 'Your payment'}</h1>
        <dl className="mt-8 divide-y divide-border">
          {rows.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-semibold break-all sm:text-right">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-sm text-muted-foreground">{site.siteName}. Keep this page for your records.</p>
        <p className="mt-4"><Link href="/" className="font-semibold text-primary-strong underline underline-offset-4">Back to the home page</Link></p>
      </div>
    </Section>
  )
}
