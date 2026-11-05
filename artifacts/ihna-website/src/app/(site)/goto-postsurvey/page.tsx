// Utility URL kept alive (the old GoTo post-webinar survey form had no working handler; nothing is ported). noindex.
import type { Metadata } from 'next'
import { pageMetadata, Hero, Link, ThankYouCard } from '@/components/page'

export const metadata: Metadata = pageMetadata({ title: 'GoTo Post Survey', path: '/goto-postsurvey/', noindex: true })

export default function GotoPostSurveyRoute() {
  return (
    <>
      <Hero heading="Thank you for attending" variant="compact" audienceSwitch={false} />
      <ThankYouCard icon="check">
        <p>This survey is closed. For questions about our courses, please <Link href="/contact/">contact us</Link>.</p>
      </ThankYouCard>
    </>
  )
}
