import { describe, expect, it } from 'vitest'
import { buildCsp } from '@/lib/seo/csp'

// The hosts the payment pages load (45 §4): Airwallex SDK and drop-in (live and demo), SecurePay card UI (live and sandbox).
describe('CSP carries the payment page hosts', () => {
  const { reportOnly } = buildCsp()
  const directive = (name: string) => reportOnly.split('; ').find((d) => d.startsWith(`${name} `)) ?? ''
  it.each(['https://static.airwallex.com', 'https://checkout.airwallex.com', 'https://checkout-demo.airwallex.com', 'https://api.airwallex.com', 'https://api-demo.airwallex.com', 'https://payments.auspost.net.au', 'https://payments-stest.npe.auspost.zone'])('%s is allowed to load and connect', (host) => {
    expect(directive('script-src')).toContain(host)
    expect(directive('connect-src')).toContain(host)
    expect(directive('frame-src')).toContain(host)
  })
})
