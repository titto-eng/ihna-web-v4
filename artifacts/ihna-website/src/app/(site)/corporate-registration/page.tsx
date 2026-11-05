// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, EnquiryForm, Hero, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Corporate Registration',
  path: '/corporate-registration/',
  description: 'Submit the details here for corporate registration of the IHNA Corporate Training Membership for Hospitals and Clinics.',
})

export default function CorporateRegistrationRoute() {
  return (
    <>
      <Hero
        heading="Corporate Registration"
        variant="split" look="mosaic"
        audienceSwitch={false}
        subheading="Welcome to the registration portal for the Institute of Health and Nursing Australia’s Corporate Training Membership for Hospitals and Clinics." image={img({ src: '/images/ihna/pages/corporate-registration.webp', alt: 'Healthcare business team', width: 480, height: 600 })} />
      <EnquiryForm formKey="corporate-registration" heading="Please complete the details below." />
    </>
  )
}
