// Lazy environment access for the enquiry pipeline. `src/env.ts` validates the names at boot; reading here (not at import)
// lets tests flip DRY_RUN, DYNAMICS_ENABLED and the like per case. Values are never logged or stored (rule 3).
import { site } from '@/content/site'

type Source = Record<string, string | undefined>

const read = (name: string, src: Source): string | undefined => {
  const v = src[name]
  return v === undefined || v.trim() === '' ? undefined : v.trim()
}

export const envValue = (name: string, src: Source = process.env): string | undefined => read(name, src)

export const isDryRun = (src: Source = process.env): boolean => (read('DRY_RUN', src) ?? '1') === '1'
/** `ENQUIRY_LIVE_ADAPTERS`: comma/semicolon/space separated adapter names (case-insensitive). Unset = none is live. */
export const liveAdapterList = (src: Source = process.env): string[] =>
  (read('ENQUIRY_LIVE_ADAPTERS', src) ?? '').split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean)
export const isDynamicsEnabled = (src: Source = process.env): boolean => read('DYNAMICS_ENABLED', src) === '1'
export const isProduction = (src: Source = process.env): boolean => (read('NODE_ENV', src) ?? 'development') === 'production'
export const siteUrl = (src: Source = process.env): string => (read('NEXT_PUBLIC_SITE_URL', src) ?? 'http://localhost:3000').replace(/\/$/, '')
export const emailFrom = (src: Source = process.env): string => read('EMAIL_FROM', src) ?? site.emailFromDefault

/** `RECAPTCHA_SECRET_KEY` is canonical (00-architecture); `RECAPTCHA_SECRET` is accepted as an alias. */
export const recaptchaSecret = (src: Source = process.env): string | undefined => read('RECAPTCHA_SECRET_KEY', src) ?? read('RECAPTCHA_SECRET', src)
export const recaptchaMinScore = (src: Source = process.env): number => {
  const n = Number(read('RECAPTCHA_MIN_SCORE', src))
  return Number.isFinite(n) && n > 0 && n <= 1 ? n : 0.5
}

/** Comma/semicolon separated list from `ENQUIRY_NOTIFY_TO`. */
export const notifyFallback = (src: Source = process.env): string[] =>
  (read('ENQUIRY_NOTIFY_TO', src) ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean)

export const rateLimitStore = (src: Source = process.env): 'memory' | 'postgres' => {
  const v = read('RATE_LIMIT_STORE', src)
  if (v === 'memory' || v === 'postgres') return v
  return isProduction(src) ? 'postgres' : 'memory'
}

/** Mailpit (SMTP 1025) in dev and test unless Resend is configured; production uses Resend. */
export const smtpConfig = (src: Source = process.env): { host: string; port: number } | null => {
  const host = read('SMTP_HOST', src)
  if (host) return { host, port: Number(read('SMTP_PORT', src) ?? 1025) }
  if (!isProduction(src) && !read('RESEND_API_KEY', src)) return { host: 'localhost', port: 1025 }
  return null
}

/** Hosts and ports a dev mail catcher (Mailpit) can have. Anything else is a real mail server. */
export const LOCAL_MAIL_HOSTS = ['localhost', '127.0.0.1', '::1', '[::1]', 'mailpit'] as const
export const LOCAL_MAIL_PORTS = [1025, 1026, 2525, 8025] as const

/**
 * True only when the configured SMTP transport is a local Mailpit: no Resend key, host in LOCAL_MAIL_HOSTS and a dev port.
 * DRY_RUN=1 sends email only when this is true; otherwise the message is recorded in the delivery row and nothing is sent.
 */
export const isLocalMailCatcher = (src: Source = process.env): boolean => {
  if (read('RESEND_API_KEY', src)) return false
  const smtp = smtpConfig(src)
  if (!smtp) return false
  return (LOCAL_MAIL_HOSTS as readonly string[]).includes(smtp.host.toLowerCase()) && (LOCAL_MAIL_PORTS as readonly number[]).includes(smtp.port)
}
