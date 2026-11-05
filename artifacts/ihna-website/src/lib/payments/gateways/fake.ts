// In-memory FakeGateway: the whole payment flow runs end to end with no network (PAYMENTS_GATEWAY_MODE=fake, the dev/test default).
// State lives on globalThis so route handlers, server components and jobs in one Next process share it across module instances.
import type { Gateway, PaymentRow, Session, SessionInput, StatusAnswer } from '../types'

export type FakeDecision = 'approve' | 'decline' | 'abandon'
type FakeSession = { amountCents: number; decision: FakeDecision | null; createdAt: number }
const KEY = Symbol.for('ihm.payments.fakeGateway')
const store = (): Map<string, FakeSession> => {
  const g = globalThis as unknown as Record<symbol, Map<string, FakeSession> | undefined>
  return (g[KEY] ??= new Map())
}

export const fakePagePath = (paymentId: string) => `/pay/fake/${paymentId}/`

export class FakeGateway implements Gateway {
  readonly name = 'fake' as const

  async createSession(input: SessionInput): Promise<Session> {
    store().set(input.paymentId, { amountCents: input.amountCents, decision: null, createdAt: Date.now() })
    return { type: 'redirect', url: fakePagePath(input.paymentId), gatewayRef: `fake_${input.paymentId.slice(0, 8)}` }
  }

  /** The "customer" acts on the fake page. The amount the fake gateway reports is the one it was asked to charge unless a test overrides it. */
  decide(paymentId: string, decision: FakeDecision, opts: { amountCents?: number; fallbackAmountCents?: number } = {}): { decision: FakeDecision; amountCents: number } {
    const s = store().get(paymentId) ?? { amountCents: opts.fallbackAmountCents ?? 0, decision: null, createdAt: Date.now() }
    s.decision = decision
    store().set(paymentId, s)
    return { decision, amountCents: opts.amountCents ?? s.amountCents }
  }

  async queryStatus(p: PaymentRow): Promise<StatusAnswer> {
    const s = store().get(p.paymentId)
    if (!s || s.decision === null || s.decision === 'abandon') return { state: 'pending' }
    return s.decision === 'approve' ? { state: 'paid', amountCents: s.amountCents, ref: `fake_${p.paymentId.slice(0, 8)}` } : { state: 'failed' }
  }

  reset(): void {
    store().clear()
  }
}

export const fakeGateway = new FakeGateway()
