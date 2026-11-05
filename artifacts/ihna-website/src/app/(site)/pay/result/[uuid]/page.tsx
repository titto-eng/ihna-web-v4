import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ResultView } from '@/components/payments/ResultView'
import { PurchaseEvent } from '@/components/tracking/ConversionEvents'
import { loadResult, purchaseEventFor } from '@/lib/payments/handlers'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Payment status' }

export default async function PayResult({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  const result = await loadResult(await getPayload({ config }), uuid)
  if (!result) notFound()
  const purchase = purchaseEventFor(result) // every gateway return lands here (303), so this is the one purchase push
  return (
    <>
      <ResultView result={result} />
      {purchase && <PurchaseEvent {...purchase} />}
    </>
  )
}
