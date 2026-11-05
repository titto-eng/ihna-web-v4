// Generated on 2026-10-21 from the live page through scripts/import/html-to-blocks.ts. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { ImageText, Pic, Rich, img, QuickFacts } from '@/components/page'
import { CourseLandingPage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/study-at-ihna/domestic/certificate-iii-in-pathology-collection-perth/'

export const metadata: Metadata = landingMetadata(PATH)

export default function DomesticCertificateIiiInPathologyCollectionPerthRoute() {
  return (
    <CourseLandingPage
      path={PATH}
      hero={{ heading: 'HLT37525 - Certificate III in Pathology Collection', subheading: 'Become a Pathology Collector in Months, with Real Clinical Experience', image: img({ src: '/landing/study-at-ihna/domestic/certificate-iii-in-pathology-collection-perth/img/banner-pc-mob.webp', alt: 'HLT37525 - Certificate III in Pathology Collection', width: 659, height: 586 }), variant: 'split', audienceSwitch: false }}
      body={
        <>
          <Rich depth={1}>
            <p>Classes just 3 days a week</p>
          </Rich>
          <QuickFacts
            items={[
              { label: 'Intakes', value: <>New batches starting bi-monthly</> },
              { label: 'Mode of Delivery', value: <>Face to Face</> },
              { label: 'AQF Level', value: <>3</> },
              { label: 'Course Fee', value: <>Government funding available for eligible students</> },
              { label: 'Location', value: <>Perth</> },
              { label: 'Course Duration', value: <>6 Months <span>This training is delivered with Western Australian Funding.</span> <span>If the student is eligible for government funding, the student pays $1,300.86.</span> <span>If the student holds a valid concession card, the student pays $385.44*.</span></> },
            ]}
          />
          <Rich depth={1}>
            <h2>Why Certificate III in Pathology Collection from IHNA?</h2>
            <p>Learn venepuncture & capillary collection, infection prevention, specimen handling, ID checks, consent and documentation.</p>
            <p>Get supervised experience during your ~35-hour placement at approved collection centres.</p>
            <p>Study online at your own pace, with scheduled on-campus labs and ample time for needlework.</p>
          </Rich>
          <ImageText depth={1} media={img({ src: '/landing/study-at-ihna/domestic/certificate-iii-in-pathology-collection-perth/img/block-pc.webp', alt: '', width: 800, height: 533 })} imageSide="right">
            <h2>Where You Can Work</h2>
            <ul>
              <li>Pathology Collector / Phlebotomist</li>
              <li>Specimen Collection Officer</li>
              <li>Hospital Phlebotomy Unit</li>
              <li>GP & Specialist Clinics</li>
              <li>Mobile/Home Collection</li>
            </ul>
          </ImageText>
          <Rich depth={1}>
            <h2>Who Can Apply?</h2>
            <h3>Entry requirements made simple.</h3>
            <ul>
              <li><strong>Age:</strong> 18+ at course start</li>
              <li><strong>Schooling:</strong> Year 10 (or equivalent)</li>
              <li><strong>English & LLN:</strong> Short Language, Literacy & Numeracy check</li>
              <li><strong>ID & USI:</strong> Valid photo ID and a Unique Student Identifier (USI)</li>
              <li><strong>Access:</strong> Computer, internet and basic digital skills</li>
              <li><strong>Clinic readiness:</strong> Steady hand/fine motor skills, comfortable working around needles, blood and biohazard controls</li>
            </ul>
            <p>Note: Subclass 500 visa holders aren't eligible for this domestic course.</p>
            <h2>Already studied elsewhere? Apply for Credit Transfer!</h2>
          </Rich>
          <ImageText depth={1} media={img({ src: '/landing/study-at-ihna/domestic/certificate-iii-in-pathology-collection-perth/img/steps-web.svg', alt: '', width: 618, height: 533 })} imageSide="right">
            <h2>How it Works?</h2>
            <p>Enquire today and have a quick chat to confirm the right programme, complete the paperwork, then start training with orientation, sim-lab practice and a supervised placement arranged by IHNA. (Details may vary by campus and course.)</p>
          </ImageText>
          <Rich depth={1}>
            <h3>Empowering the next generation of Pathology Collectors</h3>
          </Rich>
          <QuickFacts
            variant="stats"
            items={[
              { label: 'Student Satisfaction', value: '92.1%' },
              { label: 'Students Studied', value: '30,000+' },
              { label: 'Graduate Employment Rate', value: '82.7%' },
            ]}
          />
          <Rich depth={1}>
            <h2>Ready to launch your career in Pathology ?</h2>
            <h3>Secure your spot today!</h3>
            <p>Limited seats</p>
            <p>Real job outcomes</p>
            <p>Submit your details and speak to a course advisor within 24 hours</p>
          </Rich>
          <Rich depth={1}>
            <p><Pic src='/landing/study-at-ihna/domestic/certificate-iii-in-pathology-collection-perth/img/accreditation.webp' alt='' width={325} height={85} /></p>
          </Rich>
        </>
      }
    />
  )
}
