// Generated on 2026-10-21 from the live page through scripts/import/html-to-blocks.ts. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { Checklist, FigureGrid, LinkTiles, QuickFacts, SplitProse, img } from '@/components/page'
import { RegionalPage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/healthcare-courses-adelaide/'

export const metadata: Metadata = landingMetadata(PATH)

export default function HealthcareCoursesAdelaideRoute() {
  return (
    <RegionalPage
      path={PATH}
      hero={{ heading: 'Healthcare Courses Adelaide', image: img({ src: '/landing/healthcare-courses-adelaide/images/banner.jpg', alt: 'Healthcare Courses Adelaide', width: 1900, height: 609 }), variant: 'split', audienceSwitch: false }}
      body={
        <>
          <FigureGrid images={[{ src: '/landing/healthcare-courses-adelaide/images/banner2.jpg', alt: 'Healthcare courses in Adelaide', width: 1900, height: 609 }]} />
          <SplitProse
            tone="default"
            eyebrow="Course"
            heading="CHC33015 - Certificate III in Individual Support"
            aside={<QuickFacts items={[{ label: 'Location', value: 'Adelaide' }, { label: 'Fees', value: '1999 AUD (Including Placement fees)' }]} />}
          >
            <h3>About the Course</h3>
            <p>This qualification is designed for workers in the community or residential setting who provide individualised support to the aged or people with disabilities. They must use discretion and judgement, and take responsibility for their own outputs. They are taught factual, technical and procedural knowledge of the concepts and practices required. <br /> Students may undertake this course as an entry pathway into the aged care or disability care industry. Our course is directed towards developing multi-skilled workers for the broad range of services supporting aged people and the disabled in residential and community settings.</p>
            <h3>Job Outcomes</h3>
            <ul><li>Accommodation support worker</li><li>Community care worker</li><li>Care assistant</li><li>Assistant in nursing</li><li>Personal care assistant</li><li>Care service employees</li><li>Field officer</li><li>Personal care giver</li><li>In-home respite worker</li><li>Home care assistant</li><li>Nursing assistant</li><li>Community house worker</li><li>Community support worker</li><li>Care worker</li><li>Personal care worker</li><li>Support worker</li><li>Disability service officer (in some jurisdictions)</li></ul>
          </SplitProse>
          <SplitProse
            tone="muted"
            eyebrow="Course"
            heading="HLT47315 - Certificate lV in Health Administration"
            aside={<QuickFacts items={[{ label: 'Location', value: 'Adelaide' }, { label: 'Fees', value: '2999 AUD (Including Placement fees)' }]} />}
          >
            <h3>About the Course</h3>
            <p>This qualification reflects the role of individuals who work in a senior operational or team leading role in the health industry. Health Administration Workers complete a wide range of administrative and operational tasks under direct or indirect supervision. <br /><br /> No licensing, legislative, regulatory or certification requirements apply to this qualification at the time of publication.</p>
            <h3>Job Outcomes</h3>
            <ul><li>Executive Assistant</li><li>Ward Clerk</li><li>Health Administration Supervisor</li><li>Senior Clinical Coder</li><li>Practice Manager</li><li>Medical Records Section Leader</li></ul>
          </SplitProse>
          <Checklist heading="Why study with Us" items={['Theory completely online.', 'Experienced educators with Industrial experience.', 'Placements organized by IHNA in Adelaide.', 'Fortnightly payment plans available.', 'No separate placement fees.']} />
          <LinkTiles tone="muted" heading="Our Campuses" items={[{ title: 'Melbourne Heidelberg', href: '/our-locations/' }, { title: 'Melbourne CBD', href: '/our-locations/' }, { title: 'Perth (ST.George)', href: '/our-locations/' }, { title: 'Sydney ARGYLE', href: '/our-locations/' }]} />
        </>
      }
    />
  )
}
