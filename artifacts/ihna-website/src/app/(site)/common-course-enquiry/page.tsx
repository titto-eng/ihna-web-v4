// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, EnquiryForm, Hero, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Common Course Enquiry',
  path: '/common-course-enquiry/',
  description: 'Any questions about studying with IHNA? Talk to us: feel free to contact us any time.',
})

export default function CommonCourseEnquiryRoute() {
  return (
    <>
      <Hero heading="Any Questions?" variant="split" look="editorial" audienceSwitch={false} subheading="If you have any questions, feel free to contact us any time." image={img({ src: '/images/ihna/pages/common-course-enquiry.webp', alt: 'Course advisor on the phone', width: 524, height: 655 })} />
      <EnquiryForm formKey="lp-enquiry" heading="Talk to Us." />
    </>
  )
}
