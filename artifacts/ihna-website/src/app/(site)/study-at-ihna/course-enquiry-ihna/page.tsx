// Generated on 2026-10-21 from the live page through scripts/import/html-to-blocks.ts. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { EnquiryLandingPage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/study-at-ihna/course-enquiry-ihna/'

export const metadata: Metadata = landingMetadata(PATH)

export default function StudyAtIhnaCourseEnquiryIhnaRoute() {
  return (
    <EnquiryLandingPage
      path={PATH}
      hero={{ heading: 'Talk to our *counsellor*', subheading: 'Send us your details and the course you are interested in. A course counsellor will call you back.', variant: 'compact', audienceSwitch: false }}
    />
  )
}
