// Dynamics 365 payload mapping for IHNA (40 §6 "dynamics", brief §2). Hand-edited constants; keep it plain data. Option values
// come from the old SendEnquiryDynamics (RDynamics.php); the course and package options are in ./course-crm.ts, keyed by KH id.
// The shared adapter keeps the token and the `leads` -> `new_enquiries` transport; this file decides the bodies.
import { crmCampuses, crmCourses, dynamicsPackageOptions } from './course-crm'

export type DynamicsMap = {
  /** `new_enquiries.new_interesteduniversities` (IHNA 100000001). */
  interestedUniversities: number
  /** `new_enquiries.new_name`; null = the enquirer's full name. */
  enquiryName: string | null
  /** Lead `subject` when the destination gives none; null = "Enquiry from <form name>". */
  defaultSubject: string | null
  /** Bind `campaignid@odata.bind` from the campaign table (41); the fallback is this code's GUID. Null = no bind. */
  campaignFallbackCode: string | null
  /** Send `new_campaign` (the table's `leadSrc`). */
  sendNewCampaign: boolean
  /** Copy the message to the lead's `new_questionsorcomm` too. */
  messageOnLead: boolean
  courseOptions: Record<number, string>
  packageOptions: Record<string, string>
  /** Campus select key -> `new_preferredcampus`. */
  campusOptions: Record<string, number>
  studentTypeOptions: { domestic: number; international: number } | null
  /** Form field -> lead attribute, copied when the field has a value (booleans as true/false). */
  leadFields: Record<string, string>
}

export const dynamicsMap: DynamicsMap = {
  interestedUniversities: 100000001,
  enquiryName: 'Enquiry from IHNA Website',
  defaultSubject: 'Enquiry from IHNA Website',
  campaignFallbackCode: 'default',
  sendNewCampaign: true,
  messageOnLead: true,
  courseOptions: Object.fromEntries(crmCourses.filter((c) => c.dynamicsOption).map((c) => [c.khId, c.dynamicsOption!])),
  packageOptions: dynamicsPackageOptions,
  campusOptions: Object.fromEntries(Object.entries(crmCampuses).filter(([, c]) => c.dynamics).map(([k, c]) => [k, c.dynamics!])),
  studentTypeOptions: { domestic: 100000001, international: 100000000 },
  leadFields: {
    bestTimeContact: 'new_idealtimeto_call',
    city: 'address1_city',
    sixYearsEducation: 'new_6yearsofeducation',
    twoYearsGrades: 'new_twoyearsgrades',
    ieltsScore7: 'new_ieltsscoreof7',
    englishTest: 'new_doyouhaveavalidenglishproficiencytest',
  },
}
