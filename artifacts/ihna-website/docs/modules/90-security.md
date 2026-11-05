# 90 — Security

## 1. Purpose
Who may do what (access matrix, auth), what is reachable (admin guard, API, rate limits, headers, uploads, the old PHP and AJAX URLs), and what must never exist in the repo or a page (secrets, personal data, old HTML). Enforces AGENTS.md rules 2–6.

## 2. Data model
**Access helpers** (`src/lib/access.ts`):
- `isStaff(user)`: the user is a `users` doc, or a Local API user object with `roles`. Alumni are never staff.
- `hasRole`, `isAdmin`, `roles(...)` (admin plus the listed roles), `fieldRoles(...)` (the same check at field level).
- `anyone`, `denyAll`, `loggedIn`, `staffOnly`, `staffField`.
- `publishedOrStaff`: anyone else sees only `_status = published`.
- `activeOrStaff`: anyone else sees only `active = true`.
- `selfOrAdmin(collection)`: own doc only, except admin.

Payload's default access is "any logged-in user", which includes alumni, so every collection declares its operations explicitly.

**Staff roles:** `users.roles` (select, hasMany, `saveToJWT`): `admin`, `marketing`, `events`, `finance`, `viewer`; the default is `viewer`. Only admin can update the field.

**Matrix.** P = anonymous or alumni; C/R/U/D = create/read/update/delete; R* = published only; Ra = active only; – = denied. "Staff" means any role, `viewer` included.

| Collection | P | admin | marketing | events | finance | viewer |
|---|---|---|---|---|---|---|
| posts, staff, testimonials | R* | CRUD | CRU | R | R | R |
| courses | R* | CRUD | CRU (not `fees`, not the `facts.fee` text) | R | RU (`fees` and the `facts.fee`/`factsInternational.fee` value and detail only) | R |
| events | R* | CRUD | CRU | CRU | R | R |
| 7 lookups (levels, deliveryModes, durations, universities, campuses, disciplines, categories) | Ra | CRUD | CRU | R | R | R |
| blogCategories | Ra | CRUD | CRU | R | R | R |
| galleries | Ra | CRUD | CRU | CRU | R | R |
| products | Ra | CRUD | RU (not `priceCents`, `currency`, `studentDiscountPercent`) | R | CRU | R |
| media | R | CRUD | CRU | CRU | R | R |
| documents | R | CRUD | CRU (`publicPath` on create only) | R | R | R |
| global `courseShared` | R | RU | RU | R | R | R |
| enquiries | – | R | R | – | R | – |
| payments | – | R | – | – | R | – |
| users | – | CRUD | self RU | self RU | self RU | self RU |
| alumni | own doc RU (alumni) | CRUD | – | – | – | – |

**Rules the matrix does not show:**
- Nobody creates, updates or deletes `enquiries` or `payments` through access control (`denyAll`, DEC-3). The system writes them through the Local API with `overrideAccess`.
- `readVersions` is staff-only on every collection that declares it and on `courseShared`.
- Every content delete is admin-only.
- `unlock` on `users` and `alumni` is admin-only.

**Field-level rules:**
- **Courses:** `lockFields` (`src/collections/shared/fields.ts`) locks every `courses` field except `fees` to admin and marketing. `fees` and the fee fact `value`/`detail` are admin and finance only; the fee fact's `show` is admin and marketing. A finance save publishes like any other save (DEC-72 is not applied).
- **Products:** `priceCents`, `currency` and `studentDiscountPercent` are admin and finance only.
- **Documents:** `publicPath` can be created by admin and marketing and updated by admin only. `notes` is readable by staff only.
- **Lookups:** `enquiryEmail` (universities, campuses, categories) is admin and marketing only, read included.
- **Staff:** `staff.email` is readable by staff only.
- **Import fields:** the `import.*` system fields except `reviewStatus` are admin only. The App Runner keys `apprunnerId` and `sourceUpdatedAt` on posts and galleries (and `apprunnerId` on gallery items) are admin only.
- **Alumni:** `legacyId` and `passwordSetAt` are create/update admin only (`passwordSetAt` is also stamped by a `beforeChange` hook whenever a password is set) and have no read restriction. An alumnus's own write drops `_verified` and restores `email`.

**Jobs:** `/api/payload-jobs/run` needs `Authorization: Bearer $CRON_SECRET` or an admin session (`src/jobs/index.ts`).

## 3. Admin capabilities
- Admin manages users and roles, unlocks accounts, and creates or deletes alumni.
- Admin and marketing release held enquiries and retry deliveries through `POST /api/enquire/release/` and `POST /api/enquire/retry/`. Both need a staff session with role admin or marketing (`src/lib/enquiries/adminRoute.ts`, DEC-20).
- Admin and finance re-queue a payment's dead fulfilment steps through `POST /api/payments/retry/` (`src/app/api/payments/retry/route.ts`, 45 §6); it needs a staff session with role admin or finance (DEC-20).
- Finance edits fees and prices.
- The embed allowlist is code (`site.allowedEmbedHosts` in `src/content/site.ts`), not an admin field.

## 4. Front-end behaviour
**Payload auth** (`src/collections/Users.ts`, `src/collections/Alumni.ts`):

| Setting | users | alumni |
|---|---|---|
| `tokenExpiration` | 8 h | 12 h |
| `maxLoginAttempts` / `lockTime` | 5 / 15 min | 5 / 15 min |
| `verify` | off | on (link to `/alumni/verify/?token=`) |
| `forgotPassword.expiration` | Payload default | 1 h (link to `/alumni/reset-password/?token=`) |
| cookies | `sameSite: 'Strict'`, `secure` in production | `sameSite: 'Lax'`, `secure` in production |
| `removeTokenFromResponses` | true | true |
| admin panel | yes (`admin.user: 'users'`) | no (`access.admin: () => false`) |

- **Alumni password policy** (`src/lib/alumni/password.ts`): 12–128 characters, not in the bundled common-password list, and not containing the email local part. It applies on `resetPassword` and on an alumnus's own update (`src/lib/alumni/hooks.ts`).
- **Account enumeration:** an alumni login with a wrong password and one with an unknown email get the same 401. Forgot-password answers the same 200 for an unknown email.
- **Alumni sign-up:** there is no self-registration. `/alumni/register/` carries the `alumni-signup` enquiry form (DEC-47).

**`/admin` guard** (`src/proxy.ts` calls `adminGuardDecision` in `src/lib/security/adminGuard.ts`):
- It applies to `/admin` and `/admin/*` only.
- When `ADMIN_BASIC_USER` and `ADMIN_BASIC_HASH` are set, a request needs HTTP Basic auth with that user and a password whose SHA-256 hex equals `ADMIN_BASIC_HASH`. Otherwise it gets a 401 with `WWW-Authenticate: Basic realm="IHNA CMS"`. User and hash are compared in constant time.
- A `cf-access-authenticated-user-email` header skips the check only when `ADMIN_GUARD_TRUST_CF_ACCESS=1`. The operator sets it only when the origin is reachable through Cloudflare Access alone. Without it the header is ignored, because anyone who reaches the origin directly can send it.
- With either basic-auth variable unset, there is no guard.
- `/api/*`, including `/api/users/login`, is not behind the guard. Payload access control protects the data.

**API surface:**
- `graphQL: { disable: true }` (DEC-14), and no GraphQL route files exist.
- REST is served at `src/app/(payload)/api/[...slug]/route.ts`, gated by the matrix.
- Custom routes (`src/app/api/`):
  - `/api/enquire` (plus `retry` and `release`).
  - `/api/payments/start`, `/api/payments/securepay/charge`, `/api/payments/webhook/{airwallex,payway}` and `/api/payments/fake/[uuid]` (45).
  - `/api/payments/retry`: POST, staff session with role admin or finance (401/403 otherwise).
  - `/api/preview`: GET, needs `?secret=` equal to `PREVIEW_SECRET` (503 when unset, 401 when wrong), a site-relative `path` (400 otherwise) and a staff session (401); then turns draft mode on and redirects. `/api/preview/exit` needs nothing and turns draft mode off.
  - `/api/revalidate`: needs `x-revalidate-secret` equal to `REVALIDATE_SECRET`, else 401. With the variable unset it always answers 401.
  - `/api/csp-report/`: POST only (other methods 405). It accepts `application/csp-report`, `application/reports+json` and `application/json` (else 415), refuses a body over 16 KB (413) or bad JSON (400), logs one `csp.violation` line per report with `console.warn` (document, directive, blocked URL, disposition) and answers 204. Nothing is stored.

**Webhooks and gateway returns** (`src/lib/payments/handlers.ts`, 45):
- **Airwallex** (`/api/payments/webhook/airwallex/`, and POST `/airwallex-webhook` with or without the slash, `site.postWithoutSlash`): `x-signature` must equal hex HMAC-SHA256 of `x-timestamp` + the raw body under `AIRWALLEX_WEBHOOK_SECRET`, and the timestamp must lie within 5 minutes (`WEBHOOK_TOLERANCE_MS`). A bad or missing signature, a stale timestamp or an unset secret answers 401 and changes nothing. Events are idempotent. GET `/airwallex-webhook/` is an empty 200.
- **PayWay notification** (`/api/payments/webhook/payway/`): the Basic auth header (or the `username`/`password` fields) must match `PAYWAY_NOTIFY_USERNAME`/`PAYWAY_NOTIFY_PASSWORD` (`safeEqual`); a mismatch or an unset password answers 401.
- **PayWay return** (`/pay/return/payway/`, and `/payway-response/?EncryptedParameters=` rewritten to it): the parameters are decrypted and verified with `PAYWAY_ENCRYPTION_KEY` (AES-128); a response that fails verification, names an unknown payment or carries no positive amount answers 400 and changes nothing (`handlePaywayReturn`).

**Signed invoice links** (DEC-106, `src/lib/portal/ihna.ts`): `/pay-online/` pre-fills an invoice only from `?invoice_id=&exp=&sig=`, `sig` = hex HMAC-SHA256 of `invoice:<id>:<exp>` under `PORTAL_INVOICE_LINK_KEY`, compared in constant time. A link is refused after `exp`, or when `exp` lies more than `PORTAL_INVOICE_LINK_MAX_DAYS` (default 30, 1–365) ahead. Without the key there is no prefill. Only the invoice number and amount due come back, never a name, email or student id. `/payment-options/` passes all three parameters on (`signedInvoiceParams`). The pay pages are noindex and send no referrer (`src/components/templates/payPages.tsx`); HubSpot does not load on the pay paths (`TRACKING_DEFAULTS.exclusions`).

**Old payment URLs:** `/secure-pay-response/`, `/secure-pay-card-dcc/` and `/airwallex-checkout/` are information pages that ignore their old `?id=`/`?data=` parameters, so no payment is shown by a guessed number (DEC-45).

**Receipts:** `/pay/receipt/[uuid]/?e=<email>` shows a receipt only when the email matches the stored payer email (`loadReceipt`, constant-time compare); a wrong id, a wrong email and a rate-limited request all answer the same 404.

**Legacy AJAX endpoints** (DEC-112, `src/lib/portal/legacy-endpoints.ts`): `/census-date-details/`, `/census-date-details-ajax/`, `/agent-details/`, `/hc-course-details/`, `/hc-course-transition/`.
- Every query-string id passes `idParam` (`^\d{1,9}$`, above 0); a present but malformed id is unknown.
- Ids are checked against cached lists of real ids before any deeper read. Unknown → 404 `{"error":"not_found"}` with `Cache-Control: no-store`, no portal row query and no new cache entry.
- Every portal statement is a constant with `?` placeholders (`tests/portal/no-raw-sql.test.ts`).
- One rate-limit bucket for all five (below).
- `/agent-details/` answers with `Access-Control-Allow-Origin: *` and returns agency fields only (no partner staff person); it includes the agency's `web_name`, `web_email` and `web_phone_number` (§10).
- `/hc-course-details/` never serves the portal's course-overview HTML: those keys are empty (rule 5).

**Empty 200s and stand-ins** (DEC-113, `src/content/static-paths.ts`): `/RDynamics.php`, `/campaign_codes.php` and `/e2btns.php` answer an empty 200 with `X-Robots-Tag: noindex` (`src/lib/empty-200.ts`). They are live URLs whose old source holds credentials and lookup tables; none of that source is in this repo (rule 3). The 18 `demo/` pages answer a noindex "not available" page; any other `/demo/` URL is 404.

**Secret comparisons:** `safeEqual` (`src/lib/security/safeEqual.ts`, constant time, edge-safe) compares the `/admin` basic-auth user and hash, `x-revalidate-secret`, the `CRON_SECRET` bearer token (`src/jobs/index.ts`, `access.run`) and the `PREVIEW_SECRET` query parameter (`src/app/api/preview/route.ts`); the payment `safeEqual` (`src/lib/payments/sign.ts`) compares the PayWay notification credentials and the receipt email. No secret is compared with `===`.

**Rate limits:**
- **Counter:** one fixed-window counter, `rateLimit()` in `src/lib/enquiries/rateLimit.ts`, keyed `<ip>|<bucket>` with a 60 s default window.
- **Store:** `RATE_LIMIT_STORE` (`memory|postgres`; the default is `postgres` in production, `memory` elsewhere, `src/lib/enquiries/config.ts`). The Postgres table `enquiry_rate_limits` is created on first use, outside Payload's schema (DEC-54).
- **Store failure:** the counter falls back to memory. It never blocks on a store failure.

| Route | Bucket | Limit | Over the limit |
|---|---|---|---|
| POST `/api/enquire` | the formKey | 10/min per IP + formKey | 429 + `Retry-After` |
| POST `/api/payments/start` | `payments-start` | 5/min per IP | 429 + `Retry-After` |
| POST `/api/payments/securepay/charge` | `payments-charge` | 10/min per IP | 429 + `Retry-After` |
| `/pay/receipt/[uuid]/` | `payments-receipt` | 10/min per IP | 404 (same as a wrong id or email) |
| GET the five legacy AJAX URLs (above) | `portal-legacy` (one shared bucket) | 30/min per IP (`LEGACY_RATE_LIMIT`) | 429 + `Retry-After`, `no-store` |
| REST `/api/alumni/login`, `/api/alumni/forgot-password` | `alumni-login`, `alumni-forgot` | 10/min per IP each (`src/lib/alumni/rateLimit.ts`) | 429 + `Retry-After` |
| REST `/api/alumni/forgot-password` | `alumni-forgot-email` | 3/h per email (HMAC of the email with `PAYLOAD_SECRET`) | 429 + `Retry-After` |

**Client IP and limit scope:**
- Every limit uses `clientIp` (`src/lib/security/clientIp.ts`, re-exported by `src/lib/enquiries/request.ts`; the alumni limiter's `ipOf` is the same function).
- Order: the headers named in `TRUSTED_IP_HEADERS` (comma separated, e.g. `cf-connecting-ip`), first one present wins; then the rightmost `X-Forwarded-For` entry (the hop our own proxy appended); else `unknown`. The leftmost entry is never used: the client writes it.
- `TRUSTED_IP_HEADERS` is unset by default, so no single-value header (`cf-connecting-ip`, `x-vercel-forwarded-for`, `x-real-ip`) is read: a client that sends its own cannot choose its rate-limit bucket or the IP stored on the enquiry and sent to the KH portal. Name a header there only when the production proxy or CDN sets or overwrites it on every request (§10). `X-Forwarded-For` is never accepted as a trusted name.
- Local API calls are not rate limited.

**reCAPTCHA and autoresponders:** a production server refuses to boot without `RECAPTCHA_SECRET_KEY` (or `RECAPTCHA_SECRET`), except during `next build` (`src/env.ts`). `site.autoresponderNeedsCaptcha` is true, so in production only an enquiry whose captcha status is `ok` gets its autoresponder; an unverified post is still stored and delivered to staff (`autoresponderAllowed`, `src/lib/enquiries/captcha.ts`). Outside production, with no secret set, the autoresponder is sent.

**Headers** (`src/proxy.ts`): set on every response that reaches the end of the proxy. Not on 410s, the `/admin` 401, legacy redirects, the document rewrite, `/wp-content/uploads/*`, or paths outside the proxy matcher (`_next/static`, `_next/image`, `favicon.ico`, `media/`, `api/media/`).
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `X-Frame-Options: SAMEORIGIN`.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

`next.config.ts` adds, in production only, `Strict-Transport-Security: max-age=63072000; includeSubDomains` on every path (`productionHeaders`), so a local `http://localhost` never pins itself. `poweredByHeader: false` drops `X-Powered-By`.

**CSP** (`buildCsp` in `src/lib/seo/csp.ts`, DEC-5, DEC-21):
- **Enforced** (`Content-Security-Policy`): `object-src 'none'; base-uri 'self'; frame-ancestors 'self'`. `'self'` is there because Payload live preview frames the site.
- **Full policy** (`Content-Security-Policy-Report-Only`, `report-uri /api/csp-report/`):
  - `default-src 'self'`.
  - `script-src 'self' 'unsafe-inline'` + `SCRIPT_HOSTS` (including the HubSpot EU1 hosts, LiveChat and `connect.facebook.net`) + `GATEWAY_HOSTS`; `'unsafe-eval'` in development only.
  - `connect-src` with `CONNECT_HOSTS` + `GATEWAY_HOSTS`.
  - `img-src` with the analytics, YouTube, Facebook and LiveChat image hosts.
  - `frame-src`: `FRAME_HOSTS` + `GATEWAY_HOSTS` + `embedHostSources(site.allowedEmbedHosts)` (`my.matterport.com`, `forms.monday.com`, `ihna.online`, `hrms.ihna.edu.au`, `portal.ihna.edu.au`, `student.ihna.edu.au`). The embed list is computed once when the proxy module loads, so adding a host is a code change and a deploy.
  - `form-action 'self' https://api.payway.com.au`.
- **`report-uri`** is `CSP_REPORT_URI` = `/api/csp-report/`, with the trailing slash: with `trailingSlash`, the bare path answers a 308 and browsers do not follow redirects for reports.
- **`/admin`:** the Report-Only policy names no third-party host.

**Embeds:**
- **Video:** `videoEmbed` stores the `url` (validated as YouTube or Vimeo); the renderer parses it into provider and id and builds the iframe `src` itself (`parseVideoUrl`, `videoSrc` in `src/blocks/embeds.ts`), never from the stored URL.
- **iframes:** `iframeEmbed` hosts must be in `BUILTIN_EMBED_HOSTS` or `site.allowedEmbedHosts`. They are checked at save by `validateEmbedHosts` (courses `sections`, posts; DEC-29) and again at render (`src/blocks/iframeEmbed/Component.tsx`).
- **Maps:** `mapEmbed` accepts only `https://www.google.com/maps/embed…`.

**Runtime HTML (rule 5):**
- `sanitize-html` is used only by `scripts/import/html-to-blocks.ts`.
- Pages render Lexical through our converters and blocks.
- `dangerouslySetInnerHTML` appears only for JSON-LD, always through `safeJsonLd`, which escapes `<` (DEC-26):
  - `src/components/seo/JsonLd.tsx`
  - `src/blocks/accordion/Component.tsx`
  - `src/components/page/blocks.tsx`
- No ESLint rule enforces this.

**Uploads:**
- **Size:** `payload.config.ts` `upload.limits.fileSize` caps any file at 50 MB (`requestSizeLimit` 51 MB). `media` caps its files at 20 MB in the `limitMediaSize` beforeValidate hook (`MEDIA_MAX_BYTES`, 413 over it).
- **`media`:** jpeg, png, webp, avif, gif and pdf. No SVG.
- **`documents`:** `application/pdf` only.
- **Storage:** both live on local disk under the gitignored `media/` tree (`media/`, `media/documents/`).
- **Who uploads:** only staff with create access. There is no public upload endpoint.
- **Forms:** no form accepts a file (DEC-110). The `jobs-eoi` CV (`cvUrl`) and the `quick-feedback` attachment (`attachmentUrl`) are optional text fields that accept only an `https://` link (`LINK_PATTERN` in `src/content/forms.ts`), and their labels say so.
- **Document serving:** `src/app/(site)/pdf/serve.ts` reads only inside `public/` and the documents upload dir, with symlinks resolved.

## 5. URLs
- `/admin/*` is guarded when the basic-auth variables are set.
- `/wp-json/*`, `/xmlrpc.php`, `/wp-login.php` and `/wp-admin/*` answer 410 (DEC-58). That includes `/wp-admin/admin-post.php`, so the old `pay_online` posts have no route (§10).
- `/RDynamics.php`, `/campaign_codes.php`, `/e2btns.php`: empty 200, noindex (DEC-113).
- `/census-date-details/`, `/census-date-details-ajax/`, `/agent-details/`, `/hc-course-details/`, `/hc-course-transition/`: JSON, rate limited, unknown ids 404 (DEC-112).
- `/airwallex-webhook/`: POST is the Airwallex webhook (also without the slash), GET an empty 200 (DEC-45).
- Alumni REST endpoints: `/api/alumni/{login,logout,forgot-password,reset-password,verify/:token}`.
- `/alumni/dashboard/` redirects to `/alumni/login/` without an alumni session.
- `/pay/receipt/[uuid]/?e=<email>` shows a receipt only when the email matches the row.
- `/pay-online/?invoice_id=&exp=&sig=` pre-fills only with a valid, unexpired portal signature (DEC-106).
- `/api/revalidate/`, `/api/payload-jobs/run` and `/api/preview/` need their secrets.

## 6. Integrations
**Env** (`src/env.ts`, one zod schema parsed when the module loads; an invalid value throws `Invalid environment` listing the variable names and messages; `.env.example` mirrors it with empty secrets, DEC-24):
- `PAYLOAD_SECRET` (≥32 characters, required) and `DATABASE_URL` (must start with `postgres`) (DEC-14).
- `NEXT_PUBLIC_SITE_URL` (default `http://localhost:3001`).
- `ADMIN_BASIC_USER`, `ADMIN_BASIC_HASH`, `ADMIN_GUARD_TRUST_CF_ACCESS` (`0|1`, default off).
- `TRUSTED_IP_HEADERS` (comma list of client-IP headers the proxy sets; unset by default).
- `REVALIDATE_SECRET` (≥16 when set), `CRON_SECRET`, `PREVIEW_SECRET`.
- `RATE_LIMIT_STORE`.
- `RECAPTCHA_SECRET_KEY` (alias `RECAPTCHA_SECRET`): required when `NODE_ENV=production`, checked after the schema and skipped while `next build` runs (`NEXT_PHASE`).
- `PAYMENTS_DATA_KEY` (≥16; HMAC key of signed amounts and payment ids; `src/lib/payments/sign.ts` throws in production without it).
- `PORTAL_INVOICE_LINK_KEY`, `PORTAL_INVOICE_LINK_MAX_DAYS` (empty or 1–3 digits) for signed invoice links (DEC-106).
- `PORTAL_SKILLDEMY_URL`: empty or an `https://` URL.
- Webhook secrets: `AIRWALLEX_WEBHOOK_SECRET`, `PAYWAY_NOTIFY_USERNAME`, `PAYWAY_NOTIFY_PASSWORD`, `PAYWAY_ENCRYPTION_KEY`; outbound: `IHNA_ONLINE_WEBHOOK_KEY` (sent as `X-Webhook-Key`, DEC-103).
- `DEV_ADMIN_EMAIL`, `DEV_ADMIN_PASSWORD` (≥12).

**Secrets:** every secret lives in `.env`, and only public ids are `NEXT_PUBLIC_*`. Gateway credentials are entered by the owner (DEC-49). `tests/payments/no-raw-sql.test.ts` asserts that `src/lib/payments`, `src/jobs` and the payment pages hold no hard-coded secret or old-theme id.

**Dry-run records** mask every header or body key matching `secret|password|passwd|token|api[-_]?key|webhook[-_]?key|authorization|credential` (`SECRET_KEY` in `src/lib/adapters/util.ts`), so the IHNA Online `X-Webhook-Key` and the Dynamics `client_secret` never reach a delivery row.

**Retention:** the `scrubEnquiryIps` job (`src/jobs/scrubEnquiryIps.ts`, daily at 03:00 on the `maintenance` queue) nulls `enquiries.ip` after 90 days. The rows and their deliveries stay.

## 7. Import / seed
- **First admin:** `npx tsx scripts/dev/seed-admin.ts` creates it from `DEV_ADMIN_EMAIL`/`DEV_ADMIN_PASSWORD` (dev only; it refuses to run in production).
- **Personal data (rule 4):** none is imported or committed from the old repo (`../ihna-web-2.0`). That covers the CVs in its `wp-content/uploads/resumes/` folder (251 files) and the cover letters elsewhere in `wp-content/uploads/`, error and audit logs, enquiry history, student and portal rows, and agent personal emails. The App Runner import reads public GET endpoints only.
- **`static` import step** (`scripts/import/steps/static.ts`):
  - Copies the `STATIC_STORES` folders (`pdf`, `ihna-policies`, `ihna-procedures`, `IHNA_International_Course_Guide`, `alumni/docs`, `emailers`) and the listed `STATIC_FILES` into `public/`. From `wp-content/uploads/` it takes only the 7 listed PDFs.
  - Allowlist: `pdf, jpg, jpeg, png, webp, gif, svg` plus `STATIC_EXTRA_EXTENSIONS` (`.docx`, `.json`; `scripts/import/seeds/documents.ts`).
  - Never `.php`, `.htaccess`, `.js`, `.html`, backup names or dotfiles.
  - Skips files over 50 MB.
  - Skips an SVG whose text (entities decoded) holds `<script`, `javascript:` or an `on*=` handler (`unsafeSvgReason`), and lists it in the report.
- **Credentials to rotate before go-live:** these are in the old repo and its git history. None may be copied into this repo (rule 3).
  - HubSpot private-app token (hard-coded in about 174 landing and theme files).
  - reCAPTCHA secrets (about 323 files).
  - Dynamics 365 password-grant user account (`RDynamics.php`).
  - IHNA Online leads webhook key (`X-Webhook-Key`), and the application-portal Basic credentials in `lp/diploma-of-counselling-*`.
  - monday.com API tokens (Quick Feedback, the event landing page, the E2 board).
  - PayWay encryption key, login and merchant.
  - SecurePay client credentials (live and sandbox).
  - Airwallex client id, API key and webhook secret.
  - The WordPress DB user's credentials (in the old AJAX plugin and theme files) and its grants on `ihna_portal`.
  - The Moodle token in `template-moodle-test.php`.
  - The old landing handlers (`study-at-ihna/**/thanks.php`, backups included) accept POSTs on the old server as long as it runs.
- **Landing forms** use the same `/api/enquire/` pipeline (rate limit, honeypot `_hp_url`, reCAPTCHA, store first). They do not repeat the old pages' unsafe behaviour: GET forms with personal data in the URL, captcha failure answered with the normal thank-you, string-built CRM JSON, unescaped visitor text in HubSpot notes (escaped, joined with `<br>`, `src/lib/adapters/hubspot.ts`), unencoded WhatsApp redirects.

## 8. Acceptance checks
1. `tests/collections/access.test.ts`:
   - Alumni auth needs verification and has lockout.
   - An alumnus cannot verify themselves.
   - Enquiries and payments cannot be written by anyone, and are read by the matrix roles.
   - Product price is finance-only.
   - Lookup `enquiryEmail` is hidden from the public.
   - Users read only themselves, cannot change their own roles, and alumni ids never match staff rows.
2. `tests/collections/courses.test.ts`:
   - Marketing cannot update `fees`; finance can, and touches nothing else.
   - Viewer is read-only, and anonymous users cannot read a draft.
3. `tests/collections/documents.test.ts`:
   - Anyone reads; marketing and admin create and update; only admin deletes.
   - `notes` is staff-only, and only admin changes `publicPath`.
   - Only PDFs upload.
4. `tests/alumni/access.test.ts`:
   - An alumni token cannot read users, enquiries or payments, or another alumnus.
   - It cannot create, delete or unlock accounts, change its email or verification, or set a weak password.
   - The admin panel refuses it.
5. `tests/alumni/login.test.ts`:
   - Login sets an HttpOnly cookie and returns no token in the body.
   - A wrong password and an unknown email get the same 401.
   - The account locks after 5 failures.
   - Staff credentials fail on the alumni endpoint.
   - The 11th login in a minute gets 429 + `Retry-After`.
   - The auth settings match §4.
6. `tests/alumni/forgot-reset.test.ts`: single-use tokens, no enumeration, 10/min per IP and 3/h per email.
7. `tests/alumni/password.test.ts`: the password policy.
8. `tests/enquiries/thankyou-ratelimit.test.ts`: the memory and Postgres rate-limit stores.
9. `tests/enquiries/scrub-ips.test.ts`: the IP is nulled after 90 days and the rows are kept.
10. `tests/enquiries/ihna-forms.test.ts`: in production only captcha status `ok` plans the autoresponder; dev without a secret still does.
11. `tests/seo/tracking.test.ts` ("CSP"):
    - `frame-src` = the fixed list + `allowedEmbedHosts`, with junk dropped.
    - No `'unsafe-eval'` in production.
    - The enforced policy is `object-src 'none'; base-uri 'self'; frame-ancestors 'self'`.
    - The admin policy has no third-party host.
12. `tests/payments/csp.test.ts`: the CSP carries the payment page hosts.
13. `tests/seo/jsonld.test.ts`: `<` is escaped in JSON-LD.
14. `tests/import/no-legacy-markup.test.ts`: no legacy markup is stored in posts or staff.
15. `tests/payments/no-raw-sql.test.ts` and `tests/portal/no-raw-sql.test.ts`: parameterised SQL only, and no hard-coded credentials.
16. `tests/portal/legacy-endpoints.test.ts`: unknown ids 404 before any deeper read; 30 requests per minute per IP, then 429 with `Retry-After`.
17. `tests/portal/ihna-queries.test.ts`: invoice links are refused with no key, a missing or wrong signature, an expired `exp` or one too far ahead.
18. `tests/payments/airwallex-webhook.test.ts`: an altered body, a wrong secret, a missing header, a stale timestamp or an unset secret is 401 and changes nothing; replays are ignored.
19. `tests/payments/webhook-slash.test.ts`: only `site.postWithoutSlash` paths skip the trailing-slash 308.
20. `tests/seo/ihna-shell.test.ts`: the three PHP URLs answer an empty 200 with noindex.
21. `tests/enquiries/client-ip.test.ts`: a spoofed multi-value `X-Forwarded-For` gives the rightmost entry; client-sent `cf-connecting-ip`, `x-vercel-forwarded-for` and `x-real-ip` are ignored unless `TRUSTED_IP_HEADERS` names them, in its order; `clientIp` and `ipOf` agree.
22. `tests/seo/admin-guard.test.ts`: the CF Access header is ignored without `ADMIN_GUARD_TRUST_CF_ACCESS=1`; basic auth passes only with the right user and password; `safeEqual`. `tests/seo/secret-compare.test.ts`: the `CRON_SECRET` bearer and `PREVIEW_SECRET` pass only when exact, and both go through `safeEqual`.
23. `tests/seo/headers.test.ts`: HSTS in production only; `poweredByHeader: false`; `output: 'standalone'`.
24. `tests/seo/csp-report.test.ts`: both policies report to `/api/csp-report/`, which no trailing-slash redirect matches and which has a route file; 204 and one log line per report, 413 over 16 KB, 415 for other types, 405 for GET.
25. `tests/collections/upload-limits.test.ts`: the 50 MB parser limit and the 20 MB `media` hook.
26. `tests/import/static-svg.test.ts`: script-bearing SVGs are rejected; the step reads `ctx.dry`.
27. DB (`psql -h 127.0.0.1 -p 5432 -U postgres -d ihna`): `SELECT count(*) FROM media WHERE mime_type ILIKE '%svg%'` → 0; `SELECT count(*) FROM documents WHERE mime_type <> 'application/pdf'` → 0.
28. Running server (`npm run dev -- -p 3001`):
    - `curl -s -o /dev/null -w '%{http_code}' localhost:3001/wp-login.php` → 410.
    - With `ADMIN_BASIC_*` set, `curl -sI localhost:3001/admin/` → 401 with `WWW-Authenticate: Basic realm="IHNA CMS"`.
    - `curl -sI localhost:3001/` carries `Content-Security-Policy`, `Content-Security-Policy-Report-Only`, `X-Frame-Options: SAMEORIGIN` and `X-Content-Type-Options: nosniff`.
    - `curl -s -o /dev/null -w '%{http_code}' -X POST localhost:3001/api/revalidate/` → 401.
    - `curl -s -o /dev/null -w '%{http_code} %{size_download}' localhost:3001/RDynamics.php` → `200 0`, with `X-Robots-Tag: noindex`.
    - `curl -s 'localhost:3001/agent-details/?country=abc'` → 404 `{"error":"not_found"}`.
    - `curl -s -o /dev/null -w '%{http_code}' -X POST -H 'content-type: application/json' -d '{}' localhost:3001/airwallex-webhook` → 401 (unsigned).
    - `curl -s -o /dev/null -w '%{http_code}' 'localhost:3001/pay/receipt/00000000-0000-0000-0000-000000000000/?e=a@b.c'` → 404.
    - `curl -s -o /dev/null -w '%{http_code}' -X POST -H 'content-type: application/csp-report' -d '{"csp-report":{}}' localhost:3001/api/csp-report/` → 204, and `curl -sI localhost:3001/` shows `report-uri /api/csp-report/`.

## 9. Differences from ihm-web
- IHNA has the collections `blogCategories` and `galleries` (DEC-105) in the matrix; ihm-web has neither.
- IHNA's finance saves on courses publish (DEC-72); ihm-web stores them as drafts and keeps denied sub-fields on partial saves.
- IHNA requires `RECAPTCHA_SECRET_KEY` at production boot and sends autoresponders only for a verified captcha (`site.autoresponderNeedsCaptcha`); ihm-web treats the secret as optional and always sends them.
- IHNA serves the five legacy AJAX URLs with their own `portal-legacy` rate-limit bucket (DEC-112) and three empty-200 PHP URLs (DEC-113); ihm-web has neither.
- IHNA pre-fills invoices only from portal-signed, expiring links (`PORTAL_INVOICE_LINK_KEY`, DEC-106) and has the Skilldemy callback (`PORTAL_SKILLDEMY_URL`, https only); ihm-web has neither variable.
- IHNA accepts the Airwallex webhook POST without the trailing slash (`site.postWithoutSlash`); ihm-web has no such path.
- IHNA's CSP adds the HubSpot EU1, LiveChat and Meta hosts; its admin realm is `IHNA CMS`.
- IHNA has the `ihnaOnline` and Dynamics secrets (`IHNA_ONLINE_WEBHOOK_KEY`, `DYNAMICS_*`, DEC-12, DEC-103); `DYNAMICS_ENABLED` defaults to `1` (ihm-web `0`).
- IHNA's `static` step also copies `.docx` and `.json` files.

## 10. Open questions
1. Who rotates each credential in §7, and by when?
2. Is the origin reachable only through Cloudflare Access? `ADMIN_GUARD_TRUST_CF_ACCESS=1` is safe only if it is.
3. Which proxy or CDN fronts production, and which client-IP header does it set or overwrite on every request? That header goes in `TRUSTED_IP_HEADERS` (§4 Client IP); until then the rightmost `X-Forwarded-For` entry is used.
4. Production rate-limit store (DEC-54): the raw `enquiry_rate_limits` table, or a Payload collection or migration.
5. `/agent-details/` publishes each agency's `web_name`, `web_email` and `web_phone_number` cross-site; for a sole-trader agency these may be a person (50 §10). Keep them public or omit them?
6. The receipt URL carries the payer email (`?e=<email>`). Should it use an HMAC token instead (with 45-payments)?
7. GTM (GA4, Clarity) loads on `/pay-online/` when tracking is on, so a signed invoice link reaches analytics page URLs and stays usable there for as long as it is valid. Strip `sig` from the URL after load, or exclude these tools there?
8. CV and attachment uploads instead of link fields (DEC-110).
9. Keep the stand-ins of DEC-113 (`demo/` pages, empty PHP URLs) or let them 404.
10. Are staff emails public? (`staff.email` is staff-read.)
11. Production storage for `media` and `documents`: persistent disk or a cloud storage adapter.
12. How long are enquiry personal fields kept? Only the IP is scrubbed (privacy officer).
13. Cookie consent: there is no banner or Consent Mode (`src/components/tracking/Tracking.tsx`).
14. `scripts/import/out/cut-2026-10-19-dropped-tables.dump.sql` (21 MB, tracked in git) is not IHNA content: it holds CMS tables of the sister site (campaigns, footer, form definitions, enquiry routing and more), including named staff addresses: remove it from the repo or confirm the addresses are public.
15. `pay_online` posts that set the amount in the sender (`type=ihnaonline` to `/wp-admin/admin-post.php`) answer 410 and have no route (rule 6): who sends them, and can the portal sign the amount instead (45 §10)?
16. Alumni self-registration: stay invite/import only (DEC-47)?
