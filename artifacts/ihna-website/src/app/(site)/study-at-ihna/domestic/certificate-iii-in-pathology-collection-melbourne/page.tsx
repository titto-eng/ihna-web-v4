// Generated on 2026-10-21 from the live page through scripts/import/html-to-blocks.ts. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { ImageText, Pic, Rich, img, QuickFacts } from '@/components/page'
import { CourseLandingPage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/study-at-ihna/domestic/certificate-iii-in-pathology-collection-melbourne/'

export const metadata: Metadata = landingMetadata(PATH)

export default function DomesticCertificateIiiInPathologyCollectionMelbourneRoute() {
  return (
    <CourseLandingPage
      path={PATH}
      hero={{ heading: 'HLT37525 - Certificate III in Pathology Collection', subheading: 'Become a Pathology Collector in Months, with Real Clinical Experience', image: img({ src: '/landing/study-at-ihna/domestic/certificate-iii-in-pathology-collection-melbourne/img/banner-pc-mob.webp', alt: 'HLT37525 - Certificate III in Pathology Collection', width: 659, height: 586 }), variant: 'split', audienceSwitch: false }}
      body={
        <>
          <QuickFacts
            items={[
              { label: 'Intakes', value: <>New batches starting bi-monthly</> },
              { label: 'Mode of Delivery', value: <>Blended</> },
              { label: 'AQF Level', value: <>3</> },
              { label: 'Course Fee', value: <>$3,499 <span>*Victorian state government funding available for eligible students!</span></> },
              { label: 'Location', value: <>Melbourne</> },
              { label: 'Course Duration', value: <>6 Months <span>*This training is delivered with Victorian and Commonwealth Government Funding. The student tuition fees as published are subject to change given individual circumstances at enrolment. Contact us to learn more.</span></> },
            ]}
          />
          <Rich depth={1}>
            <h2>Flexible Study that Fits Real Life</h2>
            <p>Online Theory</p>
            <p>Short weekly modules with quizzes and trainer feedback.</p>
            <p>Skills Workshops</p>
            <p>On-campus labs to practise venepuncture and capillary collection, patient ID & consent, labelling, chain-of-custody, packing/centrifugation, and incident management—on real devices.</p>
            <p>35h Placement</p>
            <p>We arrange supervised hours with approved pathology providers.</p>
            <h2>Why Certificate III in Pathology Collection from IHNA?</h2>
            <p>Learn venepuncture & capillary collection, infection prevention, specimen handling, ID checks, consent and documentation.</p>
            <p>Get supervised experience during your ~35-hour placement at approved collection centres.</p>
            <p>Study online at your own pace, with scheduled on-campus labs and ample time for needlework.</p>
          </Rich>
          <ImageText depth={1} media={img({ src: '/landing/study-at-ihna/domestic/certificate-iii-in-pathology-collection-melbourne/img/block-pc.webp', alt: '', width: 800, height: 533 })} imageSide="right">
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
            <h2>What You'll Learn?</h2>
            <p>A practical, job-ready toolkit across specimen collection, patient care, safety, and airtight documentation, so clinics can trust you on Day 1.</p>
            <ul>
              <li><strong>Venepuncture & capillary collection:</strong>site selection, order of draw, managing difficult veins and adverse reactions.</li>
              <li><strong>Patient ID, consent & privacy:</strong>ensuring positive identification, explaining procedures, and providing culturally safe care.</li>
              <li><strong>Infection Prevention & Sharps Safety:</strong>Aseptic Technique, PPE, Waste Segregation, and Exposure Response.</li>
              <li><strong>Specimen handling & transport:</strong>tube/additive selection, mixing, labelling, storage temps, cold-chain basics.</li>
              <li><strong>Chain of custody and compliance:</strong>drug/alcohol screening protocols and legal documentation.</li>
              <li><strong>Communication & professionalism:</strong>calming anxious patients, understanding nuances in paediatric and elderly care, and teamwork with lab/clinic staff.</li>
              <li><strong>Documentation & digital systems:</strong>request forms, incident reporting, intro to collection/LIS workflows.</li>
              <li><strong>Quality focus:</strong>pre-analytical error reduction, QC checks, and escalation pathways.</li>
            </ul>
            <h2>Already studied elsewhere? Apply for Credit Transfer!</h2>
          </Rich>
          <ImageText depth={1} media={img({ src: '/landing/study-at-ihna/domestic/certificate-iii-in-pathology-collection-melbourne/img/steps-web.svg', alt: '', width: 618, height: 533 })} imageSide="right">
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
            <ul>
              <li>Limited seats</li>
              <li>Flexible payments</li>
              <li>Real job outcomes</li>
            </ul>
            <p>Submit your details and speak to a course advisor within 24 hours</p>
          </Rich>
          <Rich depth={1}>
            <p><Pic src='/landing/study-at-ihna/domestic/certificate-iii-in-pathology-collection-melbourne/img/accreditation.webp' alt='' width={325} height={85} /></p>
          </Rich>
        </>
      }
    />
  )
}
