// Generated on 2026-10-21 from the live page through scripts/import/html-to-blocks.ts. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { EnquiryLandingPage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/study-at-ihna/tollfree/'

export const metadata: Metadata = landingMetadata(PATH)

export default function StudyAtIhnaTollfreeRoute() {
  return (
    <EnquiryLandingPage
      path={PATH}
      hero={{ eyebrow: 'Reception', heading: 'Walk-in and direct *enquiries*', subheading: 'For reception staff: record enquiries from the toll-free line and walk-in visitors here.', variant: 'compact', audienceSwitch: false }}
    />
  )
}
