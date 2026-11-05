// Generated on 2026-10-21 from the live page through scripts/import/html-to-blocks.ts. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { Rich } from '@/components/page'
import { RegionalPage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/healthcare-courses-ballarat/contact.php'

export const metadata: Metadata = landingMetadata(PATH)

export default function HealthcareCoursesBallaratContactRoute() {
  return (
    <RegionalPage
      path={PATH}
      hero={{ heading: 'Let\'s Talk', variant: 'split', audienceSwitch: false }}
      body={
        <>
          <Rich depth={0}>
            <h3>Our Campus</h3>
            <ul><li>Melbourne <br /> heidelberg</li><li>Melbourne<br /> CBD</li><li>North <br /> Melbourne</li><li>Perth <br /> (Carillon)</li><li>Perth<br /> (ST.George)</li><li>Sydney <br />ARGYLE</li><li>Sydney <br />(WENT-WORTH)</li></ul>
          </Rich>
        </>
      }
    />
  )
}
