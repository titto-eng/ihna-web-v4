// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, EnquiryForm, Hero, SplitProse, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Expression of Interest',
  path: '/expression-of-interest/',
  description: 'We invite you to be a part of our great team as a stakeholder, by submitting an expression of interest by filling the form.',
})

export default function ExpressionOfInterestRoute() {
  return (
    <>
      <Hero heading="Expression of Interest" variant="split" look="orbit" audienceSwitch={false} subheading="EOI for becoming a Stakeholder with IHNA" image={img({ src: '/images/ihna/pages/expression-of-interest.webp', alt: 'Educator working with nursing students', width: 546, height: 683 })} />
      <SplitProse eyebrow="Work with IHNA" heading="Help shape *healthcare education*">
        <p>IHNA focus on the development and delivery of quality education, training and management systems for the healthcare sector. We are now in the next growth phase by entering into the Higher education sector (Institute of Health &amp; Management Pty Ltd) and development of innovative enterprise systems for compliance and quality management.</p>
        <p>IHNA is now looking for motivated individuals with industry (healthcare and management) expertise and with a passion for teaching, course development, industry consultation and curriculum review. We invite you to be a part of our great team, by submitting an expression of interest by filling the below form.</p>
        <p>Be part of a positive change, by contributing to the healthcare education while nurturing our core values of Innovation, Caring and Excellence – ICE.</p>
      </SplitProse>
      <EnquiryForm formKey="jobs-eoi" heading="Submit your expression of interest" />
    </>
  )
}
