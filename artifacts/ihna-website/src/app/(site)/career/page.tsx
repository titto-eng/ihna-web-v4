// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, IframeEmbed, Rich, SplitProse, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Career',
  path: '/career/',
  description: 'We are hiring. Join IHNA, where we redefine education and empower healthcare professionals to become visionary leaders. Search current jobs.',
})

export default function CareerRoute() {
  return (
    <>
      <Hero
        heading="Come and Join Us"
        eyebrow="We are hiring"
        variant="split" look="spotlight"
        audienceSwitch={false}
        subheading="Transform your career with IHNA. Empower your journey today!"
        ctas={[{ label: 'Search Jobs', href: '#search-jobs', style: 'primary' }]} image={img({ src: '/images/ihna/pages/career.webp', alt: 'Nurse smiling in a hospital corridor', width: 1000, height: 1250 })} />
      <SplitProse eyebrow="Careers at IHNA" heading="Education for *Employment*">
        <p>Welcome to IHNA, where we redefine education and empower healthcare professionals to become visionary leaders. Our commitment to &quot;Education for Employment: Bridging the gap globally&quot; goes beyond jobs; we aim to cultivate innovation, critical thinking, and positive change. With expert faculty, state-of-the-art facilities, and strong industry partnerships, IHNA offers a supportive environment to unleash your potential and make a meaningful impact in the healthcare industry. Join us now and shape a brighter future in healthcare.</p>
      </SplitProse>
      <Rich anchorId="search-jobs" spacing="compact">
        <h2>Search Jobs</h2>
      </Rich>
      <IframeEmbed url="https://hrms.ihna.edu.au/careers/?embed=1" title="Current vacancies at IHNA" height={1200} spacing="compact" />
    </>
  )
}
