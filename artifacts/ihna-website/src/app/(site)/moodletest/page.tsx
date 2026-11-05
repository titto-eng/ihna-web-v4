// Utility URL kept alive (the old page was a Moodle debug template; none of its code or content is ported). noindex.
import type { Metadata } from 'next'
import { pageMetadata, Hero, Link, ThankYouCard } from '@/components/page'

export const metadata: Metadata = pageMetadata({ title: 'MoodleTest', path: '/moodletest/', noindex: true })

export default function MoodleTestRoute() {
  return (
    <>
      <Hero heading="MoodleTest" variant="compact" audienceSwitch={false} />
      <ThankYouCard icon="info" links={[{ label: 'Student login', href: '/student-login/' }, { label: 'Back to home', href: '/' }]}>
        <p>This page is no longer in use. Students can sign in to their learning platforms from the <Link href="/student-login/">student login</Link> page.</p>
      </ThankYouCard>
    </>
  )
}
