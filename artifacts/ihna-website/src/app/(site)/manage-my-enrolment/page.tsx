// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, Rich, SplitProse, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Manage my Enrolment',
  path: '/manage-my-enrolment/',
  description: 'Students may request a deferment or suspension of their studies during the course in limited circumstances as set out in National Code of Practice for…',
})

export default function ManageMyEnrolmentRoute() {
  return (
    <>
      <Hero heading="Manage my Enrolment" variant="split" look="editorial" audienceSwitch={false} eyebrow="Current students" image={img({ src: '/images/ihna/pages/manage-my-enrolment.webp', alt: 'Student services officer on the phone', width: 524, height: 655 })} />
      <SectionNav section="current-student" current="/manage-my-enrolment/" />
      <Rich>
        <p className="lead">Students may request a deferment or suspension of their studies during the course in limited circumstances as set out in National Code of Practice for Registration Authorities and Providers of Education and Training to Overseas Students 2007 (National Code) Standard 13.</p>
      </Rich>
      <SplitProse tone="muted" eyebrow={'Enrolment'} heading={'Deferment of Commencement of Study Requested by Student'}>
        <ul>
          <li>IHNA will only grant a deferment of commencement of studies for compassionate and compelling circumstances</li>
          <li>A deferment of enrolment may affect the student visa. Students can access information from DIBP website or helpline (131 881) for information on how the potential change to enrolment status may impact upon his or her visa</li>
        </ul>
      </SplitProse>
      <SplitProse eyebrow={'Enrolment'} heading={'Suspension of Study Requested by Student'}>
        <ul>
          <li>Once the student has commenced the course, IHNA will only grant a suspension of study for compassionate and compelling circumstances</li>
          <li>Periods of suspension of longer than six months will result in the cancellation of the student’s visa and will, therefore, require the student to apply for their visa to be reinstated</li>
          <li>Students must be inform that the suspension of enrolment may affect his or her student visa (see below: Students can access information from DIBP website or helpline (131 881) for information on how the potential change to enrolment status may impact upon his or her visa</li>
        </ul>
      </SplitProse>
      <SplitProse tone="muted" eyebrow={'Enrolment'} heading={'Cancellation of Enrolment'}>
        <ul>
          <li>The College will cancel the enrolment of a student under the following conditions</li>
          <li>Failure to pay course fees</li>
          <li>Any behaviour identified as resulting in cancellation in IHNA’s Student Code of Conduct</li>
          <li>
            Any behaviour that leads the college to believe that it is not in the best interests of the student’s welfare or the welfare of other students to continue studying, for example (but not limited to):
            <ul>
              <li>the student is missing</li>
              <li>the student has medical concerns or severe depression or psychological issues which lead the College to fear for the student’s wellbeing</li>
              <li>the student has engaged in, or threatened to engage in, behaviour that is reasonably believed to endanger the student or others</li>
              <li>where the college has reason to believe that the student is not a bonafide student</li>
            </ul>
          </li>
        </ul>
      </SplitProse>
    </>
  )
}
