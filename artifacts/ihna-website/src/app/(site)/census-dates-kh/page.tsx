// Unit census dates from the portal (template-census-date-kh.php): CensusView over src/lib/portal/ihna.ts.
// Query strings (campus, course, batch, semester) are validated ids; the page is rendered per request.
import type { Metadata } from 'next'
import { pageMetadata } from '@/components/page'
import { CensusView } from '@/components/templates/Census'
import { CensusIntro } from '@/components/templates/censusCopy'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({
  title: 'Census Dates in 2018 and after that',
  path: '/census-dates-kh/',
  description: 'Census dates from 2018 onwards for each unit of study, by campus, course, intake and semester.',
})

export default async function CensusRoute({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <CensusView hero={{ variant: 'compact', heading: 'Census Dates in 2018 and after that', audienceSwitch: false }} searchParams={await searchParams}>
      <CensusIntro />
    </CensusView>
  )
}
