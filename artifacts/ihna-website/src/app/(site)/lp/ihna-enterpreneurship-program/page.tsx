// Generated on 2026-10-21 from the live page through scripts/import/html-to-blocks.ts. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { Rich, SplitProse, ValueCards, img } from '@/components/page'
import { EventInvitePage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/lp/ihna-enterpreneurship-program/'

export const metadata: Metadata = landingMetadata(PATH)

export default function LpIhnaEnterpreneurshipProgramRoute() {
  return (
    <EventInvitePage
      path={PATH}
      hero={{ heading: 'Announcing IHNA’s Open Day: Your Gateway to a Rewarding Career in Healthcare', image: img({ src: '/landing/lp/ihna-enterpreneurship-program/img/banner-img.jpg', alt: 'Announcing IHNA’s Open Day: Your Gateway to a Rewarding Career in Healthcare', width: 900, height: 600 }), variant: 'split', look: 'mosaic', audienceSwitch: false }}
      body={
        <>
          <SplitProse eyebrow="Open Day" heading="Start your *healthcare career*">
            <p>At IHNA, we are committed to nurturing the healthcare professionals of the future. Our Open Day is the perfect platform for you to get started on a fulfilling career in healthcare!</p>
            <p>Join us for a firsthand look at IHNA’s healthcare courses, meet our expert faculty, and explore our state-of-the-art campuses. Discover scholarship options, get career counselling, and have all your questions answered by our dedicated team.</p>
          </SplitProse>
          <SplitProse tone="muted" eyebrow="HCPA partnership" heading="This year, there’s more in *store!*">
            <h4>HCI Australia and Health Care Providers Association (HCPA) present an Exclusive Partnership for IHNA Students and Alumni!</h4>
            <p>HCI Australia is happy to announce our innovative partnership with the Health Care Providers Association (HCPA), opening doors to a world of entrepreneurship opportunities for IHNA students and alumni.</p>
            <p>Our Mission: To equip IHNA and IHM students and alumni with the tools and resources they need to thrive in the dynamic world of entrepreneurship in the healthcare and nursing sectors.</p>
            <h4>Join Us for IHNA’s Open Day,when you can learn more about these opportunities:</h4>
            <p>During IHNA’s much-awaited Open Day and in collaboration with HCPA, we are hosting a series of webinars to help you explore exciting possibilities in healthcare entrepreneurship.</p>
          </SplitProse>
          <ValueCards
            tone="default"
            heading="IHNA Open Day"
            items={[
              { mark: '1', title: 'Parramatta Campus | NSW', body: <><p><strong>November 2 Thursday</strong></p><p>Campus Address: Level 7, <br />33 Argyle St, <br />Parramatta NSW 2150</p></> },
              { mark: '2', title: 'Heidelberg Campus | VIC', body: <><p><strong>November 3 Friday</strong></p><p>Campus Address: 597 Heidelberg Rd, <br />Heidelberg Heights, <br />VIC 3081</p></> },
              { mark: '3', title: 'Perth Campus | WA', body: <><p><strong>November 9 Thursday</strong></p><p>Campus Address: Level 2, <br />12 St Georges Terrace, <br />Perth WA 6000</p></> },
            ]}
          />
          <ValueCards
            heading="About Health Care Providers Association (HCPA):"
            intro="HCPA is Australia's largest consulting firm, assisting individuals and businesses in successfully navigating the end-to-end registration process to operate effectively within government schemes. With extensive industry knowledge and partnerships, HCPA helps their clients scale and grow their businesses in the government-funded sector."
            items={[
              { title: 'Provider Registration (NDIS & Aged Care)', body: <p>HCPA guides you through the entire NDIS registration process, from compliance document creation to application submission, government negotiations, audit assistance, client acquisition, and ongoing business support.</p> },
              { title: 'Grow Traffic and Generate Aged Care & NDIS Revenue', body: <p>HCPA provides growth consulting services to help NDIS Providers achieve their business objectives, increasing traffic and generating revenue.</p> },
              { title: 'Renewing Provider Registrations (NDIS & Aged Care)', body: <p>HCPA ensures the seamless renewal of Provider registrations by reviewing documentation, making necessary amendments, completing all required applications, and working with auditors to facilitate renewals.</p> },
            ]}
          />
          <Rich depth={0}>
            <h2>Don't Miss IHNA’s Open Day: Your Chance to Explore Healthcare Entrepreneurship!</h2>
            <h2>Register for the event</h2>
          </Rich>
        </>
      }
    />
  )
}
