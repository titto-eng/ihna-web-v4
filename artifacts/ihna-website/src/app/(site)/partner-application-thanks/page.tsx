// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, ThankYouCard } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Thank You : Partner Application',
  path: '/partner-application-thanks/',
  description: 'Thank you for your application to join as our partner.',
  noindex: true,
})

export default function PartnerApplicationThanksRoute() {
  return (
    <>
      <Hero heading="Thank You : Partner Application" variant="compact" audienceSwitch={false} />
      <ThankYouCard>
        <p>Thank you for your application to join as our partner.</p>
      </ThankYouCard>
    </>
  )
}
