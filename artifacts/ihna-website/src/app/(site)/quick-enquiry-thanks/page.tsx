// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, ThankYouCard } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Thanks',
  path: '/quick-enquiry-thanks/',
  description: 'Thank you for your enquiry. One of our representative will get back to you soon.',
  noindex: true,
})

export default function QuickEnquiryThanksRoute() {
  return (
    <>
      <Hero heading="Thanks" variant="compact" audienceSwitch={false} />
      <ThankYouCard>
        <p>Thank you for your enquiry. One of our representative will get back to you soon.</p>
      </ThankYouCard>
    </>
  )
}
