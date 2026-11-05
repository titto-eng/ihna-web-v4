// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, Rich, Link, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Careers',
  path: '/careers/',
  description: 'IHNA has a great reputation for generating graduates who are highly competent and ready to work. Our industry partners trust the quality graduates that we…',
})

export default function CareersRoute() {
  return (
    <>
      <Hero heading="Careers" variant="split" look="spotlight" audienceSwitch={false} eyebrow="Current students" image={img({ src: '/images/ihna/pages/careers.webp', alt: 'Nurse in blue scrubs', width: 731, height: 914 })} />
      <SectionNav section="current-student" current="/careers/" />
      <Rich>
        <p className="lead">IHNA has a great reputation for generating graduates who are highly competent and ready to work. Our industry partners trust the quality graduates that we create and look favourably towards hiring them to work in micro, small, medium, or big health sector organisations operating locally, nationally, or worldwide.</p>
        <p>We’re here to make sure you have the skills, experience, confidence, and knowledge you need to be job and career ready, whether you’re a current student or a recent IHNA graduate.</p>
        <p>If you seek career guidance or help <Link href="/career-help/">click here</Link>.</p>
        <p>Watch this space for the latest job postings!</p>
      </Rich>
    </>
  )
}
