// Generated on 2026-10-21 from the live page through scripts/import/html-to-blocks.ts. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { ImageText, Pic, Rich, img, QuickFacts } from '@/components/page'
import { CourseLandingPage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/study-at-ihna/domestic/certificate-iii-health-services-assistance-melbourne/'

export const metadata: Metadata = landingMetadata(PATH)

export default function DomesticCertificateIiiHealthServicesAssistanceMelbourneRoute() {
  return (
    <CourseLandingPage
      path={PATH}
      hero={{ heading: 'HLT33115 – Certificate III in Health Services Assistance (Assisting in nursing work in acute care)', variant: 'split', audienceSwitch: false }}
      body={
        <>
          <Rich depth={1}>
            <p>At the moment, This course is not available for Subclass 500 visa holders</p>
            <p>Government funding available for eligible students</p>
            <p>Flexible payment options available for non-eligible students</p>
            <p>Eligible students can get credit transfers</p>
            <p>Dedicated student support team</p>
            <p>Professional Experience Placement</p>
          </Rich>
          <QuickFacts
            items={[
              { label: 'Intakes', value: <>New batches <br /> Starting bi-monthly</> },
              { label: 'Mode of Delivery', value: <>Blended & Face to Face. <span>AQF level</span> <span>3</span></> },
              { label: 'Course Fee', value: <>$2,499 <span>Victorian state government funding available for eligible students*</span></> },
              { label: 'Location', value: <>Melbourne</> },
              { label: 'Course Duration', value: <>12 Months <span>*This training is delivered with Victorian and Commonwealth Government Funding. The student tuition fees as published are subject to change given individual circumstances at enrolment. Contact us to learn more.</span></> },
            ]}
          />
          <Rich depth={1}>
            <h2>Key Highlights</h2>
            <ul>
              <li>On-Campus Simulation Workshops</li>
              <li>Professional Experience Placement</li>
              <li>New Batches Starting Bi-Monthly</li>
            </ul>
          </Rich>
          <ImageText depth={1} media={img({ src: '/landing/study-at-ihna/domestic/certificate-iii-health-services-assistance-melbourne/img/course-overview.webp', alt: '', width: 1380, height: 920 })} imageSide="right">
            <h2>Course Overview</h2>
            <p>This is a professional accreditation that focuses on the range of roles that provide assistance to health professional staff with the care of clients in acute care. Upon completion of the program, students will be able to perform various duties as an AIN, including assisting with basic nursing care, providing personal care, supporting patients' mobility, and assisting with diagnostic procedures in various healthcare settings, including hospitals, aged care facilities, and community health centres. The program also provides a pathway to further study in nursing or other healthcare-related disciplines.</p>
          </ImageText>
          <Rich depth={1}>
            <h2>Entry Requirements</h2>
            <p>There are no formal entry requirements for this qualification; however, applicants should demonstrate the ability to perform tasks as required by the industry.</p>
            <h4>IHNA Admission Requirements</h4>
            <ul><li>Applicants are required to be 18 years old and above.</li><li>Successful completion of an Australian Year 10 qualification or equivalent.</li></ul>
            <p><strong>Note:</strong> Mature age students (22+) may also be considered without the minimum education requirements. Each case will be reviewed individually to ascertain the capacity of the applicant to meet qualification requirements.</p>
            <h2>Possible Career Outcomes</h2>
            <p>With the Certificate III in Health Service Assistance (assisting in Nursing work in acute care) in hand, you’ll be able to work professionally as a:</p>
            <ul><li>Nursing Assistant in the Acute care department of a Hospital</li><li>Nursing Assistant in Age Care Centre</li><li>Personal Services Assistant</li><li>Care Service Employees</li><li>Ward Assistant</li><li>Personal Care Assistant</li><li>Operation Theatre Assistant</li><li>Patient Support Assistant</li><li>Nursing Support Worker</li><li>Patient handling & transport</li></ul>
            <h2>Credit Transfer</h2>
            <p>Have you already completed relevant units at another Australian educational institution? Get them credited and move forward faster!</p>
            <h2>How can I become an Health service assistant</h2>
            <p>IHNA offers the HLT33115 – Certificate III in Health Services Assistance (Assisting in nursing work in acute care). It is suitable for people looking work as an Health service assistant.</p>
            <h2>What does a Health service assistant do?</h2>
            <p>Health Services Assistants work in various healthcare settings, including hospitals, acute care facilities, and aged care centres. These professionals perform several key tasks in their daily work. The HLT33115 - Certificate III in Health Services Assistance prepares students for:</p>
            <ul><li>Assisting nurses with basic patient care and observations</li><li>Complying with infection prevention and control policies</li><li>Performing clinical cleaning and bed making</li><li>Providing personal care assistance (bathing, feeding, grooming)</li><li>Transporting non-emergency patients</li><li>Maintaining medical supplies and equipment</li><li>Offering emotional support to patients and families</li></ul>
            <h2>Awards Received by IHNA</h2>
            <h3>A Respected Institution</h3>
            <p>At IHNA, we are committed to elevating the student experience by pushing the boundaries of vocational education, whether online or on-campus</p>
          </Rich>
          <QuickFacts
            variant="stats"
            items={[
              { label: 'IHNA Shapes 1,000+ healthcare leaders annually.', value: '1,000+' },
              { label: 'Industry partnerships', value: '220+' },
              { label: 'Students studied with IHNA', value: '30,000+' },
            ]}
          />
          <Rich depth={1}>
            <h2>Take the next step in your career. Contact us today!</h2>
            <p><Pic src='/landing/study-at-ihna/domestic/certificate-iii-health-services-assistance-melbourne/img/accreditation.jpg' alt='' width={325} height={85} /></p>
          </Rich>
        </>
      }
    />
  )
}
