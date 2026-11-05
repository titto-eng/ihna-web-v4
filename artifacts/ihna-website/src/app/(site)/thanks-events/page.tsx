// Thank-you page for enquiries that name it (src/content/forms.ts thankYou). Contact lines come from src/content/site.ts.
import type { Metadata } from 'next'
import { pageMetadata, Hero, ThankYouCard } from '@/components/page'
import { site } from '@/content/site'

const telHref = (n: string) => `tel:${n.replace(/[^+\d]/g, '')}`

export const metadata: Metadata = pageMetadata({
  title: 'Thanks : Events',
  path: '/thanks-events/',
  description: 'One of our representatives will get back to you shortly.',
})

export default function ThanksRoute() {
  return (
    <>
      <Hero heading="Thanks for your enquiry." variant="compact" audienceSwitch={false} />
      <ThankYouCard phone={null} email={null}>
        <p>
          One of our representatives will get back to you shortly. In the meantime feel free to contact us
          {site.phone && <> on <a href={telHref(site.phone)}>{site.phone}</a> (toll free)</>}
          {site.email && <> or by email at <a href={`mailto:${site.email}`}>{site.email}</a></>}.
        </p>
      </ThankYouCard>
    </>
  )
}
