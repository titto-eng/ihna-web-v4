// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, Rich, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Student Representative Council',
  path: '/student-representative-council/',
  description: 'Student Representative Councils (SRC) are an integral part of campus life at each IHNA campus and encourage students to become actively involved in the…',
})

export default function StudentRepresentativeCouncilRoute() {
  return (
    <>
      <Hero heading="Student Representative Council" variant="split" look="mosaic" audienceSwitch={false} eyebrow="Current students" image={img({ src: '/images/ihna/pages/student-representative-council.webp', alt: 'IHNA students together', width: 1000, height: 1250 })} />
      <SectionNav section="current-student" current="/student-representative-council/" />
      <Rich>
        <p className="lead">Student Representative Councils (SRC) are an integral part of campus life at each IHNA campus and encourage students to become actively involved in the Institute and, IHNA Life.</p>
        <p>The SRC provides a forum for Students to raise and discuss emerging views, suggestions and issues about learning, teaching, and student services. SRC is also an important opportunity for open communication between the student body and the Institute.</p>
        <p>Student Representatives are sought from across the student community and IHNA has also extended participation to Alumni. SRC members are self-nominated from the student body and the Chair and Office-Bearers are appointed by the SRC.</p>
        <p>As students represent the views of the entire student body, SRC provides an opportunity for students to develop their own soft skills and influencing skills as they participate in activities such as organising activities, leadership and representation and communication and mentoring of new students.</p>
      </Rich>
    </>
  )
}
