// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, DocumentGroups, Hero, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({
  title: 'VSL/ VFH Policies/ Procedures',
  path: '/vsl-vfh-policies-and-procedures/',
  description: 'VSL/ VFH Policies/ Procedures',
})

export default function VslVfhPoliciesAndProceduresRoute() {
  return (
    <>
      <Hero heading="VSL/ VFH Policies/ Procedures" variant="split" look="editorial" audienceSwitch={false} eyebrow="Current students" image={img({ src: '/images/ihna/pages/vsl-vfh-policies-and-procedures.webp', alt: 'Nurse in scrubs', width: 524, height: 655 })} />
      <SectionNav section="current-student" current="/vsl-vfh-policies-and-procedures/" />
      <DocumentGroups
        groups={[
          {
            title: 'VSL/ VFH Policies/ Procedures',
            docs: [
              { label: 'Admission and Enrolment Policy', href: '/pdf/VSL-VFH-policies-procedures/IHNA_Admission_and_Enrolment_Policy.pdf' },
              { label: 'Admission and Enrolment Procedure', href: '/pdf/VSL-VFH-policies-procedures/IHNA_Admission_and_Enrolment_Procedure_Updated.pdf' },
              { label: 'Privacy Policy', href: '/pdf/VSL-VFH-policies-procedures/IHNA_Privacy_Policy.pdf' },
              { label: 'Procedure for Cancelling a Student’s Enrolment in a Course', href: '/pdf/VSL-VFH-policies-procedures/IHNA_Cancelling_a_Student_Enrolment_in_a_Course.pdf' },
              { label: 'Procedure for withdrawal from VET course of Study or an Approved Course', href: '/pdf/VSL-VFH-policies-procedures/IHNA_Procedure_for_Withdrawal_from_VET_Course_of_Study.pdf' },
              { label: 'Student Complaints and Appeals Policy', href: '/pdf/VSL-VFH-policies-procedures/IHNA_Student_Complaints_and_Appeals_Policy.pdf' },
              { label: 'Student Complaints and Appeals Procedure', href: '/pdf/VSL-VFH-policies-procedures/IHNA_Student_Complaints_and_Appeals_Procedure.pdf' },
              { label: 'Student Entry Procedure', href: '/pdf/VSL-VFH-policies-procedures/IHNA_Student_Entry_Procedure_for_VET_Student_Loans.pdf' },
              { label: 'Student Review Procedures For Re-Crediting A Fee-Help Balance', href: '/pdf/VSL-VFH-policies-procedures/IHNA_Student_Review_Procedures_for_ReCrediting_Student_Loans_Balance.pdf' },
              { label: 'Tuition Protection Procedure', href: '/pdf/VSL-VFH-policies-procedures/IHNA_Tuition_Protection_Procedure.pdf' },
              { label: 'Tuition Protection Service Policy', href: '/pdf/VSL-VFH-policies-procedures/IHNA_Tuition_Protection_Service_Policy.pdf' },
            ],
          },
        ]}
      />
    </>
  )
}
