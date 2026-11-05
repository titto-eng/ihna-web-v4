// Generated on 2026-10-21 from the live page through scripts/import/html-to-blocks.ts. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { ImageText, Pic, Rich, img, QuickFacts } from '@/components/page'
import { CourseLandingPage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability-melbourne/'

export const metadata: Metadata = landingMetadata(PATH)

export default function DomesticCertificateIiiIndividualSupportAgeingDisabilityMelbourneRoute() {
  return (
    <CourseLandingPage
      path={PATH}
      hero={{ heading: 'CHC33021 - Certificate III in Individual Support (Ageing & Disability)', subheading: 'Learn the skills to become a Support Worker in 26 Weeks', image: img({ src: '/landing/study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability-melbourne/img/banner-is-mob.webp', alt: 'CHC33021 - Certificate III in Individual Support (Ageing & Disability)', width: 748, height: 586 }), variant: 'split', audienceSwitch: false }}
      body={
        <>
          <QuickFacts
            items={[
              { label: 'Intakes', value: <>New batches starting bi-monthly</> },
              { label: 'Mode of Delivery', value: <>Blended</> },
              { label: 'AQF Level', value: <>3</> },
              { label: 'Course Fee', value: <>$2,499 <span>*Victorian state government funding available for eligible students!</span></> },
              { label: 'Location', value: <>Melbourne</> },
              { label: 'Course Duration', value: <>6 Months <span>*This training is delivered with Victorian and Commonwealth Government Funding. The student tuition fees as published are subject to change given individual circumstances at enrolment. Contact us to learn more.</span></> },
            ]}
          />
          <Rich depth={1}>
            <h2>Flexible Study that Fits Real Life</h2>
            <p>Online Theory</p>
            <p>Short weekly modules, quizzes, and trainer feedback</p>
            <p>Skills Workshops</p>
            <p>On‑campus days to practise manual handling, personal care, communication and documentation.</p>
            <p>120h Placement</p>
            <p>We arrange your PEP with approved providers. You'll graduate with real references and confidence.</p>
            <h2>Why Certificate III in Individual Support (Ageing and Disability) from IHNA?</h2>
            <p>Learn practical care, communication, infection prevention, and person-centred support.</p>
            <p>Get supervised experience with real clients during your 120-hour placement.</p>
            <p>Study online at your pace, with scheduled on‑campus skills days.</p>
          </Rich>
          <ImageText depth={1} media={img({ src: '/landing/study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability-melbourne/img/block-is.webp', alt: '', width: 742, height: 562 })} imageSide="right">
            <h2>Where You Can Work</h2>
            <ul>
              <li>Aged Care Support Worker</li>
              <li>Disability Support Worker</li>
              <li>Home Care Assistant</li>
              <li>Personal Care Assistant</li>
              <li>Community Support Worker</li>
            </ul>
          </ImageText>
          <Rich depth={1}>
            <h2>Who Can Apply?</h2>
            <h3>Entry requirements made simple.</h3>
            <p>Age: 18+ at course start</p>
            <p>Schooling: Year 10 (or equivalent)</p>
            <p>English & LLND: You'll complete a short Language, Literacy & Numeracy check</p>
            <p>ID & USI: Valid ID and a Unique Student Identifier (USI)</p>
            <p>Access: Computer, internet and basic digital skills</p>
            <h2>What You'll Learn?</h2>
            <p>A practical, job‑ready set of skills across person‑centred care, communication, empowerment, infection prevention, and safety.</p>
            <p>Person-centred support & independence</p>
            <p>Communication and documentation</p>
            <p>Infection prevention & safe work practices</p>
            <p>Supporting people with disability & ageing</p>
            <p>First response and basic health support</p>
            <h2>Already studied elsewhere? Apply for Credit Transfer!</h2>
          </Rich>
          <ImageText depth={1} media={img({ src: '/landing/study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability-melbourne/img/steps-web.svg', alt: '', width: 618, height: 533 })} imageSide="right">
            <h2>How it Works?</h2>
            <p>Enquire today and have a quick chat to confirm the right programme, complete the paperwork, then start training with orientation, sim-lab practice and a supervised placement arranged by IHNA. (Details may vary by campus and course.)</p>
          </ImageText>
          <Rich depth={1}>
            <h3>Empowering the next generation of Care Workers</h3>
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
            <h2>Ready to launch your career in Care?</h2>
            <h3>Secure your spot today!</h3>
            <ul>
              <li>Limited seats</li>
              <li>Flexible payments</li>
              <li>Real job outcomes</li>
            </ul>
            <p>Submit your details and speak to a course advisor within 24 hours</p>
          </Rich>
          <Rich depth={1}>
            <p><Pic src='/landing/study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability-melbourne/img/accreditation.webp' alt='' width={325} height={85} /></p>
          </Rich>
        </>
      }
    />
  )
}
