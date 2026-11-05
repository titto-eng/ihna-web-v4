// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, EnquiryForm, Hero, Rich } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Diploma of Nursing – Enquiry form',
  path: '/diploma-of-nursing-print-media/',
  description: 'Diploma of Nursing – Enquiry form',
})

export default function DiplomaOfNursingPrintMediaRoute() {
  return (
    <>
      <Hero heading="Diploma of Nursing – Enquiry form" variant="compact" audienceSwitch={false} />
      <Rich>
        <h2>Talk to an Enrollment Advisor</h2>
      </Rich>
      <EnquiryForm formKey="quick-enquiry" />
    </>
  )
}
