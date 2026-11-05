// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, EnquiryForm, Hero, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Join Referral Network',
  path: '/join-referral-network/',
  description: 'Join our referral network, which helps to find nursing and healthcare career pathways after studies.',
})

export default function JoinReferralNetworkRoute() {
  return (
    <>
      <Hero heading="Join Referral Network" variant="split" look="mosaic" audienceSwitch={false} image={img({ src: '/images/ihna/pages/join-referral-network.webp', alt: 'Two people shaking hands', width: 480, height: 600 })} />
      <EnquiryForm formKey="referral-application" />
    </>
  )
}
