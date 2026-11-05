// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, img, Link, MediaSplit } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Career Changers',
  path: '/career-changers/',
  description: 'You’re not alone – more than half of all career-changers in Australia move into a completely different industry or occupation. This decision comes with…',
})

export default function CareerChangersRoute() {
  return (
    <>
      <Hero heading="Career Changers" variant="compact" audienceSwitch={false} eyebrow="Future students" />
      <SectionNav section="student" current="/career-changers/" />
      <MediaSplit
        imageSide="right"
        image={img({ src: '/images/ihna/theme/lifeexperience2.webp', alt: 'IHNA students in a practical class', width: 416, height: 299 })}
      >
        <p>You’re not alone – more than half of all career-changers in Australia move into a <a href="https://www.abs.gov.au/statistics/labour/employment-and-unemployment/participation-job-search-and-mobility-australia/latest-release" rel="noopener noreferrer">completely different industry or occupation</a>. This decision comes with its share of excitement and challenges, and we’re here to make sure that it leads you to a satisfying career.</p>
        <p>If you feel that you’re struggling or lacking the knowledge of where to go or what to look for then IHNA is here to help you navigate those moments.</p>
        <p>We collaborate with industry partners and other institutions to provide you with professional accredited courses incorporating relevant and practical learning experiences. Whether you’re looking for a completely new pathway into the healthcare industry or you’re just looking for that one course to get you direct access to a job, you’ll find all the information available on our <Link href="/domestic-students/">courses</Link> page.</p>
        <p>All our courses incorporate blended learning so that you can make the most of online and in-person experiences. You’ll get comfortable with simulating real work scenarios when you get to use the campus facilities and modern laboratories.</p>
        <p>Combine that with the relevant and deep knowledge our trainers have of each topic, and you’ll be equipped with what you need to walk straight into employment in healthcare.</p>
      </MediaSplit>
    </>
  )
}
