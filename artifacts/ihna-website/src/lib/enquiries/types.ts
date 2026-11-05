// Shapes shared by the route, the job and the adapters. Plain data: no Payload types leak into adapters.
export const FIELD_TYPES = ['text', 'email', 'tel', 'select', 'radio', 'textarea', 'checkbox', 'hidden', 'country', 'course', 'campus'] as const
export type FieldType = (typeof FIELD_TYPES)[number]

export type FormFieldDef = {
  name: string
  label?: string | null
  type: FieldType
  required?: boolean | null
  maxLength?: number | null
  pattern?: string | null
  options?: { value: string; label?: string | null }[] | null
  /** HubSpot property for this field when the site map (src/content/hubspot-map.ts) does not name one. Server-side only. */
  hubspotProperty?: string | null
}

/**
 * A condition on an enquiry (IHNA conditional destinations, autoresponders and thank-you paths). Every key given must hold.
 * Course facts come from the CMS course, the form's `courseKhId` field or the landing row (src/lib/enquiries/conditions.ts).
 */
export type When = {
  courseKhIdIn?: number[]
  courseCodeIn?: string[]
  /** The landing row the form was posted from (its registry path). */
  landingIn?: string[]
  /** A field's value is one of `in`, or (with `present`) is non-blank. */
  field?: { name: string; in?: string[]; present?: boolean }
  not?: When
}

export type AdapterName = 'email' | 'hubspot' | 'portalCrm' | 'portalStakeholder' | 'admissionsApi' | 'dynamics' | 'ihnaOnline'

export type DestinationDef = {
  adapter: AdapterName
  config?: {
    recipientGroup?: string | null
    fixedSourceId?: number | null
    defaultSourceId?: number | null
    hubspotCampaignSourceDefault?: string | null
    /** HubSpot `campaign_source` that neither a campaign code nor the form default can change (41 §6). */
    hubspotCampaignSourceFixed?: string | null
    /** Also create a HubSpot note on the contact with these fields (40 §6). */
    hubspotNote?: { fields: string[] } | null
    /** Dynamics lead `subject`. */
    dynamicsSubject?: string | null
    /** Campus key (src/content/course-crm.ts) when the form has no campus field, e.g. `online`. */
    campusFixed?: string | null
    /** Student type when neither the form nor the landing row gives one. */
    studentType?: 'domestic' | 'international' | null
  } | null
  /** Planned only when the condition holds at insert time (IHNA, 40 §6). */
  when?: When | null
}

export type FormDef = {
  key: string
  name?: string | null
  family?: string | null
  active?: boolean | null
  consentText?: string | null
  fields: FormFieldDef[]
  destinations: DestinationDef[]
  thankYou?: {
    type?: 'path' | 'brochure' | 'whatsapp' | 'inline' | null
    path?: string | null
    /** First matching rule wins over `path` (e.g. the short-course thank-you). */
    rules?: { when: When; path: string }[] | null
  } | null
  /** `variants`: the first whose `when` holds replaces subject and body, and plans the autoresponder even when `enabled` is false. */
  autoresponder?: {
    enabled?: boolean | null; subject?: string | null; body?: string | null
    variants?: { when: When; subject: string; body: string }[] | null
  } | null
  /** Staff email subject; unset = the shared defaults in src/lib/adapters/email.ts. */
  emailSubject?: string | null
  /** Campaign table code (src/content/campaign-codes.ts) used when the visitor's code is missing or unknown (41). */
  campaignFallback?: string | null
  captcha?: boolean | null
  honeypot?: boolean | null
}

/** What the browser may see of a definition: no destinations, recipients or autoresponder text. */
export type PublicFormDef = {
  key: string
  name?: string | null
  consentText?: string | null
  fields: FormFieldDef[]
  captcha: boolean
  honeypot: boolean
  thankYouType: 'path' | 'brochure' | 'whatsapp' | 'inline'
}

export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'dead' | 'held' | 'dry_run'
export type DeliveryRow = {
  id?: string | null
  adapter: string
  target?: string | null
  status?: DeliveryStatus | null
  attempts?: number | null
  at?: string | null
  responseCode?: number | null
  externalId?: string | null
  lastError?: string | null
  dryRunRequest?: unknown
  hsSourceFallback?: boolean | null
}

export const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid'] as const
export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number]

export const MAX_DELIVERY_ATTEMPTS = 5
