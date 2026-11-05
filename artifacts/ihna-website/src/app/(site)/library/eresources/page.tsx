// Library page (template-library-course-units-page.php): the HCI library catalogue search, then the reading list by core and elective
// unit (LibraryCatalogue over src/content/library/catalogue.ts, taken from the live page; /library/ebooks/ and /library/eresources/ show the same list).
import type { Metadata } from 'next'
import { pageMetadata, Rich } from '@/components/page'
import { Section } from '@/components/layout/Section'
import { LeadHero } from '@/components/templates/pageParts'
import { LibrarySearch } from '@/components/templates/LibrarySearch.client'
import { LibraryCatalogue } from '@/components/templates/LibraryCatalogue'
import { PRIMO_HOME } from '@/components/templates/library'

export const metadata: Metadata = pageMetadata({
  title: 'Eresources',
  path: '/library/eresources/',
  description: 'Search the library collection for eresources available to IHNA students.',
})

export default function LibraryEresourcesRoute() {
  return (
    <>
      <LeadHero hero={{ variant: 'compact', heading: 'Eresources', eyebrow: 'Library', audienceSwitch: false }} />
      <Section tone="muted" spacing="compact">
        <LibrarySearch />
      </Section>
      <Rich>
        <p>
          Search the library collection for books, ebooks, journals and other eresources for your units of study, or{' '}
          <a href={PRIMO_HOME}>open the library catalogue</a>.
        </p>
      </Rich>
      <LibraryCatalogue />
    </>
  )
}
