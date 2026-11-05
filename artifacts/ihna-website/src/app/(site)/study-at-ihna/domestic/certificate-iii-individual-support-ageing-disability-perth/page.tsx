// Generated on 2026-10-21 from the live page through scripts/import/html-to-blocks.ts. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { ImageText, Pic, Rich, img, QuickFacts } from '@/components/page'
import { CourseLandingPage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability-perth/'

export const metadata: Metadata = landingMetadata(PATH)

export default function DomesticCertificateIiiIndividualSupportAgeingDisabilityPerthRoute() {
  return (
    <CourseLandingPage
      path={PATH}
      hero={{ heading: 'CHC33021 - Certificate III in Individual Support (Ageing & Disability)', subheading: 'Learn the skills to become a Support Worker in 6 Months', image: img({ src: '/landing/study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability-perth/img/banner-is-mob.webp', alt: 'CHC33021 - Certificate III in Individual Support (Ageing & Disability)', width: 748, height: 586 }), variant: 'split', audienceSwitch: false }}
      body={
        <>
          <Rich depth={1}>
            <p>Classes just 4 days a week</p>
          </Rich>
          <QuickFacts
            items={[
              { label: 'Intakes', value: <>New batches starting bi-monthly</> },
              { label: 'Mode of Delivery', value: <>Face to Face</> },
              { label: 'AQF Level', value: <>3</> },
              { label: 'Course Fee', value: <>$0 <span>Fee for Eligible Students</span></> },
              { label: 'Location', value: <>Perth</> },
              { label: 'Course Duration', value: <>6 Months <span>This training is delivered with Western Australian Funding.</span> <span>Funding is available subject to approval. Eligible students may commence training only after funding places are approved by the Department of Training and Workforce Development (DTWD).</span> <span>*The Student tuition fees are indicative only and are subject to change given individual circumstances at enrolment. Additional fees may apply such as resource fees and other fees.</span> <span>Refer to the “DTWD Funded Training” eligibility guidelines to check your funding eligibility.</span></> },
            ]}
          />
          <Rich depth={1}>
            <h2>Why Certificate III in Individual Support (Ageing and Disability) from IHNA?</h2>
            <p>Learn practical care, communication, infection prevention, and person-centred support.</p>
            <p>Get supervised experience with real clients during your 120-hour placement.</p>
            <p>Study online at your pace, with scheduled on‑campus skills days.</p>
          </Rich>
          <ImageText depth={1} media={img({ src: '/landing/study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability-perth/img/block-is.webp', alt: '', width: 742, height: 562 })} imageSide="right">
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
            <p>Note: Subclass 500 visa holders aren't eligible for this course.</p>
            <h2>Already studied elsewhere? Apply for Credit Transfer!</h2>
          </Rich>
          <ImageText depth={1} media={img({ src: '/landing/study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability-perth/img/steps-web.svg', alt: '', width: 618, height: 533 })} imageSide="right">
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
            <p>Limited seats</p>
            <p>Real job outcomes</p>
            <p>Submit your details and speak to a course advisor within 24 hours</p>
          </Rich>
          <Rich depth={1}>
            <p><Pic src='/landing/study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability-perth/img/accreditation.webp' alt='' width={325} height={85} /></p>
            <p>Mon - Thu</p>
          </Rich>
        </>
      }
    />
  )
}
