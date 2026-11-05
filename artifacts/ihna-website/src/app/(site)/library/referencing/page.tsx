// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Cta, Hero, SplitProse, ValueCards, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Referencing',
  path: '/library/referencing/',
  description: 'Referencing is a set of rules for acknowledging sources which, you have used to create an idea to build or share knowledge, strengthens your work by…',
})

export default function LibraryReferencingRoute() {
  return (
    <>
      <Hero heading="Referencing" variant="split" look="editorial" audienceSwitch={false} eyebrow="Library" image={img({ src: '/images/ihna/pages/library-referencing.webp', alt: 'Student researching on a laptop', width: 598, height: 748 })} />
      <SectionNav section="library" current="/library/referencing/" />
      <SplitProse eyebrow="Referencing" heading="Acknowledge every *source*">
        <p>Referencing is a set of rules for acknowledging sources which, you have used to create an idea to build or share knowledge, strengthens your work by supporting your points, ideas or arguments, how you engage critically with sources in your academic writing. Referencing also avoid plagiarism and demonstrates to readers that you have done your much research and found valid supporting evidence for your ideas. Even if your initial source is a book, Journal, website, facts, image, statistics, diagram, data, words, ideas, podcast, video or any other source, you need to reference all sources that you use to collaborate you are writing. All sources used in your academic work must be acknowledged by referencing.</p>
      </SplitProse>
      <ValueCards
        columns={2}
        eyebrow="APA 7th"
        intro="All higher education courses at the Institute of Health and Nursing Australia require the use of the APA 7th referencing and formatting style when submitting written assignments. APA consists of two parts:"
        items={[
          { title: 'Intext citation', mark: '1', body: <p>a short reference (Author, Date) included within the text of your assignment.</p> },
          { title: 'End text reference', mark: '2', body: <p>the full citation details of each reference in alphabetical order which used in the text of your assignment.</p> },
        ]}
      />
      <Cta links={[{ href: '/pdf/APA_Referencing_Guide_IHNA.pdf', label: 'Download Guide', style: 'primary' }]} variant="inline" tone="muted" spacing="compact" />
    </>
  )
}
