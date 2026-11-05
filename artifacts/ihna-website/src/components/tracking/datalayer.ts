// dataLayer events (80-tracking §4 "Conversion events"). Typed builders that refuse PII, plus the browser helpers.
// GTM URL triggers on the old thank-you URLs keep working because those URLs are unchanged; these events sit beside them.

export type DataLayerEvent = { event: string; [key: string]: unknown }

// Keys that would carry personal data. `item_name`/`page_title` are product and page labels, so they are not listed.
const PII_KEYS = new Set([
  'name', 'first_name', 'last_name', 'full_name', 'given_name', 'family_name', 'email', 'email_address', 'phone', 'phone_number',
  'mobile', 'telephone', 'message', 'comment', 'comments', 'enquiry', 'address', 'street', 'postcode', 'dob', 'date_of_birth', 'country_of_residence',
])
const EMAIL = /[^\s@"']+@[^\s@"']+\.[^\s@"']+/

/** Throws when a payload carries a PII-shaped key (at any depth) or an email-like value. */
export function assertNoPii(value: unknown, path = 'event'): void {
  if (typeof value === 'string') {
    if (EMAIL.test(value)) throw new Error(`dataLayer: email-like value at ${path}`)
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => assertNoPii(v, `${path}[${i}]`))
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (PII_KEYS.has(k.toLowerCase())) throw new Error(`dataLayer: PII key "${k}" at ${path}`)
      assertNoPii(v, `${path}.${k}`)
    }
  }
}

const compact = <T extends DataLayerEvent>(e: T): T => {
  for (const k of Object.keys(e)) if (e[k] === undefined || e[k] === null || e[k] === '') delete e[k]
  assertNoPii(e)
  return e
}

export type LeadInput = { formKey: string; campaign?: string | null; courseCode?: string | null; campus?: string | null; studentType?: string | null; enquiryRef?: string | null }

export const generateLead = (i: LeadInput) =>
  compact({ event: 'generate_lead', form_key: i.formKey, campaign: i.campaign, course_code: i.courseCode, campus: i.campus, student_type: i.studentType, enquiry_ref: i.enquiryRef })

export const brochureDownload = (i: { formKey: string; courseCode?: string | null }) =>
  compact({ event: 'brochure_download', form_key: i.formKey, course_code: i.courseCode })

export const eventRegistration = (i: { eventSlug: string }) => compact({ event: 'event_registration', event_slug: i.eventSlug })

/** A direct visit to a thank-you URL (no stored enquiry): not a conversion. */
export const thankYouView = (path?: string) => compact({ event: 'thank_you_view', page_path: path })

export const pageViewVirtual = (pagePath: string, pageTitle?: string) => compact({ event: 'page_view_virtual', page_path: pagePath, page_title: pageTitle })

export type PurchaseInput = {
  transactionId: string
  value: number
  paymentType: string
  items: { itemId: string; itemName: string; price: number }[]
}

/** GA4 `purchase`. The caller passes server-rendered values from the `payments` row (rule 6); the browser never decides them. */
export const purchase = (i: PurchaseInput) =>
  compact({
    event: 'purchase',
    transaction_id: i.transactionId,
    value: i.value,
    currency: 'AUD',
    payment_type: i.paymentType,
    items: i.items.map((it) => ({ item_id: it.itemId, item_name: it.itemName, price: it.price })),
  })

// ------------------------------------------------------------------ browser helpers

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

export function pushDataLayer(event: DataLayerEvent): void {
  if (typeof window === 'undefined') return
  assertNoPii(event)
  ;(window.dataLayer ??= []).push(event)
}

/** Pushes at most once per `key` per tab session (`sessionStorage` guard). Returns whether it pushed. */
export function pushOnce(key: string, event: DataLayerEvent): boolean {
  if (typeof window === 'undefined') return false
  const k = `dl:once:${key}`
  try {
    if (window.sessionStorage.getItem(k)) return false
    window.sessionStorage.setItem(k, '1')
  } catch {
    /* storage blocked: push anyway, GA4 dedupes purchases by transaction_id */
  }
  pushDataLayer(event)
  return true
}

// ------------------------------------------------------------------ enquiry handoff (form -> thank-you page)

/** The form stores this after `POST /api/enquire` succeeds, then navigates with a full load. */
export const ENQUIRY_SESSION_KEY = 'ihna:enquiry'

export type StoredEnquiry = LeadInput

export function storeEnquiry(e: StoredEnquiry): void {
  try {
    window.sessionStorage.setItem(ENQUIRY_SESSION_KEY, JSON.stringify(e))
  } catch {
    /* ignore */
  }
}

/** Reads and clears the stored enquiry, so a reload of the thank-you page cannot push a second lead. */
export function takeEnquiry(): StoredEnquiry | null {
  try {
    const raw = window.sessionStorage.getItem(ENQUIRY_SESSION_KEY)
    if (!raw) return null
    window.sessionStorage.removeItem(ENQUIRY_SESSION_KEY)
    const v = JSON.parse(raw) as StoredEnquiry
    return v && typeof v.formKey === 'string' ? v : null
  } catch {
    return null
  }
}
