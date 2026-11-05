// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, Link, SplitProse, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Career Help',
  path: '/career-help/',
  description: 'Our students come from a myriad of backgrounds, whether it be International Students or career changers, that is why our Learning Support team members…',
})

export default function CareerHelpRoute() {
  return (
    <>
      <Hero heading="Career Help" variant="split" look="orbit" audienceSwitch={false} eyebrow="Current students" image={img({ src: '/images/ihna/pages/career-help.webp', alt: 'Healthcare professional with her team', width: 480, height: 600 })} />
      <SectionNav section="current-student" current="/career-help/" />
      <SplitProse tone="muted" eyebrow={'Career help'} heading={'Get Job Ready Workshops'}>
        <p>Our students come from a myriad of backgrounds, whether it be International Students or career changers, that is why our Learning Support team members provide regular sessions on employment essentials- CV Writing, Cover Letter Writing, Personality Development, Interview Skills and many more. These workshops occur on recurring basis every week, across each campus.</p>
        <p>You will be made aware of upcoming sessions throughout the time of your studies, but you can also contact any of the Learning Support Officers on your campus to know more about these sessions.</p>
      </SplitProse>
      <SplitProse eyebrow={'Career help'} heading={'Job Placement Support'}>
        <p>At IHNA we will not leave you high and dry as soon as your course is over, we want to ensure that our students get the best support to enter the workforce once you graduate. That is why we designated Placement Coordinators to not only provide you with clinical placements during your course.</p>
        <p>To know more please contact:</p>
        <ul>
          <li>Melbourne Campuses <Link href="/our-locations/?selectedTab=melbourne-tab">Click Here</Link></li>
          <li>Perth Campus <Link href="/ihna-perth-campus/">Click Here</Link></li>
          <li>Sydney Campus <Link href="/our-locations/?selectedTab=sydney-tab">Click Here</Link></li>
          <li>Brisbane Campus <Link href="/our-locations/?selectedTab=brisbane-tab">Click Here</Link></li>
        </ul>
      </SplitProse>
    </>
  )
}
