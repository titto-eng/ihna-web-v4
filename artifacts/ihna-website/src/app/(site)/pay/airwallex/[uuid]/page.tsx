import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Section } from '@/components/layout/Section'
import { AirwallexDropIn } from '@/components/payments/AirwallexDropIn.client'
import { gatewayMode, siteUrl } from '@/lib/payments/config'
import { airwallexEnv, retrieveIntent } from '@/lib/payments/gateways/airwallex'
import { fakePagePath } from '@/lib/payments/gateways/fake'
import { resultPath } from '@/lib/payments/handlers'
import { formatAud } from '@/lib/payments/money'
import { isUuid } from '@/lib/payments/sign'
import { findPayment } from '@/lib/payments/store'

// Airwallex drop-in page. The intent is retrieved server-side (client secret never stored); the Airwallex.js components SDK
// (https://static.airwallex.com/components/sdk/v1/index.js) is loaded by the client component on this page only. CSP hosts: script
// https://static.airwallex.com; connect/frame https://checkout.airwallex.com https://api.airwallex.com (demo: https://checkout-demo.airwallex.com
// https://api-demo.airwallex.com). 45-payments §4.
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Pay online', robots: { index: false, follow: false }, referrer: 'no-referrer' }

export default async function AirwallexPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  if (!isUuid(uuid)) notFound()
  const row = await findPayment(await getPayload({ config }), uuid)
  if (!row || row.gateway !== 'airwallex') notFound()
  if (row.status !== 'pending') redirect(resultPath(uuid))
  if (gatewayMode() === 'fake') redirect(fakePagePath(uuid))
  const intent = row.gatewayRef ? await retrieveIntent(row.gatewayRef) : null
  if (!intent?.client_secret || !intent.id) notFound()
  const env = airwallexEnv()
  return (
    <Section spacing="default">
      <div className="mx-auto max-w-xl">
        <p className="label-mono mb-3 text-accent">Secure online payment</p>
        <h1 className="display text-4xl">Pay {formatAud(row.amountCents)}</h1>
        {row.paymentFor && <p className="mt-2 text-muted-foreground">{row.paymentFor}</p>}
        <div className="mt-8">
          <AirwallexDropIn intentId={intent.id} clientSecret={intent.client_secret} env={env} returnUrl={`${siteUrl()}/pay/return/airwallex/?id=${row.paymentId}`} sdkHost="https://static.airwallex.com" />
        </div>
      </div>
    </Section>
  )
}
