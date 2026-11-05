// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, ThankYouCard } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Thanks for your expression of interest',
  path: '/expression-of-interest-thanks/',
  description: 'Thanks for your expression of interest',
  noindex: true,
})

export default function ExpressionOfInterestThanksRoute() {
  return (
    <>
      <Hero heading="Thanks for your expression of interest" variant="compact" audienceSwitch={false} />
      <ThankYouCard>
        <h2>We will contact you soon.</h2>
      </ThankYouCard>
    </>
  )
}
