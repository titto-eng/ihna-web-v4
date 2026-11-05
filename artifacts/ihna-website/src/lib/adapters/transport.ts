import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { resendAdapter } from '@payloadcms/email-resend'
import { site } from '@/content/site'
import { emailFrom, envValue, smtpConfig } from '@/lib/enquiries/config'

// Payload `email` adapter (40 §6): Resend when RESEND_API_KEY is set, otherwise SMTP (Mailpit on localhost:1025 in dev and test).
// With neither, production would have no way to send mail, so it falls back to a localhost SMTP transport that fails loudly
// instead of an Ethereal test account (nodemailerAdapter() with no options would call the network).
export function buildEmailAdapter() {
  const defaultFromAddress = emailFrom()
  const defaultFromName = site.siteName
  const apiKey = envValue('RESEND_API_KEY')
  if (apiKey) return resendAdapter({ defaultFromAddress, defaultFromName, apiKey })
  const smtp = smtpConfig() ?? { host: 'localhost', port: 1025 }
  return nodemailerAdapter({ defaultFromAddress, defaultFromName, transportOptions: { host: smtp.host, port: smtp.port, secure: false, ignoreTLS: true } })
}
