import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ReceiptView } from '@/components/templates/Receipt'
import { clientIp } from '@/lib/enquiries/request'
import { loadReceipt, receiptAllowed } from '@/lib/payments/handlers'

// /pay/receipt/[uuid]/?e=<email>: shown only when the email matches the payer email on the row. A wrong email, an unknown id and
// a rate-limited caller all get the same 404, so nothing can be enumerated (45 §4). 10 per minute per IP.
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Payment receipt', robots: { index: false, follow: false }, referrer: 'no-referrer' }

export default async function PayReceipt({ params, searchParams }: { params: Promise<{ uuid: string }>; searchParams: Promise<{ e?: string | string[] }> }) {
  const [{ uuid }, sp] = await Promise.all([params, searchParams])
  const payload = await getPayload({ config })
  if (!(await receiptAllowed(payload, clientIp(await headers())))) notFound()
  const e = Array.isArray(sp.e) ? sp.e[0] : sp.e
  const receipt = await loadReceipt(payload, uuid, e)
  if (!receipt) notFound()
  return <ReceiptView receipt={receipt} />
}
