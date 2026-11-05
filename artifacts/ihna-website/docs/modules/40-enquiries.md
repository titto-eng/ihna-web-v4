# 40 · Enquiries (single form pipeline)

## 1. Purpose
Every website form posts to one endpoint, `POST /api/enquire/`. The pipeline saves an `enquiries` row first (rule 2: nothing is sent before the row exists), then the `deliverEnquiry` job delivers it to each destination with retries, a `dead` state and an alert. Form definitions and recipient groups are code (`src/content/forms.ts`, `src/content/enquiry-routing.ts`, DEC-63). Campaign codes: `41`. Landing pages: `60`.

Code map: `src/app/api/enquire/route.ts` (HTTP adapter) → `src/lib/enquiries/process.ts` (`handleEnquire`, the pipeline) → `src/jobs/deliverEnquiry.ts` (`runDelivery`) → `src/lib/adapters/*` (one file per destination, live switch in `live.ts`).

## 2. Data model
**Form definitions** (`src/content/forms.ts`, `FormDef[]` typed in `src/lib/enquiries/types.ts`, looked up with `formByKey`): 30 keys (list in §7, DEC-2), every one `active`.
- `key`, `name`, `family` (the old handler the form answers for), `active`, `consentText`, `emailSubject` (staff mail subject; every IHNA form sets one, so `emailSubjects` is empty), `campaignFallback` (campaign-table code used when the visitor brings none or an unknown one: `default` on the WordPress-family course forms, `lp_default` on landing and walk-in forms, `blog` on `blog-enquiry`, `rpl` on `rpl-enquiry`; 41).
- `fields[]`: `name`, `type` (text, email, tel, select, radio, textarea, checkbox, hidden, country, course, campus), `label`, `required`, `maxLength`, `pattern`, `options`, `hubspotProperty` (server-side only). Campus fields are `select`s whose values are the CRM campus keys of `src/content/course-crm.ts` (`melbourne-heidelberg`, `melbourne-cbd`, `sydney-parramatta`, `perth-sgt`, `brisbane`, `online`, `cochin`); no IHNA form has a `campus`-type field. The walk-in, course-enquiry, RPL and `lp-dynamics` course pickers are a `courseKhId` select of KH course ids (`crmCoursePickerOptions`).
- `destinations[]`: `adapter` (email, hubspot, portalCrm, portalStakeholder, admissionsApi, dynamics, ihnaOnline), optional `config` {`recipientGroup`, `fixedSourceId`, `defaultSourceId`, `hubspotCampaignSourceDefault`, `hubspotCampaignSourceFixed`, `hubspotNote: {fields}`, `dynamicsSubject`, `campusFixed`, `studentType`} and optional `when` (below, DEC-102).
- `thankYou`: `type` (path, brochure, whatsapp, inline), `path` and `rules[]` ({`when`, `path`}; the first matching rule wins over the type).
- `autoresponder`: `enabled`, `subject`, `body` (tokens `{{firstName}}`, `{{courseTitle}}`) and `variants[]` ({`when`, `subject`, `body`}): a matching variant replaces the text and plans the autoresponder even when `enabled` is false.
- `captcha` and `honeypot` (both on unless `false`; no IHNA form turns either off).
- The browser only receives `toPublicDef(def)`: key, name, consentText, fields (without `hubspotProperty`), captcha, honeypot, thankYouType (`src/lib/enquiries/lookups.ts`).

**Conditions** (`When` in `types.ts`, evaluated by `matchesWhen` in `src/lib/enquiries/conditions.ts`): every key given must hold. `courseKhIdIn`, `courseCodeIn` (course facts), `landingIn` (the registry path of the matched landing row), `field: {name, in?, present?}`, `not`. Course facts (`courseFactsOf`) come from the CMS course (`khId`, `code`), else the form's `courseKhId` picker, else the landing row's `khId`/`courseCode`, completed from `src/content/course-crm.ts` (KH id ↔ course code). A conditional destination is planned at insert time only when its condition holds; without a context it is not planned.

**Enquiry routing** (`src/content/enquiry-routing.ts`, DEC-19): `recipientGroups[]` {`key`, `to[]`, `cc[]`}, 18 role groups (enquiries, admissions, marketing, agents, referral, partnerships, hr, student-support, e-learning, skilldemy, health-careers-pathways, anaesthetic-technology, regional, alumni, scholarship, events, library, feedback); every `to` and `cc` is empty and is typed by a person. `alertTo[]` (empty). `defaultSourceId` 2 (the campaign table's `default` row). An empty group falls back to `ENQUIRY_NOTIFY_TO`. The WhatsApp number is `site.whatsappNumber` in `src/content/site.ts` (`null`).

**`enquiries` collection** (`src/collections/Enquiries.ts`, append-only):
- `publicId` (12 hex chars, returned to the visitor as `enquiryId`), `submissionId` (uuid, unique), `formKey`.
- `status` (indexed): received, delivering, delivered, partial, dead, held, spam. `held`/`spam` are set at insert; the rest is derived from the deliveries by `deriveStatus` in `src/jobs/deliverEnquiry.ts`.
- `captchaStatus` (ok, low, unverified, missing), `captchaScore`, `honeypot`.
- Contact columns filled by `contactFrom` (`src/lib/enquiries/contact.ts`): `firstName`, `lastName` (split from `name` when the form has a single name field), `email`, `phone`, `country`, `studentType`, `consent`.
- `course` → `courses`, `campus` → `campuses` (set only by a `course`/`campus`-type field; on IHNA only `course` is used).
- `campaignCode` (raw, indexed), `utm` group (`utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`, `utmContent`, `gclid`, `gbraid`, `wbraid`, `fbclid`, `msclkid`, `referrer`, `landingPath`, `firstTouch`), `hutk`. See 41; nothing writes `firstTouch`.
- `data` (the validated fields as json), `pageUrl`, `source` (always `api`; the `legacy-post` option is unused), `ip` (nulled after 90 days).
- `deliveries[]`: `adapter`, `target`, `status` (pending, sent, failed, dead, held, dry_run), `attempts`, `at`, `responseCode`, `externalId`, `lastError` (≤500 chars, never a response body), `dryRunRequest` (json: the recorded request with secrets masked, or the live response excerpt), `hsSourceFallback`.

**Read from the CMS:** `courses` (`title`, `code`, `khId`, `splId`, `hubspotCourseId`, `dynamicsCourseOption`, and the brochure URL resolved by `brochureHrefFor` from `brochure`/`brochureUrl`, DEC-69). The courses import sets `hubspotCourseId` to the course code (19 of 21 courses; the other 2 have no code, 30 §7.4); no course has `dynamicsCourseOption`, so the Dynamics option comes from `course-crm.ts`. `campuses` (`slug`, `name`, `portalCampusId`, `hubspotCampusValue`) is read only for a `campus`-type field; the 4 campus rows have neither CRM value.

**Landing match:** `findLandingByPageUrl(payload, pageUrl, formKey)` (`lookups.ts`) tries the path of `pageUrl`, its slashed form, then its parent path against `landingAt` (`src/content/landing.ts`, aliases included) and returns the row only when `row.formKey` is the posted form; a row of another form ends the search with no match. So the dialog and WhatsApp forms on a landing page keep their own thank-you, campaign, course facts and destinations. The row supplies `thankYouPath`, the CRM keys (`courseCode`, `khId`, `campusKey`, `studentType`) and the attribution keys (`campaignFallback`, `fixedCampaign`, `hubspotCampaignSource`; 41, 60). `pageUrl` is sent by the browser (41 §2).

**Site CRM tables** (code, `src/content/`): `course-crm.ts` (35 CRM courses: KH id ↔ course code ↔ Dynamics option, the picker flag; `SHORT_COURSE_KH_IDS` 352, 397, 361, 14, 115; `IHNA_ONLINE_COURSE_CODES` CHC33021, HLT33115, HLT35021, CHC52025; campus keys → HubSpot / KH / Dynamics values; KH country ids from `countries_phone.php` with `countryKhId(name)`; empty `fixedKhCourseByForm` / `selectKhCourseByForm`), `hubspot-map.ts` (property names, constants, default `campaign_source` "IHNA Website", `courseValue: 'code'`), `dynamics-map.ts` (bodies), `campaign-codes.ts` (41).

**Rate-limit table:** with `RATE_LIMIT_STORE=postgres` (the default when `NODE_ENV=production`) `src/lib/enquiries/rateLimit.ts` creates and uses a raw `enquiry_rate_limits` table outside Payload's schema (DEC-54). Otherwise an in-memory store is used.

## 3. Admin capabilities
- Access (DEC-3, DEC-20): read = admin, marketing, finance; create/update/delete = nobody (`denyAll`). All writes go through the Local API with `overrideAccess`.
- List: columns createdAt, formKey, email, campaignCode, status; search on email, submissionId, formKey, campaignCode. Payload's list filters work on any field (e.g. `deliveries.status` = dead, `formKey`, `campaignCode`, `createdAt`).
- **Retry dead / Release held** buttons above the list (`src/components/forms/RetryDeadButton.tsx`) call `POST /api/enquire/retry/` and `POST /api/enquire/release/` (`src/lib/enquiries/adminRoute.ts`): staff session, roles admin or marketing (401/403 otherwise). Body `{ action?, ids? }`; without ids every matching row is processed (200 at most).
  - `retry-dead`: rows with status dead or partial; `dead` deliveries → `pending`, attempts 0; row → `received`; job queued.
  - `release-held`: `held` rows; `held` deliveries → `pending`; queued. No autoresponder row is added on release.
  - `requeue-stuck` (retry route, `action` in the body only): `received` rows older than 5 minutes with `pending`/`failed` deliveries are queued again. Nothing calls it automatically.
- Labels, fields, autoresponders, destinations and recipient addresses change only by editing `src/content/forms.ts` / `src/content/enquiry-routing.ts` and deploying. Recipient addresses are typed by a person, never taken from old code.

## 4. Front-end behaviour
**Where forms are mounted**
- `EnquiryForm` block (`src/blocks/enquiryForm/`): fields `formKey`, `heading`, `variant` (card, inline, sidebar) plus the section fields. It renders nothing for an unknown or inactive key. The page's course (render context) preselects the course field.
- Templates and route files place keys: `quick-enquiry` (`/contact/`, the course, campus and generic templates), `course-brochure` (the `brochureDownload` block), `blog-enquiry` (every blog post's sidebar), `event-registration` (the events listing), and one page each for `lp-enquiry`, `online-learning`, `scholarship`, `skilldemy-enquiry`, `referral-application`, `global-partner`, `employer-eoi`, `corporate-registration`, `jobs-eoi`, `library-enquiry`, `rpl-enquiry`, `alumni-signup`, `alumni-story`. The landing keys are mounted by the landing templates from `src/content/landing.ts` (60), which may show a subset of the form's fields (`formFields`) and narrow a select (`fieldOptions`). `agent-registration`, `quick-feedback`, `business-enquiry` and `lp-mail-only` are defined but no page mounts them.
- Site-wide dialog (`src/components/forms/EnquiryDialog.tsx`, mounted in the footer): opened by `?enquire=1` (the page's default key), `?enquire=<formKey>`, or the WhatsApp button (`src/components/layout/WhatsAppButton.tsx`, hidden while `site.whatsappNumber` is null). Keys, default and titles are `site.enquiryDialog` (`quick-enquiry`, `whatsapp`; default `quick-enquiry`). The header CTA links to `/course-enquiry/`, not to the dialog.

**Client** (`src/components/forms/EnquiryFormClient.tsx`): react-hook-form with the same `buildEnquirySchema` the server uses. `?course=<id>` preselects the course; a hidden field takes the same-named URL parameter. reCAPTCHA v3 (`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, action `enquire`) loads only when the form has `captcha`. It posts JSON to `/api/enquire/` and follows only the server's `thankYouPath` (a same-site path or `https://api.whatsapp.com/send?...`); `null` shows an inline thank-you. On success, before navigating, it pushes one conversion per `submissionId` (`leadEventFor`, 80 §4) with the response's `enquiryId` as `enquiry_ref`.

**Request body** (`envelopeSchema` in `src/lib/enquiries/request.ts`): `formKey`, `submissionId` (uuid created on mount), `fields{}`, `campaign`, `utm_*`, `gclid`, `gbraid`, `wbraid`, `fbclid`, `msclkid`, `hutk` (else the `hubspotutk` cookie), `referrer`, `landingPath`, `pageUrl`, `_hp_url` (honeypot; must never match a real field name: `agent-registration` has a real `website` field), `captchaToken`. Unknown keys are stripped; there is no thank-you field (DEC-4). JSON, or `application/x-www-form-urlencoded` (`fields[name]=` or bare `name=`); 32 KB max.

**Pipeline order** (`handleEnquire`):
1. Size check (413 `too_large`), parse, envelope validation (400 `validation` or `unknown_form`).
2. Rate limit: 10 per minute per client IP + formKey (429 `rate_limited`, `Retry-After`). The IP is `clientIp` (`src/lib/security/clientIp.ts`): the headers named in `TRUSTED_IP_HEADERS` (none by default), else the rightmost `X-Forwarded-For` entry (90 §4). A failing store falls back to memory and never blocks.
3. Form lookup (400 `unknown_form` for a missing or inactive key).
4. Duplicate `submissionId`: answers like the first submission (`duplicate: true`), stores and queues nothing.
5. Landing match (§2).
6. Honeypot `_hp_url` filled: stored as `spam` with no deliveries, ordinary 200.
7. Field validation with `buildEnquirySchema(def)` (`src/lib/enquiries/schema.ts`): strings trimmed, email lower-cased and checked with `z.email()`, tel `^[0-9 +()-]{5,20}$`, select/radio `z.enum` of the options, course/campus numeric ids that must exist, `pattern` on text/textarea/hidden, blank optional = absent. 400 with `fieldErrors`.
8. reCAPTCHA (`src/lib/enquiries/captcha.ts`, 3 s timeout): form `captcha: false` or no `RECAPTCHA_SECRET_KEY` (alias `RECAPTCHA_SECRET`) → `unverified`, delivered; no token → `missing`, held; failure, wrong action, wrong hostname or score below `RECAPTCHA_MIN_SCORE` (default 0.5) → `low`, held; siteverify error or timeout → `unverified`, delivered. `src/env.ts` refuses to boot a production server without the secret (not during `next build`). Autoresponders fail closed (`autoresponderAllowed`, `site.autoresponderNeedsCaptcha: true`): in production only an `ok` captcha plans one, so an `unverified` post is stored and delivered to staff but mails nobody back; outside production with no secret (dev, tests) they are planned.
9. Campaign code and attribution (41).
10. INSERT with planned delivery rows (`planDeliveryRows`: one per adapter target whose `when` holds, `held` when held, plus the autoresponder unless held or not allowed by step 8; `dynamics` only with `DYNAMICS_ENABLED=1`). Failure → 500 `save_failed` with a safe message.
11. Queue `deliverEnquiry` (not for held rows or rows without deliveries) and run it right after the response (`after()` + `runJobNow`). A queue failure leaves the row `received`.
12. 200 `{ ok, enquiryId, thankYouPath }`.

No-JS (urlencoded) posts get 303 to `thankYouPath` (`/thanks/` when it is null) on success, else 303 to `/?enquiry=error`.

**Thank-you target** (`computeThankYou` in `src/lib/enquiries/thankYou.ts`, always server-side, DEC-4/DEC-18), first match:
1. the matched landing row (§2) with a local `thankYouPath`, plus `?campaign=<code>` and, for a brochure request (form type `brochure` or field `intent`/`formType` = `brochure`), `intent=brochure`, which shows the landing ThankYou view's BrochureDownload block (60);
2. the form's first `thankYou.rules` entry whose condition holds (a short course on `quick-enquiry` and `blog-enquiry` → `/short-course-enquiry-thanks/`);
3. `inline` → `null`;
4. `whatsapp` → `https://api.whatsapp.com/send?phone=<site.whatsappNumber>&text=<course-only prefill>`; while the number is `null`, the form path (`/thanks/`);
5. a brochure request → the course brochure URL (`brochureHrefFor`: the `brochure` document's `publicPath`, else `brochureUrl`) when it is a local path or on our host, else the form path or `/thanks/`;
6. `quick-enquiry` → `/quick-enquiry-thanks/?course_id=<KH id>&campaign_id=<code>&campus=<campus key>`;
7. the form's `thankYou.path`, else `/thanks/`.

## 5. URLs
- `POST /api/enquire/` (public; GET answers 405), `POST /api/enquire/retry/` and `POST /api/enquire/release/` (staff). `trailingSlash` is on: post to the slash form.
- Thank-you pages (route files under `src/app/(site)/`): `/thanks/`, `/thanks-events/`, `/quick-enquiry-thanks/`, `/short-course-enquiry-thanks/`, `/blog/thanks/`, `/scholarship-thanks/`, `/referral-application-thanks/`, `/partner-application-thanks/`, `/expression-of-interest-thanks/`, `/rpl-and-credit-transfer/thanks/`; the landing handlers are in 60.
- `/action_page.php` has no route: 404 for GET and POST.

## 6. Integrations
**Job `deliverEnquiry`** (`src/jobs/deliverEnquiry.ts`, queue `enquiries`, input `{enquiryId}`)
- Task retries `{attempts: 5, backoff: exponential, delay 60000}`; the handler throws while any delivery is `failed`.
- Attempts only `pending`/`failed` rows; `sent` and `dry_run` rows are never touched again. Each row is persisted right after its attempt. Held and spam rows are skipped.
- A non-retryable failure or the 5th attempt (`MAX_DELIVERY_ATTEMPTS`) → `dead`. New dead rows mail `alertTo` (else `ENQUIRY_NOTIFY_TO`): reference, form, adapter, error, no personal data. The alert follows the email live switch (Mailpit only when not live).
- Runner (`src/jobs/index.ts`): `autoRun` every minute in production and every 20 s in dev, on queues `enquiries`, `payments` and `maintenance` (every 10 min); off when `NODE_ENV=test` or `ENQUIRY_AUTORUN=0`. The app deploys as the Docker image, so `autoRun` in its Node process is the only scheduler. `/api/payload-jobs/run` accepts `Authorization: Bearer $CRON_SECRET` or an admin session.
- `scrubEnquiryIps` (`src/jobs/scrubEnquiryIps.ts`): daily at 03:00 on queue `maintenance`; nulls `ip` on rows older than 90 days.

**Live switch (DEC-50, `src/lib/adapters/live.ts`).** An adapter sends for real only when `DRY_RUN` is not `1` (unset counts as `1`) AND its name is in `ENQUIRY_LIVE_ADAPTERS` (comma/space/semicolon list, case-insensitive) AND its variables are set:

| Adapter | Required env |
|---|---|
| `email` | `RESEND_API_KEY` or `SMTP_HOST` |
| `hubspot` | `HUBSPOT_ACCESS_TOKEN` (+ `HUBSPOT_PORTAL_ID` when `HUBSPOT_FORM_GUID` is set) |
| `portalCrm` | `PORTAL_CRM_URL` |
| `portalStakeholder` | `PORTAL_IHM_STAKEHOLDER_URL` / `PORTAL_IHNA_STAKEHOLDER_URL` (per target) |
| `admissionsApi` | `ADMISSIONS_API_URL`, `ADMISSIONS_API_KEY` |
| `dynamics` | `DYNAMICS_TENANT_ID`, `DYNAMICS_CLIENT_ID`, `DYNAMICS_CLIENT_SECRET`, `DYNAMICS_URL` |
| `ihnaOnline` | `IHNA_ONLINE_WEBHOOK_URL`, `IHNA_ONLINE_WEBHOOK_KEY` |

Otherwise the delivery is `dry_run`: the planned request is stored in `dryRunRequest` (secrets masked) with a `reason`, and the reason is repeated in `lastError` (`DRY_RUN=1`, `not listed in ENQUIRY_LIVE_ADAPTERS (...)`, `missing: ...`). A non-live email still goes to a local Mailpit (host localhost/127.0.0.1/::1/mailpit, port 1025/1026/2525/8025, no Resend key) and nowhere else. Live rows store `{live, response:{code, body}}` (body: 2000-char excerpt without markup). HTTP outcome (`classify` in `src/lib/adapters/util.ts`): 2xx sent; network error, 10 s timeout, 5xx, 429 retryable; any other 4xx dead. Payments use `PAYMENTS_DRY_RUN` (falls back to `DRY_RUN`), so enquiries can be live while payments stay dry. `vitest.setup.ts` forces `DRY_RUN=1` and clears `ENQUIRY_LIVE_ADAPTERS`.

**email** (`src/lib/adapters/email.ts`; Payload transport `src/lib/adapters/transport.ts`: Resend when `RESEND_API_KEY`, else SMTP `SMTP_HOST`/`SMTP_PORT`, Mailpit localhost:1025 by default outside production; sender `EMAIL_FROM`, default `no-reply@ihna.edu.au`)
- One delivery per `recipientGroup`. Staff message: escaped HTML table of the fields, course (the CMS course, else the course facts of a landing page or KH picker), form, campaign code, "Lead source" and "Lead description" from the campaign table (41), page, UTMs, gclid, fbclid and reference; subject the form's `emailSubject` ("IHNA : Quick Enquiry", "Enquiry from Landing page", ...); Reply-To the enquirer; header `Idempotency-Key: <id>:<target>`. No recipients → dead.
- Autoresponder (target `autoresponder`, signed by the IHNA Admissions Team): `agent-registration`, `referral-application`, `global-partner`, `employer-eoi`, `corporate-registration`, `event-registration`, `event-lp`; the self-enrol variant for the short courses (KH 352, 397, 361, 14, 115) on `quick-enquiry`, `blog-enquiry` and `walkin-enquiry`. Never planned for held rows or when step 8 does not allow it.

**portalCrm** (`src/lib/adapters/portalCrm.ts`): form-encoded `POST PORTAL_CRM_URL` (the KH portal's `applicationFormFromWebsites`), no credential (`X-API-Key` only if `PORTAL_CRM_API_KEY` is set). Fields `courseId` (course `khId`, else the course facts' KH id), `specialisation_index`, `firstName`, `lastName`, `phone` (`<phoneCode> - <phone>` when the form has a calling-code field), `email`, `country` (the KH country id from `countryKhId`, else the name), `campus` (`portalCampusId`, else the campus key's KH id, else the destination's `campusFixed`), `description`, `enquirySourceId` (41), `student_type` (international 1, domestic 0; from the form, the landing row or the destination), `partner_id` (`agentCode`), `ihna_web_package_id` (`packageId`), `ip_address`, and fixed `campaignId`, `createdBy`, `modified_user_id` = 1. Any 2xx is sent.

**portalStakeholder** (`agent-registration`): two deliveries, targets `ihm` and `ihna`, each a form-encoded POST of the allow-listed agent fields (`STAKEHOLDER_FIELDS`) to `PORTAL_IHM_STAKEHOLDER_URL` / `PORTAL_IHNA_STAKEHOLDER_URL`. A response body of `fail` is dead.

**hubspot** (`src/lib/adapters/hubspot.ts`, portal 26193905, EU1)
- `POST https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert` with one input `{id: email, idProperty: "email", properties}`, Bearer `HUBSPOT_ACCESS_TOKEN` (scope `crm.objects.contacts.write`); the contact id becomes `externalId`. The custom properties must exist in the portal, else HubSpot answers 400 (dead).
- Properties: `firstname`, `lastname`, `email`, `phone`, `campus` (`hubspotCampusValue`, else the campus key's value 1/2/3/4/5/6/10), `course` (`;<hubspotCourseId>` for a CMS course, else `;<course code>` (`courseValue: 'code'`), never a KH id; no CMS course: `;<course code>` from the landing row or the KH picker), `course_specialization` (`;<splId>`), `campaign_source` (41), `how_did_you_hear_about_us` (`whereHear` + `whereHearOther`), the mapped fields (`message`, `current_country`, `state`, `preferred_intake`), `hs_lead_status` NEW, `student_type`, `referral_url` (page URL). Hosts: `HUBSPOT_API_BASE`, `HUBSPOT_FORMS_BASE` (defaults `api.hubapi.com`, `api.hsforms.com`).
- Notes: a destination with `hubspotNote.fields` also posts `POST /crm/v3/objects/notes` (`hs_note_body` = form name, reference and the listed fields, each line HTML-escaped and joined with `<br>`, since HubSpot renders the body as rich text; association type 202 to the upserted contact). The delivery's `externalId` is the contact id, plus `|note:<id>` when the note exists: a retry resumes after the upsert with the stored contact id and never posts the note again.
- `hutk` (DEC-13): always stored on the row; sent only when `HUBSPOT_FORM_GUID` is set, as a further request `POST https://api.hsforms.com/submissions/v3/integration/secure/submit/{HUBSPOT_PORTAL_ID}/{guid}` with the email/name/phone fields and `context.hutk` when stored.

**dynamics** (DEC-12): planned only when `DYNAMICS_ENABLED=1` (the default in `src/env.ts`). Client-credentials token, then `leads`, then `new_enquiries` linked to the lead; the lead id is kept as `externalId` so a retry resumes at the second insert. The bodies follow `src/content/dynamics-map.ts`: lead `firstname`, `lastname`, `fullname`, `address1_country`, `emailaddress1`, `mobilephone`, `subject` (destination `dynamicsSubject`, else "Enquiry from IHNA Website"), `new_courseinterested` (package option, else the CMS course's option, else the KH id's option), `new_preferredcampus` (no Brisbane option), `new_studenttype` (domestic 100000001, international 100000000), `new_questionsorcomm`, `campaignid@odata.bind` (41), pass-through fields (`new_idealtimeto_call`, `address1_city`, `new_6yearsofeducation`, `new_twoyearsgrades`, `new_ieltsscoreof7`, `new_doyouhaveavalidenglishproficiencytest`); `new_enquiries` `new_name` "Enquiry from IHNA Website", `new_campaign` (the table's lead source), `new_description`, `new_interesteduniversities` 100000001, `new_courseinterested`. `new_epiqrnapplications` is not written.

**ihnaOnline** (`src/lib/adapters/ihnaOnline.ts`, DEC-103): JSON `POST IHNA_ONLINE_WEBHOOK_URL` with `X-Webhook-Key: IHNA_ONLINE_WEBHOOK_KEY` (masked in dry-run records). Body `lead_id` (`ihna-web-` + the first 32 hex chars of sha256(`submissionId`), so a retry sends the same id and no personal data is hashed), `first_name`, `last_name`, `email`, `phone`, `mobile`, `course_code`, `message`, `preferred_intake`, `how_did_you_hear`, `utm_source` (else the HubSpot campaign source), `utm_medium`, `utm_campaign` (else the code), `campaign_name`, `form_name`, `source` "WEBSITE". Any 2xx is sent.

**admissionsApi** (`src/lib/adapters/admissionsApi.ts`): in the shared adapters folder; no IHNA form names it.

## 7. Import / seed
None: the 30 definitions in `src/content/forms.ts` are edited by hand; the campaign table is 41. Destinations per key (H = hubspot, "fixed" = `hubspotCampaignSourceFixed`, n = with a note; P = portalCrm; D = dynamics; IO = ihnaOnline; S = portalStakeholder; E = email group; A = autoresponder; "when" = conditional):

| formKey | Destinations | Thank-you |
|---|---|---|
| `quick-enquiry` | H, E enquiries + admissions; IO when course code CHC33021/HLT33115/HLT35021/CHC52025; P + self-enrol A when KH 352/397/361/14/115; E health-careers-pathways when KH 75 and a pathway; E anaesthetic-technology when KH 400 | `/quick-enquiry-thanks/` + GTM query; short course `/short-course-enquiry-thanks/` |
| `course-brochure` | H fixed "Website Brochure Download", E marketing | brochure, else `/thanks/` |
| `lp-enquiry` | P, E enquiries | `/quick-enquiry-thanks/` |
| `online-learning` | P (campus Online), E e-learning | `/quick-enquiry-thanks/` |
| `blog-enquiry` | D "Enquiry from IHNA Blog" (not short courses), P + self-enrol A (short courses), H, E marketing; fallback code `blog` | `/blog/thanks/`; short course `/short-course-enquiry-thanks/` |
| `scholarship` | Hn (intake, reasons), E scholarship | `/scholarship-thanks/` |
| `alumni-story` | Hn fixed "IHNA Alumni", E alumni | inline |
| `alumni-signup` | E alumni (DEC-47) | inline |
| `agent-registration` | S (ihm, ihna), E agents, A | inline |
| `referral-application` | E referral, A | `/referral-application-thanks/` |
| `global-partner`, `employer-eoi` | E partnerships, A | `/partner-application-thanks/` |
| `skilldemy-enquiry` | E skilldemy | `/quick-enquiry-thanks/` |
| `business-enquiry` | E partnerships | `/thanks/` |
| `corporate-registration` | E student-support + marketing + e-learning, A | inline |
| `jobs-eoi` | E hr (CV as a link, DEC-110) | `/expression-of-interest-thanks/` |
| `library-enquiry` | E library | `/thanks/` |
| `quick-feedback` | E feedback (attachment as a link, DEC-110) | `/thanks/` |
| `event-registration` | D "Enquiry from Event Booking : IHNA", E events, A | `/thanks-events/` |
| `whatsapp` | H, E enquiries | whatsapp (`/thanks/` while `site.whatsappNumber` is null) |
| `rpl-enquiry` | H, P, E enquiries; fallback code `rpl` | `/rpl-and-credit-transfer/thanks/` |
| `walkin-enquiry` | E enquiries; H (not short courses); P + self-enrol A (short courses) | inline |
| `lp-hubspot-note` | Hn (eligibility and Expo questions), E enquiries | landing `thanks.php` |
| `lp-hubspot` | H, E enquiries | landing `thanks.php` |
| `lp-dynamics` | D "Enquiry from Landing page", E enquiries; P when posted from `/healthcare-courses-adelaide/` | landing `thanks.php` / `-int-thanks.php` |
| `lp-kh-int` | P (international), E enquiries | landing `-int-thanks.php` |
| `lp-ihna-online` | IO, E enquiries | landing `thanks.php` |
| `lp-course-enquiry` | H, P, E enquiries; E regional when posted from a Ballarat page | inline |
| `lp-mail-only` | E enquiries | `/thanks/` |
| `event-lp` | E events, A | landing `thanks.php` |

On a landing page the registry `thankYouPath` overrides the form's thank-you (60).

## 8. Acceptance checks
Automated: `npm run test:int` (includes `tests/enquiries/*.test.ts`).
1. `tests/enquiries/schema.test.ts`: schema rules; every definition of the registry compiles and rejects empty input. `tests/enquiries/ihna-forms.test.ts`: exactly the 30 IHNA keys; groups are role names with no address; links instead of uploads; every conditional destination, autoresponder variant and thank-you rule; a landing row applies only to its own form (the dialog and WhatsApp keys on a landing page get none); autoresponders fail closed in production (`autoresponderAllowed`).
2. `tests/enquiries/enquire.test.ts`: 400/413/`unknown_form`; insert before queue; 500 `save_failed`; a queue failure keeps the row; idempotent `submissionId` (also concurrent); honeypot → spam; `_hp_url` vs the agent `website` field; 11th request → 429; captcha cases; campaign resolution; source ids; unknown course id → 400.
3. `tests/enquiries/route.test.ts`: JSON 200 `{ok, thankYouPath}`; no-JS 303; Retry/Release are admin/marketing only. `tests/enquiries/client-ip.test.ts`: the rightmost `X-Forwarded-For` entry, platform headers first.
4. `tests/enquiries/ihna-adapters.test.ts`: IHNA's maps (HubSpot properties, EU1 hosts, note after the upsert, a CMS course sent as its code and never a KH id, the escaped `<br>` note, no second note on a retry after a Forms API failure; Dynamics bodies and campaign bind; portal CRM KH ids, calling code and student type) and the `ihnaOnline` live-switch guard; `tests/enquiries/campaign-codes.test.ts` the campaign table (41). The shared-pipeline tests (`enquire`, `route`, `adapters`, `live-adapters`, `email-dryrun`, `deliver`) run against a fixture of ihm-web's 25 form definitions and site maps (`tests/enquiries/fixtures/forms.ts`, `site-ihm.ts`), so every adapter and thank-you type is exercised: dry-run records match `tests/enquiries/fixtures/*.json`, no credential is recorded, no real mail under `DRY_RUN=1`.
5. `tests/enquiries/deliver.test.ts`: sent rows not resent; five failures → dead + alert in Mailpit; held/spam never delivered; autoresponder row; Retry/Release/requeue.
6. `tests/enquiries/thankyou-ratelimit.test.ts` (thank-you order; memory and Postgres rate-limit stores), `tests/enquiries/scrub-ips.test.ts`, `tests/enquiries/lead-event.test.ts`.

E2E (`tests/enquiries/playwright.config.ts`, `npm run test:e2e:enquiries`). The config never starts a server: run the dev server first (`npm run dev -- -p 3001`) with `.env` holding `DRY_RUN=1`, an empty `ENQUIRY_LIVE_ADAPTERS` (both asserted in `beforeAll`), `DYNAMICS_ENABLED=1` and the `ihna` database with the imported courses (the suite uses `diploma-of-nursing`); Mailpit on 1025/8025 catches the dry-run mail when it runs. Base URL: `PLAYWRIGHT_BASE_URL`, else `NEXT_PUBLIC_SITE_URL`, else `http://localhost:3001`. The test process sets `ENQUIRY_AUTORUN=0` and `DISABLE_DB_PUSH=1`, runs one worker with a 30-minute global timeout and 30 s action timeouts, and deletes its rows afterwards.
7. `tests/enquiries/e2e/all-keys.e2e.spec.ts`: for every key of the registry (30; landing keys posted from their first landing page, the others from `/e2e/<key>/`, with Diploma of Nursing as an ordinary course) one row whose delivery rows equal `planDeliveryRows` for that submission, all `dry_run`, status `delivered`, and the response's thank-you equal to `computeThankYou`. Then: `quick-enquiry` with an ordinary course (HubSpot `course` `;HLT54121`), a short course (KH portal `courseId` 352, self-enrol autoresponder, `/short-course-enquiry-thanks/`), an IHNA Online course (`ihnaOnline`, key `[masked]`); `blog-enquiry` Dynamics (lead + enquiry); `lp-hubspot-note` (note after the upsert, landing thank-you); `lp-dynamics` adds the KH portal only from Adelaide, `lp-course-enquiry` the regional group only from Ballarat; WhatsApp posted from a landing page keeps its own thank-you; `/action_page.php` is 404 for GET and POST.
8. `tests/enquiries/e2e/enquiry-form.e2e.spec.ts` (the quick-enquiry on `/contact/`: client validation, honeypot, save failure, full submit with `?campaign=z29vz2fkcw&utm_source=google...` to three `dry_run` deliveries `email:admissions`, `email:enquiries`, `hubspot:contacts` with HubSpot `course` `;HLT54121` and `campaign_source` "IHNA Website"; idempotent resubmit), `tests/enquiries/e2e/admin-enquiries.e2e.spec.ts` (a marketing user filters by formKey, campaignCode and dead deliveries; rows are read-only; a viewer and anonymous cannot read).

Manual against the dev server (`http://localhost:3001`):
9. `curl -s -X POST http://localhost:3001/api/enquire/ -H 'content-type: application/json' -d '{"formKey":"nope","submissionId":"00000000-0000-4000-8000-000000000000"}'` → 400 `{"ok":false,"error":"unknown_form"}`.
10. Every thank-you page answers 200 (prints `10 200`): `for p in thanks thanks-events quick-enquiry-thanks short-course-enquiry-thanks blog/thanks scholarship-thanks referral-application-thanks partner-application-thanks expression-of-interest-thanks rpl-and-credit-transfer/thanks; do curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3001/$p/"; done | sort | uniq -c`.

## 9. Differences from ihm-web
- IHNA has 30 form keys; ihm-web has 25, with no `when` conditions, autoresponder variants or thank-you rules (DEC-102).
- `SHARED-FILES.md` lists `src/app/api/enquire/**`, `src/jobs/**`, `src/lib/enquiries/**` and `src/lib/adapters/**` as shared; the IHNA copies add `conditions.ts`, the `ihnaOnline` adapter (DEC-103), the HubSpot property map and v3 notes, the Dynamics body map and the portal CRM extras, all driven by `src/content/{campaign-codes,course-crm,hubspot-map,dynamics-map}.ts`. ihm-web has none of those content files; with its values (`tests/enquiries/fixtures/site-ihm.ts`) the shared code sends ihm-web's requests.
- Dynamics is on by default on IHNA (`DYNAMICS_ENABLED=1`); on ihm-web it defaults to `0` (DEC-12).
- HubSpot sends a CMS course as its code (`courseValue: 'code'`); ihm-web sends the KH id when a course has no `hubspotCourseId`.
- Autoresponders need a verified captcha in production (`site.autoresponderNeedsCaptcha`); ihm-web sends them for every delivered row.
- 18 recipient groups by staff role (ihm-web: 9); site default KH source 2 (ihm-web: 24).
- The attribution cookies are `ihna_attr` / `ihna_attr_first` (`site.attributionCookies`); ihm-web's are `ihm_attr` / `ihm_attr_first`.

## 10. Open questions
1. Every `recipientGroups[].to` and `alertTo` in `src/content/enquiry-routing.ts` is empty, so all staff mail and alerts go to `ENQUIRY_NOTIFY_TO`. Who receives each group?
2. Production rate-limit store: keep the raw `enquiry_rate_limits` table or bring it under Payload (DEC-54)?
3. HubSpot EU1 (blocked on access): do the custom properties exist (`campus` numeric values, `course` as `;<code>`, `how_did_you_hear_about_us`, `current_country`, `preferred_intake`, `student_type`, `referral_url`), which `course` values does the portal accept, and will a form GUID (`HUBSPOT_FORM_GUID`) be created so `hutk` is sent? Two courses have no code and send no `course`.
4. Dynamics (DEC-12; no sandbox): is it still a destination (`blog-enquiry`, `event-registration`, `lp-dynamics`)? The CRM needs an application user, a Brisbane campus option and options for the newer KH courses; is `new_epiqrnapplications` still wanted?
5. Which destinations do RPL enquiries need? `rpl-enquiry` sends to HubSpot, the KH portal and the enquiries group because the live handler is server-only.
6. The portal CRM returns no lead reference (any 2xx counts as sent). Is a confirmable response available?
7. Uploads (DEC-110): `jobs-eoi` (CV) and `quick-feedback` (attachment) ask for an https link. Keep links, or add private uploads (type/size allow-list, retention; 90)?
8. KH 400: the old quick-enquiry handler treats it as the anaesthetic technology course, the old Dynamics map as another course (`src/content/course-crm.ts`).
9. The old handlers also post enquiries for courses whose WordPress meta is `university=ihm` to the stakeholder portal's `autoAgent`; no course data says which courses these are, so that destination does not exist.
10. The production IHNA stakeholder portal URL for `agent-registration` (the old code posts to a staging host), and whether agent registration is wanted at all (no page mounts it).
11. Deployment: which client-IP header does the production proxy set or overwrite? Name it in `TRUSTED_IP_HEADERS`; until then `clientIp` uses the rightmost `X-Forwarded-For` entry, so a visitor cannot pick their own rate-limit bucket or KH `ip_address`.
