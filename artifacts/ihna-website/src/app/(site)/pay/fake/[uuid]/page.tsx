import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { FakeGatewayView } from '@/components/payments/FakeGatewayView'
import { fakeEnabled } from '@/lib/payments/handlers'
import { isUuid } from '@/lib/payments/sign'
import { findPayment } from '@/lib/payments/store'

// The fake gateway (dev, test and DRY_RUN only). 404 in production.
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Fake gateway' }

export default async function FakeGateway({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  if (!fakeEnabled() || !isUuid(uuid)) notFound()
  const row = await findPayment(await getPayload({ config }), uuid)
  if (!row) notFound()
  return <FakeGatewayView paymentId={row.paymentId} amountCents={row.amountCents} status={row.status} />
}
