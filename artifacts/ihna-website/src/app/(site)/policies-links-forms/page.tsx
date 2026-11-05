// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, DocumentGroups, Hero, img } from '@/components/page'
import { SectionNav } from '@/components/templates/SectionNav'

export const metadata: Metadata = pageMetadata({ title: 'Policies and Procedures', path: '/policies-links-forms/', description: 'Policies and Procedures' })

export default function PoliciesLinksFormsRoute() {
  return (
    <>
      <Hero heading="Policies and Procedures" variant="split" look="ribbon" audienceSwitch={false} eyebrow="Future students" image={img({ src: '/images/ihna/pages/policies-links-forms.webp', alt: 'A student checking the IHNA policy list on a phone', width: 1000, height: 1250 })} />
      <SectionNav section="student" current="/policies-links-forms/" />
      <DocumentGroups
        groups={[
          {
            title: 'POLICIES',
            docs: [
              { label: 'Aboriginal and Torres Strait Islander Education and Support Policy', href: '/ihna-policies/IHNA_Aboriginal_and_Torres_Strait_Islander_Education_and_Support_Policy.pdf' },
              { label: 'Academic Participation and Progression Policy', href: '/ihna-policies/IHNA_Academic_Participation_and_Progress_Policy.pdf' },
              { label: 'Access and Equity Policy', href: '/ihna-policies/IHNA_Access_and_Equity_Policy.pdf' },
              { label: 'Assessment Validation Policy', href: '/ihna-policies/IHNA_Assessment_Validation_Policy.pdf' },
              { label: 'Certification Issuing and Recognition of Qualifications and Statements of Attainment Policy', href: '/ihna-policies/IHNA_Certification_Issuing_and_Recognition_of_Qualifications_and_Statements_of_Attainment_Policy.pdf' },
              { label: 'Communication with Regulators and Accreditation Agencies Policy', href: '/ihna-policies/IHNA_Communication_with_Regulators_and_Accreditation_Agencies_Policy.pdf' },
              { label: 'Credit Transfer Policy', href: '/ihna-policies/IHNA_Credit_Transfer_Policy.pdf' },
              { label: 'Critical Incident Response Policy', href: '/ihna-policies/IHNA_Critical_Incident_Response_Policy.pdf' },
              { label: 'Fees Policy', href: '/ihna-policies/IHNA_Fees_Policy.pdf' },
              { label: 'Plagiarism and Cheating Policy', href: '/ihna-policies/IHNA_Plagiarism_and_Cheating_Policy.pdf' },
              { label: 'Policy Against Sexual Abuse and Sexual Harassment', href: '/ihna-policies/IHNA_Policy_Against_Sexual_Abuse_and_Sexual_Harassment.pdf' },
              { label: 'Privacy Policy', href: '/ihna-policies/IHNA_Privacy_Policy.pdf' },
              { label: 'Professional Experience Placement Policy (Diploma of Nursing)', href: '/ihna-policies/IHNA_Professional_Experience_Placement_Policy.pdf' },
              { label: 'Professional Experience Placement Policy (Other Courses)', href: '/ihna-policies/IHNA_Professional_Experience_Placement_Policy_other.pdf' },
              { label: 'Recognition of Prior Learning Policy', href: '/ihna-policies/IHNA_Recognition_of_Prior_Learning_Policy.pdf' },
              { label: 'Refund Policy', href: '/ihna-policies/IHNA_Refund_Policy.pdf' },
              { label: 'Risk Management Policy', href: '/ihna-policies/IHNA_Risk_Management_Policy.pdf' },
              { label: 'Social Media Policy', href: '/ihna-policies/IHNA_Social_Media_Policy.pdf' },
              { label: 'Student Complaints and Appeals Policy', href: '/ihna-policies/IHNA_Student_Complaints_and_Appeals_Policy.pdf' },
              { label: 'Student Support Services Policy', href: '/ihna-policies/IHNA_Student_Support_Services_Policy.pdf' },
              { label: 'Student Code of Conduct Policy', href: '/ihna-policies/IHNA_student_code_of_conduct_policy.pdf' },
              { label: 'Training Package Transition Policy', href: '/ihna-policies/IHNA_Training_Package_Transition_Policy.pdf' },
              { label: 'Prepaid Fee Management Policy', href: '/ihna-policies/IHNA_Prepaid_Fee_Management_Policy.pdf' },
            ],
          },
          {
            title: 'PROCEDURES',
            docs: [
              { label: 'Academic Participation and Progression Procedure for International Students', href: '/ihna-procedures/IHNA_Academic_Participation_and_Progress_Procedure_for_International_Student.pdf' },
              { label: 'Academic Participation and Progression Procedure for Domestic Students', href: '/ihna-procedures/IHNA_Academic_Participation_and_Progress_Procedure_for_Domestic_Student.pdf' },
              { label: 'Access and Equity Procedure', href: '/ihna-procedures/IHNA_Access_and_Equity_Procedure.pdf' },
              { label: 'Assessment Validation Procedure', href: '/ihna-procedures/IHNA_Assessment_Validation_Procedure.pdf' },
              { label: 'AHPRA Mandatory Notification Reporting Procedure', href: '/ihna-procedures/IHNA_AHPRA_Mandatory_Notification_Reporting_Procedure.pdf' },
              { label: 'Procedure for Cancelling a Student’s Enrolment in a Course', href: '/ihna-procedures/IHNA_Procedure_for_Cancelling_Student\'s_Enrollment_in_a_Course.pdf' },
              { label: 'Certification, Issuing and Recognition of Qualifications and Statements of Attainment Procedure', href: '/ihna-procedures/IHNA_Certification_Issuing_and_Recognition_of_Qualifications_and_Statements_of_Attainment_Procedure.pdf' },
              { label: 'Communication with Regulators and Accreditation Agencies Procedure', href: '/ihna-procedures/IHNA_Communication_with_Regulators_and_Accreditation_Agencies_Procedure.pdf' },
              { label: 'Credit Transfer Procedure', href: '/ihna-procedures/IHNA_Credit_Transfer_Procedure.pdf' },
              { label: 'Critical Incident Response Procedure', href: '/ihna-procedures/IHNA_Critical_Incident_Response_Procedure.pdf' },
              { label: 'Fee Payment Procedure', href: '/ihna-procedures/IHNA_Fee_Payment_Procedure.pdf' },
              { label: 'Plagiarism and Cheating Procedure', href: '/ihna-procedures/IHNA_Plagiarism_and_Cheating_Procedure.pdf' },
              { label: 'Professional Experience Placement Procedure (Diploma of Nursing)', href: '/ihna-procedures/IHNA_Professional_Experience_Placement_Procedure.pdf' },
              { label: 'Professional Experience Placement Procedure (Other Courses)', href: '/ihna-procedures/IHNA_Professional_Experience_Placement_Procedure_other.pdf' },
              { label: 'Recognition of Prior Learning Procedure', href: '/ihna-procedures/IHNA_Recognition_of_Prior_Learning_Procedure.pdf' },
              { label: 'Refund Procedure Domestic Students', href: '/ihna-procedures/IHNA_Refund_Procedure_Domestic_Students.pdf' },
              { label: 'Refund Procedure International Students', href: '/ihna-procedures/IHNA_Refund_Procedure_International.pdf' },
              { label: 'Risk Management Procedure', href: '/ihna-procedures/IHNA_Risk_Management_Procedure.pdf' },
              { label: 'Social Media Procedure', href: '/ihna-procedures/IHNA_Social_Media_Procedure.pdf' },
              { label: 'Student Complaints and Appeals Procedure', href: '/ihna-procedures/IHNA_Student_Complaints_and_Appeals_Procedure.pdf' },
              { label: 'Student Review Procedures for Re-Crediting a Student Loans Balance', href: '/ihna-procedures/IHNA_Student_Review_Procedures_for_Re-Crediting_Fee_Help_Balance.pdf' },
              { label: 'Student Support Services Procedure', href: '/ihna-procedures/IHNA_Student_Support_Services_Procedure.pdf' },
              { label: 'Student Code of Conduct Procedure', href: '/ihna-procedures/IHNA_student_code_of_conduct_procedure.pdf' },
              { label: 'Prepaid Tuition Fees Management Procedure', href: '/ihna-procedures/IHNA_Prepaid_Tuition_Fees_Procedure.pdf' },
            ],
          },
          {
            title: 'IHNA Glossary of Terms',
            docs: [
              { label: 'Glossary of Terms', href: '/pdf/IHNA_glossary_of_terms.pdf' },
            ],
          },
          {
            title: 'FORMS',
            docs: [
              { label: 'Application Form – VET Courses', href: '/pdf/IHNA_Application_Enrolment_Domestic_VET_Form.pdf' },
              { label: 'Application Form – International Students', href: '/pdf/IHNA_International_Student_Application_Form.pdf' },
              { label: 'Immunisation Declaration Form', href: '/pdf/1460789782_1428979842_ImmunisationDeclarationForm.pdf' },
              { label: 'Application for Credit Transfer', href: '/pdf/1517016959_CreditTransferApplicationform.pdf' },
              { label: 'VET Student and NCVER Privacy Notice', href: '/pdf/VET_Student_and_NCVER_Privacy_Notice.pdf' },
            ],
          },
        ]}
      />
    </>
  )
}
