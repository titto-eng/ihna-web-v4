// Generated on 2026-10-21 from the live page through scripts/import/html-to-blocks.ts. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { ImageText, Pic, Rich, img, QuickFacts } from '@/components/page'
import { CourseLandingPage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/study-at-ihna/domestic/certificate-iii-in-sterilisation-services/'

export const metadata: Metadata = landingMetadata(PATH)

export default function DomesticCertificateIiiInSterilisationServicesRoute() {
  return (
    <CourseLandingPage
      path={PATH}
      hero={{ heading: 'HLT37015 - Certificate III in Sterilisation Services', subheading: 'Start Your Journey in Healthcare', image: img({ src: '/landing/study-at-ihna/domestic/certificate-iii-in-sterilisation-services/img/ECEC_mobile_banner_image.webp', alt: 'HLT37015 - Certificate III in Sterilisation Services', width: 856, height: 588 }), variant: 'split', audienceSwitch: false }}
      body={
        <>
          <Rich depth={1}>
            <p>Morning and Evening Sessions Available</p>
          </Rich>
          <QuickFacts
            items={[
              { label: 'Intakes', value: <>New batches<br />starting bi-monthly</> },
              { label: 'Mode of Delivery', value: <>Blended Online class</> },
              { label: 'AQF Level', value: <>3</> },
              { label: 'Course Fee', value: <>$4,800</> },
              { label: 'Pay Upfront', value: <>$3,800 <span><strong>*$1000</strong> discount when you pay upfront.</span></> },
              { label: 'Course Duration', value: <>6 Months <span>(Including 80 hrs placement)</span></> },
            ]}
          />
          <Rich depth={1}>
            <h2>Key Highlights</h2>
            <ul>
              <li>Truly Affordable</li>
              <li>One of the lowest fees in Australia</li>
              <li>Blended Learning</li>
              <li>Study Online with Flexible scheduling</li>
              <li>Credit Transfer Available</li>
              <li>Recognise previous course achievements</li>
            </ul>
          </Rich>
          <ImageText depth={1} media={img({ src: '/landing/study-at-ihna/domestic/certificate-iii-in-sterilisation-services/img/block.webp', alt: '', width: 743, height: 562 })} imageSide="right">
            <h2>Build a fulfilling career in Sterilisation with IHNA's Certificate Program</h2>
            <p>HLT37015 - Certificate III in Sterilisation Services supports the professional development of sterilisation technicians of health care facilities. The course covers cleaning and disinfecting reusable medical devices, using chemicals, sterilising loads, and managing sterilised stock. It provides graduates with a nationally recognised qualification. The training combines online theoretical study, on-campus simulation lab sessions, and practical experience in the industry.</p>
            <p>Upon completion, you’ll be qualified to work as:</p>
            <p>Sterilisation Technician</p>
            <p>Sterilisation Assistant</p>
            <p>Instrument Technician</p>
            <p>CSSD Technician</p>
            <p>This 6-month program includes a practical placement component designed to help you gain real-world experience in a sterilisation setting.</p>
          </ImageText>
          <Rich depth={1}>
            <h2>Who Can Apply? Entry requirements made simple</h2>
            <p>There are no strict academic prerequisites for this course, but applicants must:</p>
            <p>Be at least 18 years old and above</p>
            <p>Have completed Year 10 (or equivalent)</p>
            <p>Mature students (aged 22+) may also be considered if they can show readiness for the course.</p>
            <p>Language, Literacy, Numeracy and Digital (LLND).</p>
            <h3>LLND Assessment – What it means for you</h3>
            <p>All students must sit a short Language, Literacy, Numeracy and Digital (LLND) test. This ensures you’ll be comfortable with the course materials and learning requirements.</p>
            <p>We’ll guide you through the process – no stress, no exam-style pressure.</p>
            <h2>What You'll Learn</h2>
            <p>How to clean, inspect, package, and sterilise medical instruments and equipment for surgical and clinical procedures.</p>
            <p>Apply infection control practices to ensure a safe, hygienic environment.</p>
            <p>Manage sterile stock and chemical disinfection processes.</p>
            <p>Participate in professional experience placements to gain real-world skills</p>
            <h2>Already studied elsewhere? Apply for Credit Transfer!</h2>
            <p>If you’ve completed relevant units at another institution, you may be eligible for Credit transfer. Fast-track your course and avoid repeating the same content.</p>
          </Rich>
          <Rich depth={1}>
            <h2>Why more than 30,000 students have chosen IHNA</h2>
            <h3>Empowering the next generation of Sterilisation Services professionals</h3>
            <p>With over 30,000 students trained and nearly 20 years of experience, IHNA is proud to prepare skilled Sterilisation Services (CSSD) professionals through quality training, personal support, and nationally recognised qualifications.</p>
            <h2>92.4%</h2>
            <p>Student Satisfaction</p>
            <p>Students consistently rate IHNA highly for quality of training, support and experience (Source: NCVER 2025)</p>
            <h2>30,000+</h2>
            <p>Students Studied</p>
            <p>Across allied health, nursing, and community services since IHNA began</p>
            <h2>82.7%</h2>
            <p>Graduate Employment Rate</p>
            <p>Most IHNA students find a job after completing their qualification (Source: NCVER 2025)</p>
            <h2>Ready to launch your career in Sterilisation Services?</h2>
            <h3>Secure your spot today!</h3>
            <ul>
              <li>Limited seats</li>
              <li>Flexible payments</li>
              <li>Real job outcomes</li>
            </ul>
            <p>Submit your details and speak to a course advisor within 24 hours</p>
          </Rich>
          <Rich depth={1}>
            <p><Pic src='/landing/study-at-ihna/domestic/certificate-iii-in-sterilisation-services/img/accreditation.webp' alt='' width={325} height={85} /></p>
            <p>Flexible Evening</p>
            <p>Classes Available</p>
          </Rich>
        </>
      }
    />
  )
}
