import type { Adapter, Planned, SendResult } from './types'
import { classify, compact, envRef, httpSend, networkError, str } from './util'

// Agent registration (40 §6 "portalStakeholder"; inventory/05 §3.5 row 13): post allow-listed agent fields to the IHM and the IHNA
// stakeholder portals, one delivery per portal. The portal answers the body `fail` when it rejects the registration.
export const STAKEHOLDER_FIELDS = [
  'orgName', 'address', 'country', 'email', 'phone', 'abn', 'website',
  ...[1, 2, 3].flatMap((n) => ['Name', 'Position', 'Email', 'Mobile', 'Office'].map((k) => `contact${n}${k}`)),
] as const

const PORTALS: Record<string, string> = { ihm: 'PORTAL_IHM_STAKEHOLDER_URL', ihna: 'PORTAL_IHNA_STAKEHOLDER_URL' }

export const portalStakeholderAdapter: Adapter = {
  name: 'portalStakeholder',
  enabled: () => true,
  targets: () => ['ihm', 'ihna'],
  plan(input): Planned {
    const env = input.env ?? process.env
    const missing: string[] = []
    const body = compact(Object.fromEntries(STAKEHOLDER_FIELDS.map((k) => [k, str(input.enquiry.data[k])])))
    const url = envRef(PORTALS[input.target] ?? PORTALS.ihm, env, missing)
    return { transport: 'http', requests: [{ method: 'POST', url, headers: {}, encoding: 'form', body, note: `${input.target} stakeholder portal autoAgent` }], missingEnv: missing }
  },
  async send(planned): Promise<SendResult> {
    if (planned.transport !== 'http') return { ok: false, retryable: false, error: 'not an http plan' }
    if (planned.missingEnv?.length) return { ok: false, retryable: false, error: `missing configuration: ${planned.missingEnv.join(', ')}` }
    try {
      const out = await httpSend(planned.requests[0])
      const res = classify(out.status, out.text)
      if (res.ok && out.text.trim().toLowerCase() === 'fail') return { ok: false, retryable: false, responseCode: out.status, error: 'portal answered fail', responseBody: 'fail' }
      return res
    } catch (e) {
      return networkError(e)
    }
  },
}
