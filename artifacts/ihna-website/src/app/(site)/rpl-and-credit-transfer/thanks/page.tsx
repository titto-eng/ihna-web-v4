// Thank-you page of the RPL eligibility form (`rpl-enquiry`). Live answers at /rpl-and-credit-transfer/thanks (no slash): the
// slash-less URL 308s here.
import type { Metadata } from 'next'
import { pageMetadata, Hero, ThankYouCard, Link } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'RPL',
  path: '/rpl-and-credit-transfer/thanks/',
  description: 'Thanks for your enquiry. One of our representatives will get back to you shortly.',
  noindex: true,
})

export default function RplThanksRoute() {
  return (
    <>
      <Hero heading="Thanks for your enquiry." variant="compact" audienceSwitch={false} />
      <ThankYouCard phone={null} email={null}>
        <p>One of our representatives will get back to you shortly.</p>
        <p>In the mean time feel free to contact us via our toll free number <a href="tel:1800225283">1800 22 52 83</a> or via email <a href="mailto:enquiry@ihna.edu.au">enquiry@ihna.edu.au</a>.</p>
        <p><Link href="/">Home Page</Link></p>
      </ThankYouCard>
    </>
  )
}
