// Enquiry routing (DEC-19/63). Hand-edited constants; keep it plain data.
// Form destinations name a recipient group; the addresses are typed HERE, never copied from the old code (rule 4).
// `to`/`cc` are email addresses. `alertTo` gets the "delivery dead" alerts (no personal data in them). While a list is empty the
// group falls back to ENQUIRY_NOTIFY_TO. The old handlers also copied web-agency and developer mailboxes: those are not recreated.
export type RecipientGroup = { key: string; to: string[]; cc: string[] }

/** One group per staff role (brief-forms-campaigns §2 "Email"). TODO(ihna): a person types each mailbox. */
export const enquiryRouting: { recipientGroups: RecipientGroup[]; alertTo: string[]; defaultSourceId: number } = {
  recipientGroups: [
    { key: 'enquiries', to: [], cc: [] }, // general course enquiries (quick enquiry, landing pages, walk-in)
    { key: 'admissions', to: [], cc: [] }, // admissions team copy of quick enquiries
    { key: 'marketing', to: [], cc: [] }, // brochure downloads, blog enquiries, corporate registrations
    { key: 'agents', to: [], cc: [] }, // education agent registrations
    { key: 'referral', to: [], cc: [] }, // referral network applications
    { key: 'partnerships', to: [], cc: [] }, // global partners, employer expressions of interest, business enquiries
    { key: 'hr', to: [], cc: [] }, // job expressions of interest
    { key: 'student-support', to: [], cc: [] }, // corporate registrations
    { key: 'e-learning', to: [], cc: [] }, // online learning, corporate registrations
    { key: 'skilldemy', to: [], cc: [] }, // Skilldemy enquiries
    { key: 'health-careers-pathways', to: [], cc: [] }, // quick enquiries for the nursing pathway (KH 75 + pathway)
    { key: 'anaesthetic-technology', to: [], cc: [] }, // quick enquiries for KH 400
    { key: 'regional', to: [], cc: [] }, // Ballarat health careers pages
    { key: 'alumni', to: [], cc: [] }, // alumni registration and stories
    { key: 'scholarship', to: [], cc: [] }, // scholarship applications
    { key: 'events', to: [], cc: [] }, // event registrations
    { key: 'library', to: [], cc: [] }, // library enquiries
    { key: 'feedback', to: [], cc: [] }, // quick feedback
  ],
  alertTo: [],
  // The campaign table's `default` row (KH enquiry source 2, src/content/campaign-codes.ts); 41 §4.
  defaultSourceId: 2,
}
