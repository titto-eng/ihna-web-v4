// Where each gateway client sends its requests, sandbox vs production (45 §6 Env). One place, so the clients, the sandbox guard and
// scripts/dev/verify-gateways.ts can never disagree. Names only: no merchant id, key or password lives in this file.
//
// Sandbox vs production, as the providers document it:
// - Airwallex: AIRWALLEX_ENV=demo -> https://api-demo.airwallex.com, AIRWALLEX_ENV=prod -> https://api.airwallex.com.
//   https://www.airwallex.com/docs/developer-tools/sandbox-environment (current pages call the sandbox host api.sandbox.airwallex.com;
//   api-demo.airwallex.com is the long-standing name of the same host and resolves to the same address).
// - SecurePay: SECUREPAY_ENV=sandbox -> API https://payments-stest.npe.auspost.zone, auth https://welcome.api2.sandbox.auspost.com.au/oauth/token;
//   SECUREPAY_ENV=live -> API https://payments.auspost.net.au, auth https://welcome.api2.auspost.com.au/oauth/token.
//   SecurePay API reference, "Environment details" and "Authentication URL" (https://auspost.com.au/payments/docs/securepay/, archived
//   2024-12-17; SecurePay now hands the reference out on request: https://www.securepay.com.au/support/developer-documentation).
// - PayWay Net: ONE host per bank, no sandbox host. Test payments use merchant_id=TEST on a free test facility.
//   https://www.payway.com.au/docs/hosted-payment-page-handoff-developers-guide/ ("Testing and going live": "pass your live
//   merchant_id, rather than TEST"). IHM's facility is St.George (the old theme posts to payway.stgeorge.com.au); Westpac is www.payway.com.au.
import { envValue } from '../config'

type Src = Record<string, string | undefined>
const trim = (u: string) => u.replace(/\/+$/, '')

export const AIRWALLEX_HOSTS = { demo: 'https://api-demo.airwallex.com', prod: 'https://api.airwallex.com' } as const
export const SECUREPAY_HOSTS = {
  sandbox: { api: 'https://payments-stest.npe.auspost.zone', auth: 'https://welcome.api2.sandbox.auspost.com.au/oauth/token' },
  live: { api: 'https://payments.auspost.net.au', auth: 'https://welcome.api2.auspost.com.au/oauth/token' },
} as const
export const PAYWAY_HOSTS = { stgeorge: 'https://payway.stgeorge.com.au', westpac: 'https://www.payway.com.au' } as const
/** The test merchant of a PayWay test facility (hand-off guide, "PayWay request parameters": "Specify TEST for making test payments"). */
export const PAYWAY_TEST_MERCHANT = 'TEST'

/** Hosts that take real money. A configured URL on one of these is "production" for assertSandboxOnly. */
export const PRODUCTION_HOSTS = ['api.airwallex.com', 'payments.auspost.net.au', 'welcome.api2.auspost.com.au'] as const

export const airwallexEnv = (src: Src = process.env): 'demo' | 'prod' => (envValue('AIRWALLEX_ENV', src) === 'prod' ? 'prod' : 'demo')
export const airwallexApiUrl = (src: Src = process.env): string => trim(envValue('AIRWALLEX_API_URL', src) ?? AIRWALLEX_HOSTS[airwallexEnv(src)])

export const securepayEnv = (src: Src = process.env): 'sandbox' | 'live' => (envValue('SECUREPAY_ENV', src) === 'live' ? 'live' : 'sandbox')
export const securepayApiUrl = (src: Src = process.env): string => trim(envValue('SECUREPAY_API_URL', src) ?? SECUREPAY_HOSTS[securepayEnv(src)].api)
export const securepayAuthUrl = (src: Src = process.env): string => envValue('SECUREPAY_AUTH_URL', src) ?? SECUREPAY_HOSTS[securepayEnv(src)].auth

export const paywayBaseUrl = (src: Src = process.env): string => trim(envValue('PAYWAY_BASE_URL', src) ?? PAYWAY_HOSTS.stgeorge)
/** PayWay has no sandbox host: a payment is "test" only when the merchant id is TEST. Unset = nothing can be charged (PayWay rejects it). */
export const paywayIsLive = (src: Src = process.env): boolean => {
  const m = envValue('PAYWAY_MERCHANT_ID', src)
  return Boolean(m) && m!.toUpperCase() !== PAYWAY_TEST_MERCHANT
}

export const isProductionHost = (url: string): boolean => {
  try { return (PRODUCTION_HOSTS as readonly string[]).includes(new URL(url).host) } catch { return false }
}

/** What each gateway would talk to right now, and whether that is production. Used by the guard and by verify-gateways (prints hosts, never values). */
export function gatewayTargets(src: Src = process.env): { gateway: 'payway' | 'securepay' | 'airwallex'; urls: string[]; production: boolean }[] {
  const aw = airwallexApiUrl(src)
  const sp = [securepayApiUrl(src), securepayAuthUrl(src)]
  return [
    { gateway: 'airwallex', urls: [aw], production: isProductionHost(aw) },
    { gateway: 'securepay', urls: sp, production: sp.some(isProductionHost) },
    { gateway: 'payway', urls: [paywayBaseUrl(src)], production: paywayIsLive(src) },
  ]
}
