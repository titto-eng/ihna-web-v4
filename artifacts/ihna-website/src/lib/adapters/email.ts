import { AdapterConfigError, type Adapter, type AdapterInput, type EmailMessage, type Planned, type SendResult } from './types'
import { escapeHtml } from './util'
import { isEmailLive } from './live'
import { site } from '@/content/site'
import { emailSubjects } from '@/content/forms'
import { leadDescription, leadSource } from '@/lib/enquiries/campaign'
import { autoresponderVariant, courseFactsOf } from '@/lib/enquiries/conditions'
import { isLocalMailCatcher, notifyFallback } from '@/lib/enquiries/config'
import { contactFrom, splitName } from '@/lib/enquiries/contact'
import type { FormDef } from '@/lib/enquiries/types'

// Staff notification + autoresponder (40 §6 "email"). Resend when RESEND_API_KEY, else SMTP (Mailpit in dev).
// Sends for real only when `email` is in ENQUIRY_LIVE_ADAPTERS and RESEND_API_KEY or SMTP_HOST is set (live.ts); otherwise Mailpit-only.
// Bodies are escaped HTML (the old handlers interpolated raw $_POST, 05 §2.3). Reply-To is the enquirer.

export const AUTORESPONDER_TARGET = 'autoresponder'

// Subjects follow the old handlers (05 §2.3, §3.5): the form's `emailSubject`, else the site's `emailSubjects` map
// (src/content/forms.ts; IHNA sets `emailSubject` on every form), else the form's name.
export const subjectFor = (form: Pick<FormDef, 'key' | 'name' | 'emailSubject'>): string =>
  form.emailSubject?.trim() || emailSubjects[form.key] || (form.key.startsWith('lp-') ? 'Enquiry from Landing page' : `${site.shortName} : ${form.name ?? form.key}`)

const label = (f: FormDef['fields'][number]) => f.label?.trim() || f.name
function display(f: FormDef['fields'][number], v: unknown): string {
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  const s = String(v ?? '')
  return f.options?.find((o) => o.value === s)?.label ?? s
}

export function renderRows(rows: [string, string][]): { html: string; text: string } {
  return {
    html: `<table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse">${rows
      .map(([k, v]) => `<tr><th align="left">${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`)
      .join('')}</table>`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
  }
}

function staffMessage(input: AdapterInput, to: string[], cc: string[]): EmailMessage {
  const { enquiry: e, form, course, campus } = input
  const rows: [string, string][] = []
  for (const f of form.fields) {
    const v = e.data[f.name]
    if (v === undefined || v === '' || v === null) continue
    rows.push([label(f), display(f, v)])
  }
  if (course) rows.push(['Course (site)', course.title])
  else if (!form.fields.some((f) => f.name === 'courseKhId' && e.data[f.name])) {
    // a landing page's fixed course (src/content/course-crm.ts); a KH course picker already shows its own row
    const facts = courseFactsOf({ data: e.data, landing: input.landing })
    if (facts.title || facts.code) rows.push(['Course', facts.title ?? facts.code ?? ''])
  }
  if (campus) rows.push(['Campus (site)', campus.name])
  rows.push(['Form', form.key])
  if (e.campaignCode) rows.push(['Campaign code', e.campaignCode])
  const src = leadSource(input.campaign)
  if (src) rows.push(['Lead source', src])
  const desc = leadDescription(input.campaign)
  if (desc && desc !== src) rows.push(['Lead description', desc])
  if (e.pageUrl) rows.push(['Page', e.pageUrl])
  const u = e.utm
  for (const [k, v] of Object.entries({ utm_source: u?.utmSource, utm_medium: u?.utmMedium, utm_campaign: u?.utmCampaign, utm_term: u?.utmTerm, utm_content: u?.utmContent, gclid: u?.gclid, fbclid: u?.fbclid })) {
    if (v) rows.push([k, v])
  }
  rows.push(['Reference', e.publicId ?? String(e.id)])
  const body = renderRows(rows)
  const replyTo = e.email ?? undefined
  return {
    to, cc: cc.length ? cc : undefined, replyTo,
    subject: subjectFor(form),
    html: `<p>New enquiry received through the website.</p>${body.html}`,
    text: `New enquiry received through the website.\n\n${body.text}`,
    headers: { 'Idempotency-Key': `${e.id}:${input.target}` },
  }
}

const tokens = (s: string, vars: Record<string, string>): string => s.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => vars[k] ?? '')

function autoresponderMessage(input: AdapterInput): EmailMessage {
  const { enquiry: e, form, course } = input
  const to = e.email ?? contactFrom(e.data).email
  if (!to) throw new AdapterConfigError('Autoresponder needs an email address')
  const contactName = typeof e.data.contact1Name === 'string' ? splitName(e.data.contact1Name).firstName : ''
  const facts = courseFactsOf({ course, data: e.data, landing: input.landing })
  const vars = { firstName: e.firstName ?? contactFrom(e.data).firstName ?? contactName, courseTitle: course?.title ?? facts.title ?? '' }
  // a conditional variant (e.g. the short-course self-enrol steps) replaces the form's text
  const variant = autoresponderVariant(form, { facts, data: e.data, landingPath: input.landing?.path ?? null })
  const subject = tokens(variant?.subject ?? (form.autoresponder?.subject?.trim() || 'Thank you for your enquiry'), vars)
  const bodyText = tokens(variant?.body ?? (form.autoresponder?.body?.trim() || `Hi {{firstName}},\n\nThank you for contacting the ${site.siteName}. We have received your enquiry and will be in touch within 24 hours.`), vars)
  const html = bodyText.split(/\n{2,}/).map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('')
  return { to: [to], subject, html, text: bodyText, headers: { 'Idempotency-Key': `${e.id}:${AUTORESPONDER_TARGET}` } }
}

export const emailAdapter: Adapter = {
  name: 'email',
  enabled: () => true,
  targets: (d) => [d.config?.recipientGroup?.trim() || 'default'],
  plan(input): Planned {
    if (input.target === AUTORESPONDER_TARGET) return { transport: 'email', message: autoresponderMessage(input) }
    const group = input.routing.recipientGroups.find((g) => g.key === input.target)
    const to = group?.to.length ? group.to : notifyFallback(input.env ?? process.env)
    return { transport: 'email', message: staffMessage(input, to, group?.cc ?? []) }
  },
  async send(planned, input): Promise<SendResult> {
    if (planned.transport !== 'email') return { ok: false, retryable: false, error: 'not an email plan' }
    if (!planned.message.to.length) return { ok: false, retryable: false, error: `No recipients configured for "${input.target}" (src/content/enquiry-routing.ts)` }
    if (!input.payload) return { ok: false, retryable: false, error: 'no payload instance' }
    try {
      await input.payload.sendEmail({
        to: planned.message.to, cc: planned.message.cc, replyTo: planned.message.replyTo,
        subject: planned.message.subject, html: planned.message.html, text: planned.message.text,
        headers: planned.message.headers,
      })
      return { ok: true }
    } catch (e) {
      return { ok: false, retryable: true, error: `mail: ${e instanceof Error ? e.message : 'send failed'}`.slice(0, 200) }
    }
  },
}

/** Send a plain internal message (the dead-delivery alert). Follows the email adapter's switch: real when email is live, else Mailpit only. */
export async function sendInternalMail(payload: AdapterInput['payload'], message: { to: string[]; subject: string; text: string }, env: Record<string, string | undefined> = process.env): Promise<'sent' | 'skipped'> {
  if (!payload || !message.to.length) return 'skipped'
  if (!isEmailLive(env) && !mailpitOnly(env)) return 'skipped'
  await payload.sendEmail({ to: message.to, subject: message.subject, text: message.text, html: `<pre>${escapeHtml(message.text)}</pre>` })
  return 'sent'
}

/** An email adapter that is not live may still deliver to a local Mailpit (localhost-style host, dev port), never to another SMTP host or Resend. */
export const mailpitOnly = (env: Record<string, string | undefined> = process.env): boolean => isLocalMailCatcher(env)
