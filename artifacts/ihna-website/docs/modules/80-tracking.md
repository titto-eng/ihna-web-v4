# 80 — Tracking, chat and conversion events (ihna-web)

## 1. Purpose
Load the site's third-party tags (GTM, Microsoft Clarity, HubSpot tracking, LiveChat, Meta pixels) from ids in code, behind one gate and one env switch, and provide typed, PII-free `dataLayer` event builders. Every thank-you and receipt URL is a real page; reached by client navigation it is reported as `page_view_virtual`.

## 2. Data model
`site.tracking` in `src/content/site.ts` (plain data, edited by a developer, shipped by a deploy):
`{ gtmId: null, clarityId: null, hubspotPortalId: null, hubspotRegion: 'eu1', airgenticId: null, livechatLicence: null }`.
`buildTrackingConfig` (`src/components/tracking/config.ts`) also accepts optional `airgenticServiceId`, `metaPixels[] {pixelId, paths[] {path}}`, `gtmOverrides[] {pathPrefix, containerId}` and `exclusions[] {tool, pathPrefix}`. An empty or invalid id falls back to `TRACKING_DEFAULTS` (`src/components/tracking/defaults.ts`, IHNA's own file, not shared); a missing array uses the default array, a present array replaces it. Ids must match `^[A-Za-z0-9_-]{1,40}$`; prefixes and pixel paths must start with `/` (a trailing `/` is added); `tool` ∈ `gtm | clarity | hubspot | airgentic | livechat | metaPixel` (DEC-63).

Values that load (all from `TRACKING_DEFAULTS`, since every id in `site.tracking` is `null`):

| Setting | Value |
|---|---|
| `gtmId` | `GTM-M2PBNS` |
| `gtmOverrides` (replace the main container under the prefix) | `GTM-KC4DVMW` on `/study-at-ihna/domestic/HLT57921-diploma-of-anaesthetic-technology-and-practice/` and the four `/study-at-ihna/domestic/*-Perth-FF/` paths (these are `gone` on live and have no route); `GTM-K3TPCL` on `/study-at-ihna/certificate3-individual-suport-int-thanks.php`. Paths keep their case. |
| `clarityId` | `9pyrntuztg` |
| HubSpot | portal `26193905`, region `eu1` (`js-eu1.hs-scripts.com`) |
| LiveChat | licence `12907932`, site-wide |
| Meta pixels | `988091695328691`, `830252460920799`, `867500190574239`, `1304174603320589`, PageView only, each with an empty `paths` list, so none loads |
| Airgentic | account `''`: never loads |
| `exclusions` | `hubspot` off under `/pay-online/`, `/pay/`, `/airwallex/`, `/secure-pay/` |

All ids are public. `enquiries.hutk` (text) is defined in `src/collections/Enquiries.ts` (40-enquiries).

## 3. Admin capabilities
None. A developer edits `src/content/site.ts` (or `defaults.ts`) and deploys.

## 4. Front-end behaviour
`Tracking` (`src/components/tracking/Tracking.tsx`, server component) renders once at the top of `<body>` in `src/app/(site)/layout.tsx`. It calls `buildTrackingConfig(site.tracking, env.TRACKING_ENABLED === '1')` and passes the result to the client component `TrackingScripts`, which picks tags for `usePathname()` with `activeTags` (longest override prefix wins; exclusions switch a tool off; a pixel loads only on a path equal to one of its `paths`). With `TRACKING_ENABLED` off, `activeTags` returns nothing and no third-party script loads. `/admin` uses a different layout and loads no tags.

- **GTM:** `<GoogleTagManager gtmId>` from `@next/third-parties/google`, plus a `<noscript>` iframe to `www.googletagmanager.com/ns.html`. GA4, Ads and any other marketing tags live inside the container; the code calls no `gtag()`.
- **Clarity:** inline `next/script` `id="clarity-script"`, `afterInteractive`, standard loader for `https://www.clarity.ms/tag/<id>`.
- **HubSpot:** `next/script` `id="hs-script-loader"`, `https://js-eu1.hs-scripts.com/<portalId>.js` (`js.` for region `na1`), `lazyOnload`.
- **LiveChat:** inline `next/script` `id="livechat-script"`, `lazyOnload`, sets `window.__lc.license` and loads `https://cdn.livechatinc.com/tracking.js`.
- **Meta pixel:** inline `next/script` `id="meta-pixel-<id>"`, `afterInteractive`, loads `connect.facebook.net/en_US/fbevents.js`, `fbq('init')` and `fbq('track','PageView')`.
- **Airgentic:** the shared loader (`chat.airgentic.com/_js/airgentic-1.4.js`) renders only when an account id is set; IHNA sets none.
- **Client navigation:** `TrackingScripts` pushes `{event: 'page_view_virtual', page_path, page_title}` on every route change after the first load, whether or not tags are enabled. Enquiry and pay forms navigate to a local thank-you/result path with `router.push` (client navigation, so it is reported as `page_view_virtual`) and to an absolute URL with `window.location.assign`; the SecurePay and Airwallex components use `window.location.assign`.

**`dataLayer` builders** (`src/components/tracking/datalayer.ts`). Every builder and `pushDataLayer` run `assertNoPii`, which throws on PII-shaped keys (name, email, phone, message, address, dob, …) at any depth and on email-like values; empty fields are dropped.

| Builder | Event | Fields |
|---|---|---|
| `generateLead` | `generate_lead` | `form_key`, `campaign`, `course_code`, `campus`, `student_type`, `enquiry_ref` |
| `brochureDownload` | `brochure_download` | `form_key`, `course_code` |
| `eventRegistration` | `event_registration` | `event_slug` |
| `thankYouView` | `thank_you_view` | `page_path` |
| `pageViewVirtual` | `page_view_virtual` | `page_path`, `page_title` |
| `purchase` | `purchase` | `transaction_id`, `value`, `currency: 'AUD'`, `payment_type`, `items[] {item_id, item_name, price}` |

Helpers: `pushOnce(key, event)` (one push per key per tab via `sessionStorage`), `storeEnquiry` / `takeEnquiry` (`sessionStorage` key `ihna:enquiry`, read-and-clear). `src/components/tracking/ConversionEvents.tsx` exports `ThankYouEvent` (pushes `generate_lead` / `brochure_download` from a stored enquiry, else `thank_you_view`; `event_registration` for events) and `PurchaseEvent` (one `purchase` per transaction).

Where events are pushed:
- **Enquiry forms** (`EnquiryFormClient`): on a successful submit, before navigating, `pushOnce('lead:<submissionId>', leadEventFor(...))`: `brochure_download` for a brochure form (`thankYouType` `brochure`), else `generate_lead` with the form key, the campaign code, the course and campus ids, `studentType` and `enquiry_ref` = the response's `enquiryId` (the row's `publicId`). The push happens whatever the target (thank-you page, brochure file, inline) and a tracking error never blocks the redirect. No form calls `storeEnquiry`.
- **Landing thank-you pages** (`src/components/templates/landing/ThankYou.tsx`, at the old `thanks.php` / `thankyou.php` / `thankyou` URLs) render `<ThankYouEvent />`, which pushes `thank_you_view` (nothing is stored). The site thank-you pages (`/thanks/`, `/thanks-events/`, `/quick-enquiry-thanks/`, `/scholarship-thanks/`, `/blog/thanks/`, …) do not render it; they are reported by the page view (first load) or `page_view_virtual`.
- **Paid result page** (`/pay/result/[uuid]/`, where every gateway return lands with a 303) renders `PurchaseEvent` from `purchaseEventFor` (`src/lib/payments/handlers.ts`): `transaction_id` = payment uuid, `value` = the stored amount, `payment_type` = gateway, one item whose id is the payment kind and whose name is the stored product name for products, else the kind (an invoice's typed "payment for" text is never sent). Nothing is pushed for any other status.

**`hutk` handoff** (DEC-13). `EnquiryFormClient` sends the `hubspotutk` cookie value as `hutk` in the `POST /api/enquire/` body; `src/lib/enquiries/process.ts` falls back to the request's `hubspotutk` cookie (`hutkFromCookie`). The value is always stored on `enquiries.hutk`. The HubSpot adapter (`src/lib/adapters/hubspot.ts`) sends it only as `context.hutk` on a Forms API v3 submit, which happens only when `HUBSPOT_FORM_GUID` is set; the Contacts upsert never carries it. `src/components/tracking/hutk.ts` (`readHutk`) parses the cookie but is used only by tests.

**CSP** (`src/lib/seo/csp.ts`, applied by `src/proxy.ts`, DEC-21). Enforced: `object-src 'none'; base-uri 'self'; frame-ancestors 'self'`. Everything else is `Content-Security-Policy-Report-Only` (report-uri `/api/csp-report/`), because GTM custom-HTML tags can inject any host. Inline loaders are allowed by `'unsafe-inline'` (no nonces).
- `SCRIPT_HOSTS`: `www.googletagmanager.com`, `*.google-analytics.com`, `www.googleadservices.com`, `googleads.g.doubleclick.net`, `js.hs-scripts.com`, `js.hs-analytics.net`, `js.hs-banner.com`, `js.hscollectedforms.net`, `js.usemessages.com`, `www.clarity.ms`, `chat.airgentic.com`, `www.google.com/recaptcha/`, `www.gstatic.com`, `js-eu1.hs-scripts.com`, `js-eu1.hs-analytics.net`, `js-eu1.hs-banner.com`, `js-eu1.hscollectedforms.net`, `cdn.livechatinc.com`, `connect.facebook.net`
- `CONNECT_HOSTS`: `*.google-analytics.com`, `*.analytics.google.com`, `*.hubspot.com`, `*.hsforms.com`, `*.clarity.ms`, `chat.airgentic.com`, `*.livechatinc.com` (https and wss), `www.facebook.com`
- `FRAME_HOSTS`: `www.googletagmanager.com`, `chat.airgentic.com`, `www.google.com`, `www.youtube-nocookie.com`, `www.youtube.com`, `player.vimeo.com`, `hrms.ihna.edu.au`, `superform.spot-nik.com`, plus `site.allowedEmbedHosts` (DEC-5)
- img-src adds `i.ytimg.com`, `www.googletagmanager.com`, `*.google-analytics.com`, `*.clarity.ms`, `*.hubspot.com`, `googleads.g.doubleclick.net`, `www.facebook.com`, `*.livechatinc.com`. Payment gateway hosts are in 45-payments.

**Consent:** no consent banner or Consent Mode. `Tracking.tsx` is the single place to add one.

## 5. URLs
None of its own. Thank-you pages (`/thanks/`, `/thanks-events/`, the `*-thanks/` pages, landing thank-you paths) and `/pay/result/[uuid]/`, `/pay/receipt/[uuid]/` are owned by 40-enquiries, 60-landing and 45-payments.

## 6. Integrations
- External: GTM (GA4 and Ads inside it), Clarity, HubSpot EU1, LiveChat, Meta pixels (none mapped). reCAPTCHA belongs to 40-enquiries.
- Env: `TRACKING_ENABLED` (`0 | 1`, default `0`, set `1` in production only). `0` = no third-party tag loads; `dataLayer` pushes still happen.
- `HUBSPOT_FORM_GUID` (with `HUBSPOT_PORTAL_ID`) controls whether `hutk` is sent (40-enquiries).

## 7. Import / seed
None.

## 8. Acceptance checks
1. `tests/seo/tracking.test.ts` (`npm run test:int`): default tags everywhere (GTM, Clarity, HubSpot EU1, LiveChat; no Airgentic, no pixel without a mapped path); the override paths (Perth fee-free, anaesthetic technology, the international thank-you page) swap the GTM container and their siblings keep `GTM-M2PBNS`; payment pages load no HubSpot; a Meta pixel loads only on its mapped paths; nothing loads with tracking off; malformed ids, prefixes and tools are ignored; builders carry only opaque fields; `purchase` uses AUD and the GA4 item shape; PII keys and email-like values are rejected; `readHutk`; CSP frame-src and admin policy.
2. `tests/enquiries/adapters.test.ts`: the Forms API request carries `hutk` only when `HUBSPOT_FORM_GUID` is set; the Contacts request never contains it.
3. `tests/enquiries/lead-event.test.ts` (`leadEventFor`: opaque fields, `enquiry_ref` = `enquiryId`, brochure forms), `tests/payments/purchase-event.test.ts` (`purchaseEventFor`: paid only, no invoice text).
4. With `TRACKING_ENABLED=1` on the dev server (`npm run dev -- -p 3001`), `curl -s http://localhost:3001/ | grep -c 'ns.html?id=GTM-M2PBNS'` is ≥ 1 (server-rendered noscript iframe); with it unset, 0.
5. With `TRACKING_ENABLED=1`, `curl -s http://localhost:3001/study-at-ihna/domestic/HLT57921-diploma-of-anaesthetic-technology-and-practice/ | grep -o 'ns.html?id=GTM-[A-Z0-9]*' | sort -u` prints only `ns.html?id=GTM-KC4DVMW`.
6. `curl -sI http://localhost:3001/ | grep -i content-security-policy-report-only` names `js-eu1.hs-scripts.com`, `cdn.livechatinc.com` and `connect.facebook.net` (any `TRACKING_ENABLED`).

## 9. Differences from ihm-web
- IHNA's `defaults.ts` holds its own ids: GTM `GTM-M2PBNS` with two override containers, Clarity `9pyrntuztg`, HubSpot EU1 `26193905`; ihm-web loads `GTM-KXFBMHL`, Clarity `9q34oifeju` and HubSpot NA1 `39853473`.
- IHNA loads LiveChat and has Meta pixel slots (tools `livechat`, `metaPixel`, and their CSP hosts); ihm-web has neither.
- IHNA loads no Airgentic; ihm-web loads it site-wide (account `ihm`).
- IHNA switches HubSpot off on the payment pages; ihm-web's exclusions cover `/school-of-american-education/`.
- The `sessionStorage` enquiry key is `ihna:enquiry` (`ihm:enquiry` on ihm-web).

## 10. Open questions
1. Meta pixel pages: the four pixels are tied to old WordPress page ids (85/89, 91/95, 111/112, 115) that need the WordPress database dump to map to paths; until mapped, none loads.
2. GTM container exports: triggers bound to old DOM selectors or form ids may not fire on the new markup. Who owns the containers?
3. GTM conversion tags that fire on a thank-you URL page view must also listen to `page_view_virtual` (client navigation) or switch to the `generate_lead` / `purchase` events.
4. Will marketing create a HubSpot form so `HUBSPOT_FORM_GUID` can be set (DEC-13), and which HubSpot EU1 property names and `course` values does it use?
5. Consent (Australian Privacy Act): Consent Mode v2 defaults, a CMP, or none?
6. `frame-src` lists no LiveChat host; the CSP reports show which frame host the widget needs before the policy is enforced.
7. The four `-Perth-FF` `GTM-KC4DVMW` overrides match no served page (the pages are `gone`): drop them, or does marketing want those pages back?
