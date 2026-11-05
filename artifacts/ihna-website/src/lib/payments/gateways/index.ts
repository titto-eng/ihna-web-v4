import { gatewayMode, isDryRun, PaymentsConfigError, productionAllowed, type GatewayName } from '../config'
import type { Gateway } from '../types'
import { airwallexGateway } from './airwallex'
import { gatewayTargets } from './endpoints'
import { fakeGateway } from './fake'
import { paywayGateway } from './payway'
import { securepayGateway } from './securepay'

export { fakeGateway } from './fake'

export { productionAllowed } from '../config'

/**
 * Refuses production gateway endpoints (resolved, so a production DEFAULT counts too) unless PAYMENTS_ALLOW_PRODUCTION=1.
 * Under DRY_RUN=1 a production endpoint is refused even with the switch: a dry run never points at a live account (45 §6).
 * Production = api.airwallex.com, payments.auspost.net.au / welcome.api2.auspost.com.au, or a PayWay merchant id other than TEST.
 */
export function assertSandboxOnly(src: Record<string, string | undefined> = process.env, only?: GatewayName): void {
  for (const t of gatewayTargets(src)) {
    if (only && t.gateway !== only) continue
    if (!t.production) continue
    if (isDryRun(src)) throw new PaymentsConfigError(`DRY_RUN=1 with a production ${t.gateway} endpoint`)
    if (!productionAllowed(src)) throw new PaymentsConfigError(`${t.gateway} points at production; set PAYMENTS_ALLOW_PRODUCTION=1 to take real payments`)
  }
}

const real: Record<GatewayName, Gateway> = { payway: paywayGateway, securepay: securepayGateway, airwallex: airwallexGateway }

/** `fake` mode always answers with the in-memory FakeGateway; `real` mode uses the named client (which itself never sends under DRY_RUN=1). */
export function getGateway(name: GatewayName): Gateway {
  if (gatewayMode() === 'fake') return fakeGateway
  assertSandboxOnly(process.env, name)
  return real[name]
}
