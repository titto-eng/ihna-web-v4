// Generated on 2026-10-21 from the live page through scripts/import/html-to-blocks.ts. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { ImageText, Pic, Rich, img, QuickFacts } from '@/components/page'
import { CourseLandingPage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/study-at-ihna/domestic/diploma-community-services/'

export const metadata: Metadata = landingMetadata(PATH)

export default function DomesticDiplomaCommunityServicesRoute() {
  return (
    <CourseLandingPage
      path={PATH}
      hero={{ heading: 'CHC52025 – Diploma of Community Services (Case Management)', image: img({ src: '/landing/study-at-ihna/domestic/diploma-community-services/img/banner-is-mob.webp', alt: 'CHC52025 – Diploma of Community Services (Case Management)', width: 748, height: 586 }), variant: 'split', audienceSwitch: false }}
      body={
        <>
          <Rich depth={1}>
            <h3>Learn the skills to become a Community Services Case Manager in 18 Months</h3>
            <p>Morning and Evening Sessions Available</p>
          </Rich>
          <QuickFacts
            items={[
              { label: 'Intakes', value: <>New batches starting bi-monthly</> },
              { label: 'Mode of Delivery', value: <>Face-to-Face & Blended</> },
              { label: 'AQF Level', value: <>5</> },
              { label: 'Course Fee', value: <>$10,000</> },
              { label: 'Pay Upfront', value: <>$9,000 <span><strong>*$1,000</strong> discount when you pay upfront.</span></> },
              { label: 'Location', value: <>Melbourne (Face-to-Face & Blended) <br /> Sydney & Perth (Blended)</> },
              { label: 'Course Duration', value: <>18 Months</> },
            ]}
          />
          <Rich depth={1}>
            <h2>Flexible Study that Fits Real Life</h2>
            <p>Online Theory</p>
            <p>Short weekly modules with quizzes and trainer feedback.</p>
            <p>Skills Workshops</p>
            <p>On-campus days to practise client interviews, assessment tools, goal setting, motivational interviewing, de-escalation, case conferencing, cultural safety, and rock-solid case notes using real-world scenarios and digital systems.</p>
            <p>160hr Placement</p>
            <p>We arrange your placement with approved community organisations. You'll graduate with real client experience, supervisor references, and the confidence to manage a caseload.</p>
            <h2>Why the Diploma of Community Services (Case Management) at IHNA?</h2>
            <p>Learn <strong>intake & assessment, case planning, risk/safety, advocacy, referral coordination,</strong> and <strong>professional documentation</strong> that stands up to audit.</p>
            <p>Get <strong>supervised experience</strong> with real clients during your industry placement—so employers see you're job-ready, not just qualified.</p>
            <p>Study <strong>online at your own pace</strong> with scheduled skills workshops, one-on-one trainer support, and career guidance to help you land interviews quickly.</p>
          </Rich>
          <ImageText depth={1} media={img({ src: '/landing/study-at-ihna/domestic/diploma-community-services/img/block-is.webp', alt: '', width: 6589, height: 4392 })} imageSide="right">
            <h2>Where You Can Work</h2>
            <ul>
              <li>Case Manager</li>
              <li>Support Coordinator (NDIS)</li>
              <li>Intake & Assessment Officer</li>
              <li>Family & Youth Support Worker</li>
              <li>Housing & Homelessness Worker</li>
              <li>Mental Health / AOD Support Worker</li>
            </ul>
          </ImageText>
          <Rich depth={1}>
            <h2>Who Can Apply?</h2>
            <h3>Entry requirements made simple.</h3>
            <p>Age: 18+ at course start</p>
            <p>Schooling: Year 12 (or equivalent) — or relevant Cert III/IV experience in community/health preferred</p>
            <p>English & LLND: Short Language, Literacy & Numeracy check</p>
            <p>ID & USI: Valid photo ID and a Unique Student Identifier (USI)</p>
            <p>Access: Computer, internet and basic digital skills</p>
            <p>People-ready: Comfortable interviewing clients, writing case notes and working with diverse communities</p>
            <p>Note: Subclass 500 visa holders aren't eligible for this domestic course.</p>
            <h2>What You'll Learn?</h2>
            <p>A practical, job-ready toolkit for real-world case management.</p>
            <p><strong>Intake & holistic assessment</strong> (risk, needs, strengths, eligibility)</p>
            <p><strong>Case planning & review</strong> with goals that are realistic and measurable</p>
            <p><strong>Trauma-informed, strengths-based practice</strong> that respects culture and choice</p>
            <p><strong>Risk & safety planning</strong> (DFV, homelessness, mental health, AOD) and escalation pathways</p>
            <p><strong>Referral & service coordination</strong> across health, housing, justice, NDIS and community supports</p>
            <p><strong>Professional documentation</strong>: case notes, consent, privacy, data and reporting that withstand audit</p>
            <p><strong>Communication that works</strong>: interviewing, de-escalation, boundaries, and interagency case conferencing</p>
            <p><strong>Ethics & legislation</strong>: duty of care, mandatory reporting, and rights-based practice</p>
            <h2>Already studied elsewhere? Apply for Credit Transfer!</h2>
          </Rich>
          <ImageText depth={1} media={img({ src: '/landing/study-at-ihna/domestic/diploma-community-services/img/steps-web.svg', alt: '', width: 618, height: 533 })} imageSide="right">
            <h2>How it Works?</h2>
            <p>Enquire today and have a quick chat to confirm the right programme, complete the paperwork, then start training with orientation, sim-lab practice and a supervised placement arranged by IHNA. (Details may vary by campus and course.)</p>
          </ImageText>
          <Rich depth={1}>
            <h3>Empowering the next generation of Community Services professionals</h3>
          </Rich>
          <QuickFacts
            variant="stats"
            items={[
              { label: 'Student Satisfaction', value: '92.4%' },
              { label: 'Students Trained', value: '30,000+' },
              { label: 'Graduate Employment Rate', value: '82.7%' },
            ]}
          />
          <Rich depth={1}>
            <h2>Ready to launch your career in Community Services?</h2>
            <h3>Secure your spot today!</h3>
            <ul>
              <li>Limited seats</li>
              <li>Flexible payments</li>
              <li>Real job outcomes</li>
            </ul>
            <p>Submit your details and speak to a course advisor within 24 hours</p>
          </Rich>
          <Rich depth={1}>
            <p><Pic src='/landing/study-at-ihna/domestic/diploma-community-services/img/accreditation.webp' alt='' width={325} height={85} /></p>
            <p>Flexible Evening</p>
            <p>Classes Available</p>
          </Rich>
        </>
      }
    />
  )
}
