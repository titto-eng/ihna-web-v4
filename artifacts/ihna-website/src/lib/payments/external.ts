// Every call this module makes to the outside (gateways, portal callbacks, monday.com, Graph, Canvas) goes through `externalCall`.
// DRY_RUN=1: the request is logged (host, path, masked body keys) and NEVER sent; the caller gets the synthetic response it supplied.
import { maskDeep } from '@/lib/adapters/util'
import { GatewayError } from './types'
import { gatewayMode, isDryRun, PaymentsConfigError, productionAllowed } from './config'
import { isProductionHost } from './gateways/endpoints'

/** Services that are payment gateways: with PAYMENTS_GATEWAY_MODE=fake they are never contacted, whatever DRY_RUN says. */
export const GATEWAY_SERVICES = ['payway', 'securepay', 'airwallex']

export type ExternalRequest = {
  /** Who is being called: `payway`, `securepay`, `airwallex`, `portal`, `monday`, `graph`, `canvas`. */
  service: string
  note: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH'
  url: string
  headers?: Record<string, string>
  body?: Record<string, unknown> | string
  encoding?: 'json' | 'form' | 'none'
}

export type ExternalResult = { status: number; text: string; json: unknown; dryRun: boolean }

/** What DRY_RUN calls would have sent, for tests and the admin log. Bounded. Secrets are masked. */
export const dryRunLog: { service: string; note: string; method: string; host: string; path: string; body: unknown }[] = []

function safeLog(req: ExternalRequest) {
  let host = ''
  let path = ''
  try {
    const u = new URL(req.url)
    host = u.host
    path = u.pathname
  } catch { /* relative or malformed: logged as empty */ }
  const body = typeof req.body === 'object' && req.body ? maskDeep(req.body) : undefined
  const entry = { service: req.service, note: req.note, method: req.method, host, path, body }
  dryRunLog.push(entry)
  if (dryRunLog.length > 200) dryRunLog.shift()
  console.info(`[payments] dry-run ${req.service}: ${req.note} (${req.method} ${host}${path}) not sent`)
}

const parse = (text: string): unknown => {
  try { return text ? JSON.parse(text) : null } catch { return null }
}

export async function externalCall(req: ExternalRequest, opts: { dryResponse?: unknown; fetchImpl?: typeof fetch; timeoutMs?: number; dry?: boolean } = {}): Promise<ExternalResult> {
  // The single guard for every outbound call. fake mode (the FakeGateway) and DRY_RUN=1 both record instead of sending; a gateway
  // host is only ever fetched when the mode is `real` AND DRY_RUN=0.
  const isGateway = GATEWAY_SERVICES.includes(req.service)
  const fakeGatewayMode = isGateway && gatewayMode() === 'fake'
  const dry = opts.dry ?? isDryRun()
  // Second line of defence behind assertSandboxOnly (pages call the clients directly): a production gateway host is refused under
  // DRY_RUN=1, and otherwise needs PAYMENTS_ALLOW_PRODUCTION=1. PayWay's live/test split is its merchant id, checked in its client.
  if (isGateway && !fakeGatewayMode && isProductionHost(req.url) && (dry || !productionAllowed())) {
    throw new PaymentsConfigError(`${req.service} ${req.note}: production host refused (${dry ? 'DRY_RUN=1' : 'PAYMENTS_ALLOW_PRODUCTION is not 1'})`)
  }
  if (fakeGatewayMode || dry) {
    safeLog(req)
    const json = opts.dryResponse ?? {}
    return { status: 200, text: JSON.stringify(json), json, dryRun: true }
  }
  const enc = req.encoding ?? (req.body === undefined ? 'none' : typeof req.body === 'string' ? 'none' : 'json')
  const headers: Record<string, string> = { ...req.headers }
  let body: string | undefined
  if (req.body !== undefined) {
    if (typeof req.body === 'string') body = req.body
    else if (enc === 'form') {
      headers['content-type'] ??= 'application/x-www-form-urlencoded'
      body = new URLSearchParams(Object.entries(req.body).map(([k, v]) => [k, String(v)])).toString()
    } else {
      headers['content-type'] ??= 'application/json'
      body = JSON.stringify(req.body)
    }
  }
  const f = opts.fetchImpl ?? globalThis.fetch
  try {
    const res = await f(req.url, { method: req.method, headers, body, signal: AbortSignal.timeout(opts.timeoutMs ?? 10_000), redirect: 'manual' })
    const text = await res.text().catch(() => '')
    return { status: res.status, text, json: parse(text), dryRun: false }
  } catch (e) {
    throw new GatewayError(`network: ${e instanceof Error ? e.name : 'error'} (${req.service} ${req.note})`, true)
  }
}

/** 2xx, else a GatewayError. 5xx and 429 are retryable; any other status is the request's fault. Bodies are never put in the message. */
export function expectOk(res: ExternalResult, what: string): ExternalResult {
  if (res.status >= 200 && res.status < 300) return res
  throw new GatewayError(`${what}: HTTP ${res.status}`, res.status >= 500 || res.status === 429)
}
