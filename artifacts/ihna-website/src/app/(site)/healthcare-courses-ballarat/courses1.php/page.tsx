// Generated on 2026-10-21 from the live page through scripts/import/html-to-blocks.ts. This file is the page: edit it freely.
import type { Metadata } from 'next'
import { Rich, img } from '@/components/page'
import { RegionalPage, landingMetadata } from '@/components/templates/landing/pages'

const PATH = '/healthcare-courses-ballarat/courses1.php'

export const metadata: Metadata = landingMetadata(PATH)

export default function HealthcareCoursesBallaratCourses1Route() {
  return (
    <RegionalPage
      path={PATH}
      hero={{ heading: 'Bootstrap 3 Gallery', image: img({ src: '/landing/healthcare-courses-ballarat/images/banner.jpg', alt: 'Bootstrap 3 Gallery', width: 1900, height: 689 }), variant: 'split', audienceSwitch: false }}
      body={
        <>
          <Rich depth={0}>
            <p>Fluid Layout With Overlay Effect</p>
            <h3>Our Campus</h3>
            <ul><li>Melbourne <br /> heidelberg</li><li>Melbourne<br /> CBD</li><li>North <br /> Melbourne</li><li>Perth <br /> (Carillon)</li><li>Perth<br /> (ST.George)</li><li>Sydney <br />ARGYLE</li><li>Sydney <br />(WENT-WORTH)</li></ul>
          </Rich>
        </>
      }
    />
  )
}
