// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Table, Hero, Rich, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'IHNA Fees Schedule : Domestic Full fee paying students',
  path: '/domestic-fees-schedule/',
  description: '* Speak to our consultant for available scholarship options',
})

export default function DomesticFeesScheduleRoute() {
  return (
    <>
      <Hero heading="IHNA Fees Schedule: Domestic Full fee paying students" variant="split" look="editorial" audienceSwitch={false} eyebrow="Current students" image={img({ src: '/images/ihna/pages/domestic-fees-schedule.webp', alt: 'Student with a tablet', width: 1000, height: 1250 })} />
      <SectionNav section="current-student" current="/domestic-fees-schedule/" />
      <Table headerRow={true} variant="striped" rows={[
        ['Courses*', 'Melbourne', 'Perth', 'Sydney', 'Brisbane'],
        ['CHC33021 – Certificate III in Individual Support (Ageing and Disability)', '$2,500.00', '$2,500.00', '$2,500.00', '–'],
        ['HLT33115 – Certificate III in Health Services Assistance (Assisting In Nursing Work in Acute Care)', '$2,500.00', '$2,500.00', '$2,500.00', '–'],
        ['HLT37525 – Certificate III in Pathology Collection', '$4,800.00', '$4,800.00', '$4,800.00', '$4,800.00'],
        ['HLT37015 – Certificate III in Sterilisation Services', '$4,800.00', '$4,800.00', '$4,800.00', '$4,800.00'],
        ['HLT35021 – Certificate III in Dental Assisting', '$7,000.00', '$7,000.00', '–', '–'],
        ['HLT54121 – Diploma of Nursing', '$24,000.00', '$30,000.00', '$24,000.00', '$24,000.00'],
        ['CHC52025 – Diploma of Community Services (Case Management)', '$10,000.00', '$10,000.00', '$10,000.00', '–'],
        ['HLT57921 – Diploma of Anaesthetic Technology and Practices', '$16,000.00', '–', '–', '$16,000.00'],
      ]} />
      <Rich>
        <p>* Speak to our consultant for available scholarship options</p>
      </Rich>
      <Table headerRow={true} variant="striped" rows={[
        ['Courses', 'Melbourne', 'Perth', 'Sydney', 'Brisbane'],
        ['HLTPAT005 – Collect Specimens for Drugs of Abuse Testing', '$450.00', '$450.00', '$450.00', '$450.00'],
        ['HLTAID009 – Provide Cardiopulmonary Resuscitation', '$80.00', '$80.00', '$80.00', '$80.00'],
        ['HLTAID010 – Provide Basic Emergency Life Support', '$80.00', '$80.00', '$80.00', '$80.00'],
        ['HLTAID011 – Provide First Aid', '$120.00', '$120.00', '$120.00', '$120.00'],
      ]} />
      <Rich>
        <p>Fee options including split payments (direct debits) are available to suit the convenience of students. State and federal government funding is available for eligible candidates. Enrolling in this qualification and availing the relevant state funding, may affect student’s future training options and the eligibility for further government subsidised training. Please contact each campus for details of current fee option and details. Campus based scholarships are also available for a limited number of candidates.</p>
        <p>WA Funded Students Concession Fee : Concession eligible students are holders of either a health care or pensioner concession card, recipients of AUSTUDY, ABSTUDY, or Youth Allowance.</p>
        <p><em>The Student tuition fees are indicative only and are subject to change given individual circumstances at enrolment. Additional fees may apply such as student service and resource fees.</em></p>
        <p>This course has been approved for Centrelink student allowances. More information on assistance available can be found on the Centrelink website <a href="https://www.humanservices.gov.au/Individuals/centrelink" rel="noopener noreferrer">www.centrelink.gov.au</a>. For information regarding your Individual eligibility please contact Centrelink on 132490 or visit your local Customer Service Centre.</p>
      </Rich>
    </>
  )
}
