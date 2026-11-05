import type { Payload } from 'payload'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const nonce = () => Math.random().toString(36).slice(2, 10)
export const uuid = () => crypto.randomUUID()

// Tests never start the in-process job runner, so nothing is delivered behind a test's back.
process.env.ENQUIRY_AUTORUN = '0'

export const boot = async (): Promise<Payload> => getPayload({ config: await config })

/** Forms and routing are code (src/content), so there is nothing to seed; callers keep their `seed` call. */
export async function seed(_payload: Payload) {}

export const request = (body: unknown, ip: string, extraHeaders: Record<string, string> = {}) => ({
  rawBody: typeof body === 'string' ? body : JSON.stringify(body),
  headers: new Headers({ 'content-type': 'application/json', 'x-forwarded-for': ip, ...extraHeaders }),
  contentType: 'application/json',
})

export const quickEnquiryBody = (over: Record<string, unknown> = {}, fields: Record<string, unknown> = {}) => ({
  formKey: 'quick-enquiry',
  submissionId: uuid(),
  fields: { firstName: 'Test', lastName: 'Person', email: `t-${nonce()}@example.test`, phone: '+61 400 000 000', consent: true, ...fields },
  pageUrl: 'http://localhost:3000/courses/',
  _hp_url: '',
  ...over,
})

/** Deletes enquiries by submissionId (the collection grants nobody delete; tests use overrideAccess). */
export async function removeEnquiries(payload: Payload, submissionIds: string[]) {
  if (!submissionIds.length) return
  await payload.delete({ collection: 'enquiries', where: { submissionId: { in: submissionIds } }, overrideAccess: true }).catch(() => {})
}

export const mailpit = 'http://localhost:8025/api/v1'
export async function mailpitUp(): Promise<boolean> {
  try {
    return (await fetch(`${mailpit}/info`, { signal: AbortSignal.timeout(2000) })).ok
  } catch {
    return false
  }
}
