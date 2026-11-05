import { envValue, isDryRun, liveAdapterList } from '@/lib/enquiries/config'

// Per-adapter live switch (DEC-50, 40 §6). An adapter sends for real only when ALL hold:
//   1. DRY_RUN is not `1` (DRY_RUN=1 forces every adapter to record), and
//   2. its name is listed in ENQUIRY_LIVE_ADAPTERS, and
//   3. its credentials / URL variables are present.
// Otherwise it records the request (dry run) and the delivery row says why. Names only: no value is read into a message.
type Env = Record<string, string | undefined>

export type AdapterMode = { live: true } | { live: false; reason: string }

/** Variable names that must be set for the adapter to send. A `a|b` entry means any one of them. */
export function requiredEnv(adapter: string, target: string | undefined, env: Env): string[] {
  switch (adapter) {
    case 'email': return ['RESEND_API_KEY|SMTP_HOST']
    case 'hubspot': return ['HUBSPOT_ACCESS_TOKEN', ...(envValue('HUBSPOT_FORM_GUID', env) ? ['HUBSPOT_PORTAL_ID'] : [])]
    case 'portalCrm': return ['PORTAL_CRM_URL']
    case 'portalStakeholder': return [target === 'ihna' ? 'PORTAL_IHNA_STAKEHOLDER_URL' : 'PORTAL_IHM_STAKEHOLDER_URL']
    case 'admissionsApi': return ['ADMISSIONS_API_URL', 'ADMISSIONS_API_KEY']
    case 'dynamics': return ['DYNAMICS_TENANT_ID', 'DYNAMICS_CLIENT_ID', 'DYNAMICS_CLIENT_SECRET', 'DYNAMICS_URL']
    case 'ihnaOnline': return ['IHNA_ONLINE_WEBHOOK_URL', 'IHNA_ONLINE_WEBHOOK_KEY']
    default: return []
  }
}

export const missingEnv = (adapter: string, target: string | undefined, env: Env): string[] =>
  requiredEnv(adapter, target, env).filter((n) => !n.split('|').some((x) => envValue(x, env) !== undefined))

export function adapterMode(adapter: string, target: string | undefined, env: Env = process.env): AdapterMode {
  if (isDryRun(env)) return { live: false, reason: 'DRY_RUN=1' }
  const listed = liveAdapterList(env)
  if (!listed.some((n) => n.toLowerCase() === adapter.toLowerCase())) {
    return { live: false, reason: `not listed in ENQUIRY_LIVE_ADAPTERS (${listed.join(',') || 'empty'})` }
  }
  const missing = missingEnv(adapter, target, env)
  if (missing.length) return { live: false, reason: `missing: ${missing.join(', ')}` }
  return { live: true }
}

/** True when the email adapter really sends (Resend or SMTP). Dead-delivery alerts and the autoresponder follow the same switch. */
export const isEmailLive = (env: Env = process.env): boolean => adapterMode('email', undefined, env).live
