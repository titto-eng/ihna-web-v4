import { APIError } from 'payload'
import type { CollectionBeforeOperationHook, CollectionBeforeValidateHook } from 'payload'
import { passwordProblem } from './password'
import { limitByIp, limitForgotByEmail } from './rateLimit'

// Collection hooks for `alumni` auth, so the limits and the password policy hold for the REST endpoints
// (/api/alumni/login, /forgot-password, /reset-password) that the forms call, not only for our pages.
// Local API calls (seed, import, tests, `payload.login` in scripts) are not rate limited: they carry no client address.

const tooMany = (req: Parameters<CollectionBeforeOperationHook>[0]['req'], retryAfterSeconds: number): never => {
  req.responseHeaders = new Headers(req.responseHeaders ?? undefined)
  req.responseHeaders.set('Retry-After', String(retryAfterSeconds))
  throw new APIError('Too many attempts. Please wait a minute and try again.', 429, undefined, true)
}

export const alumniBeforeOperation: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
  if (req.payloadAPI !== 'REST') return
  const data = (args as { data?: Record<string, unknown> } | undefined)?.data ?? {}

  if (operation === 'login' || operation === 'forgotPassword') {
    const r = await limitByIp(req.payload, req.headers, operation === 'login' ? 'login' : 'forgot')
    if (!r.allowed) tooMany(req, r.retryAfterSeconds)
  }
  if (operation === 'forgotPassword' && typeof data.email === 'string' && data.email) {
    const r = await limitForgotByEmail(req.payload, data.email)
    if (!r.allowed) tooMany(req, r.retryAfterSeconds)
  }
  if (operation === 'resetPassword') {
    // Policy before the token is spent. The token also tells us the email, for the "contains your email" rule.
    const token = typeof data.token === 'string' ? data.token : ''
    const user = token
      ? await req.payload.db.findOne({ collection: 'alumni', req, where: { resetPasswordToken: { equals: token } } })
      : null
    const problem = passwordProblem(data.password, (user as { email?: string } | null)?.email)
    if (problem) throw new APIError(problem, 400, undefined, true)
  }
}

/** An alumnus who sets a password on their own document (PATCH /api/alumni/:id) meets the same policy. Admin and import writes are untouched. */
export const alumniPasswordPolicy: CollectionBeforeValidateHook = ({ data, originalDoc, req }) => {
  if (req.user?.collection !== 'alumni' || !data || typeof data.password !== 'string') return data
  const problem = passwordProblem(data.password, (originalDoc as { email?: string } | undefined)?.email)
  if (problem) throw new APIError(problem, 400, undefined, true)
  return data
}
