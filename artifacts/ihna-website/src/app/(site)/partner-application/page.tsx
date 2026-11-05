// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, EnquiryForm, Hero, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Partner Application',
  path: '/partner-application/',
  description: 'If you are interested in Industry, Clinical, global, university partnerships with us, apply here.',
})

export default function PartnerApplicationRoute() {
  return (
    <>
      <Hero
        heading="Partner Application"
        variant="split" look="mosaic"
        audienceSwitch={false}
        subheading="If you are interested in Industry, Clinical, global, university partnerships with us, apply here." image={img({ src: '/images/ihna/pages/partner-application.webp', alt: 'HCI and Ramsay Health Care partnership', width: 1000, height: 1250 })} />
      <SectionNav section="industry" current="/partner-application/" />
      <EnquiryForm formKey="global-partner" />
    </>
  )
}
