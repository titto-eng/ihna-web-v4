// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, ThankYouCard } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Pay Online Error',
  path: '/pay-online-error/',
  description: 'Please check whether you have entered all the details properly and also make sure that JavaScript is enabled in your browser.',
})

export default function PayOnlineErrorRoute() {
  return (
    <>
      <Hero heading="Error Occured" variant="compact" audienceSwitch={false} />
      <ThankYouCard icon="alert" links={[{ label: 'Payment options', href: '/payment-options/' }, { label: 'Back to home', href: '/' }]}>
        <p>The online payment cannot be processed.</p>
        <p>Please check whether you have entered all the details properly and also make sure that JavaScript is enabled in your browser.</p>
      </ThankYouCard>
    </>
  )
}
