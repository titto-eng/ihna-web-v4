// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, ThankYouCard } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Scholarship Thanks',
  path: '/scholarship-thanks/',
  description: 'Thank you for your scholarship enquiry. One of our representatives will get back to you soon.',
  noindex: true,
})

export default function ScholarshipThanksRoute() {
  return (
    <>
      <Hero heading="Thanks" variant="compact" audienceSwitch={false} />
      <ThankYouCard links={[{ label: 'Back to Scholarships', href: '/scholarship/' }, { label: 'Explore courses', href: '/courses/' }]}>
        <p>Thank you for your enquiry. One of our representatives will get back to you soon.</p>
      </ThankYouCard>
    </>
  )
}
