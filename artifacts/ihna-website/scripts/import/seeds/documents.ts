// Site-specific inputs of the `static` and `documents` import steps (30-import §7.2; seeds/ is never synced with ihm-web).
// IHNA: the old repo `../ihna-web-2.0` stores whose files answer 200 on ihna.edu.au (checked file by file on 2026-10-21). Files of
// these stores that are 404 on live are listed in static-held.json `paths`; the live-only ones in its `missingOnServerOnly`.
import type { DocumentSection } from '../../../src/collections/Documents'

export type PageLink = [DocumentSection, string, string]
type Category = 'policy' | 'procedure' | 'staff-policy' | 'form' | 'guide' | 'handbook' | 'brochure' | 'other'
type Audience = 'students' | 'staff' | 'public'

/** Folders of the old repo copied to public/ at the same path (recursive). Not copied: brochures/, brochures-new/, ihna-policy/,
 *  the student handbooks (all 404 on live), demo/ (old HTML, rule 5), the landing folders (code routes). */
export const STATIC_STORES = ['pdf', 'ihna-policies', 'ihna-procedures', 'IHNA_International_Course_Guide', 'alumni/docs', 'emailers']

/** Single files of the old repo copied to public/ at the same path. Only these upload PDFs: the uploads tree also holds job
 *  applicants' cover letters and CVs, which never leave the old repo (rule 4). */
export const STATIC_FILES = [
  '/course-urls.json',
  '/wp-content/uploads/guides/Elearning_Support_Tool_Guide.pdf',
  '/wp-content/uploads/pdf/IHNA-Online-Service-Standards.pdf',
  '/wp-content/uploads/pdf/IHNA_ATSI_Flyer_2019_EV.pdf',
  '/wp-content/uploads/pdf/VFH-Statement-of-tuition-assurance-2018.pdf',
  '/wp-content/uploads/pdf/VSL-Statement-of-tuition-assurance-2018.pdf',
  '/wp-content/uploads/pdf/agent-guide-submitting-student-applications.pdf',
  '/wp-content/uploads/pdf/services_and_amenities.pdf',
]

/** public path → old repo path, for a file the live site serves under another name. */
export const STATIC_ALIASES: Record<string, string> = {}

/** Extensions copied besides the default allowlist (pdf, jpg, jpeg, png, webp, gif, svg): the two Diploma of Nursing entry
 *  requirement Word files and the course-finder data are live URLs. */
export const STATIC_EXTRA_EXTENSIONS = ['.docx', '.json']

/** Lines added to the static report's review list. */
export const STATIC_REVIEW: string[] = []

/** public/ folders whose PDFs become `documents` rows (their URL prefixes are DOCUMENT_PREFIXES in src/content/documents.ts). */
export const DOCUMENT_STORES = [
  'pdf',
  'ihna-policies',
  'ihna-procedures',
  'IHNA_International_Course_Guide',
  'alumni/docs',
  'wp-content/uploads/pdf',
  'wp-content/uploads/guides',
  'brochures',
]

/** [path prefix, category ('by-name': from the file name), audience]; first match wins, then the name heuristic with `public`. */
export const DOCUMENT_FOLDERS: [string, Category | 'by-name', Audience][] = [
  ['/ihna-policies/', 'policy', 'students'],
  ['/ihna-procedures/', 'procedure', 'students'],
  ['/pdf/VSL-VFH-policies-procedures/', 'by-name', 'students'],
  ['/pdf/VET_Student_Loan/', 'guide', 'students'],
  ['/pdf/Diploma_of_Nursing/', 'guide', 'students'],
  ['/pdf/ToR/', 'other', 'public'],
  ['/pdf/reports/', 'other', 'public'],
  ['/IHNA_International_Course_Guide/', 'guide', 'public'],
  ['/alumni/docs/', 'other', 'public'],
  ['/brochures/', 'brochure', 'public'],
]

/** Every live PDF link on /policies-links-forms/ (the WordPress page in the inventory snapshot), in page order: [section, href (decoded), link text].
 *  The page's 28 links to files that are 404 on live are left out. */
export const PAGE_LINKS: PageLink[] = [
  [
    'student-policies',
    '/ihna-policies/IHNA_Aboriginal_and_Torres_Strait_Islander_Education_and_Support_Policy.pdf',
    'Aboriginal and Torres Strait Islander Education and Support Policy',
  ],
  ['student-policies', '/ihna-policies/IHNA_Academic_Participation_and_Progress_Policy.pdf', 'Academic Participation and Progression Policy'],
  ['student-policies', '/ihna-policies/IHNA_Access_and_Equity_Policy.pdf', 'Access and Equity Policy'],
  ['student-policies', '/ihna-policies/IHNA_Assessment_Validation_Policy.pdf', 'Assessment Validation Policy'],
  [
    'student-policies',
    '/ihna-policies/IHNA_Certification_Issuing_and_Recognition_of_Qualifications_and_Statements_of_Attainment_Policy.pdf',
    'Certification Issuing and Recognition of Qualifications and Statements of Attainment Policy',
  ],
  [
    'student-policies',
    '/ihna-policies/IHNA_Communication_with_Regulators_and_Accreditation_Agencies_Policy.pdf',
    'Communication with Regulators and Accreditation Agencies Policy',
  ],
  ['student-policies', '/ihna-policies/IHNA_Credit_Transfer_Policy.pdf', 'Credit Transfer Policy'],
  ['student-policies', '/ihna-policies/IHNA_Critical_Incident_Response_Policy.pdf', 'Critical Incident Response Policy'],
  ['student-policies', '/ihna-policies/IHNA_Fees_Policy.pdf', 'Fees Policy'],
  ['student-policies', '/ihna-policies/IHNA_Plagiarism_and_Cheating_Policy.pdf', 'Plagiarism and Cheating Policy'],
  ['student-policies', '/ihna-policies/IHNA_Policy_Against_Sexual_Abuse_and_Sexual_Harassment.pdf', 'Policy Against Sexual Abuse and Sexual Harassment'],
  ['student-policies', '/ihna-policies/IHNA_Privacy_Policy.pdf', 'Privacy Policy'],
  ['student-policies', '/ihna-policies/IHNA_Professional_Experience_Placement_Policy.pdf', 'Professional Experience Placement Policy (Diploma of Nursing)'],
  ['student-policies', '/ihna-policies/IHNA_Professional_Experience_Placement_Policy_other.pdf', 'Professional Experience Placement Policy (Other Courses)'],
  ['student-policies', '/ihna-policies/IHNA_Recognition_of_Prior_Learning_Policy.pdf', 'Recognition of Prior Learning Policy'],
  ['student-policies', '/ihna-policies/IHNA_Refund_Policy.pdf', 'Refund Policy'],
  ['student-policies', '/ihna-policies/IHNA_Refund_Policy.pdf', 'Refund Policy – Domestic students'],
  ['student-policies', '/ihna-policies/IHNA_Risk_Management_Policy.pdf', 'Risk Management Policy'],
  ['student-policies', '/ihna-policies/IHNA_Social_Media_Policy.pdf', 'Social Media Policy'],
  ['student-policies', '/ihna-policies/IHNA_Student_Complaints_and_Appeals_Policy.pdf', 'Student Complaints and Appeals Policy'],
  ['student-policies', '/ihna-policies/IHNA_Student_Support_Services_Policy.pdf', 'Student Support Services Policy'],
  ['student-policies', '/ihna-policies/IHNA_student_code_of_conduct_policy.pdf', 'Student Code of Conduct Policy'],
  ['student-policies', '/ihna-policies/IHNA_Training_Package_Transition_Policy.pdf', 'Training Package Transition Policy'],
  ['student-policies', '/ihna-policies/IHNA_Prepaid_Fee_Management_Policy.pdf', 'Prepaid Fee Management Policy'],
  [
    'student-procedures',
    '/ihna-procedures/IHNA_Academic_Participation_and_Progress_Procedure_for_International_Student.pdf',
    'Academic Participation and Progression Procedure for International Students',
  ],
  [
    'student-procedures',
    '/ihna-procedures/IHNA_Academic_Participation_and_Progress_Procedure_for_Domestic_Student.pdf',
    'Academic Participation and Progression Procedure for Domestic Students',
  ],
  ['student-procedures', '/ihna-procedures/IHNA_Access_and_Equity_Procedure.pdf', 'Access and Equity Procedure'],
  ['student-procedures', '/ihna-procedures/IHNA_Assessment_Validation_Procedure.pdf', 'Assessment Validation Procedure'],
  ['student-procedures', '/ihna-procedures/IHNA_AHPRA_Mandatory_Notification_Reporting_Procedure.pdf', 'AHPRA Mandatory Notification Reporting Procedure'],
  [
    'student-procedures',
    "/ihna-procedures/IHNA_Procedure_for_Cancelling_Student's_Enrollment_in_a_Course.pdf",
    'Procedure for Cancelling a Student’s Enrolment in a Course',
  ],
  [
    'student-procedures',
    '/ihna-procedures/IHNA_Certification_Issuing_and_Recognition_of_Qualifications_and_Statements_of_Attainment_Procedure.pdf',
    'Certification, Issuing and Recognition of Qualifications and Statements of Attainment Procedure',
  ],
  [
    'student-procedures',
    '/ihna-procedures/IHNA_Communication_with_Regulators_and_Accreditation_Agencies_Procedure.pdf',
    'Communication with Regulators and Accreditation Agencies Procedure',
  ],
  ['student-procedures', '/ihna-procedures/IHNA_Credit_Transfer_Procedure.pdf', 'Credit Transfer Procedure'],
  ['student-procedures', '/ihna-procedures/IHNA_Critical_Incident_Response_Procedure.pdf', 'Critical Incident Response Procedure'],
  ['student-procedures', '/ihna-procedures/IHNA_Fee_Payment_Procedure.pdf', 'Fee Payment Procedure'],
  ['student-procedures', '/ihna-procedures/IHNA_Plagiarism_and_Cheating_Procedure.pdf', 'Plagiarism and Cheating Procedure'],
  [
    'student-procedures',
    '/ihna-procedures/IHNA_Professional_Experience_Placement_Procedure.pdf',
    'Professional Experience Placement Procedure (Diploma of Nursing)',
  ],
  [
    'student-procedures',
    '/ihna-procedures/IHNA_Professional_Experience_Placement_Procedure_other.pdf',
    'Professional Experience Placement Procedure (Other Courses)',
  ],
  ['student-procedures', '/ihna-procedures/IHNA_Recognition_of_Prior_Learning_Procedure.pdf', 'Recognition of Prior Learning Procedure'],
  ['student-procedures', '/ihna-procedures/IHNA_Refund_Procedure_Domestic_Students.pdf', 'Refund Procedure Domestic Students'],
  ['student-procedures', '/ihna-procedures/IHNA_Refund_Procedure_International.pdf', 'Refund Procedure International Students'],
  ['student-procedures', '/ihna-procedures/IHNA_Risk_Management_Procedure.pdf', 'Risk Management Procedure'],
  ['student-procedures', '/ihna-procedures/IHNA_Social_Media_Procedure.pdf', 'Social Media Procedure'],
  ['student-procedures', '/ihna-procedures/IHNA_Student_Complaints_and_Appeals_Procedure.pdf', 'Student Complaints and Appeals Procedure'],
  [
    'student-procedures',
    '/ihna-procedures/IHNA_Student_Review_Procedures_for_Re-Crediting_Fee_Help_Balance.pdf',
    'Student Review Procedures for Re-Crediting a Student Loans Balance',
  ],
  ['student-procedures', '/ihna-procedures/IHNA_Student_Support_Services_Procedure.pdf', 'Student Support Services Procedure'],
  ['student-procedures', '/ihna-procedures/IHNA_student_code_of_conduct_procedure.pdf', 'Student Code of Conduct Procedure'],
  ['student-procedures', '/ihna-procedures/IHNA_Prepaid_Tuition_Fees_Procedure.pdf', 'Prepaid Tuition Fees Management Procedure'],
  ['glossary', '/pdf/IHNA_glossary_of_terms.pdf', 'Glossary of Terms'],
]
/** Titles of the "Forms" and "Links" PDFs on the same page. */
export const FORM_TITLES: Record<string, string> = {
  '/wp-content/uploads/pdf/services_and_amenities.pdf': 'List of Services and Amenities',
  '/pdf/IHNA_Application_Enrolment_Domestic_VET_Form.pdf': 'Application Form – VET Courses',
  '/pdf/IHNA_International_Student_Application_Form.pdf': 'Application Form – International Students',
  '/pdf/1460789782_1428979842_ImmunisationDeclarationForm.pdf': 'Immunisation Declaration Form',
  '/pdf/1517016959_CreditTransferApplicationform.pdf': 'Application for Credit Transfer',
  '/pdf/VET_Student_and_NCVER_Privacy_Notice.pdf': 'VET Student and NCVER Privacy Notice',
}
