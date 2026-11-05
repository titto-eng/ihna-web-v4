import Link from 'next/link'
import { Section } from '@/components/layout/Section'
import type { PublicResult } from '@/lib/payments/handlers'
import { formatAud } from '@/lib/payments/money'

// What the customer sees after the gateway. No name, no email: the receipt (with the right email) carries those.
const COPY: Record<string, { title: string; text: string }> = {
  paid: { title: 'Payment received', text: 'Thank you. We have received your payment. A receipt is on its way to the email address you gave us.' },
  pending: { title: 'Waiting for confirmation', text: 'Your payment provider has not confirmed the payment yet. You do not need to pay again. If it succeeded, a receipt will be emailed to you shortly.' },
  failed: { title: 'Payment not completed', text: 'The payment was declined or cancelled and you have not been charged by us. You can try again or choose another payment method.' },
  flagged: { title: 'We are checking your payment', text: 'We could not confirm this payment automatically. Our finance team will review it and contact you. Please do not pay again.' },
  refunded: { title: 'Payment refunded', text: 'This payment has been refunded.' },
  cancelled: { title: 'Payment cancelled', text: 'This payment was cancelled.' },
  expired: { title: 'Payment expired', text: 'This payment was not completed in time. Please start again.' },
}

export function ResultView({ result }: { result: PublicResult }) {
  const copy = COPY[result.status] ?? COPY.pending
  return (
    <Section spacing="default">
      <div className="mx-auto max-w-2xl rounded-card border border-border bg-card p-8 text-center md:p-12" data-testid="payment-result" data-status={result.status}>
        <p className="label-mono mb-4 text-accent">Payment</p>
        <h1 className="display text-4xl">{copy.title}</h1>
        <p className="mt-4 text-muted-foreground">{copy.text}</p>
        <p className="mt-6 text-lg font-semibold">{formatAud(result.amountCents)}{result.paymentFor ? ` for ${result.paymentFor}` : ''}</p>
        <p className="mt-8 flex justify-center gap-6 text-sm font-semibold">
          {(result.status === 'failed' || result.status === 'expired') && <Link href="/payment-options/" className="text-primary-strong underline underline-offset-4">Try again</Link>}
          <Link href="/" className="text-primary-strong underline underline-offset-4">Back to the home page</Link>
        </p>
      </div>
    </Section>
  )
}
