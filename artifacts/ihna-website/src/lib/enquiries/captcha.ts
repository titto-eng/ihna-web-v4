import { site } from '@/content/site'
import { cleanText } from './request'
import { recaptchaMinScore, recaptchaSecret, siteUrl, isProduction } from './config'

export type CaptchaStatus = 'ok' | 'low' | 'unverified' | 'missing'
export type CaptchaResult = { status: CaptchaStatus; score?: number; held: boolean }

export const CAPTCHA_ACTION = 'enquire'
export const CAPTCHA_TIMEOUT_MS = 3000

type Fetch = typeof fetch

/**
 * reCAPTCHA v3 verification (40 §4 step 3).
 * - no secret configured: log-and-allow (`unverified`), because a missing key must never drop a submission (rule 2);
 * - secret set, no token: `held` (`missing`);
 * - secret set, low score / wrong action / wrong hostname / failure: `held` (`low`);
 * - siteverify unreachable or slow: `unverified`, delivered anyway.
 */
export async function verifyCaptcha(args: { required: boolean; token?: string; ip?: string; fetchImpl?: Fetch; env?: Record<string, string | undefined> }): Promise<CaptchaResult> {
  const env = args.env ?? process.env
  const secret = recaptchaSecret(env)
  if (!args.required) return { status: 'unverified', held: false }
  if (!secret) {
    console.warn(`[enquire] reCAPTCHA secret not set: submission allowed, captchaStatus=unverified${isProduction(env) ? ' (PRODUCTION: set RECAPTCHA_SECRET_KEY)' : ''}`)
    return { status: 'unverified', held: false }
  }
  const token = cleanText(args.token, 4096)
  if (!token) return { status: 'missing', held: true }

  const body = new URLSearchParams({ secret, response: token })
  if (args.ip && args.ip !== 'unknown') body.set('remoteip', args.ip)
  try {
    const res = await (args.fetchImpl ?? fetch)('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(CAPTCHA_TIMEOUT_MS),
    })
    if (!res.ok) return { status: 'unverified', held: false }
    const json = (await res.json()) as { success?: boolean; score?: number; action?: string; hostname?: string }
    const score = typeof json.score === 'number' ? json.score : undefined
    const host = new URL(siteUrl(env)).hostname
    const hostOk = !json.hostname || json.hostname === host || (!isProduction(env) && json.hostname === 'localhost')
    const actionOk = !json.action || json.action === CAPTCHA_ACTION
    if (!json.success || !actionOk || !hostOk || (score ?? 0) < recaptchaMinScore(env)) return { status: 'low', score, held: true }
    return { status: 'ok', score, held: false }
  } catch {
    return { status: 'unverified', held: false } // outage or timeout: deliver anyway (rule 2)
  }
}

/**
 * Whether a stored, delivered enquiry may also get its autoresponder (40 §4 step 7). A site with `autoresponderNeedsCaptcha` (IHNA)
 * fails closed: only a verified token (`ok`) sends one, so an unverified post (siteverify outage) cannot make the site mail any
 * address; outside production with no secret configured (dev, tests) it is still sent. Without the flag (IHM) it always is.
 * The enquiry itself is stored and delivered to staff either way (rule 2).
 */
export function autoresponderAllowed(status: CaptchaStatus, env: Record<string, string | undefined> = process.env): boolean {
  if (!(site as { autoresponderNeedsCaptcha?: boolean }).autoresponderNeedsCaptcha) return true
  if (status === 'ok') return true
  return !isProduction(env) && !recaptchaSecret(env)
}
