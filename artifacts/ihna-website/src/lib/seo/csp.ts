// Content-Security-Policy builder (90-security §4, 80-tracking §4 CSP, DEC-5, DEC-21). Pure: no env, no I/O, edge-safe.
// script/connect/style launch as Report-Only because GTM custom-HTML tags can inject any host; the three
// directives that cannot break a page (`frame-ancestors`, `object-src`, `base-uri`) are enforced.

/** From 80-tracking §4 (exact lists). */
export const SCRIPT_HOSTS = [
  'https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://www.googleadservices.com', 'https://googleads.g.doubleclick.net',
  'https://js.hs-scripts.com', 'https://js.hs-analytics.net', 'https://js.hs-banner.com', 'https://js.hscollectedforms.net', 'https://js.usemessages.com',
  'https://www.clarity.ms', 'https://chat.airgentic.com', 'https://www.google.com/recaptcha/', 'https://www.gstatic.com',
  // IHNA (80 §9): HubSpot EU1 portal hosts, LiveChat and the Meta pixels
  'https://js-eu1.hs-scripts.com', 'https://js-eu1.hs-analytics.net', 'https://js-eu1.hs-banner.com', 'https://js-eu1.hscollectedforms.net',
  'https://cdn.livechatinc.com', 'https://connect.facebook.net',
]
export const CONNECT_HOSTS = [
  'https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.hubspot.com', 'https://*.hsforms.com', 'https://*.clarity.ms', 'https://chat.airgentic.com',
  'https://*.livechatinc.com', 'wss://*.livechatinc.com', 'https://www.facebook.com',
]
/** 80 §4 frame-src plus Vimeo and Google Maps (`www.google.com`, already listed). The gateway hosts are `GATEWAY_HOSTS` (45-payments). */
export const FRAME_HOSTS = [
  'https://www.googletagmanager.com', 'https://chat.airgentic.com', 'https://www.google.com',
  'https://www.youtube-nocookie.com', 'https://www.youtube.com', 'https://player.vimeo.com', 'https://hrms.ihna.edu.au',
  // student appeals and complaints forms (iframeEmbed blocks; host is also in site.allowedEmbedHosts)
  'https://superform.spot-nik.com',
]
/** Payment gateways (90 §4). Confirm the exact live/test hosts with 45-payments before enforcing. */
export const GATEWAY_HOSTS = [
  'https://checkout.airwallex.com', 'https://api.airwallex.com', 'https://api.payway.com.au', 'https://payments.auspost.net.au',
  // 45-payments: loaded only by /pay/airwallex/ (SDK) and /pay/securepay/ (card UI). The builder has no per-path groups, so they are site-wide.
  'https://static.airwallex.com', 'https://checkout-demo.airwallex.com', 'https://api-demo.airwallex.com', 'https://payments-stest.npe.auspost.zone',
]
const IMG_HOSTS = ['https://i.ytimg.com', 'https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://*.clarity.ms', 'https://*.hubspot.com', 'https://googleads.g.doubleclick.net', 'https://www.facebook.com', 'https://*.livechatinc.com']
const FORM_ACTION_HOSTS = ['https://api.payway.com.au']

/** The sink route (src/app/api/csp-report). Trailing slash: `trailingSlash: true` answers the bare path with a 308, and browsers do not follow redirects for reports. */
export const CSP_REPORT_URI = '/api/csp-report/'

/** `site.allowedEmbedHosts` entries are bare hosts (`my.matterport.com`). Anything that is not one is dropped. */
export function embedHostSources(hosts: (string | null | undefined)[]): string[] {
  const out = new Set<string>()
  for (const h of hosts) {
    const host = String(h ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    if (/^(\*\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?$/.test(host)) out.add(`https://${host}`)
  }
  return [...out]
}

const join = (name: string, values: string[]) => `${name} ${values.join(' ')}`

export type CspOptions = { embedHosts?: string[]; dev?: boolean; admin?: boolean }

export function buildCsp({ embedHosts = [], dev = false, admin = false }: CspOptions = {}): { enforced: string; reportOnly: string } {
  const enforced = ["object-src 'none'", "base-uri 'self'", "frame-ancestors 'self'"].join('; ') // 'self': Payload live preview frames the site

  if (admin) {
    // /admin gets no third-party hosts. Payload's UI needs inline script/style; it frames the site (live preview).
    return {
      enforced,
      reportOnly: [
        "default-src 'self'",
        `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-src 'self'",
        `report-uri ${CSP_REPORT_URI}`,
      ].join('; '),
    }
  }

  return {
    enforced,
    reportOnly: [
      "default-src 'self'",
      // ISR pages cannot carry nonces, so inline loaders need 'unsafe-inline'; no 'unsafe-eval' in production.
      join('script-src', ["'self'", "'unsafe-inline'", ...(dev ? ["'unsafe-eval'"] : []), ...SCRIPT_HOSTS, ...GATEWAY_HOSTS]),
      "style-src 'self' 'unsafe-inline'",
      join('img-src', ["'self'", 'data:', 'blob:', ...IMG_HOSTS]),
      "font-src 'self' data:",
      join('connect-src', ["'self'", ...CONNECT_HOSTS, ...GATEWAY_HOSTS]),
      join('frame-src', [...new Set([...FRAME_HOSTS, ...GATEWAY_HOSTS, ...embedHosts])]),
      "media-src 'self'",
      join('form-action', ["'self'", ...FORM_ACTION_HOSTS]),
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'self'",
      `report-uri ${CSP_REPORT_URI}`,
    ].join('; '),
  }
}
