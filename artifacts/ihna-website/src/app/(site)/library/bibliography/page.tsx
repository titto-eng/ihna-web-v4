// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, LinkTiles, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({ title: 'Bibliography', path: '/library/bibliography/', description: 'Bibliography' })

export default function LibraryBibliographyRoute() {
  return (
    <>
      <Hero heading="Bibliography" variant="split" look="editorial" audienceSwitch={false} eyebrow="Library" image={img({ src: '/images/ihna/pages/library-bibliography.webp', alt: 'Library reading room', width: 682, height: 853 })} />
      <SectionNav section="library" current="/library/bibliography/" />
      <LinkTiles
        items={[
          { title: 'HLT54121 Diploma of Nursing', body: 'IHNA · School of Nursing', href: '/library/eresources/', label: 'Read More' },
          { title: 'ebook Collection', body: 'IHNA', href: '/library/ebooks/?cat=1', label: 'Read More' },
        ]}
      />
    </>
  )
}
