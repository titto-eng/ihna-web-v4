// The newer copy of the walk-in enquiry page (live 200, linked from the home banner; not in the old repo). Same template and form as
// /walkin-enquiry/; the registry row picks the fields.
import type { Metadata } from 'next'
import { WalkInPage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/walkin-registration/'

export const metadata: Metadata = landingMetadata(PATH)

export default function WalkinRegistrationRoute() {
  return (
    <WalkInPage
      path={PATH}
      hero={{ heading: 'Enquire now to know *more*', subheading: 'Tell us which course and campus you are interested in and an enrolment advisor will contact you.', variant: 'compact', audienceSwitch: false }}
    />
  )
}
