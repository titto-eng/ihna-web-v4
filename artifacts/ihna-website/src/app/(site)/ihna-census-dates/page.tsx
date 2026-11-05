// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, LinkTiles } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({ title: 'IHNA Census Dates', path: '/ihna-census-dates/', description: 'IHNA Census Dates' })

export default function IhnaCensusDatesRoute() {
  return (
    <>
      <Hero heading="IHNA Census Dates" variant="compact" audienceSwitch={false} eyebrow="Current students" />
      <SectionNav section="current-student" current="/ihna-census-dates/" />
      <LinkTiles
        items={[
          { title: 'Census Dates older than 2018', href: '/census-dates/' },
          { title: 'Census Dates in 2018 and after that', href: '/census-dates-kh/' },
        ]}
      />
    </>
  )
}
