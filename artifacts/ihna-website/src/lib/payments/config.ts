// Lazy environment access for payments (45-payments §6 Env). Names only live in .env; values never reach logs (rule 3).
// `src/env.ts` validates names at boot; reading here lets tests flip modes per case.
import { envValue, isProduction, siteUrl } from '@/lib/enquiries/config'

export { envValue, isProduction, siteUrl }

/**
 * Payments stay in dry run until `PAYMENTS_DRY_RUN=0`. When it is unset it follows `DRY_RUN`, so existing setups behave as before;
 * it exists so enquiries can go live (`DRY_RUN=0` + `ENQUIRY_LIVE_ADAPTERS`) without payments leaving dry run (DEC-50).
 */
export const isDryRun = (src: Record<string, string | undefined> = process.env): boolean =>
  (envValue('PAYMENTS_DRY_RUN', src) ?? envValue('DRY_RUN', src) ?? '1') === '1'

export const GATEWAY_NAMES = ['payway', 'securepay', 'airwallex'] as const
export type GatewayName = (typeof GATEWAY_NAMES)[number]
export const isGatewayName = (v: unknown): v is GatewayName => (GATEWAY_NAMES as readonly unknown[]).includes(v)

export class PaymentsConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PaymentsConfigError'
  }
}

export type GatewayMode = 'fake' | 'real'

/** Default: `real` when NODE_ENV=production, `fake` (in-memory FakeGateway) everywhere else. Production must run `real`. */
export function gatewayMode(src: Record<string, string | undefined> = process.env): GatewayMode {
  const v = envValue('PAYMENTS_GATEWAY_MODE', src)
  const mode: GatewayMode = v === 'real' || v === 'fake' ? v : isProduction(src) ? 'real' : 'fake'
  if (mode === 'fake' && isProduction(src)) throw new PaymentsConfigError('PAYMENTS_GATEWAY_MODE=fake is not allowed in production')
  return mode
}

/** `PAYMENTS_ALLOW_PRODUCTION=1` is the one switch that lets the real clients reach hosts (or a PayWay merchant) that take real money. */
export const productionAllowed = (src: Record<string, string | undefined> = process.env): boolean => envValue('PAYMENTS_ALLOW_PRODUCTION', src) === '1'

/** AUD, 2 dp. Invoice sanity limits (45 §2 `maxInvoiceAmount`, until the paymentSettings global exists). */
export const MIN_INVOICE_CENTS = 100
export const maxInvoiceCents = (src: Record<string, string | undefined> = process.env): number => {
  const n = Number(envValue('PAYMENTS_MAX_INVOICE_AMOUNT', src))
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 5_000_000 // AUD 50,000
}

/** Surcharge per gateway in percent (today 1.5% on SecurePay, added in the browser: T/template-secure-pay.php:190). Default 0 until finance decides. */
export function surchargePercent(gateway: GatewayName, src: Record<string, string | undefined> = process.env): number {
  const n = Number(envValue(`PAYMENTS_SURCHARGE_${gateway.toUpperCase()}_PERCENT`, src))
  return Number.isFinite(n) && n > 0 && n <= 10 ? n : 0
}

/** Staff and finance mailboxes (45 `paymentSettings.mailboxes` until that global exists). */
export const financeRecipients = (src: Record<string, string | undefined> = process.env): string[] =>
  (envValue('PAYMENTS_FINANCE_TO', src) ?? envValue('ENQUIRY_NOTIFY_TO', src) ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean)

export const PAYMENTS_QUEUE = 'payments'
export const PENDING_MIN_AGE_MS = 10 * 60_000
export const PENDING_MAX_AGE_MS = 7 * 86_400_000
export const PENDING_EXPIRE_MS = 24 * 3_600_000
