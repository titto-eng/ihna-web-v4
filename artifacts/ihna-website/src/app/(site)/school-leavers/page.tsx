// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, img, Link, MediaSplit } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Leaving School? Enter the Next Phase of Your Future',
  path: '/school-leavers/',
  description: 'Congrats on finishing high school and deciding to make your next move into healthcare. This decision comes with its share of excitement and challenges…',
})

export default function SchoolLeaversRoute() {
  return (
    <>
      <Hero heading="Leaving School? Enter the Next Phase of Your Future" variant="compact" audienceSwitch={false} eyebrow="Future students" />
      <SectionNav section="student" current="/school-leavers/" />
      <MediaSplit
        imageSide="right"
        image={img({ src: '/images/ihna/theme/lifeexperience1.webp', alt: 'IHNA students on campus', width: 416, height: 299 })}
      >
        <p>Congrats on finishing high school and deciding to make your next move into healthcare. This decision comes with its share of excitement and challenges, and we’re here to make sure that you get the help you need to secure your future in this industry.</p>
        <p>If you feel that you’re struggling or lacking the knowledge of where to go or what to look for then IHNA is here to help you navigate those moments and help you explore your options.</p>
        <p>Whether you nailed your ATAR or didn’t quite get what you wanted, we’ll support you with admission pathways and clear information about prerequisites either on our <Link href="/domestic-students/">courses</Link> page or if you get in touch with us directly.</p>
        <p>All our courses incorporate blended learning so that you can make the most of online and in-person experiences. You’ll get comfortable with simulating real work scenarios when you get to use the campus facilities and laboratories.</p>
        <p>We collaborate with people working directly in healthcare to make sure that you get the all the relevant skills you need to walk straight into work after your course is finished.</p>
        <p>Combine that with the relevant and deep knowledge our trainers have of each topic, and you’ll be equipped with what you need to walk straight into employment in healthcare.</p>
      </MediaSplit>
    </>
  )
}
