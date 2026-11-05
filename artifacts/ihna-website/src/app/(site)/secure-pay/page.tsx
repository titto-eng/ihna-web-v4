import { PayFormRoute, payFormMetadata } from '@/components/templates/payPages'

// The old SecurePay entry page (template-secure-pay.php): the pay form with SecurePay preselected (45-payments §5). 200, not a redirect.
export const dynamic = 'force-dynamic'
export const metadata = payFormMetadata('Pay with SecurePay', '/secure-pay/')

export default async function SecurePay({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <PayFormRoute path="/secure-pay/" title="Pay with SecurePay" gateway="securepay" searchParams={await searchParams} />
}
