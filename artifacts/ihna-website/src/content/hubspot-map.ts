// HubSpot contact mapping for IHNA (40 §6 "hubspot"; portal 26193905, EU1). Hand-edited constants; keep it plain data.
// The shared adapter (src/lib/adapters/hubspot.ts) builds firstname, lastname, email, phone, campus, course and campaign_source itself;
// this file names the site's own properties. The custom properties must exist in the portal, else HubSpot answers 400 (dead row).
export type HubspotMap = {
  /** `campaign_source` when neither the destination, the campaign table nor the form gives one (41 §6). */
  defaultCampaignSource: string
  /** Property for "where did you hear about us" (`whereHear` + `whereHearOther`). */
  whereHearProperty: string
  /** Form field name -> HubSpot property, for every form. A field's own `hubspotProperty` wins. */
  fieldProperties: Record<string, string>
  /** Fixed properties sent with every upsert. */
  constants: Record<string, string>
  /** Sent as the `referral_url` style property: the page the form was posted from. Null = not sent. */
  pageUrlProperty: string | null
  /** `student_type` values. */
  studentTypeProperty: string | null
  /**
   * The `course` value of a CMS course when it has no `hubspotCourseId`: `code` = the course code (`facts.code`), never a KH id;
   * unset = the KH id (IHM's behaviour).
   */
  courseValue?: 'code' | 'khId'
}

export const hubspotMap: HubspotMap = {
  defaultCampaignSource: 'IHNA Website',
  whereHearProperty: 'how_did_you_hear_about_us',
  fieldProperties: {
    message: 'message',
    country: 'current_country',
    state: 'state',
    preferredIntake: 'preferred_intake',
  },
  constants: { hs_lead_status: 'NEW' },
  pageUrlProperty: 'referral_url',
  studentTypeProperty: 'student_type',
  courseValue: 'code', // the old site sent `;<course code>` (HLT54121); the courses import sets hubspotCourseId to the code as well
}
