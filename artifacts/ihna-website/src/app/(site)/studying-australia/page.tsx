// Converted once from the old WordPress page and edited by hand; this file is the page.
import type { Metadata } from 'next'
import { pageMetadata, Link, SplitProse, Timeline, ValueCards } from '@/components/page'
import { CampusPage } from '@/components/templates/pages'

export const metadata: Metadata = pageMetadata({
  title: 'Study at IHNA',
  path: '/studying-australia/',
  description: 'Living and studying in Australia as an international student at IHNA, and how to apply for a course.',
})

export default function StudyingAustraliaRoute() {
  return (
    <CampusPage title="Study at IHNA" path="/studying-australia/" hero={{ heading: 'Welcome (Wominjeka) to Australia – Your Journey with IHNA', variant: 'compact', audienceSwitch: false, eyebrow: 'Study in Australia' }}>
      <SplitProse eyebrow="Study in Australia" heading="Your Journey with *IHNA*">
        <p>Australia is known for its multiculturalism, breathtaking landscapes, and friendly locals, making it a fantastic place for international students. As an IHNA student, you will enjoy a world-class education, a supportive student community, and opportunities to balance work and study.</p>
      </SplitProse>
      <ValueCards
        tone="muted"
        columns={4}
        heading="Life in *Australia*"
        items={[
          { title: 'Work and Study', body: 'International students can work part-time (up to 48 hours per fortnight), allowing them to support their studies and gain work experience.' },
          { title: 'Multicultural Society', body: 'Australia is home to diverse cultures, making it easy for international students to integrate.' },
          { title: 'Beautiful Cities & Nature', body: 'Experience Australia’s beautiful coastal cities, national parks, and warm climate. Cities like Sydney, Melbourne, Perth and Brisbane offer exciting student-friendly lifestyles, with numerous cafes, cultural events, and safe public transport.' },
          { title: 'Safety & Healthcare', body: 'Australia is one of the safest countries for international students, with access to high-quality healthcare services. All international students must have Overseas Student Health Cover (OSHC), ensuring they are covered for medical treatment during their stay.' },
        ]}
      />
      <Timeline
        heading="How to Apply for a Course at *IHNA*"
        steps={[
          { title: 'Explore Your Course Options', body: <p>Visit the <Link href="/courses/"><strong>IHNA Courses Page</strong></Link> to select a program that aligns with your career goals. Each course offers detailed information about the study duration, career outcomes, and entry requirements.</p> },
          {
            title: 'Prepare Your Documents',
            body: (
              <>
                <p>Gather the necessary documents for your application, including:</p>
                <ul>
                  <li>Academic qualifications (certified copies of transcripts or certificates)</li>
                  <li>Proof of English proficiency (IELTS, TOEFL, PTE, or equivalent)</li>
                  <li>Passport copy</li>
                  <li>Work experience (if required)</li>
                  <li>Genuine Student Test (GST) statement</li>
                  <li>Financial documents showing your ability to cover course fees and living costs</li>
                </ul>
              </>
            ),
          },
          { title: 'Submit Your Application', body: <p>Apply online through IHNA’s <a href="https://application.ihna.edu.au/" target="_blank" rel="noopener noreferrer">application portal</a> or contact a registered education agent for assistance. Ensure all documents are submitted correctly to avoid processing delays.</p> },
          { title: 'Receive Your Offer', body: <p>Once your application is reviewed and accepted, IHNA will issue a <strong>Letter of Offer</strong>. Read the terms and conditions carefully before accepting the offer. After accepting, you’ll need to pay the initial tuition deposit, and IHNA will provide you with a <strong>Confirmation of Enrolment (CoE)</strong>. This document is required for your student visa application.</p> },
          {
            title: 'Apply for Your Student Visa (Subclass 500)',
            body: (
              <>
                <p>With your CoE, you can apply for the <strong>Student Visa (Subclass 500)</strong> through the Department of Home Affairs. Make sure to include all required documents, including your CoE, proof of OSHC, financial capacity, and GST statement.</p>
                <p>Visa processing times vary, so apply well before your course start date to avoid delays.</p>
              </>
            ),
          },
          {
            title: 'Prepare for Your Arrival in Australia',
            body: (
              <ul>
                <li>Arrange <a href="https://www.studyaustralia.gov.au/en/plan-your-move/overseas-student-health-cover-oshc" target="_blank" rel="noopener noreferrer">Overseas Student Health Cover (OSHC)</a> for the entire duration of your stay. IHNA can help you organize your OSHC if needed.</li>
                <li>Look for accommodation options in your city of study. IHNA offers advice and resources to help you find suitable student housing, whether you prefer on-campus, off-campus, or homestay options.</li>
                <li>Book your flights to Australia, ensuring you arrive at least a week before the start of your course. This will give you enough time to settle in and attend orientation.</li>
              </ul>
            ),
          },
          { title: 'Attend IHNA’s Orientation Program', body: <p>Orientation is essential for new international students. It helps you understand your course structure, meet fellow students, and get familiar with IHNA’s campus facilities. You’ll also receive guidance on Australian life, safety, and student support services.</p> },
        ]}
      />
      <SplitProse tone="muted" eyebrow="IHNA" heading="Why Choose *IHNA*?">
        <p>IHNA offers a range of accredited health and nursing courses designed to equip you with the skills and knowledge to excel in your chosen field. Our Melbourne, Sydney, Perth, and Brisbane campuses provide state-of-the-art learning facilities, and our dedicated student support services ensure that international students receive the help they need to succeed academically and personally.</p>
        <h2>Additional Resources</h2>
        <p>For more detailed information on studying in Australia, visit the <a href="https://www.studyaustralia.gov.au/en">Study Australia website</a>. To learn more about IHNA’s courses and admissions process, check out the <Link href="/">IHNA website</Link>.</p>
        <p>We look forward to welcoming you to IHNA and supporting you through your exciting journey in Australia!</p>
      </SplitProse>
    </CampusPage>
  )
}
