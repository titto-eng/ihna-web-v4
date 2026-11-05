import type { Payload } from 'payload'
import { mailpitOnly } from '@/lib/adapters/email'
import { escapeHtml } from '@/lib/adapters/util'
import { isDryRun } from './config'

export type MailMessage = { to: string[]; subject: string; text: string; html?: string }

/**
 * Receipts and finance notices go through the Payload email adapter (Resend, or Mailpit in dev). DRY_RUN=1 sends only to a
 * local Mailpit and never through Resend or a real SMTP host (same rule as the enquiry adapters).
 */
export async function sendPaymentMail(payload: Payload, m: MailMessage, env: Record<string, string | undefined> = process.env): Promise<'sent' | 'skipped'> {
  if (!m.to.length) return 'skipped'
  if (isDryRun(env) && !mailpitOnly(env)) {
    console.info(`[payments] dry-run mail "${m.subject}" to ${m.to.length} recipient(s) not sent (no local mail catcher)`)
    return 'skipped'
  }
  await payload.sendEmail({ to: m.to, subject: m.subject, text: m.text, html: m.html ?? `<pre>${escapeHtml(m.text)}</pre>` })
  return 'sent'
}
