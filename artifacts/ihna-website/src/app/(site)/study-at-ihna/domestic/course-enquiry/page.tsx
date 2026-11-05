// Generated on 2026-10-21 from the live page through scripts/import/html-to-blocks.ts. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { EnquiryLandingPage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/study-at-ihna/domestic/course-enquiry/'

export const metadata: Metadata = landingMetadata(PATH)

export default function DomesticCourseEnquiryRoute() {
  return (
    <EnquiryLandingPage
      path={PATH}
      hero={{ eyebrow: 'Course enquiry', heading: 'Talk to *us*', subheading: 'For enrolment staff: record phone and social media enquiries here and choose the lead source.', variant: 'compact', audienceSwitch: false }}
    />
  )
}
