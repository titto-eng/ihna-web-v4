import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Section } from '@/components/layout/Section'
import { SecurePayCard } from '@/components/payments/SecurePayCard.client'
import { envValue, gatewayMode, isDryRun, PaymentsConfigError } from '@/lib/payments/config'
import { securepayApiUrl } from '@/lib/payments/gateways/endpoints'
import { fakePagePath } from '@/lib/payments/gateways/fake'
import { resultPath } from '@/lib/payments/handlers'
import { formatAud } from '@/lib/payments/money'
import { isUuid } from '@/lib/payments/sign'
import { findPayment } from '@/lib/payments/store'

// SecurePay card page. The SecurePay UI script ({api}/v3/ui/client/securepay-ui.min.js, "Consumers of SecurePay UI must not host the script")
// is loaded by the client component on this page only, in `checkout` mode (AUD). It tokenises the card; the server charges the STORED amount.
// No payment order is needed for a plain card payment (SecurePay API reference, "Initiate Payment Order": only before DCC or 3DS2).
// CSP hosts: script/connect/frame https://payments.auspost.net.au (sandbox: https://payments-stest.npe.auspost.zone). 45-payments §4.
//
// DCC (SECUREPAY_DCC=1) is refused: in `dcc` mode the customer may choose the card currency, and Create Payment must then send the foreign
// amount and currency from the browser's quote (dccQuote.converted), which rule 6 forbids until finance decides how to handle it (45 §10).
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Pay by card', robots: { index: false, follow: false }, referrer: 'no-referrer' }

export default async function SecurePayPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  if (!isUuid(uuid)) notFound()
  const payload = await getPayload({ config })
  const row = await findPayment(payload, uuid)
  if (!row || row.gateway !== 'securepay') notFound()
  if (row.status !== 'pending') redirect(resultPath(uuid))
  if (gatewayMode() === 'fake') redirect(fakePagePath(uuid))

  if (envValue('SECUREPAY_DCC') === '1') throw new PaymentsConfigError('SECUREPAY_DCC=1 is not supported: the DCC amount would come from the browser (rule 6)')
  const apiOrigin = new URL(securepayApiUrl()).origin
  return (
    <Section spacing="default">
      <div className="mx-auto max-w-xl">
        <p className="label-mono mb-3 text-accent">Secure card payment</p>
        <h1 className="display text-4xl">Pay {formatAud(row.amountCents)}</h1>
        {row.paymentFor && <p className="mt-2 text-muted-foreground">{row.paymentFor}</p>}
        <div className="mt-8">
          <SecurePayCard paymentId={row.paymentId} clientId={envValue('SECUREPAY_UI_CLIENT_ID') ?? ''} merchantCode={envValue('SECUREPAY_MERCHANT_CODE') ?? ''} scriptHost={apiOrigin} dryRun={isDryRun()} />
        </div>
      </div>
    </Section>
  )
}
