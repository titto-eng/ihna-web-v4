// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, Cta, EnquiryForm, Hero, SplitProse, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Skilldemy',
  path: '/skilldemy/',
  description: 'HCI Skilldemy, the Global Skill Training Academy, offers internationally-focused healthcare training courses developed by HCI for offshore delivery.',
})

export default function SkilldemyRoute() {
  return (
    <>
      <Hero
        eyebrow="Global Skill Training Academy"
        heading="HCI Skilldemy"
        subheading="Education for Employment: Bridging the gap globally"
        variant="split" look="ribbon"
        audienceSwitch={false}
        ctas={[{ href: '#enquiry', label: 'Enquire now', style: 'primary' }]} image={img({ src: '/images/ihna/pages/skilldemy.webp', alt: 'Healthcare workers in scrubs', width: 480, height: 600 })} />
      <SplitProse eyebrow="HCI Skilldemy" heading="Education for *Employment*">
        <p>The Global Skill Training Academy, also known as HCI Skilldemy, is a dynamic initiative by HCI aimed at elevating vocational education in healthcare. Skilldemy specialises in offering internationally-focused training courses, developed by HCI’s curriculum experts for offshore delivery.</p>
      </SplitProse>
      <CardGrid
        columns="3"
        variant="grid"
        tone="muted"
        cards={[
          {
            title: 'Experience world-class education with HCI Skilldemy',
            body: 'Building on a robust foundation of vocational training, Australia’s VET system, operational for over four decades, exemplifies educational excellence.',
          },
          {
            title: 'Bridging the skills gap in healthcare',
            body: 'The HCI Skilldemy aspires to be the bridge in global healthcare education, preparing individuals to meet the demands of the industry with an expansive skill set, committed to ‘Education for Employment’.',
          },
          {
            title: 'Key objectives to strengthen the workforce',
            body: 'The HCI Skilldemy program focuses on key objectives to make international workforces stronger.',
          },
        ]}
      />
      <Cta
        variant="inline"
        heading="What courses do we offer?"
        links={[{ href: 'https://skilldemy.com.au/', label: 'Know more', style: 'primary' }]}
      />
      <EnquiryForm anchorId="enquiry" formKey="skilldemy-enquiry" />
    </>
  )
}
