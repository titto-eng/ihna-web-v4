// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, SplitProse, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'USI',
  path: '/usi/',
  description: 'If you intend to undertake VET training in Australia, you must get a USI – a Unique Student Identifier. Without a USI, training providers will be unable…',
})

export default function UsiRoute() {
  return (
    <>
      <Hero heading="USI" variant="split" look="orbit" audienceSwitch={false} eyebrow="Current students" image={img({ src: '/images/ihna/pages/usi.webp', alt: 'Nursing student holding a folder', width: 524, height: 655 })} />
      <SectionNav section="current-student" current="/usi/" />
      <SplitProse tone="muted" eyebrow={'USI'} heading={'Unique Student Identifier (USI)'}>
        <p>If you intend to undertake VET training in Australia, you must get a USI – a Unique Student Identifier. Without a USI, training providers will be unable to issue you a Completion Certificate, Statement of Attainment or Transcript to show that you have, indeed, successfully completed the training.</p>
      </SplitProse>
      <SplitProse eyebrow={'USI'} heading={'What is the Unique Student Identifier?'}>
        <p>The Unique Student Identifier or USI is a reference number that is allotted to a student for life, and allows all their training records to be linked. Through this scheme, every student who undertakes nationally recognised VET training in Australia (or overseas from an Australian-registered provider) will be able to access their enrolment and achievement record from a single authoritative source.</p>
        <p>The USI is required under the National VET Regulator Act, and from 1st January 2015, it will be mandatory for all students undertaking nationally recognised VET training to have a USI. Without a valid USI, a student cannot obtain a certificate or statement of attainment from a Registered Training Organisation.</p>
      </SplitProse>
      <SplitProse tone="muted" eyebrow={'USI'} heading={'What are the Advantages of this Scheme?'}>
        <p>With the introduction of the USI, students can conveniently obtain a complete record of their VET enrolments and achievements. They can provide training providers with access to an online authenticated record of student attainment.</p>
        <p>Training organisations will be able to assess pre-requisites, credit transfer and Recognition of Prior Learning (RPL), and can access complete data about access to and use of the VET sector. Easier online recording of enrolment details will help to streamline the assessment of course prerequisites, credit transfer and the assessment of eligibility for funding assistance.</p>
        <p>VET reforms can be carried out in the long term, as this will provide accurate and complete data about students’ training achievements and movements within the VET system. The new initiative will provide an important foundation for understanding and improving VET performance and for better meeting students’ needs.</p>
        <p>The USI is expected to assist in making all operations in the VET sector transparent and will help to build a consistent, national system for the storage of training information. This will eventually enhance quality assurance and future growth.</p>
      </SplitProse>
      <SplitProse eyebrow={'USI'} heading={'How should a Student Enrol for the USI?'}>
        <p>Students can apply for the USI from October 2014. After January 2015, the USI must be provided to the training provider before a student can receive a statement of attainment or qualification.</p>
        <p>Only registered training organisations (RTOs) can issue nationally recognised qualifications or statements of attainment, which ensures that students can have confidence that they will attain skills of a high quality, accepted and recognised everywhere in Australia. All nationally recognised training is listed on the training.gov.au website, and if the training you wish to undertake is not listed, it is not nationally recognised training.</p>
      </SplitProse>
      <SplitProse tone="muted" eyebrow={'USI'} heading={'What are the Details Required to Register for the USI?'}>
        <p>You are required to keep certain details ready before you can apply for the USI. One form of ID should be kept ready from the following list:</p>
        <ul>
          <li>Drivers licence</li>
          <li>Medicare card</li>
          <li>Australian passport</li>
          <li>Visa with non-Australian passport for international students</li>
          <li>Australian Birth certificate</li>
          <li>Certificate of Registration by descent</li>
          <li>Citizenship Certificate</li>
          <li>ImmiCard</li>
        </ul>
        <p>Please note that the details you enter when you create your USI must match exactly with those shown on the ID used.</p>
        <p>If you have none of the above, please contact your training organisation or the training organisation you intend to study with</p>
      </SplitProse>
      <SplitProse eyebrow={'USI'} heading={'Need Help or Further Info?'}>
        <p>The Australian Government provide full details on the USI scheme through the USI portal.</p>
        <p>You can also view the video about USI scheme by <a href="https://www.youtube.com/watch?v=QD8eXcYvlNk" rel="noopener noreferrer">clicking here</a>.</p>
        <p>If you need help with creating your USI, please talk to our Support Staff at any of our campuses or contact us on <a href="tel:1800225283">1800 22 52 83</a>.</p>
      </SplitProse>
    </>
  )
}
