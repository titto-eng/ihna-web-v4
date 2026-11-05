import type { Payload } from 'payload'
import type { AdapterName, DeliveryRow, DestinationDef, FormDef } from '@/lib/enquiries/types'
import type { CampaignAttribution } from '@/lib/enquiries/campaign'
import type { CampusLite, CourseLite, LandingLite, RoutingLite } from '@/lib/enquiries/lookups'

/** What the adapters see of a stored enquiry. Built by the job from the `enquiries` row; plain data. */
export type EnquiryRecord = {
  id: number | string
  publicId?: string | null
  submissionId: string
  formKey: string
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
  country?: string | null
  studentType?: string | null
  consent?: boolean | null
  data: Record<string, unknown>
  pageUrl?: string | null
  ip?: string | null
  hutk?: string | null
  campaignCode?: string | null
  utm?: {
    utmSource?: string | null; utmMedium?: string | null; utmCampaign?: string | null; utmTerm?: string | null; utmContent?: string | null
    gclid?: string | null; fbclid?: string | null; referrer?: string | null; landingPath?: string | null
  } | null
}

export type AdapterInput = {
  payload?: Payload
  enquiry: EnquiryRecord
  form: FormDef
  destination: DestinationDef
  /** The delivery target this call is for (a recipient group, `ihm`/`ihna`, `autoresponder`, ...). */
  target: string
  course: CourseLite | null
  campus: CampusLite | null
  routing: RoutingLite
  /** Portal enquiry source after 41's resolution: fixed, campaign, form default, site default (24). */
  sourceId: number
  /** The landing row the form was posted from (matched on `pageUrl`), or null. */
  landing?: LandingLite | null
  /** The stored code's campaign-table rows (41), or null when the site has no table. */
  campaign?: CampaignAttribution | null
  /** The delivery row as stored, so a retry can resume (dynamics keeps the lead id). */
  existing?: DeliveryRow | null
  env?: Record<string, string | undefined>
}

export type PlannedHttp = {
  method: 'POST' | 'PUT' | 'PATCH'
  url: string
  headers: Record<string, string>
  encoding: 'json' | 'form'
  body: Record<string, unknown>
  /** Why this request exists (e.g. "contacts upsert"). Stored with the dry-run record. */
  note?: string
}

export type EmailMessage = {
  to: string[]
  cc?: string[]
  replyTo?: string
  subject: string
  html: string
  text: string
  headers?: Record<string, string>
}

export type PlannedMeta = { hsSourceFallback?: boolean; missingEnv?: string[] }
export type Planned =
  | ({ transport: 'http'; requests: PlannedHttp[] } & PlannedMeta)
  | ({ transport: 'email'; message: EmailMessage } & PlannedMeta)

export type SendResult =
  | { ok: true; responseCode?: number; externalId?: string; responseBody?: string }
  | { ok: false; retryable: boolean; responseCode?: number; error: string; externalId?: string; responseBody?: string }

export type DeliveryResult = {
  status: 'sent' | 'dry_run' | 'failed' | 'dead'
  responseCode?: number
  externalId?: string
  lastError?: string
  /** The recorded request (dry run) or the live response `{live, response:{code, body}}`. Stored in the row's `dryRunRequest` json. */
  dryRunRequest?: unknown
  /** Why the adapter only recorded (dry_run rows): stored in `lastError`, e.g. `missing: HUBSPOT_ACCESS_TOKEN`. */
  note?: string
  hsSourceFallback?: boolean
}

export interface Adapter {
  name: AdapterName
  enabled(env?: Record<string, string | undefined>): boolean
  /** Delivery rows this destination expands to (one per recipient group, per portal, ...). */
  targets(destination: DestinationDef): string[]
  plan(input: AdapterInput): Planned | Promise<Planned>
  send(planned: Planned, input: AdapterInput): Promise<SendResult>
}

/** Missing configuration. Never retried: retrying cannot fix it. */
export class AdapterConfigError extends Error {}
