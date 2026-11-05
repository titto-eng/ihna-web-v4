// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, GrowthRoadmap, Hero, ImageText, img, Rich, SplitProse } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'HCI Australia',
  path: '/hci-australia/',
  description: 'Since the inception, HCI comprises of healthcare training institute and post graduation nursing institute dedicated to providing quality healthcare…',
})

export default function HciAustraliaRoute() {
  return (
    <>
      <Hero heading="Take a look at HCI Australia" variant="compact" audienceSwitch={false} eyebrow="About IHNA" />
      <SectionNav section="about" current="/hci-australia/" />
      <Rich>
        <p className="lead">Since the inception, HCI comprises of healthcare training institute and post graduation nursing institute dedicated to providing quality healthcare education and training. HCI Australia embraces latest technologies and tools in the design and delivery of its programs. This approach allows HCI to create new opportunities for students around the world develop and enhance their skills, and for governments and health sector organisations to more effectively develop healthcare workforce of the future.</p>
      </Rich>
      {/* the old "IHNA Roadmap" graphic (ihna-timeline-roadmap.webp), as a live roadmap with the same milestones */}
      <GrowthRoadmap
        heading="Take a look at HCI *Growth*"
        items={[
          { year: '2004', org: 'HCI', icon: 'flag', title: 'Health Careers International (HCI)' },
          { year: '2005', org: 'HSS', icon: 'people', title: 'Healthcare Staffing Solutions' },
          { year: '2007', org: 'IHNA', icon: 'launch', title: 'July 2007 HCI started RTO in Melbourne' },
          { year: '2010', org: 'IHNA', icon: 'campus', title: 'Perth Campus', detail: 'IHNA Perth' },
          { year: '2013', org: 'IHNA', icon: 'campus', title: 'Sydney Campus', detail: 'IHNA started operations in NSW' },
          { year: '2013', icon: 'brand', title: 'EduSystems' },
          { year: '2015', org: 'IHM', icon: 'course', title: 'IHM’s First courses GDN and GCN was accredited by TEQSA on 22 January 2015' },
          { year: '2016', org: 'IHNA', icon: 'award', title: 'State Award', detail: 'IHNA won Victorian International Education Award' },
          { year: '2017', org: 'IHNA', icon: 'pin', title: 'New Campus in Perth', detail: 'St. George Tce' },
          { year: '2018', org: 'IHNA', icon: 'quality', title: 'IHNA achieved ASQA re-registration, underlining its commitment to quality education' },
          { year: '2019', org: 'IHNA', icon: 'care', title: 'Entry Program for Internationally Qualified Registered Nurses (EPIQRN)' },
          { year: '2019', org: 'IHM', icon: 'campus', title: 'Launch of IHM', detail: 'in North Melbourne Campus' },
          { year: '2021', org: 'IHM', icon: 'course', title: 'Master of Nursing' },
          { year: '2022', org: 'IHNA', icon: 'quality', title: 'Diploma of Nursing Accreditation' },
          { year: '2022', org: 'IHM', icon: 'quality', title: 'GCAN and BSW TEQSA accreditation' },
          { year: '2023', org: 'IHNA', icon: 'award', title: 'Received the Excellence Award in International Education for the third consecutive time' },
          { year: '2023', org: 'IHNA', icon: 'campus', title: 'Grand opening of IHNA Brisbane Campus, Addition of Lonsdale Melbourne Campus' },
          { year: '2024', org: 'Skilldemy', icon: 'launch', title: 'HCI Skilldemy' },
          { year: '2024', org: 'Cintana', icon: 'partner', title: 'Strategic Partnership', detail: 'Cintana Education · Ramsay Health Care · Arizona State University' },
          { year: '2024', org: 'IHNA · IHM', icon: 'brand', title: 'Rebranding of IHNA and IHM' },
        ]}
        goal={{ year: '2030', title: 'IHM aiming to become a University College' }}
      />
      <SplitProse eyebrow="Take a look at Our Group" heading="Institute of Health & *Management* (IHM)">
        <h4>Enhancing lives through healthcare education</h4>
        <p>The Institute of Health &amp; Management (IHM) was founded in 2015, and specialises in the development and provision of higher education courses specialising in health care. These postgraduate courses draw on the expertise of experienced nurses, academics, and clinicians. In 2021 IHM has officially become Australia’s first private higher education institute offering the Master of Nursing program!</p>
        <p>IHM’s mission is to become an Australian University College by 2030, to do so we are constantly striving to integrate the best technology based resources into our curriculum to deliver an unbeatable training experience for our students.</p>
        <p><a href="https://www.ihm.edu.au/" rel="noopener noreferrer">Visit Website</a> · <a href="https://www.linkedin.com/showcase/institute-of-health-and-management-ihm-/" rel="noopener noreferrer">Visit Linkedin</a></p>
      </SplitProse>
      <ImageText media={img({ src: '/images/ihna/brand/ihna-logo.webp', alt: 'IHNA Logo', width: 1453, height: 665 })} imageSide="right">
        <h3>IHNA</h3>
        <h4>Enhancing lives through healthcare training</h4>
        <p>The Institute of Health and Nursing Australia (IHNA) is an Australian Registered Training Organisation (RTO) that is dedicated to giving the best learning experience for a successful and satisfying career in nursing, health, and community services. IHNA was founded in 2007 and has since maintained deep and relevant expertise of the healthcare industry.</p>
        <p>We’re proud to have welcomed over 35,000 students from across 50 countries through our campus doors throughout Melbourne, Sydney, Brisbane and Perth. Our team has also grown to over 150 professionals with a broad range of industry experience. We believe what differentiates IHNA from other healthcare education providers is our passion for technology enhanced learning. We invest in state of the art simulation facilities and laboratories, so that our students will gain exposure to latest and best practical training experiences.</p>
      </ImageText>
    </>
  )
}
