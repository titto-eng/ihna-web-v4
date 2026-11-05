import { z } from 'zod'
import { ATTRIBUTION_KEYS, type AttributionKey } from './types'

export const MAX_BODY_BYTES = 32 * 1024 // 40 §4: 32 KB max
export const CODE_PATTERN = /^[A-Za-z0-9_-]{2,64}$/ // 41 §2

/** Printable text only, trimmed and capped. Anything else becomes undefined. */
export function cleanText(v: unknown, max = 200): string | undefined {
  if (typeof v !== 'string') return undefined
  const s = v.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max)
  return s === '' ? undefined : s
}

const optionalText = (max = 200) => z.preprocess((v) => cleanText(v, max), z.string().optional())

/** The JSON body of `POST /api/enquire/` (40 §4). The client never sends a thank-you target (DEC-4): unknown keys are stripped. */
export const envelopeSchema = z.object({
  formKey: z.string().regex(/^[a-z0-9][a-z0-9_-]{0,63}$/, { error: 'unknown_form' }),
  submissionId: z.uuid({ error: 'submissionId must be a uuid' }),
  fields: z.record(z.string(), z.unknown()).default({}),
  campaign: optionalText(100),
  utm_source: optionalText(), utm_medium: optionalText(), utm_campaign: optionalText(), utm_term: optionalText(), utm_content: optionalText(),
  gclid: optionalText(), gbraid: optionalText(), wbraid: optionalText(), fbclid: optionalText(), msclkid: optionalText(),
  hutk: optionalText(64),
  referrer: optionalText(500),
  landingPath: optionalText(500),
  pageUrl: optionalText(2048),
  // Honeypot. Its name must never match a real field: agent-registration has a real `website` field.
  _hp_url: z.preprocess((v) => (typeof v === 'string' ? v.slice(0, 500) : undefined), z.string().optional()),
  captchaToken: z.preprocess((v) => (typeof v === 'string' ? v.slice(0, 4096) : undefined), z.string().optional()),
})
export type Envelope = z.infer<typeof envelopeSchema>

export const attributionOf = (e: Partial<Record<AttributionKey, string | undefined>>): Partial<Record<AttributionKey, string>> => {
  const out: Partial<Record<AttributionKey, string>> = {}
  for (const k of ATTRIBUTION_KEYS) if (e[k]) out[k] = e[k]
  return out
}

/** The attribution cookies (`site.attributionCookies`, 41 §4): first-party JSON. Every value is re-validated here. */
export function parseAttributionCookie(header: string | null | undefined, name: string): { campaign?: string } & Partial<Record<AttributionKey, string>> {
  if (!header) return {}
  const raw = header.split(/;\s*/).find((c) => c.startsWith(`${name}=`))
  if (!raw) return {}
  try {
    const json = JSON.parse(decodeURIComponent(raw.slice(name.length + 1))) as Record<string, unknown>
    const out: { campaign?: string } & Partial<Record<AttributionKey, string>> = {}
    const code = cleanText(json.campaign, 64)
    if (code && CODE_PATTERN.test(code)) out.campaign = code
    for (const k of ATTRIBUTION_KEYS) {
      const v = cleanText(json[k])
      if (v) out[k] = v
    }
    return out
  } catch {
    return {}
  }
}

export const hutkFromCookie = (header: string | null | undefined): string | undefined => {
  const raw = header?.split(/;\s*/).find((c) => c.startsWith('hubspotutk='))
  const v = cleanText(raw?.slice('hubspotutk='.length), 64)
  return v && /^[A-Za-z0-9]+$/.test(v) ? v : undefined
}

/** The rate-limit key for enquiries, payments and receipts: the platform's client address (src/lib/security/clientIp.ts). */
export { clientIp } from '@/lib/security/clientIp'
