// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, ThankYouCard } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Thanks',
  path: '/thanks/',
  description: 'Thanks for your enquiry. One of our representatives will get back to you shortly. In the meantime feel free to contact us via our toll free number 1800 22…',
  noindex: true,
})

export default function ThanksRoute() {
  return (
    <>
      <Hero heading="Thanks" variant="compact" audienceSwitch={false} />
      <ThankYouCard phone={null} email={null}>
        <p>Thanks for your enquiry. One of our representatives will get back to you shortly.<br />In the mean time feel free to contact us via our toll free number <a href="tel:1800225283">1800 22 52 83</a> or via email <a href="mailto:enquiry@ihna.edu.au">enquiry@ihna.edu.au</a></p>
      </ThankYouCard>
    </>
  )
}
