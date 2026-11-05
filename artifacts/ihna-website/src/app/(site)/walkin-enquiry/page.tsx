// Generated on 2026-10-21 from the live page through scripts/import/html-to-blocks.ts. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { WalkInPage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/walkin-enquiry/'

export const metadata: Metadata = landingMetadata(PATH)

export default function WalkinEnquiryRoute() {
  return (
    <WalkInPage
      path={PATH}
      hero={{ heading: 'Enquire now to know *more*', subheading: 'Tell us which course and campus you are interested in and an enrolment advisor will contact you.', variant: 'compact', audienceSwitch: false }}
    />
  )
}
