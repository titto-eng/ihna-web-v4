// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Cta, Hero, SplitProse, Link, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'International Student Recruitment',
  path: '/international-student-recruitment/',
  description: 'Partner with IHNA for International Student Recruitment: download the Agent Application Form and find our registered recruitment consultants.',
})

export default function InternationalStudentRecruitmentRoute() {
  return (
    <>
      <Hero
        heading="International Student Recruitment"
        subheading="Partner with IHNA for International Student Recruitment"
        variant="split" look="spotlight"
        audienceSwitch={false} image={img({ src: '/images/ihna/pages/international-student-recruitment.webp', alt: 'Map of Australia with IHNA campuses', width: 702, height: 878 })} />
      <SplitProse eyebrow="Education agents" heading="Work *with us*">
        <p>If you’re interested in working with us, please download and complete the <Link href="/pdf/IHNA_Education_Agent_Application_Form.pdf">Agent Application Form</Link> and send it to <a href="mailto:enquiry@ihna.edu.au">enquiry@ihna.edu.au</a>.</p>
      </SplitProse>
      <Cta
        variant="inline"
        heading="Find our registered International Student Recruitment Consultants"
        links={[{ href: 'https://online.fliphtml5.com/wmka/utdk/', label: 'IHNA International Student Recruitment Agent List', style: 'primary' }]}
      />
      <Cta
        variant="centered"
        heading="Enhance your career by learning new skills."
        body="Find the right course for you."
        links={[{ href: '/courses/', label: 'Explore courses', style: 'secondary' }]}
      />
    </>
  )
}
