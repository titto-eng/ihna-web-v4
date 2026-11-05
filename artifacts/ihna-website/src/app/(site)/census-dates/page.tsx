// Unit census dates from the portal (template-census-date-older.php): CensusView over src/lib/portal/ihna.ts.
// Query strings (campus, course, batch, semester) are validated ids; the page is rendered per request.
import type { Metadata } from 'next'
import { pageMetadata } from '@/components/page'
import { CensusView } from '@/components/templates/Census'
import { CensusIntro } from '@/components/templates/censusCopy'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({
  title: 'Census Dates older than 2018', // the live page title (parity)
  path: '/census-dates/',
  description: 'Census dates for each unit of study, by campus, course, intake and semester.',
})

export default async function CensusRoute({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <CensusView hero={{ variant: 'compact', heading: 'Census Dates', audienceSwitch: false }} searchParams={await searchParams}>
      <CensusIntro />
    </CensusView>
  )
}
