// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, Link, SplitProse, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Academic support',
  path: '/academic-support/',
  description: 'Academic support is an integral element which assists students in successful completion of studies. IHNA offers student support and study groups which…',
})

export default function AcademicSupportRoute() {
  return (
    <>
      <Hero heading="Academic support" variant="split" look="orbit" audienceSwitch={false} eyebrow="Current students" image={img({ src: '/images/ihna/pages/academic-support.webp', alt: 'Students studying together', width: 617, height: 771 })} />
      <SectionNav section="current-student" current="/academic-support/" />
      <SplitProse eyebrow="Current students" heading="Academic *support*">
        <p>Academic support is an integral element which assists students in successful completion of studies. IHNA offers student support and study groups which helps ease the transition to student life. IHNA has experienced educators and student support officers who provides one on one academic depending on the requirements of the student. We also have designated student support officer for each course who can provide you with academic support which ranges from</p>
        <ul>
          <li>Academic Writing skills including report writing and essay structures</li>
          <li>Language support</li>
          <li>Importance of academic integrity</li>
          <li>APA referencing style</li>
          <li>Paraphrasing and identifying plagiarism</li>
        </ul>
        <p>The academic support sessions are designed to cater for both online and face to face students. The online supports sessions are scheduled by the research and learning support officers which is conducted weekly and is delivered by internal speakers. The face-to-face support focuses on the specific requirements and suggestion raised by students. Students can also request for one-on-one support with the course coordinator, educator or student support officer.</p>
        <p>Go to <Link href="/life-at-ihna/">News &amp; Events</Link> to stay up to date with upcoming events, you can also get more details through our Learning Support Officers.</p>
      </SplitProse>
    </>
  )
}
