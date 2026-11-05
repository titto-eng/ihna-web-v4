// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, SplitProse, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'CRICOS',
  path: '/cricos/',
  description: 'The Commonwealth Register of Institutions and Courses for Overseas Students (CRICOS) is an Australian government register that lists all Australian…',
})

export default function CricosRoute() {
  return (
    <>
      <Hero heading="CRICOS" variant="split" look="editorial" audienceSwitch={false} image={img({ src: '/images/ihna/pages/cricos.webp', alt: 'International student on campus', width: 727, height: 909 })} />
      <SplitProse eyebrow="CRICOS" heading="Registered for *overseas students*">
        <p>The Commonwealth Register of Institutions and Courses for Overseas Students (CRICOS) is an Australian government register that lists all Australian education providers offering courses to people studying in Australia on student visas and the courses offered.</p>
        <p>Health Careers International Pty is registered under CRICOS to provide accredited healthcare courses to people studying in Australia on student visas. The courses are offered through its Registered Training Organization, the Institute of Health and Nursing Australia(IHNA). The CRICOS provider code is 03386G.</p>
      </SplitProse>
      <SplitProse heading="What does it mean to be a CRICOS Provider?" tone="muted">
        <p>Education institutions must be registered on the Commonwealth Register of Institutions and Courses for Overseas Students (CRICOS) in order to enroll and deliver education services to students in Australia on a student visa. As a CRICOS provider, HCI has met, and continues to meet, the requirements of the Education Services for Overseas Students Act 2000 (ESOS Act) and National Code of Practice for Providers of Education and Training to Overseas Students 2007 (National Code).</p>
      </SplitProse>
    </>
  )
}
