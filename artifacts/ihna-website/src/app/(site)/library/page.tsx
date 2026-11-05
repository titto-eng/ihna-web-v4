// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, EnquiryForm, Hero, Rich, Tabs, ValueCards, VideoEmbed, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Library',
  path: '/library/',
  description: 'Search the IHNA Library for books, eBooks, journals, eJournals and audio-visual materials, and find databases, referencing help and digital resources.',
})

const L = '/images/ihna/theme/library-pages'
const CATALOGUE = 'https://library.hci.edu.au/discovery/search?vid=61IOHAM_INST:61IOHAM'

const videos = [
  { label: 'Academic Integrity', id: 'gUT0HM_h7Ac', title: 'Academic SCRUM | Academic Integrity' },
  { label: 'APA Referencing', id: 'vXJcauqIhYI', title: 'Academic SCRUM | APA Referencing' },
  { label: 'Introduction to Canvas', id: '7kKo8weU6N8', title: 'Business SCRUM | Introduction to CANVAS' },
  { label: 'Library for Web 3.0', id: 'MrR2meeC4sc', title: 'HCI SCRUM | Library for Web 3.0' },
  { label: 'Student Support Services', id: '8S_6bAlFCO8', title: 'Academic SCRUM | Student Support Services' },
]

export default function LibraryRoute() {
  return (
    <>
      <Hero
        heading="IHNA *Library*"
        eyebrow="Online library"
        variant="compact"
        audienceSwitch={false}
        subheading="Search for books, eBooks, journals, eJournals and audio-visual materials."
        ctas={[
          { label: 'Search our Library collection', href: CATALOGUE, style: 'primary' },
          { label: 'Library access request', href: 'https://forms.monday.com/forms/c8e65209167cd71cfb7318b42c9ee977?r=use1', style: 'secondary' },
          { label: 'My Library Account', href: CATALOGUE, style: 'link' },
        ]}
      />
      <SectionNav section="library" current="/library/" />
      <CardGrid
        heading="Library Databases"
        columns="3"
        variant="grid"
        cards={[
          { title: 'JBI on Ovid', href: 'https://go.openathens.net/redirector/ihm.edu.au?url=http%3A%2F%2Fovidsp.ovid.com%2Fovidweb.cgi%3FT%3DJS%26NEWS%3Dn%26CSC%3DY%26PAGE%3Dmain%26D%3Djbi' },
          { title: 'eMims' },
          { title: 'Trip Database', href: 'https://proxy.openathens.net/login?qurl=http%3A%2F%2Fwww.tripdatabase.com' },
          { title: 'Cochrane Library', href: 'https://www.cochranelibrary.com/' },
          { title: 'Skills Videos', body: 'Mosby’s Nursing Skills' },
          { title: 'PubMed', href: 'https://www.ncbi.nlm.nih.gov/pubmed' },
        ]}
      />
      <CardGrid
        heading="References & other services"
        columns="3"
        variant="carousel"
        tone="muted"
        cards={[
          { title: 'Bibliography', body: 'Search for books, eBooks, journals, eJournals and audio-visual materials', image: img({ src: `${L}/ref-img-1.png`, alt: '', width: 300, height: 181 }), href: '/library/bibliography/' },
          { title: 'Academic Integrity', body: 'Academic integrity is the expectation that teachers, students, researchers and…', image: img({ src: `${L}/ref-img-2.png`, alt: '', width: 300, height: 181 }), href: '/library/academic-integrity/' },
          { title: 'Copyright', body: 'Institute of Health and Nursing Australia is committed to ensuring compliance to…', image: img({ src: `${L}/ref-img-3.png`, alt: '', width: 300, height: 181 }), href: '/library/copyright/' },
          { title: 'Referencing', body: 'Referencing is a set of rules for acknowledging sources which, you have…', image: img({ src: `${L}/ref-img-4.png`, alt: '', width: 300, height: 181 }), href: '/library/referencing/' },
          { title: 'Search Tips', body: 'Improve your Searches. Refine your search if you find too many or not enough results…', image: img({ src: `${L}/ref-img-5.png`, alt: '', width: 300, height: 181 }), href: '/library/search-tips/' },
          { title: 'Library Databases', body: 'Search for JBI, eMims, Trip Database, Cochrane Library, Skills Videos and PubMed.', image: img({ src: `${L}/library-database.png`, alt: '', width: 300, height: 181 }), href: '/library/library-databases/' },
          { title: 'Writing for Students', body: 'Approaching short or extended answer questions effectively requires a specific…', image: img({ src: `${L}/writing.png`, alt: '', width: 300, height: 181 }), href: '/library/writing-for-students/' },
          { title: 'Presentation Skills', body: 'A presentation is a set of PowerPoint slides or a Prezi that someone then shows…', image: img({ src: `${L}/presentation-skills.png`, alt: '', width: 300, height: 181 }), href: '/library/presentation-skills/' },
        ]}
      />
      <ValueCards
        tone="default"
        columns={2}
        heading="Get help *online*!"
        items={[
          { mark: '?', title: 'Ask the Library using online chat', body: 'Get help with finding information, and help with your coursework.' },
          { mark: '@', title: 'Email our Teaching support team', body: <>Help with Canvas resources and reading lists for teachers and academics: <a className="font-semibold text-primary-strong underline underline-offset-4" href="mailto:enquiry@ihna.edu.au">enquiry@ihna.edu.au</a></> },
        ]}
      />
      <EnquiryForm formKey="library-enquiry" heading="Enquire Now" />
      <Rich spacing="compact" tone="muted">
        <h2>Digital Resources</h2>
      </Rich>
      <Tabs
        tone="muted"
        spacing="compact"
        tabs={videos.map((v) => ({
          label: v.label,
          content: <VideoEmbed depth={1} url={`https://www.youtube.com/watch?v=${v.id}`} title={v.title} />,
        }))}
      />
    </>
  )
}
