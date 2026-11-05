// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, EnquiryForm, Hero, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Course Enquiry',
  path: '/course-enquiry/',
  description: 'Any questions about studying with IHNA? Talk to us: feel free to contact us any time.',
})

export default function CourseEnquiryRoute() {
  return (
    <>
      <Hero heading="Any Questions?" variant="split" look="editorial" audienceSwitch={false} subheading="If you have any questions, feel free to contact us any time." image={img({ src: '/images/ihna/pages/course-enquiry.webp', alt: 'Nursing students in scrubs', width: 800, height: 1000 })} />
      <EnquiryForm formKey="quick-enquiry" heading="Talk to Us." />
    </>
  )
}
