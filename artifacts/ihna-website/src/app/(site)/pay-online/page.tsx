import { PayFormRoute, payFormMetadata } from '@/components/templates/payPages'

// IHNA's pay form (DEC-11, 45-payments §4-5): invoices and the 12 English-test products. `?gateway=`, `?e2btn=`, `?invoice_id=` (+ `sig`).
// Never cached, never indexed.
export const dynamic = 'force-dynamic'
export const metadata = payFormMetadata('Pay online', '/pay-online/')

export default async function PayOnline({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <PayFormRoute path="/pay-online/" title="Pay online" searchParams={await searchParams} />
}
