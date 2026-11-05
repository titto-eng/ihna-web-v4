// Generated on 2026-10-21 from the live page through scripts/import/html-to-blocks.ts. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { Pic, Rich } from '@/components/page'
import { CourseLandingPage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/study-at-ihna/flinders-pathways/'

export const metadata: Metadata = landingMetadata(PATH)

export default function StudyAtIhnaFlindersPathwaysRoute() {
  return (
    <CourseLandingPage
      path={PATH}
      hero={{ heading: 'IHNA has articulated pathways into the Flinders University', variant: 'split', audienceSwitch: false }}
      body={
        <>
          <Rich depth={1}>
            <p>This articulation allows our students to progress</p>
            <ul><li>CHC52015 – Diploma of Community Services (Case Management) to Bachelor of Disability & Developmental Education</li></ul>
            <p><Pic src='/landing/study-at-ihna/flinders-pathways/assets/images/flinder-l.png' alt='Flinders University' width={277} height={122} /></p>
            <p><Pic src='/landing/study-at-ihna/flinders-pathways/assets/images/enquirenow-bt.png' alt='' width={256} height={71} /></p>
            <p><Pic src='/landing/study-at-ihna/flinders-pathways/assets/images/banner-img.png' alt='Bachelor of Disability & Developmental Education' width={639} height={633} /></p>
            <p><Pic src='/landing/study-at-ihna/flinders-pathways/assets/images/diagram1.png' alt='IHNA articulation Pathway' width={1131} height={469} /></p>
            <p><Pic src='/landing/study-at-ihna/flinders-pathways/assets/images/mobile-process.png' alt='' width={515} height={1110} /></p>
            <h2>Diploma of Community Services to Bachelor of Disability & Developmental Education</h2>
            <h3>CHC52015 – Diploma of Community Services (Case Management)</h3>
            <p>This qualification reflects the roles of community services, case management and social housing workers involved in the managing, co-ordinating and/or delivering of person-centred services to individuals, groups and communities.<br /><br /> At this level, workers have specialised skills in community services and work autonomously under broad directions from senior management. Workers are usually providing direct support to individuals or groups of individuals. Workers may also have responsibility for the supervision of other workers and volunteers and/or case management; program coordination or the development of new business opportunities.</p>
            <p><Pic src='/landing/study-at-ihna/flinders-pathways/assets/images/1mg-2.png' alt='CHC52015 – Diploma of Community Services (Case Management)' width={409} height={400} /></p>
            <h3>Bachelor of Disability & Developmental Education</h3>
            <p>Develop the knowledge and skills to shape an inclusive society providing support and advocacy to help people live their best life with our range of disability degree programs.<br /><br /> Whether a highly sought-after professional qualification in a fast-growing sector as a developmental educator to meet the needs presented by the National Disability Insurance Scheme (NDIS) or broadening your professional opportunities and skills through positive behaviour support or in an evolving policy or practical context, you will learn to facilitate, support and build capacity for a wide range of people living with a disability.</p>
            <p><Pic src='/landing/study-at-ihna/flinders-pathways/assets/images/pathway-dia.png' alt='' width={900} height={574} /></p>
            <p><Pic src='/landing/study-at-ihna/flinders-pathways/assets/images/enq-img.png' alt='Study at IHNA' width={405} height={398} /></p>
            <h2>Quick Enquiry</h2>
            <h4><strong>Melbourne CBD Campus</strong></h4>
            <ul><li>Level 5 & 6, 131 Queen Street, Melbourne, VIC – 3000, Australia</li></ul>
            <h4><strong>Melbourne (Heidelberg) Campus</strong></h4>
            <ul><li>597-599 Upper Heidelberg Road, Heidelberg Heights, VIC 3081, Australia</li></ul>
            <h4>Perth Campus</h4>
            <ul><li>Level 2, 12 St Georges Terrace, Perth, WA – 6000, Australia</li></ul>
            <h4><strong>Sydney Campus</strong></h4>
            <ul><li>Level 7, 33 Argyle Street, Parramatta, NSW 2150, Australia</li></ul>
            <h4><strong>Melbourne (Administrative Office)</strong></h4>
            <ul><li>Level 1, 76-80 Turnham Avenue, Rosanna, VIC 3084, Australia</li></ul>
            <p><Pic src='/landing/study-at-ihna/flinders-pathways/assets/images/quick-enq.jpg' alt='hci' width={39} height={174} /></p>
          </Rich>
        </>
      }
    />
  )
}
