// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, Hero, ImageText, img, Rich, TeamGrid } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Cintana Alliance Partnership',
  path: '/cintana-alliance-partnership/',
  description: 'Through our collaboration with Cintana Education, we access a global network of resources and expertise and stay at the forefront of educational innovation.',
})

const photo = (file: string, name: string, width: number, height: number) =>
  img({ src: `/images/ihna/theme/${file}`, alt: name, width, height })

export default function CintanaAlliancePartnershipRoute() {
  return (
    <>
      <Hero
        eyebrow="Education for Employment: Bridging the Gap Globally"
        heading="Cintana Education Strategic Collaboration"
        variant="split" look="spotlight"
        audienceSwitch={false}
        image={img({ src: '/images/ihna/cintana-alliance-partnership/cintana-banner.webp', alt: 'Two partners shaking hands over a city skyline', width: 1600, height: 684 })}
      />
      <CardGrid
        heading="Transforming Healthcare Education: Introducing Our Revolutionary Partnership"
        columns="3"
        variant="grid"
        cards={[
          {
            title: 'Cintana Education',
            body: 'Through our collaboration with Cintana Education, we access a global network of resources and expertise. This collaboration allows us to stay at the forefront of educational innovation and ensures our programs meet the highest international standards.',
            href: '/cintana-education-partnership-how-are-we-leveraging-global-expertise/',
          },
          {
            title: 'Arizona State University',
            body: 'Arizona State University is the most innovative university in the United States. It has formed a pioneering collaboration with HCI to deliver a practical, future-focused education for employment to enable students to make a positive impact on our world.',
            href: '/arizona-state-university-asu-partnership/',
          },
          {
            title: 'Ramsay Health Care',
            body: 'Australia’s largest private hospital operator has joined hands with HCI and ASU to support the development of a highly skilled workforce, which is essential for delivering high-quality, safe, and effective clinical care for our patients.',
            href: '/collaboration-with-ramsay-healthcare/',
          },
        ]}
      />
      <Rich tone="muted">
        <h2>Cintana Education Partnership: How Are We Leveraging Global Expertise?</h2>
        <p>The strategic partnership between the Health Careers International (HCI) Ramsay Health Care Group, and Arizona State University (ASU) is set to transform healthcare education worldwide.</p>
        <p>This collaboration unites the extensive knowledge and expertise of industry leaders from different continents, ensuring a modern and innovative approach to healthcare education. Students and professionals enrolled in this program will benefit from a well-rounded curriculum that addresses the evolving needs of the healthcare sector, establishing new benchmarks in education and training.</p>
        <h3>Vision</h3>
        <p>To be ranked No.1 in Health Science Education in Australia’s TVET sector</p>
        <h3>Mission</h3>
        <p>Empowering tomorrow’s healthcare leaders, our mission intertwines academia and industry through strategic collaboration, together we elevate healthcare education standards globally.</p>
        <h3>Excellence in healthcare</h3>
        <p>Our strategy is centered on enhancing academic excellence by implementing innovative practices such as advanced teaching techniques and expanding program options in collaboration with our partners.</p>
      </Rich>
      <ImageText media={img({ src: '/images/ihna/theme/be-part.webp', alt: '', width: 1600, height: 1068 })} imageSide="right" heading="Be Part of Our Future">
        <p>This is more than a partnership: it’s a movement towards creating a healthier world through education. We invite students, healthcare professionals, and industry partners to join us as we build this exciting future.</p>
        <p>Stay connected with us for ongoing updates and developments in our programs and initiatives.</p>
        <p>Discover how we are not just anticipating the future of healthcare education — but actively creating it.</p>
      </ImageText>
      <TeamGrid
        heading="Meet the Leaders"
        variant="grid"
        members={[
          { name: 'Dr. Kunnumpurath Bijo', role: 'Group CEO & Managing Director', photo: photo('bijo.webp', 'Dr. Kunnumpurath Bijo', 722, 922) },
          { name: 'Pankaj Patel', role: 'Chief Finance Officer', photo: photo('pankaj.webp', 'Pankaj Patel', 277, 366) },
          { name: 'Dr Shisir Manandhar', role: 'Academic Director', photo: photo('shishir.webp', 'Dr Shisir Manandhar', 277, 366) },
          { name: 'Simon Schweigert', role: 'Chief Operations Officer, IHM', photo: photo('simon.webp', 'Simon Schweigert', 277, 366) },
          { name: 'Christopher Thomas Hill', role: 'Executive Director', photo: photo('christopher-hill.webp', 'Christopher Thomas Hill', 277, 366) },
          { name: 'Thomas Korah', role: 'Chief Of Staff, Sr. Director Strategic Initiatives, Cintana', photo: photo('thomas-korah.png', 'Thomas Korah', 584, 588) },
          { name: 'Scott Luckett', role: 'Senior Advisor', photo: photo('scott-luckett.png', 'Scott Luckett', 800, 800) },
          { name: 'Geons Jose', role: 'Head of Marketing & Sales IHM, IHNA', photo: photo('academic-staff/geons-jose.webp', 'Geons Jose', 380, 521) },
          { name: 'Arshad Abdul Samad', role: 'Director of Quality Management', photo: photo('arshad-abdul.webp', 'Arshad Abdul Samad', 277, 366) },
          { name: 'Sabarish Babu', role: 'Head of Digital Transformation', photo: photo('sabarish.webp', 'Sabarish Babu', 277, 366) },
          { name: 'Jimmy Jacob', role: 'Head of People & Culture', photo: photo('jimmy.webp', 'Jimmy Jacob', 277, 366) },
          { name: 'Nayana Babu Sreelatha', role: 'Project Manager' },
        ]}
      />
    </>
  )
}
