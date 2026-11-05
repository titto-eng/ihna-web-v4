// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Table, Hero, Rich, Link, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'IHNA Fees Schedule : Funding Students',
  path: '/funding-fees-schedule/',
  description: 'Fee options including split payments (direct debits) are available to suit the convenience of students. State and federal government funding is available…',
})

export default function FundingFeesScheduleRoute() {
  return (
    <>
      <Hero heading="IHNA Fees Schedule : Funding Students" variant="split" look="editorial" audienceSwitch={false} eyebrow="Current students" image={img({ src: '/images/ihna/pages/funding-fees-schedule.webp', alt: 'Carer talking with an older man', width: 480, height: 600 })} />
      <SectionNav section="current-student" current="/funding-fees-schedule/" />
      <Table headerRow={true} variant="striped" rows={[
        ['Courses', 'Concession fee: Victoria*', 'Concession fee: Western Australia**', 'Non-concession fee: Victoria*', 'Non-concession fee: Western Australia**'],
        ['HLT33115 – Certificate III in Health Services Assistance (Assisting in nursing work in acute care)', '–', '$487.91', '–', '$1,634.75'],
        ['CHC33021 – Certificate III in Individual Support (Ageing and Disability)', '–', '$0.00', '–', '$0.00'],
        ['HLT37215 – Certificate III in Pathology Collection', '–', '$385.44', '–', '$1,300.86'],
        ['HLT37015 – Certificate III In Sterilisation Services', '–', '$489.85', '–', '$1,641.25'],
        ['HLT35021 – Certificate III in Dental Assisting', '–', '–', '–', '–'],
        ['CHC52025 – Diploma of Community Services (Case Management)', '–', '–', '–', '–'],
        ['HLT54121 – Diploma Of Nursing', '–', '$0.00', '–', '$0.00'],
      ]} />
      <Rich tone="muted" spacing="compact">
        <p><strong><sup>**</sup>For Western Australian funding:</strong></p>
        <ul>
          <li>This training is delivered with Western Australian Funding</li>
          <li>The Student tuition fees are indicative only and are subject to change given individual circumstances at enrolment. Additional fees may apply such as resource fees and other fees <Link href="/about-funding/#prog2">Click here</Link></li>
          <li>Refer to the ” DTWD Funded Training ” eligibility guidelines to check your funding eligibility. <Link href="/about-funding/#prog2">Click here.</Link></li>
          <li>For more information about VET Fees and charges policy, <a href="https://www.wa.gov.au/government/publications/vocational-education-and-training-fees-and-charges-policy" target="_blank" rel="noopener noreferrer">Click here</a></li>
        </ul>
      </Rich>
      <Rich>
        <p>Fee options including split payments (direct debits) are available to suit the convenience of students. State and federal government funding is available for eligible candidates. Enrolling in this qualification and availing the relevant state funding, may affect student’s future training options and the eligibility for further government subsidised training. Please contact each campus for details of current fee option and details. Campus based scholarships are also available for a limited number of candidates.</p>
        <p>This course has been approved for Centrelink student allowances. More information on assistance available can be found on the Centrelink website <a href="https://www.humanservices.gov.au/individuals/centrelink" rel="noopener noreferrer">www.centrelink.gov.au</a>. For information regarding your individual eligibility please contact Centrelink on 132490 or visit your local Customer Service Centre.</p>
      </Rich>
    </>
  )
}
