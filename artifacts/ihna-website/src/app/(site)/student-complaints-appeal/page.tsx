// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Cta, Hero, Rich, Link, Tabs, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Complaints & Appeals',
  path: '/student-complaints-appeal/',
  description: 'The Institute of Health and Nursing Australia (IHNA) is committed to providing an effective, fair, and confidential process for handling student…',
})

export default function StudentComplaintsAppealRoute() {
  return (
    <>
      <Hero heading="Complaints &amp; Appeals" variant="split" look="editorial" audienceSwitch={false} eyebrow="Current students" image={img({ src: '/images/ihna/pages/student-complaints-appeal.webp', alt: 'Two people in a supportive conversation', width: 604, height: 755 })} />
      <SectionNav section="current-student" current="/student-complaints-appeal/" />
      <Rich>
        <h3>IHNA – STUDENT COMPLAINTS, APPEALS AND FEEDBACK PROCESS</h3>
        <p>The Institute of Health and Nursing Australia (IHNA) is committed to providing an effective, fair, and confidential process for handling student complaints, appeals, and feedback. We aim to ensure a timely, respectful, and transparent resolution of all concerns, in alignment with our regulatory obligations and our dedication to a student-focused learning environment.</p>
        <p><strong>Submit a Complaint, Appeal or Feedback </strong></p>
        <p>To know more about How to Submit, Track &amp; Appeal Your Complaint click. <Link href="/pdf/IHNA_Student_Complaint_Guide.pdf">Student Complaint Guide</Link></p>
        <p>This is IHNA’s official channel for student complaints, appeals, and feedback. Your submission will be handled confidentially by trained staff and assessed in a fair, timely, and impartial manner.</p>
        <p><strong>What to Expect</strong></p>
        <ul>
          <li>You will receive an acknowledgement within 24 hours.</li>
          <li>IHNA aims to resolve matters within 30 calendar days.</li>
          <li>You will be informed of the progress and outcome.</li>
          <li>Where necessary, you will be advised of external appeal options.</li>
        </ul>
        <p><strong>Already Spoken to IHNA Staff?</strong></p>
        <p>If you have already raised your concern informally or discussed the issue with an IHNA staff member and are not satisfied with the outcome, we encourage you to submit a formal complaint through the <a href="https://complaints.ihna.edu.au/" rel="noopener noreferrer">Student Complaint Management System</a> and refer to the <Link href="/pdf/IHNA_Student_Complaint_Guide.pdf">Student Complaint Guide</Link> for detailed instructions on the process</p>
      </Rich>
      <Tabs
        tone="muted"
        variant="pill"
        tabs={[
          { label: 'DOMESTIC STUDENTS', content: (
              <Rich depth={1}>
                <ol>
                  <li>Students are encouraged to resolve complaints informally with the Trainer/ Student Support officer before making a formal complaint.</li>
                  <li>If not satisfied students are further encouraged to speak to the Course Coordinator of their enrolled course and present their complaint. The Course Coordinator will try and resolve the issue and come to a satisfactory solution.</li>
                  <li>If not satisfied, the student can follow the formal complaints process.</li>
                </ol>
                <h3>FORMAL COMPLAINTS PROCESS:</h3>
                <ul>
                  <li>Students should complete a ‘Student Complaints and Appeals Form’. A paper form is available at IHNA campus.</li>
                  <li>The Complaint is recorded in the Student Complaints in the KH and Student Profile.</li>
                  <li>IHNA will convene a panel comprising of the Campus Manager and Course Coordinator who will investigate the complaint and make a decision. This decision is recorded and will be reviewed by the Compliance team for opportunities for Continuous improvement. This will be then reviewed by the COO.</li>
                  <li>During investigation, the complainant will be given an opportunity to formally present their case and have the option of being accompanied/ assisted by a nominee (such as a family member, friend or counsellor) if they so desire. If the students are using a paid nominee it will be at their own cost. The nominee must present their photo ID while accompanying the student at any of the appointments at IHNA.</li>
                  <li>The students are informed by email of the outcome of the complaint and will be recorded in the student portal.</li>
                  <li>Students may use the Formal Appeals Process if they are not satisfied with the outcome of the complaint resolution process.</li>
                  <li>If the student is dissatisfied with the resolution proposed by IHNA, they can access the provision of an independent mediator; Student Mediation Scheme provided by Resolution Institute.</li>
                </ul>
                <h3>FORMAL APPEALS PROCESS:</h3>
                <ul>
                  <li>Students should complete a ‘Student Complaints and Appeals Form’. A paper form is available at IHNA campus.</li>
                  <li>The Appeal is recorded in the Student Complaints and Appeal in the KH and Student Profile.</li>
                  <li>IHNA will convene a panel comprised of the Training Manager, Director of Studies and/or COO (someone more senior and not previously involved in the case added to the panel for appeals) who will investigate the appeal and make a decision.</li>
                  <li>The appellant will be given an opportunity to formally present their case to the panel and have the option of being accompanied/assisted by a nominee (such as a family member, friend or counsellor) if they so desire.</li>
                  <li>The students are informed by email of the outcome of the appeal and will be recorded in the student portal.</li>
                  <li>If the student is dissatisfied with the appeals process by IHNA, they can access the provision of an independent mediator; Student Mediation Scheme provided by Resolution Institute.</li>
                  <li>If a student is still not satisfied after third-party mediation, they can contact higher regulatory bodies.</li>
                </ul>
                <p><Link href="/ihna-policies/IHNA_Student_Complaints_and_Appeals_Policy.pdf">Please read our Student Complaints and Appeals Policy</Link></p>
              </Rich>
            ) },
          { label: 'INTERNATIONAL STUDENTS', content: (
              <Rich depth={1}>
                <ol>
                  <li>Students are encouraged to resolve complaints informally with the Trainer/ Student Support staff before making a formal complaint.</li>
                  <li>If not satisfied students are further encouraged to speak to the Course Coordinator of their enrolled course and present their complaint. The Course Coordinator will try and resolve the issue and come to a satisfactory solution.</li>
                  <li>If not satisfied, the student can follow the formal process.</li>
                </ol>
                <h3>FORMAL COMPLAINTS PROCESS:</h3>
                <ul>
                  <li>Students should complete a ‘Student Complaints and Appeals Form’. A paper form is available at IHNA campus.</li>
                  <li>The Complaint is recorded in the Student Complaints in the KH and Student Profile.</li>
                  <li>IHNA will convene a panel comprising of the Campus Manager and Course Coordinator who will investigate the complaint and make a decision. This decision is recorded and will be reviewed by the Compliance team for opportunities for Continuous improvement. This will be then reviewed by the COO.</li>
                  <li>During investigation, the complainant will be given an opportunity to formally present their case and have the option of being accompanied/ assisted by a nominee (such as a family member, friend or counsellor) if they so desire. If the students are using a paid nominee it will be at their own cost. The nominee must present their photo ID while accompanying the student at any of the appointments at IHNA.</li>
                  <li>The students are informed by email of the outcome of the complaint and will be recorded in the student portal.</li>
                  <li>Students may use the Formal Appeals Process if they are not satisfied with the outcome of the complaint resolution process.</li>
                  <li>If the student is dissatisfied with the resolution proposed by IHNA, they can access the provision of an independent mediator; Student Mediation Scheme provided by Resolution Institute.</li>
                  <li>If not satisfied with the outcome of Resolution institute, students may take up the complaint with OMBUDSMAN.</li>
                </ul>
                <h3>FORMAL APPEALS PROCESS:</h3>
                <ul>
                  <li>Students should complete a ‘Student Complaints and Appeals Form’. A paper form is available at IHNA campus.</li>
                  <li>The Appeal is recorded in the Student Complaints and Appeal in the KH and Student Profile.</li>
                  <li>IHNA will convene a panel comprised of the Training Manager, Director of Studies and/or COO (someone more senior and not previously involved in the case added to the panel for appeals) who will investigate the appeal and make a decision.</li>
                  <li>The appellant will be given an opportunity to formally present their case to the panel and have the option of being accompanied/assisted by a nominee (such as a family member, friend or counsellor) if they so desire.</li>
                  <li>The students are informed by email of the outcome of the appeal and will be recorded in the student portal.</li>
                  <li>If the student is dissatisfied with the appeals process by IHNA, they can access the provision of an independent mediator; Student Mediation Scheme provided by Resolution Institute.</li>
                  <li>If not satisfied with the outcome of Resolution institute, students may take up the case with OMBUDSMAN</li>
                </ul>
                <p><Link href="/ihna-procedures/IHNA_Student_Complaints_and_Appeals_Procedure.pdf">Please read our Student Complaints and Appeals Procedure</Link></p>
              </Rich>
            ) },
        ]}
      />
      <Rich>
        <p>If you experience any issues submitting this form, you can also contact us at the email address: studentcomplaints@ihna.edu.au</p>
        <p><strong>To lodge a complaint/appeal/feedback use the student complaint management system</strong></p>
      </Rich>
      <Cta links={[
        {
          href: 'https://complaints.ihna.edu.au/',
          label: 'Student complaint/appeal management system',
          style: 'primary',
        },
      ]} variant="inline" />
    </>
  )
}
