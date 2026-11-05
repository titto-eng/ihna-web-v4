'use client'

import { useEffect, useState } from 'react'

// Airwallex drop-in page (45 §4). The Airwallex.js components SDK is loaded HERE ONLY, from static.airwallex.com. The intent and its client
// secret were fetched on the server for this page view; nothing about them is stored.
// Per the drop-in quickstart (https://www.airwallex.com/docs/payments/integration-options/web-checkout/drop-in-element/guest-user-checkout):
// script https://static.airwallex.com/components/sdk/v1/index.js -> window.AirwallexComponentsSDK; await init({env: 'demo'|'prod',
// enabledElements: ['payments']}); await createElement('dropIn', {intent_id, client_secret, currency}); element.mount(<container id>); listeners
// AFTER mount: 'success' (e.detail.intent.id) and 'error' (e.detail.error). The success event does not redirect by itself, and it is not proof of
// payment ("verify the payment server-side"): we go to the return URL, whose result page shows what the webhook (or a status query) settled.
type Props = { intentId: string; clientSecret: string; env: 'demo' | 'prod'; returnUrl: string; sdkHost: string }
type DropInElement = { mount: (target: string | HTMLElement) => unknown; on: (ev: string, cb: (e: unknown) => void) => void; unmount?: () => void; destroy?: () => void }
type ComponentsSDK = {
  init: (o: { env: 'demo' | 'prod'; enabledElements: string[] }) => Promise<unknown>
  createElement: (type: 'dropIn', o: { intent_id: string; client_secret: string; currency: string }) => Promise<DropInElement | null> | DropInElement | null
}
declare global {
  interface Window { AirwallexComponentsSDK?: ComponentsSDK }
}

const CONTAINER_ID = 'airwallex-dropin'

export function AirwallexDropIn({ intentId, clientSecret, env, returnUrl, sdkHost }: Props) {
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const s = document.createElement('script')
    s.src = `${sdkHost}/components/sdk/v1/index.js`
    s.async = true
    let el: DropInElement | null = null
    s.onload = async () => {
      try {
        const sdk = window.AirwallexComponentsSDK
        if (!sdk) throw new Error('sdk')
        await sdk.init({ env, enabledElements: ['payments'] })
        el = await sdk.createElement('dropIn', { intent_id: intentId, client_secret: clientSecret, currency: 'AUD' })
        if (!el) throw new Error('element')
        el.mount(CONTAINER_ID)
        el.on('success', () => window.location.assign(returnUrl))
        el.on('error', () => setError('The payment could not be completed. You can try again.'))
      } catch {
        setError('The payment form could not be loaded. Please reload the page.')
      }
    }
    s.onerror = () => setError('The payment form could not be loaded. Please reload the page.')
    document.body.appendChild(s)
    return () => { (el?.destroy ?? el?.unmount)?.call(el); s.remove() }
  }, [intentId, clientSecret, env, returnUrl, sdkHost])

  return (
    <div data-testid="airwallex-dropin">
      <div id={CONTAINER_ID} className="min-h-64" />
      {error && <p role="alert" className="mt-4 text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}
