import { PayFormRoute, payFormMetadata } from '@/components/templates/payPages'

// The old Airwallex entry page (template-airwallex.php): the pay form with Airwallex preselected (45-payments §5). 200, not a redirect.
export const dynamic = 'force-dynamic'
export const metadata = payFormMetadata('Pay with Airwallex', '/airwallex/')

export default async function Airwallex({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <PayFormRoute path="/airwallex/" title="Pay with Airwallex" gateway="airwallex" searchParams={await searchParams} />
}
