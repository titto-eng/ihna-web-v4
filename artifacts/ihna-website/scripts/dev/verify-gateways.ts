// Auth-only verification of the three payment gateways with the credentials in .env (DEC-49).
// No payment, intent, order or charge is ever created here:
// - SecurePay: OAuth client-credentials token request (SecurePay API reference, "Authentication > Client Credentials").
// - Airwallex: POST /api/v1/authentication/login (https://www.airwallex.com/docs/api/authentication/api_access_token).
// - PayWay Net: encrypt/decrypt round trip with the configured key (must be 16 bytes, AES-128) + a reachability GET of the host. PayWay Net has
//   no auth-only endpoint. With VERIFY_PAYWAY_TOKEN=1 the script also asks for a secure cart token (POST /RequestToken), which is the only call
//   that proves the Net username/password, the biller code AND this machine's IP on PayWay's allowlist. A cart token is not a payment: it is
//   "valid for 1 hour ... and can only be used once" and nobody is sent to MakePayment with it (hand-off guide, "Secure token request").
// Endpoints are the same ones the clients use (src/lib/payments/gateways/endpoints.ts). Production endpoints are checked only with
// PAYMENTS_ALLOW_PRODUCTION=1. Prints hosts and HTTP statuses, never a value.
//
// Usage: VERIFY_GATEWAYS=1 npm run verify:gateways   (the script forces real mode + DRY_RUN=0 and PAYMENTS_DRY_RUN=0 for ITS OWN
// process only; PAYMENTS_DRY_RUN takes precedence over DRY_RUN, DEC-50)
import 'dotenv/config'

if (process.env.VERIFY_GATEWAYS !== '1') {
  console.error('Refusing to run without VERIFY_GATEWAYS=1 (this script contacts the real gateway hosts for auth-only calls).')
  process.exit(2)
}
process.env.DRY_RUN = '0'
process.env.PAYMENTS_DRY_RUN = '0'
process.env.PAYMENTS_GATEWAY_MODE = 'real'

const { externalCall } = await import('../../src/lib/payments/external')
const { encryptPaywayParameters, decryptPaywayParameters } = await import('../../src/lib/payments/gateways/payway-crypto')
const ep = await import('../../src/lib/payments/gateways/endpoints')
const { productionAllowed } = await import('../../src/lib/payments/config')
const { SECUREPAY_AUDIENCE } = await import('../../src/lib/payments/gateways/securepay')

type Line = { gateway: string; check: string; result: string }
const lines: Line[] = []
const have = (name: string) => Boolean(process.env[name] && process.env[name]!.trim())
const missing = (names: string[]) => names.filter((n) => !have(n))
const host = (u: string) => { try { return new URL(u).host } catch { return '(invalid URL)' } }
const targets = Object.fromEntries(ep.gatewayTargets().map((t) => [t.gateway, t]))
const blocked = (g: 'payway' | 'securepay' | 'airwallex') => targets[g].production && !productionAllowed()
const err = (e: unknown) => `ERROR ${e instanceof Error ? e.message : String(e)}`

// ---- SecurePay: OAuth client-credentials token (no order, no charge) ----
{
  const authUrl = ep.securepayAuthUrl()
  const label = `oauth token (${ep.securepayEnv()}, ${host(authUrl)})`
  const miss = missing(['SECUREPAY_CLIENT_ID', 'SECUREPAY_CLIENT_SECRET'])
  if (miss.length) lines.push({ gateway: 'securepay', check: label, result: `skipped: missing ${miss.join(', ')}` })
  else if (blocked('securepay')) lines.push({ gateway: 'securepay', check: label, result: 'skipped: production endpoint; re-run with PAYMENTS_ALLOW_PRODUCTION=1 to check live credentials' })
  else {
    const basic = Buffer.from(`${process.env.SECUREPAY_CLIENT_ID}:${process.env.SECUREPAY_CLIENT_SECRET}`).toString('base64')
    try {
      const res = await externalCall({
        service: 'securepay', note: 'verify oauth token', method: 'POST', url: authUrl, encoding: 'form',
        headers: { authorization: `Basic ${basic}`, 'content-type': 'application/x-www-form-urlencoded' },
        body: { grant_type: 'client_credentials', audience: SECUREPAY_AUDIENCE },
      })
      const ok = res.status >= 200 && res.status < 300 && Boolean((res.json as { access_token?: string } | null)?.access_token)
      lines.push({ gateway: 'securepay', check: label, result: ok ? `OK (HTTP ${res.status}, token issued)` : `FAILED (HTTP ${res.status})` })
    } catch (e) { lines.push({ gateway: 'securepay', check: label, result: err(e) }) }
  }
  for (const n of ['SECUREPAY_MERCHANT_CODE', 'SECUREPAY_UI_CLIENT_ID']) if (!have(n)) lines.push({ gateway: 'securepay', check: 'config', result: `missing ${n} (needed by the card page and the charge)` })
}

// ---- Airwallex: login (no intent) ----
{
  const apiUrl = ep.airwallexApiUrl()
  const label = `login (${ep.airwallexEnv()}, ${host(apiUrl)})`
  const miss = missing(['AIRWALLEX_CLIENT_ID', 'AIRWALLEX_API_KEY'])
  if (miss.length) lines.push({ gateway: 'airwallex', check: label, result: `skipped: missing ${miss.join(', ')}` })
  else if (blocked('airwallex')) lines.push({ gateway: 'airwallex', check: label, result: 'skipped: production endpoint; re-run with PAYMENTS_ALLOW_PRODUCTION=1 to check live credentials' })
  else {
    try {
      const res = await externalCall({
        service: 'airwallex', note: 'verify login', method: 'POST', url: `${apiUrl}/api/v1/authentication/login`, encoding: 'none',
        headers: { 'content-type': 'application/json', 'x-client-id': process.env.AIRWALLEX_CLIENT_ID!, 'x-api-key': process.env.AIRWALLEX_API_KEY! },
      })
      const ok = res.status >= 200 && res.status < 300 && Boolean((res.json as { token?: string } | null)?.token)
      lines.push({ gateway: 'airwallex', check: label, result: ok ? `OK (HTTP ${res.status}, token issued)` : `FAILED (HTTP ${res.status})` })
    } catch (e) { lines.push({ gateway: 'airwallex', check: label, result: err(e) }) }
  }
  if (!have('AIRWALLEX_WEBHOOK_SECRET')) lines.push({ gateway: 'airwallex', check: 'webhook secret', result: 'missing AIRWALLEX_WEBHOOK_SECRET (webhook signatures cannot be verified)' })
}

// ---- PayWay Net ----
{
  const base = ep.paywayBaseUrl()
  const mode = ep.paywayIsLive() ? 'live merchant' : have('PAYWAY_MERCHANT_ID') ? 'TEST merchant' : 'merchant not set'
  const miss = missing(['PAYWAY_ENCRYPTION_KEY', 'PAYWAY_MERCHANT_ID', 'PAYWAY_BILLER_CODE'])
  if (miss.length) lines.push({ gateway: 'payway', check: 'key round trip', result: `skipped: missing ${miss.join(', ')}` })
  else {
    try {
      const key = process.env.PAYWAY_ENCRYPTION_KEY!
      const enc = encryptPaywayParameters(key, { payment_reference: 'VERIFY-ONLY', payment_amount: '0.00' })
      const dec = decryptPaywayParameters(key, enc.EncryptedParameters, enc.Signature)
      lines.push({ gateway: 'payway', check: 'key round trip', result: dec.payment_reference === 'VERIFY-ONLY' ? 'OK (16-byte AES-128 key: encrypt -> decrypt)' : 'FAILED (decrypt did not return the input)' })
    } catch (e) { lines.push({ gateway: 'payway', check: 'key round trip', result: err(e) }) }
    try {
      const res = await externalCall({ service: 'payway', note: 'verify reachability', method: 'GET', url: base })
      lines.push({ gateway: 'payway', check: 'host reachable', result: `HTTP ${res.status} from ${host(base)} (${mode})` })
    } catch (e) { lines.push({ gateway: 'payway', check: 'host reachable', result: err(e) }) }
  }
  const tokenLabel = `token request (${host(base)}, ${mode})`
  if (process.env.VERIFY_PAYWAY_TOKEN !== '1') lines.push({ gateway: 'payway', check: tokenLabel, result: 'not run (set VERIFY_PAYWAY_TOKEN=1 to prove the Net login, biller code and IP allowlist; creates an unused 1-hour cart token, no payment)' })
  else {
    const m = missing(['PAYWAY_USERNAME', 'PAYWAY_PASSWORD', 'PAYWAY_BILLER_CODE', 'PAYWAY_MERCHANT_ID'])
    if (m.length) lines.push({ gateway: 'payway', check: tokenLabel, result: `skipped: missing ${m.join(', ')}` })
    else if (blocked('payway')) lines.push({ gateway: 'payway', check: tokenLabel, result: 'skipped: live merchant; re-run with PAYMENTS_ALLOW_PRODUCTION=1' })
    else {
      try {
        const res = await externalCall({
          service: 'payway', note: 'verify token request', method: 'POST', url: `${base}/RequestToken`, encoding: 'form',
          body: {
            username: process.env.PAYWAY_USERNAME!, password: process.env.PAYWAY_PASSWORD!, biller_code: process.env.PAYWAY_BILLER_CODE!, merchant_id: process.env.PAYWAY_MERCHANT_ID!,
            payment_reference: 'VERIFYONLY', payment_amount: '1.00',
          },
        })
        const answer = new URLSearchParams(res.text.trim())
        const ok = res.status >= 200 && res.status < 300 && Boolean(answer.get('token'))
        lines.push({ gateway: 'payway', check: tokenLabel, result: ok ? `OK (HTTP ${res.status}, cart token issued and discarded)` : `FAILED (HTTP ${res.status}${answer.get('error') ? ', PayWay returned an error (check login, biller code and the IP allowlist)' : ''})` })
      } catch (e) { lines.push({ gateway: 'payway', check: tokenLabel, result: err(e) }) }
    }
  }
  if (!have('PAYWAY_NOTIFY_PASSWORD')) lines.push({ gateway: 'payway', check: 'notification', result: 'PAYWAY_NOTIFY_USERNAME/PASSWORD not set: no server-to-server notification is requested, pending PayWay rows rely on the browser return' })
}

console.log('\nGateway verification (auth-only; no payments created)\n')
for (const l of lines) console.log(`  ${l.gateway.padEnd(10)} ${l.check.padEnd(58)} ${l.result}`)
console.log('\nValues are never printed. Fix any FAILED/missing line in .env and re-run.\n')
process.exit(lines.some((l) => l.result.startsWith('FAILED') || l.result.startsWith('ERROR')) ? 1 : 0)
