// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, SplitProse, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'Professional Experience Placement',
  path: '/professional-experience-placement/',
  description: 'The Professional Experience Placement is an essential component of the course and allows you to prepare for the workplace by applying what you have…',
})

export default function ProfessionalExperiencePlacementRoute() {
  return (
    <>
      <Hero heading="Professional Experience Placement" variant="split" look="orbit" audienceSwitch={false} eyebrow="Current students" image={img({ src: '/images/ihna/pages/professional-experience-placement.webp', alt: 'Carer supporting an older person in a wheelchair', width: 524, height: 655 })} />
      <SectionNav section="current-student" current="/professional-experience-placement/" />
      <SplitProse tone="muted" eyebrow={'Placement'} heading={'What is Professional Experience Placement (PEP)?'}>
        <p>The Professional Experience Placement is an essential component of the course and allows you to prepare for the workplace by applying what you have learned in your course to the work environment.</p>
        <p>It involves more than just observing what is happening in the PEP venue as you will have specific learning outcomes or activities to undertake while on the placement.</p>
        <p>Where a Professional Experience Placement is undertaken onshore by international students, there must be full compliance with the requirements of the Guidelines for Applications for Approval of Work-Based Training in Courses for Overseas Students, the ESOS Act 2000 and the National Code 2007.</p>
      </SplitProse>
      <SplitProse eyebrow={'Placement'} heading={'What are the advantages of PEP?'}>
        <p>You have the opportunity to:</p>
        <ul>
          <li>Apply knowledge learned during your course in the workplace;</li>
          <li>Gain skills that are recognized by industry;</li>
          <li>Get to know employers’ expectations;</li>
          <li>Increase your employment options and employability skills; and</li>
          <li>Make contact with employers.</li>
        </ul>
      </SplitProse>
      <SplitProse tone="muted" eyebrow={'Placement'} heading={'How is a PEP venue found?'}>
        <p>The work placement will be arranged by IHNA once the student successfully completes the theory part of the course. Typically, the course coordinator will take into account where the students live and their mode of transport, to try and send them to the most appropriate and convenient location. However, there is no guarantee that you will be sent to your closest or preferred facility. While every effort is made to place students with their preferred employer and location, some students may be required to attend placement outside of their local area.</p>
        <p>Rigorous selection of the health care facility occurs through placement venue visits and venue assessment using health care facility profile by the IHNA Marketing Officer (PPs) and the Course Coordinator. The RTO “health care facility profile” ensures that each student has a worthwhile experience in an appropriate establishment supervised by qualified people who are prepared to supply supporting evidence.</p>
      </SplitProse>
      <SplitProse eyebrow={'Placement'} heading={'What are the costs of placements?'}>
        <p>The students are responsible to organize their own accommodation (if required) during Professional Experience Placement. As part of the program, the student may need to travel for Professional Experience Placement and all cost associated with travelling, uniform, placement material costs (e.g. for pocket articles) and accommodation shall be borne by the student.</p>
        <p>Additional fees may be/will be applicable for re-assessment and organizing additional clinical placements. The students are responsible for payment of clinical placement in case they couldn’t go on allocated time or replacing hours.</p>
      </SplitProse>
      <SplitProse tone="muted" eyebrow={'Placement'} heading={'Will I be paid?'}>
        <p>It is important to remember that you are a student and not a paid employee, so you will not receive a working wage. Students cannot simultaneously be working for an employer and be on professional placement.</p>
        <p>Specific placement requirements.</p>
      </SplitProse>
      <SplitProse eyebrow={'Placement'} heading={'Clinical Placement Compliance'}>
        <p>Once you have received the acceptance letter from IHNA, you must start the following placement compliance process immediately.</p>
        <h3>National police clearance</h3>
        <p>To comply with the requirements of placement providers, all IHNA students enrolled in the Diploma of Nursing Program who attends direct care/patient areas clinical placement are required to have a National police clearance certificate. Details of this requirement are included in their respective Department of Health website. The Department of Health, Commonwealth of Australia – State and Territories, has directed that an offer of placement in direct care/patient areas cannot occur until the completed police record have been assessed and clearance given.</p>
        <p>Student will need to complete the application form and return the form according to the instructions in the <a href="https://www.afp.gov.au/what-we-do/services/criminal-records/national-police-checks" rel="noopener noreferrer">application form</a>.</p>
        <h3>Working with Children Check</h3>
        <p>Student may have the opportunity to work with patients under the age of 18. However, before Student can be allowed contact with these minors Student needs to obtain a Working with Children (WWC) Check. The WWC Check is valid for five years. Student can pick up an application form from a participating Australia Post Office. It is advisable to undertake a non-volunteer status WWC Check so that it can be used in the future in an employment context. However, Students are able to apply for a Volunteer Check also. The Volunteer WWC Check is free.</p>
        <h3>Vaccinations/Immunisations</h3>
        <p>IHNA strongly endorses the recommendations included in the Immunisation Guidelines for Health Care Workers as stated by the various Department of Health, Commonwealth of Australia – State and Territories. IHNA requires that Students are vaccinated against preventable diseases such as diphtheria, tetanus, poliomyelitis, measles, mumps, rubella, chicken-pox, hepatitis B, hepatitis A and tuberculosis.</p>
        <p>IHNA requires all nursing students to ensure immunisations are up to date. Students attending clinical placement are required to provide an up to date immunisation record to staff at their allocated placement venue before they can begin their clinical placement.</p>
        <p>Important: Any non-compliance with regard to these requirements could lead to exclusion from the placement venue. IHNA will not be responsible for this.</p>
      </SplitProse>
    </>
  )
}
