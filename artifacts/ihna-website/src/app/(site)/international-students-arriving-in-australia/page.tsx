// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, SplitProse, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'International Students Arriving in Australia',
  path: '/international-students-arriving-in-australia/',
  description: 'Congratulations on embarking on this exciting new journey! Did you know IHNA’s first course was specifically for International Students, so we have been…',
})

export default function InternationalStudentsArrivingInAustraliaRoute() {
  return (
    <>
      <Hero heading="International Students Arriving in Australia" variant="split" look="panorama" audienceSwitch={false} eyebrow="Current students" image={img({ src: '/images/ihna/pages/international-students-arriving-in-australia.webp', alt: 'Sydney Harbour Bridge at sunrise', width: 802, height: 1002 })} />
      <SectionNav section="current-student" current="/international-students-arriving-in-australia/" />
      <SplitProse tone="muted" eyebrow={'Arriving in Australia'} heading={'Information For International Students Arriving in Australia:'}>
        <p>Congratulations on embarking on this exciting new journey! Did you know IHNA’s first course was specifically for International Students, so we have been welcoming International Students from across ‘x’ different countries to Australia since 2007. We understand that you may be little nervous and so we want to ensure that we can support you through this transition as much as possible.</p>
        <p>For more information, kindly go through the <a href="https://online.fliphtml5.com/wmka/tdni/#p=1" rel="noopener noreferrer">International Student handbook</a>.</p>
        <p>Here are a few support services we offer:</p>
      </SplitProse>
      <SplitProse eyebrow={'Arriving in Australia'} heading={'Airport Pick–up and Transfer'}>
        <p>A 24 hour airport pick-up and transfer service is available to all new international students. To ensure you arrive to your new accommodation safe and sound, please contact the Student Support Manager at studentservices@ihna.edu.au three days prior to your arrival. The cost for this service is $80 per student per pick-up.</p>
      </SplitProse>
      <SplitProse tone="muted" eyebrow={'Arriving in Australia'} heading={'Accommodation Support'}>
        <p>IHNA provide students with accommodation at a reasonable cost. Our hostel and other accommodation facilities are arranged as close as possible to campus location. We offer the following: fully furnished shared accommodation which incorporates all utilities bills, internet facilities, local telephone facilities. Please note that Student</p>
        <p>Accommodation facilities are available only at Melbourne Campus and will be available to a limited number of students. This will be served on a first come first serve basis. For further details, contact the Student Support Manager at studentservices@ihna.edu.au.</p>
      </SplitProse>
      <SplitProse eyebrow={'Arriving in Australia'} heading={'Information Regarding Part-Time Employment'}>
        <p>Student visa holders are allowed to work a maximum of 20 hours per week when their courses are in session and unlimited hours when their courses are not in session. The National minimum wage is $18.93 per hour. For advice on employment and work please refer to the Department of Immigration and Border Protection (DIBP) at <a href="https://www.homeaffairs.gov.au/" rel="noopener noreferrer">www.homeaffairs.gov.au</a>.</p>
        <p>Please find the enclosed information that explains your rights as a student studying in Australia under the Education Services for Overseas Students Act 2000. You will need to indicate that you have read this information before signing your Letter of offer and agreement.</p>
      </SplitProse>
    </>
  )
}
