// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, ThankYouCard } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Thank You',
  path: '/referral-application-thanks/',
  description: 'Thank you for your application to join our Referral Network',
  noindex: true,
})

export default function ReferralApplicationThanksRoute() {
  return (
    <>
      <Hero heading="Thank You" variant="compact" audienceSwitch={false} />
      <ThankYouCard>
        <p>Thank you for your application to join our Referral Network</p>
      </ThankYouCard>
    </>
  )
}
