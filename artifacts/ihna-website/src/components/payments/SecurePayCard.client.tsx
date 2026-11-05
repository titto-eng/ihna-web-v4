'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

// SecurePay tokenised card page (45 §4). The SecurePay UI script is loaded HERE ONLY, from the SecurePay host (live or sandbox). The browser sends
// the card token and the payment uuid to /api/payments/securepay/charge/; the server charges the stored amount.
// UI Config Object per the SecurePay API reference ("JavaScript SDK"): containerId, scriptId, clientId, merchantCode, mode `checkout` (AUD),
// card {allowedCardTypes, showCardIcons, onFormValidityChange, onTokeniseSuccess(tokenisedCard.token), onTokeniseError}.
type Props = { paymentId: string; clientId: string; merchantCode: string; scriptHost: string; dryRun: boolean }
type SecurePayUI = { tokenise: () => void }
declare global {
  interface Window { securePayUI?: { init: (o: Record<string, unknown>) => SecurePayUI } }
}

export function SecurePayCard({ paymentId, clientId, merchantCode, scriptHost, dryRun }: Props) {
  const ui = useRef<SecurePayUI | null>(null)
  const [valid, setValid] = useState(dryRun)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function charge(token: string) {
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/payments/securepay/charge/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ paymentId, token }) })
      const json = (await res.json().catch(() => ({}))) as { redirectUrl?: string }
      // 200 with status pending = SecurePay could not confirm the result yet; the result page shows it as being checked.
      if (res.ok && json.redirectUrl && /^\/(?!\/)/.test(json.redirectUrl)) { window.location.assign(json.redirectUrl); return }
      setError('We could not complete the payment. Nothing has been charged twice; you can try again.')
    } catch {
      setError('We could not reach the server. You can try again.')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (dryRun) return
    const s = document.createElement('script')
    s.id = 'securepay-ui-js'
    s.src = `${scriptHost}/v3/ui/client/securepay-ui.min.js`
    s.async = true
    s.onload = () => {
      if (!window.securePayUI) return
      ui.current = window.securePayUI.init({
        containerId: 'securepay-ui-container', scriptId: 'securepay-ui-js', clientId, merchantCode, mode: 'checkout',
        card: {
          allowedCardTypes: ['visa', 'mastercard'], showCardIcons: false,
          onFormValidityChange: (ok: boolean) => setValid(ok),
          onTokeniseSuccess: (t: { token?: string }) => { if (t?.token) void charge(t.token); else setError('The card could not be tokenised.') },
          onTokeniseError: () => setError('The card details were not accepted. Please check them and try again.'),
        },
      })
    }
    document.body.appendChild(s)
    return () => { s.remove() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div data-testid="securepay-card">
      {dryRun ? (
        <p className="rounded-card border border-border bg-muted p-4 text-sm">DRY_RUN: no card form is loaded and no gateway is called. The button below sends a dry-run token.</p>
      ) : (
        <div id="securepay-ui-container" className="min-h-40" />
      )}
      {error && <p role="alert" className="mt-4 text-sm font-medium text-destructive">{error}</p>}
      <Button type="button" size="lg" className="mt-6" disabled={!valid || busy} onClick={() => (dryRun ? void charge('dry-run-token') : ui.current?.tokenise())}>
        {busy ? 'Processing…' : 'Pay now'}
      </Button>
    </div>
  )
}
