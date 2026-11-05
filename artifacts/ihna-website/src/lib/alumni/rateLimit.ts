import { createHmac } from 'node:crypto'
import type { Payload } from 'payload'
import { env } from '@/env'
import { rateLimit as hit, type RateResult } from '@/lib/enquiries/rateLimit'
import { clientIp } from '@/lib/security/clientIp'

// Alumni login / forgot-password limits (90-security §4; the task fixes 10 per minute per IP). Reuses the enquiries counter
// (memory in dev and test, Postgres in production, same fixed window), so there is one limiter to operate.
export const ALUMNI_LIMIT = 10
export const ALUMNI_WINDOW_MS = 60_000
export const FORGOT_PER_EMAIL = 3 // per hour, key = hash of the email (90-security §4)
const HOUR_MS = 3_600_000

/** The platform's client address: the shared helper in src/lib/security/clientIp.ts. */
export const ipOf = clientIp

/** Emails are hashed in limiter keys, so the counter table never holds an address. */
export const emailKey = (email: string): string => createHmac('sha256', env.PAYLOAD_SECRET).update(email.trim().toLowerCase()).digest('hex').slice(0, 32)

export type AlumniBucket = 'login' | 'forgot'

/** Counts a login or forgot-password request for this IP. */
export const limitByIp = (payload: Payload, headers: Headers, bucket: AlumniBucket): Promise<RateResult> =>
  hit(payload, ipOf(headers), `alumni-${bucket}`, { limit: ALUMNI_LIMIT, windowMs: ALUMNI_WINDOW_MS })

/** Counts a forgot-password request for this email, whether or not an account exists (no enumeration). */
export const limitForgotByEmail = (payload: Payload, email: string): Promise<RateResult> =>
  hit(payload, `email:${emailKey(email)}`, 'alumni-forgot-email', { limit: FORGOT_PER_EMAIL, windowMs: HOUR_MS })
