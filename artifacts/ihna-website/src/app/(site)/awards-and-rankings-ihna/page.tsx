// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, AwardTimeline, CountStats, Hero, IconChecks, img, Rich, Statement } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Awards',
  path: '/awards-and-rankings-ihna/',
  description: 'At IHNA, we take pride in our achievements and continuous efforts to excel in the field of healthcare and vocational education. Over the years, our…',
})

export default function AwardsAndRankingsIhnaRoute() {
  return (
    <>
      <Hero heading="Awards, Ranking &amp; Recognition" variant="split" look="spotlight" audienceSwitch={false} eyebrow="About IHNA" image={img({ src: '/images/ihna/pages/awards-and-rankings-ihna.webp', alt: 'IHNA team at an education awards ceremony', width: 546, height: 683 })} />
      <SectionNav section="about" current="/awards-and-rankings-ihna/" />
      <AwardTimeline
        eyebrow="Recognition"
        intro="At IHNA, we take pride in our achievements and continuous efforts to excel in the field of healthcare and vocational education. Over the years, our commitment to quality education and student success has been recognised through various awards, rankings, and industry acknowledgements."
        groups={[
          {
            name: 'Victorian International Education Awards',
            awards: [
              { year: '2023', result: 'Winner' },
              { year: '2022', result: 'Winner' },
              { year: '2022', result: 'Commendation', title: 'Premier’s Award for International Education Provider of the Year' },
              { year: '2021', result: 'Winner' },
              { year: '2021', result: 'Commendation', title: 'Premier’s Award for International Education Provider of the Year' },
              { year: '2018', result: 'Finalist' },
              { year: '2016', result: 'Winner' },
            ],
          },
          { name: 'Victorian Training Awards', awards: [{ year: '2020', result: 'Finalist' }, { year: '2016', result: 'Finalist' }] },
          { name: 'McMillan Woods Global Awards', awards: [{ year: '2018', result: 'Finalist' }] },
        ]}
      />
      <CountStats
        tone="muted"
        items={[
          { value: '★', label: 'Top Education Provider for Diploma of Nursing', body: 'IHNA is one of the leading providers of Diploma of Nursing programs in Australia, helping thousands of students embark on successful nursing careers.' },
          { value: '220+', label: 'Industry Partnerships and Collaborations', body: 'IHNA collaborates with over 220+ industry partners, including leading hospitals, aged care facilities, and healthcare organisations, ensuring our students gain practical experience and real-world insights during their education journey.' },
        ]}
      />
      <IconChecks
        tone="default"
        heading="Accreditations and *Endorsements*"
        intro="IHNA is fully accredited and endorsed by:"
        items={[
          'Australian Skills Quality Authority (ASQA)',
          'Nursing and Midwifery Board of Australia (NMBA)',
          'Commonwealth Register of Institutions and Courses for Overseas Students (CRICOS)',
        ]}
      />
      <Rich spacing="none">
        <p>These accreditations reflect our dedication to maintaining the highest standards in education and training.</p>
      </Rich>
      <CountStats
        heading="A Legacy of *Excellence*"
        items={[
          { value: '35,000+', label: 'Studied', body: 'Over the years, IHNA has supported more than 35,000 students through healthcare and community services education, helping them build practical knowledge and skills for their future.' },
          { label: 'National & International Reach', body: 'With campuses across Australia and a diverse international student community, IHNA continues to strengthen its presence in healthcare education locally and globally.' },
        ]}
      />
      <Statement
        tone="default"
        title="Looking ahead"
        lead="IHNA remains steadfast in its mission to innovate and lead in healthcare education, with a vision to become the"
        quote="No.1 provider of Health Science Education in the TVET sector."
      />
    </>
  )
}
