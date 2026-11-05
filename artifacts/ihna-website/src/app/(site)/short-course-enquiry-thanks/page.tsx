// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, Rich } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Thanks',
  path: '/short-course-enquiry-thanks/',
  description: 'Thanks for your enquiry. This is a self-enrolment course: apply and pay online from the course page to start.',
  noindex: true,
})

export default function ShortCourseEnquiryThanksRoute() {
  return (
    <>
      <Hero heading="Thanks" variant="compact" audienceSwitch={false} subheading="Welcome to this short upskilling course!" />
      <Rich>
        <h3>This is a self-enrolment course, and you can follow these steps to enrol:</h3>
        <ul>
          <li>Visit the course page on the IHNA website</li>
          <li>Click on the “Apply Now” tab. You will be directed to the application form, where you have to fill in your details.</li>
          <li>Next, you will be directed to make the payment.</li>
          <li>Once the payment is made, you can start the course.</li>
        </ul>
      </Rich>
    </>
  )
}
