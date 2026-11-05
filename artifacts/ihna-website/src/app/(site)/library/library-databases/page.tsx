// Library databases (template-library-inner-pages.php): the six database tiles with their logos. eMims and Skills Videos linked to
// per-user auto-login addresses on the old student portal, so they are shown without a link (as on /library/).
import type { Metadata } from 'next'
import { pageMetadata, Hero, LogoTiles } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({ title: 'Library Databases', path: '/library/library-databases/', description: 'Library Databases' })

const L = '/images/ihna/theme/library-pages'
const logo = (file: string, alt: string) => ({ src: `${L}/${file}`, alt, width: 200, height: 136 })

export default function LibraryLibraryDatabasesRoute() {
  return (
    <>
      <Hero heading="Library Databases" variant="compact" audienceSwitch={false} eyebrow="Library" />
      <SectionNav section="library" current="/library/library-databases/" />
      <LogoTiles
        linkLabel="Launch Now"
        items={[
          {
            title: 'JBI on Ovid',
            logo: logo('joanna-briggs-institute-logo.png', 'Joanna Briggs Institute'),
            href: 'https://go.openathens.net/redirector/ihm.edu.au?url=http%3A%2F%2Fovidsp.ovid.com%2Fovidweb.cgi%3FT%3DJS%26NEWS%3Dn%26CSC%3DY%26PAGE%3Dmain%26D%3Djbi',
          },
          { title: 'eMims', logo: logo('emims-cloud-logo.png', 'eMIMS cloud') },
          { title: 'Trip Database', logo: logo('trip-pro-logo.png', 'Trip Pro'), href: 'https://proxy.openathens.net/login?qurl=http%3A%2F%2Fwww.tripdatabase.com' },
          { title: 'Cochrane Library', logo: logo('cochrane-library-logo.png', 'Cochrane Library'), href: 'https://www.cochranelibrary.com/' },
          { title: 'Skills Videos', logo: logo('mosbys-nursing-skills-logo.png', 'Mosby’s Nursing Skills') },
          { title: 'PubMed', logo: logo('pubmed-logo.png', 'PubMed'), href: 'https://www.ncbi.nlm.nih.gov/pubmed' },
        ]}
      />
    </>
  )
}
