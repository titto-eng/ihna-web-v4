# 00 — Architecture

## 1. Purpose
The skeleton every module plugs into: routes, the proxy (`src/proxy.ts`), env, caching, dev services, deploy, folders.
Content pages, landing pages, menus, forms, recipient groups, campaign codes and redirects are code (route files under
`src/app/(site)/` and constants under `src/content/`). The CMS (`/admin`) holds what changes often or is many: courses, posts, blog
categories, galleries, events, staff, media, documents, testimonials, products, lookups, and the enquiry and payment records.

## 2. Data model
Collections and the one global (`courseShared`) are in `10-content-model.md`. Routing depends on `courses.path`, `posts.path`
(+ `urlDate`, `category`), `staff.legacyId`, `events.legacyId`, `media.legacyPath`, `documents.publicPath`, and the code registries
in `src/content/` (`pages.ts` 151 rows, `landing.ts` 38 rows, `landing-routes.ts`, `redirects.ts`, `static-paths.ts`, `documents.ts`,
`news.ts`, `staff-paths.ts`, which is empty on IHNA, DEC-65).

## 3. Admin capabilities
None of its own. Publishing a course, post, gallery, event, staff doc, product or document refreshes the pages that show it (§4). A
code page changes by editing its route file and deploying.

## 4. Front-end behaviour

**Route map** (`src/app/`)

| Route | What |
|---|---|
| `(payload)/admin/[[...segments]]`, `(payload)/api/[...slug]` | Payload admin and REST (`/api/<collection>`, `/api/users/*`, `/api/alumni/*`, `/api/media/file/*`, `/api/documents/file/*`, `/api/payload-jobs/run`). GraphQL is disabled (DEC-14). |
| `(site)/page.tsx`, `(site)/<path>/page.tsx` | home and the content pages (DEC-61): plain JSX over the authoring kit `src/components/page/`, or a data-driven template from `src/components/templates/pages.tsx` (`HomePage`, `SchoolPage`, `CampusPage`, `CalendarPage`, `ContactPage`, `AlumniHubPage`) rendered with `title`, `path`, `hero` and JSX children. `/?s=<term>` redirects (307) to `/search/?q=<term>`. |
| `(site)/courses/page.tsx`, `courses/[slug]` | course listing; `CourseDetail` |
| `(site)/blog/[[...parts]]`, `blog/thanks`, `latest-blogs`, `feed` (route) | `/blog/` listing (`/blog/page/N/`), posts at `/blog/YYYY/MM/<slug>/` or `/blog/<slug>/` (DEC-104), RSS at `/feed/` (20 newest) |
| `(site)/news/[[...parts]]`, `category/india/news` | `/news/` and `/category/india/news/` list `src/content/news.ts` (DEC-42); no post has category `news`, so `/news/<slug>/` is 404 |
| landing route files at their old paths (DEC-62) | `study-at-ihna/…`, `healthcare-courses-adelaide/`, `healthcare-courses-ballarat/{contact,contact1,courses1,courses2}.php`, `walkin-enquiry/`, `walkin-registration/`, `lp/ihna-enterpreneurship-program/`; companions `thanks.php`, `*-thanks(.php)`, `index.php` (308 to the page), extensionless aliases, `study-at-ihna/diploma-nursing-int/[campaign]`, `lp/[slug]/{[campaign],thanks.php,thankyou,thankyou.php,application_form.php,index.php}`; inactive pages and `/study-at-ihna/test/` are `route.ts` stubs (DEC-113) (60) |
| `(site)/[...slug]` | catch-all for staff profile URLs in `src/content/staff-paths.ts`; the map is empty, so it answers 404 |
| `(site)/staff-profile`, `academic-staff` | staff directory; `/staff-profile/?id=N` is one profile by `staff.legacyId` (DEC-111) |
| `(site)/alumni/*` | alumni login, register, verify, forgot/reset password, dashboard, logout (route); `/alumni/` and the alumni microsite pages `events.php`, `event-details.html`, `newsletters.php`, `newsletter-details.html` |
| `(site)/pay-online/`, `payment-options/`, `secure-pay/`, `airwallex/`, `secure-pay-card-dcc/`, `airwallex-checkout/`, `secure-pay-response/`, `pay-online-error/`, `payway-response/`, `pay/*` | payment pages, gateway pages, results and receipts (DEC-11, DEC-45; 45). `/makepayment/` has no route (404, as live). |
| `(site)/pay/return/{payway,securepay,airwallex}`, `airwallex-webhook` (route) | gateway returns; `/airwallex-webhook/` POST is the Airwallex webhook, GET an empty 200. `/payway-response/?EncryptedParameters=…` is rewritten to `/pay/return/payway/` (`rewrites()` in `next.config.ts`) (45) |
| `(site)/hc-course-details`, `hc-course-transition`, `agent-details`, `census-date-details`, `census-date-details-ajax` (routes) | old theme AJAX URLs answering JSON from the portal, rate-limited per IP (`src/lib/portal/legacy-endpoints.ts`, DEC-112; 50) |
| `(site)/iCalendar/scheduler.php` (route) | `?id=<digits>` → `.ics` of the published event with that `events.legacyId`; anything else answers `Invalid link` (200) |
| `(site)/demo/[...path]` | the 18 `UNAVAILABLE_DEMO_PATHS` of `src/content/static-paths.ts` answer a noindex "not available" page; any other `/demo/` URL 404s (DEC-113) |
| `(site)/RDynamics.php`, `campaign_codes.php`, `e2btns.php` (routes) | empty 200 with `X-Robots-Tag: noindex` (`src/lib/empty-200.ts`, DEC-113) |
| `(site)/pdf/[...path]` | document file route: `documents` row by `publicPath` (or alias), else the static copy in `public/`, else 404 (DEC-68; 70) |
| `(site)/wp-content/uploads/[...path]` | old image URLs: `media.legacyPath` lookup → 301 to `/api/media/file/<filename>` (logic in `src/app/api/legacy-media/handler.ts`, DEC-59) |
| `(site)/sitemap.xml`, `robots.txt`, `wp-sitemap.xml` (routes) | sitemap, robots, and a sitemap index naming `/sitemap.xml` (70) |
| `api/enquire` (+ `retry`, `release`) | form pipeline (40) |
| `api/payments/{start,securepay/charge,webhook/airwallex,webhook/payway,fake/[uuid]}` | payments (45) |
| `api/payments/retry` | POST `{paymentIds?}`, admin or finance session: re-queues dead post-payment steps (DEC-20; 45) |
| `api/revalidate` | POST `{tags?, paths?, all?}` with header `x-revalidate-secret` = `REVALIDATE_SECRET` |
| `api/preview` (+ `exit`) | GET `?path=&secret=`: draft mode on for a staff session, then redirect to `path`; 503 while `PREVIEW_SECRET` is unset; `exit` turns it off |
| `api/csp-report` | POST CSP violation reports: logged with `console.warn`, answers 204 (90) |

Custom `api/<name>` routes win over Payload's `[...slug]`, so no collection slug may be `enquire`, `revalidate`, `preview` or
`csp-report`. The `payments` collection shares its prefix with `api/payments/*`: Payload answers `/api/payments/` and
`/api/payments/<numeric id>`, the custom handlers answer the named subpaths. `src/app/api/legacy-media/` holds only `handler.ts`
(no route), so it reserves nothing.

**Proxy** (`src/proxy.ts`, Next 16's name for middleware, DEC-1). The matcher skips `_next/static`, `_next/image`, `favicon.ico`,
`media/`, `api/media/`. In order, first answer wins:
1. A path in `site.postWithoutSlash` (`/airwallex-webhook`): POST is rewritten to the slashed route (body kept), any other method
   308s to the slashed form.
2. `/wp-json`, `/xmlrpc.php`, `/wp-login.php`, `/wp-admin` (and below) → 410 (DEC-58).
3. `/admin` guard (`src/lib/security/adminGuard.ts`): when `ADMIN_BASIC_USER` and `ADMIN_BASIC_HASH` (SHA-256 hex of the password)
   are set, HTTP basic auth is required, else 401. A `cf-access-authenticated-user-email` header (Cloudflare Access) replaces it only
   with `ADMIN_GUARD_TRUST_CF_ACCESS=1`. Payload login applies as well.
4. Prefix/contains redirects from `src/lib/legacy-redirects.ts`: the list is empty on IHNA (DEC-64, DEC-108).
5. A `.pdf` under one of `DOCUMENT_PREFIXES` (`src/content/documents.ts`: `/pdf/`, `/ihna-policies/`, `/ihna-procedures/`,
   `/IHNA_International_Course_Guide/`, `/alumni/docs/`, `/wp-content/uploads/pdf/`, `/wp-content/uploads/guides/`, `/brochures/`)
   → rewrite to `/pdf/~<path>`, so the document route answers and the `documents` collection wins over a static copy in `public/`.
6. `/wp-content/uploads/*` → passed through untouched.
7. Everything else: security headers and CSP (DEC-21; 90).

**Trailing slashes.** `trailingSlash: true` in `next.config.ts`: `/x` → 308 `/x/`; paths with a file extension stay slashless (a
slashed `/file.ext/` 308s to `/file.ext`). Next's built-in slash redirects are off (`skipTrailingSlashRedirect: true`) and the same
two rules are written out first in `redirects()` by `trailingSlashRedirects()` (`src/lib/trailing-slash.ts`), minus
`site.postWithoutSlash`, which the proxy handles (step 1; `tests/payments/webhook-slash.test.ts`). Exact redirects follow in
`redirects()`, built from `src/content/redirects.ts` (27 rules: 6 at 301, 21 at 302; DEC-30, DEC-31); they run before the proxy
and a change needs a restart.

**Path resolution.** The file router decides. Order: config redirects → proxy rules → `beforeFiles` rewrite (`/payway-response/`)
→ a route file for the exact path → `courses/[slug]`, `blog/…`, `news/…`, `demo/…`, `lp/[slug]/…` (published docs; drafts only in
draft mode) → the catch-all (404 on IHNA) → `notFound()`. `src/lib/paths.ts` holds `normalisePath`, `slugsToPath`, `slugify`,
`courseUrl`, `postUrl`, `landingUrl`. `src/content/pages.ts` (one row per content page) and `landing.ts` feed the sitemap, search,
section navigation and hubs: a new page needs its route file and its registry row.

**Caching and revalidation**
- Code pages change on deploy and carry no tags.
- CMS reads go through `unstable_cache` with collection tags (`<slug>` and `collection:<slug>`), doc tags (`course:<slug>`,
  `post:<slug>`, `staff:<slug>`, `event:<slug>`, `product:<sku>`, `document:<publicPath>`), `global:courseShared`, `sitemap` and
  `documents`. Course pages and template data (`src/components/templates/data.ts`) revalidate at most every 300 s, the
  `courseShared` read on a course page every 60 s, the sitemap and `/feed/` every 3600 s, the document index every 86 400 s; tags
  normally expire them first.
- Publish hooks (`src/collections/shared/hooks.ts`): `revalidateHooks(slug)` on events, staff, testimonials, galleries, products,
  blog categories (also tag `posts`) and lookups (also tag `courses`); `contentHooks('courses'|'posts')` adds `sitemap`;
  `revalidateGlobalAfterChange` on `courseShared`. They call `revalidateTag(tag, 'max')` when the doc or its previous version is published, skip
  under `context.importing` / `context.disableRevalidate`, and never throw. `documents` expires its tags immediately
  (`{ expire: 0 }`) because Payload deletes the old file when a new one is uploaded.
- Import steps run outside Next: `scripts/import/cli.ts` POSTs `/api/revalidate/` with `{all:true}` after every non-dry step (DEC-33).
- Portal data has its own cache (DEC-50; 50).

## 5. URLs
Live paths keep their slash and status (AGENTS.md rule 1, DEC-10); file URLs (`.php`, `.html`, `.pdf`, `.xml`) keep their
extensions. Canonical origin is `NEXT_PUBLIC_SITE_URL`. Redirects, canonicals and sitemap: 70.

## 6. Integrations
Env names are validated at boot by `src/env.ts` (a missing `DATABASE_URL`, a `PAYLOAD_SECRET` under 32 characters, or, in a
production server, a missing reCAPTCHA secret stops the app); `.env.example` lists them with comments. Values live only in `.env`.
Every `process.env.X` read in `src/` or `scripts/` is a key of the `src/env.ts` schema and appears in `.env.example` (as `X=`, or
in a comment for a platform-set name) (DEC-24, `tests/import/env-declarations.test.ts`).

| Area | Names |
|---|---|
| core | `NODE_ENV`, `NEXT_PUBLIC_SITE_URL` (default `http://localhost:3001`), `DATABASE_URL`, `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, `CRON_SECRET`, `DRY_RUN`, `NEXT_PUBLIC_ROBOTS`, `DISABLE_DB_PUSH`, `ENQUIRY_AUTORUN`, `PERF_TIMING`, `PREVIEW_SECRET`, `STUDENT_PORTAL_EMBED_ORIGIN`, `DEV_ADMIN_EMAIL`, `DEV_ADMIN_PASSWORD`, `NEXT_PHASE` (set by Next) |
| scripts only | `IMPORT_DRY`, `LEGACY_BASE_URL` (default `https://ihna.edu.au`), `APPRUNNER_API_URL`, `CHECK_BASE_URL`, `VERIFY_GATEWAYS`, `VERIFY_PAYWAY_TOKEN` |
| admin guard | `ADMIN_BASIC_USER`, `ADMIN_BASIC_HASH`, `ADMIN_GUARD_TRUST_CF_ACCESS` |
| client IP (90) | `TRUSTED_IP_HEADERS` (unset: only the rightmost `X-Forwarded-For` entry) |
| email | `EMAIL_FROM` (default `no-reply@ihna.edu.au`), `RESEND_API_KEY`, `SMTP_HOST`, `SMTP_PORT` |
| enquiries (40) | `ENQUIRY_LIVE_ADAPTERS`, `ENQUIRY_NOTIFY_TO`, `RECAPTCHA_SECRET_KEY` (alias `RECAPTCHA_SECRET`), `RECAPTCHA_MIN_SCORE`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `HUBSPOT_PORTAL_ID`, `HUBSPOT_ACCESS_TOKEN`, `HUBSPOT_FORM_GUID`, `HUBSPOT_API_BASE`, `HUBSPOT_FORMS_BASE`, `PORTAL_CRM_URL`, `PORTAL_CRM_API_KEY`, `PORTAL_IHNA_STAKEHOLDER_URL`, `PORTAL_IHM_STAKEHOLDER_URL`, `ADMISSIONS_API_URL`, `ADMISSIONS_API_KEY`, `DYNAMICS_ENABLED` (default `1`, DEC-12), `DYNAMICS_TENANT_ID`, `DYNAMICS_CLIENT_ID`, `DYNAMICS_CLIENT_SECRET`, `DYNAMICS_URL`, `IHNA_ONLINE_WEBHOOK_URL`, `IHNA_ONLINE_WEBHOOK_KEY` (DEC-103), `RATE_LIMIT_STORE` |
| payments (45) | `PAYMENTS_DRY_RUN`, `PAYMENTS_GATEWAY_MODE`, `PAYMENTS_ALLOW_PRODUCTION`, `PAYMENTS_DATA_KEY`, `PAYMENTS_MAX_INVOICE_AMOUNT`, `PAYMENTS_FINANCE_TO`, `PAYMENTS_SURCHARGE_{PAYWAY,SECUREPAY,AIRWALLEX}_PERCENT`, `PAYWAY_*` (incl. `PAYWAY_PROVIDER`, DEC-109), `SECUREPAY_*`, `AIRWALLEX_*`, `PORTAL_IHNA_URL`, `PORTAL_IHM_URL`, `PORTAL_HCLA_URL`, `PORTAL_SKILLDEMY_URL`, `SKILLDEMY_RETURN_URL`, `PORTAL_INVOICE_LINK_KEY`, `PORTAL_INVOICE_LINK_MAX_DAYS` (DEC-106), `MONDAY_*`, `MSGRAPH_*`, `CANVAS_*` |
| portal (50) | `PORTAL_ENABLED` (default `0`), `PORTAL_QUERY_TIMEOUT_MS`, `PORTAL_DB_HOST`, `PORTAL_DB_PORT`, `PORTAL_DB_NAME` (`ihna_portal` in `.env`), `PORTAL_DB_RO_USER`, `PORTAL_DB_RO_PASSWORD`, `PORTAL_DB_PAY_USER`, `PORTAL_DB_PAY_PASSWORD` (aliases `PORTAL_DB_READ_USER`, `PORTAL_DB_READ_PASSWORD`, `PORTAL_DB_PAYMENTS_USER`, `PORTAL_DB_PAYMENTS_PASSWORD`), `PORTAL_TZ` |
| tracking (80) | `TRACKING_ENABLED` (default `0`; ids are not env: every id in `site.tracking` is `null`, so they come from `TRACKING_DEFAULTS` in `src/components/tracking/defaults.ts`, DEC-63) |

`DRY_RUN` defaults to `1`: adapters and gateways record instead of sending (DEC-50). Email goes through Resend when
`RESEND_API_KEY` is set, otherwise SMTP (`SMTP_HOST`/`SMTP_PORT`, default `localhost:1025` = Mailpit) (`src/lib/adapters/transport.ts`).

**Dev services.** The app runs on the host: `npm run dev -- -p 3001` (ihm-web owns :3000). The dev database is the Homebrew
Postgres on 127.0.0.1:5432, database `ihna` (DEC-27; `DATABASE_URL` decides). `docker-compose.yml` (project `ihna-web`):
`postgres` (`postgres:16`, host port 5434, db `ihna`), `portal-mysql` (`mysql:8`, host port 3308, db `ihna_portal`, read user
`portal_ro`; load the fixtures with `docker/portal-fixtures/load.sh`, which also creates the write-limited `portal_pay` user) and
`mailpit` (SMTP 1025, UI 8025). One Mailpit serves the machine: when ihm-web's is up, start only `docker compose up -d postgres portal-mysql`.

**Schema.** `postgresAdapter` with `blocksAsJSON: true`. Dev pushes the schema from the running dev server only; scripts run with
`DISABLE_DB_PUSH=1` (DEC-46). Production applies `src/migrations/` with `npm run payload migrate`: `20261021_120328_ihna_baseline`
(the whole schema, jobs tables included; DEC-66, DEC-44), then `20261022_015647_course_shared_stats` (`courseShared.stats`). Every schema change ships a migration (`npm run payload migrate:create`).

**Storage.** `media` and `documents` are Payload uploads on local disk (`media/` and `media/documents/`, gitignored; 50 MB per
file). No cloud storage adapter is configured: production must persist that directory or add one. Static files that are not
documents are served from `public/`: gitignored copies filled by `npm run import -- static,live-files` (`pdf/`, `ihna-policies/`,
`ihna-procedures/`, `IHNA_International_Course_Guide/`, `alumni/docs/`, `wp-content/uploads/`, `emailers/`, `course-urls.json`;
DEC-32), and the committed page images `public/images/ihna/` and `public/landing/` (allowed by `images.localPatterns`, with
`/api/media/file/**`).

**Jobs** (`src/jobs/index.ts`): queues `enquiries` and `payments` (every minute in production, every 20 s in dev; the `payments`
queue also runs the 15-minute pending-payment reconcile) and `maintenance` (every 10 minutes). `autoRun` runs in-process unless
`NODE_ENV=test` or `ENQUIRY_AUTORUN=0`. The Node server process is the only scheduler; `/api/payload-jobs/run`
(`Authorization: Bearer $CRON_SECRET` or an admin session) runs a queue on demand.

**Deploy.** `next.config.ts` sets `output: 'standalone'`; the `Dockerfile` copies `.next/standalone`, `.next/static` and `public/`
and runs `server.js` on port 3000 inside the container. `poweredByHeader: false` drops `X-Powered-By`, and in production `headers()`
adds `Strict-Transport-Security: max-age=63072000; includeSubDomains` on every path (90).

**Folders:** `src/collections/` (+ `shared/`), `src/globals/` (`courseShared`), `src/content/` (code constants and registries),
`src/blocks/<name>/{config.ts,Component.tsx}`,
`src/components/{ui,layout,page,templates,templates/landing,course,forms,payments,seo,tracking,audience,alumni,blocks}`,
`src/lib/{portal,adapters,payments,enquiries,seo,alumni,security,events,courses}/`, `src/jobs/`, `src/migrations/`,
`src/styles/theme.css`; `scripts/{import,parity,dev}/` (reports in `out/`); `docker/portal-fixtures/`; `tests/`. npm only
(`package-lock.json`).

## 7. Import / seed
Not owned (30). Import steps write through the Local API with `context.importing`, then clear the cache through `/api/revalidate`.

## 8. Acceptance checks
Dev server on http://localhost:3001.
1. `docker compose up -d postgres portal-mysql` (plus `mailpit` when no Mailpit runs) starts; `npm run dev -- -p 3001` serves `/` and `/admin`.
2. `npm run check` (generate:types, typecheck, lint, check:blocks, test:int, test:blocks) is green.
3. `curl -sI localhost:3001/about-us` → 308 `/about-us/`;
   `/IHNA_International_Course_Guide/IHNA_International_Course_Guide.pdf` → 200 `application/pdf`, no slash added.
4. `/wp-json/`, `/xmlrpc.php`, `/wp-login.php`, `/wp-admin/` → 410.
5. With `ADMIN_BASIC_USER`/`ADMIN_BASIC_HASH` set, `/admin` without credentials → 401.
6. `/awards/` → 301 `/awards-and-rankings-ihna/`; `/healthcare-courses-ballarat/` → 302 `/domestic-students/`.
7. `/makepayment/` and `/unknown-xyz/` → 404; `/pay-online/`, `/staff-profile/`, `/feed/`, `/wp-sitemap.xml`,
   `/lp/ihna-enterpreneurship-program/`, `/study-at-ihna/diploma-nursing-int.php` → 200; `/walkin-enquiry/index.php` → 308
   `/walkin-enquiry/`; `/?s=nurse` → redirect to `/search/?q=nurse`.
8. `/demo/hand-hygiene/index.html` → 200 (noindex), `/demo/other.html` → 404; `/RDynamics.php` → 200 with an empty body.
9. `curl -s -X POST localhost:3001/airwallex-webhook -d '{}'` reaches the webhook handler (401 without a valid signature), not a 308.
10. A draft course or post answers 404; publishing a course title change shows on its page on the next request.
11. `npm run parity -- --site=ihna` → `scripts/parity/out/parity-ihna.summary.json` shows 821 URLs crawled, 0 `STATUS_DIFF`,
    `REDIRECT_DIFF` and `NEW_ERROR` (599 OK, 222 accepted).

## 9. Differences from ihm-web
- Landing pages are route files at their old paths (38 rows; DEC-62); ihm-web serves its landing pages under `/lp/<slug>/`.
- The pay form is `/pay-online/` and `/makepayment/` has no route (DEC-11, DEC-45); ihm-web's pay form is `/makepayment/`.
- `staff-paths.ts` is empty; profiles are `/staff-profile/?id=N` (DEC-65, DEC-111). ihm-web serves `/<person>/` profile URLs.
- `src/lib/legacy-redirects.ts` has no rules; ihm-web has prefix and substring rules there.
- The proxy builds its document rewrite from `DOCUMENT_PREFIXES` in `src/content/documents.ts` (8 prefixes); ihm-web's proxy matches
  a fixed regex of its own folders.
- `/airwallex-webhook` (no slash) takes POST through `site.postWithoutSlash` and `skipTrailingSlashRedirect`; ihm-web uses Next's
  built-in slash redirects.
- Extra routes: `/feed/`, `/wp-sitemap.xml`, `/iCalendar/scheduler.php`, the `/demo/` and empty-200 PHP stand-ins (DEC-113), the
  old AJAX portal URLs (DEC-112), `/blog/YYYY/MM/<slug>/` post URLs (DEC-104), `/all-events/` galleries (DEC-105).
- Env: `DYNAMICS_ENABLED` defaults to `1` (DEC-12); `IHNA_ONLINE_*`, `APPRUNNER_API_URL`, `PAYWAY_PROVIDER`,
  `PORTAL_SKILLDEMY_URL`, `SKILLDEMY_RETURN_URL` and `PORTAL_INVOICE_LINK_*` exist only here.
- Ports and databases: dev :3001, Docker Postgres 5434 (`ihna`), portal MySQL 3308 (`ihna_portal`); ihm-web uses :3000, 5433, 3307.
- One baseline migration (DEC-66) and the migrations added after it. `SHARED-FILES.md` lists the paths kept identical with ihm-web and the site-specific ones.

## 10. Open questions
1. Production file storage for `media` and `documents`: a persistent volume or a cloud storage adapter (none is configured).
2. Production rate-limit store: `RATE_LIMIT_STORE=postgres` creates `enquiry_rate_limits` outside Payload's schema (DEC-54).
3. Keep the DEC-113 stand-ins (18 `/demo/` pages, `/RDynamics.php`, `/campaign_codes.php`, `/e2btns.php`, `/moodletest/`,
   `/goto-postsurvey/`, `/study-at-ihna/test/`, the inactive landing stubs) or let them 404.
4. App Runner ownership and switch-off date: `APPRUNNER_API_URL` is the source of the post and gallery imports (DEC-105).
