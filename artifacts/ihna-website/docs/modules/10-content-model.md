# 10 — Content model

## 1. Purpose
Every Payload collection and global in ihna-web: fields, access per role, hooks, versions, auth; and the code registries that hold
the rest of the site's content. Change this doc when you add or change a field.

## 2. Data model
Legend: `*` required · `U` unique · `I` index · `→x` relationship · `[]` hasMany · `L` = a `blocks` field (`layoutField()` in
`src/collections/shared/fields.ts`) that references every config-level block by slug (`blockReferences`, DEC-6), stored as JSON
(`blocksAsJSON: true`).

Rich text is `lexicalEditor()` with Payload's default features (`src/payload.config.ts`); link URLs are stored as typed.

Shared groups (`src/collections/shared/fields.ts`):
- **SEO**: the SEO plugin's `meta` tab (title, description, image) on `courses` and `posts`, plus `seo` {`noindex`, `canonical`,
  `structuredData` json}.
- **import** (`courses`, `posts`): `wpId` U (admin-only), `importClass` I (A, B, C-lite, C, D, new; admin-only), `reviewStatus` I
  (`auto`, `check`, `needs-rebuild`, `kh-unresolved`, `ok`; DEC-23), `importReport` json, `reviewedBy`, `reviewedAt` (admin-only).
- `slug`: kebab-case, generated from the title (or name) when empty. `path`: computed, read-only, U.

### Collections (`src/collections/index.ts`)
Counts are the dev database `ihna`.

| Collection | Fields | Rows |
|---|---|---|
| `courses` | `title`*, `slug`* U, `path` U, `code` I, `cricosCode`, `courseStatus`, `studentType` domestic/international/both (default both), `courseType` award/non-award, **Key facts** (below), `khId` I (portal course id, DEC-8), `khIdSource` dump/scrape, `showStartDates` (default false, DEC-7), `school`* →categories, `categories`[], `disciplines`[], `levels`[], `campuses`[], `deliveryModes`[], `durations`[], `universities`[], `relatedCourses`[] →courses, `heroImage`, `excerpt`, `accreditation`, `units` number, `applyLink`, `brochure` →documents (category `brochure` only; DEC-69), `brochureUrl` (fallback, hidden in the admin when `brochure` is set), `handbookUrl`, `hubspotCourseId` (the national code; the HubSpot adapter sends it first), `dynamicsCourseOption` (empty on IHNA: the Dynamics adapter takes the option from `src/content/course-crm.ts` by KH id), `splId`, `featured` I, `featuredOrder`, `sections` array {`slot`* overview/entry/structure/careers/placements/pathways/faq/fees/additional (each once per course), `title`, `layout` L}, SEO, import, `fees` {`displayAmount`, `note`} | 21 (14 domestic, 5 international, 2 both); 17 with `khId`, 4 `kh-unresolved`; 16 `showStartDates`; 15 `brochureUrl` (FlipHTML5), 0 `brochure`; 17 `fees.displayAmount`; 19 `hubspotCourseId`; 14 featured (the live home's courses in its order, `featuredOrder` 1–14, set by `scripts/dev/seed-live-figures.ts`); `courses_sections` hold richText, videoEmbed, table, accordion and testimonials blocks only |
| `posts` | `title`*, `slug`* U, `path` U, `urlDate` I (`YYYY/MM` of the live URL, empty for `/blog/<slug>/`; validated `URL_DATE_RE`), `category`* blog/news I, `topic` →blogCategories I, `featured` I (the old "breaking blog" flag), `publishedAt`* I, `author`, `heroImage`, `cardImage` (listing crop; the hero is used when empty), `excerpt`, `readTime`, `content`* (Lexical), SEO, import (+ `apprunnerId` U, `sourceUpdatedAt`, both admin-only) | 186 blog (172 dated, 14 flat), 0 news; all with a `topic` |
| `blogCategories` | `name`*, `slug` U, `active` I, `sortOrder`, `legacyCode` U (App Runner category code, read-only) | 26 |
| `galleries` | `title`*, `slug` U, `eventDate` I, `campuses`[] select I (melbourne/sydney/perth/brisbane: the keys of `galleryCampuses`), `featured` I, `active` I, `sortOrder`, `coverImage`, `items` array {`image`* →media, `title`, `caption`, `apprunnerId` (admin-only)}, `apprunnerId` U (admin-only), `sourceUpdatedAt` (hidden) | 62 (263 items, 41 campus links, 6 featured) |
| `events` | `title`*, `slug` U, `startsAt`* I, `dayLabel`, `timeText`, `frequency`, `discipline` →disciplines, `description`, `speaker`, `speakerBio`, `venue`, `hostedBy`, `joinUrl`, `secondaryUrl`, `image`, `tags` text[], `registrationOpen`, `formKey` (default `event-registration`, a key in `src/content/forms.ts`), `legacyId` U | 0 |
| `testimonials` | `name`*, `course` →courses I, `quote`*, `image`, `videoUrl`, `headline`, `subheadline`, `featured` I, `source` mwt/hardcoded/alumni, `legacyId` U | 0 |
| `staff` | `name`*, `slug` U, `position`, `postNominals`, `school` →categories (lists the person on that school page), `photo`, `bio`, `email` (staff-read only), `linkedin`, `googleScholar`, `orcid`, profile arrays `research`, `grants`, `activities`, `supervision`, `active` I, `sortOrder`, `courses`[] →courses (drives CourseManagers and lists the person on the school page of those courses), `legacyId` U (the old `staff_profile` id: `/staff-profile/?id=<legacyId>`, DEC-111) | 33 (27 academic, 6 management), all with `legacyId` and photo; no emails, no school, no course links |
| `levels`, `deliveryModes` | `name`*, `slug` U, `active` I, `sortOrder`, `legacyId` U | levels 3 (Certificate III, Diploma, First Aid; `legacyId` = course-finder id); delivery modes 3 |
| `durations` | same + `months`* | 6 |
| `universities` | same + `image`, `detailPath` (path of its route file), `enquiryEmail` (admin/marketing only) | 1 (the partner of the package course; `detailPath` set) |
| `campuses` | same as universities + `portalCampusId` I, `hubspotCampusValue` | 4 (Sydney, Melbourne CBD, Perth, Brisbane; `portalCampusId` and `hubspotCampusValue` empty) |
| `disciplines` | same + `description`, `image`, `color` (hex), `parent` →disciplines | 4 (course-finder areas of interest; `legacyId` = finder id) |
| `categories` (Schools) | same as disciplines (`parent` →categories) + `enquiryEmail` | 6 (the Courses-menu groups, in menu order) |
| `media` | upload (`media/` on local disk): jpeg, png, webp, avif, gif, pdf (no SVG), 20 MB cap (`limitMediaSize`); sizes `thumb` 400, `card` 768, `hero` 1600, `og` 1200×630; focal point. Fields `alt`*, `caption`, `credit`, `legacyPath` U (read-only, the old `wp-content/uploads` path) | 895, all with `legacyPath` |
| `documents` | upload (`media/documents/` on local disk), PDF only, 50 MB. `title`*, `category`* policy/procedure/staff-policy/form/guide/handbook/brochure/other (`brochure` = a course brochure, pickable as `courses.brochure`), `audience`* students/staff/public, `effectiveDate`, `publicPath`* U I (under `DOCUMENT_PREFIXES`, ends `.pdf`), `listings` array {`section`* student-policies/student-procedures/staff-policies/staff-procedures/glossary, `order`*}, `notes` (staff-read only) | 167 (policy 31, procedure 31, form 7, guide 44, other 54; no brochure); 48 `listings` rows (the `documents` step fills them from the `/policies-links-forms/` links; no page renders them) |
| `enquiries` | `publicId` I, `submissionId`* U, `formKey`* I, `status`* I (received/delivering/delivered/partial/dead/held/spam, derived from deliveries), captcha {`captchaStatus`, `captchaScore`, `honeypot`}, `firstName`, `lastName`, `email` I, `phone`, `country`, `studentType`, `consent`, `course` →courses, `campus` →campuses, `campaignCode` I (raw code as received; DEC-41), `utm` group (utm_*, click ids, referrer, landingPath, firstTouch), `hutk` (DEC-13), `data` json, `pageUrl`, `source` api/legacy-post, `ip` (nulled after 90 days), `deliveries` array {adapter, target, status pending/sent/failed/dead/held/dry_run, attempts, at, responseCode, externalId, lastError, dryRunRequest, hsSourceFallback} | test rows only |
| `products` | `sku`* U, `legacyE2Btn` U (1–12, old `?e2btn=`), `name`*, `kind`* prep-package/mock-test, `description`, `priceCents`* ≥1, `currency` AUD, `studentDiscountPercent` (default 50), `accessMonths`, `gateways`[] (payway/securepay/airwallex/convera/flywire), `active` I, `sortOrder` | 12 (6 prep packages, 6 mock tests) |
| `payments` | mirror of the portal payment rows our flows create: `paymentId`* U (uuid), `kind` invoice/product/sae/portalReturn, `product`, `paymentFor`, `invoiceNo` I, `studentId` I, `payerName`, `payerEmail` I, `amountCents`*, `baseCents`, `surchargeCents`, `currency`, `gateway` I, `gatewayRef` I, `status`* I (pending/paid/failed/refunded/flagged/cancelled/expired), `statusHistory`, `steps` (post-payment job status), `portalPaymentId`, `flags`, `ip`, `settledAt`, `lastSyncedAt`. Written only by `src/lib/payments` (45) | test rows only |
| `users` (auth) | `email`, `name`, `roles`*[] admin/marketing/events/finance/viewer (default viewer, `saveToJWT`) | — |
| `alumni` (auth) | `email`, `firstName`*, `lastName`*, `graduationYear`, `course`, `marketingConsent`, `legacyId` U, `passwordSetAt` (both admin-only) | — |

**Course key facts.** The collapsible "Key facts" holds group `facts` with sub-groups `duration`, `units`, `delivery`, `level`,
`campuses`, `cricos`, `fee`, each {`show` checkbox default true, `value`, `detail`}, and group `factsInternational` with the same
shape (shown in the admin only when `studentType` is `both`). Resolution (`src/components/course/facts.ts`, pure):
- `factsInternational.<key>` is used only when the course is `both`, the audience is international, and that sub-group has a
  `value` or `show = false`; otherwise `facts.<key>`.
- `show = false` hides the fact. A blank `value` falls back to the course: lookup names (`durations`, `deliveryModes`, `levels`,
  `campuses`, joined with " · "), `units` ("24 units"), `cricosCode`, `fees.displayAmount` (with `fees.note` as the detail). A fact
  with no value after the fallback is skipped. An own `value` uses only its own `detail`.
- Order: duration, units, delivery, level, campuses, cricos, fee.
Rendering is `CourseFacts` (`src/components/course/CourseFacts.tsx`, 20). On IHNA the fee is the text the live page states
(DEC-107). `scripts/dev/fill-course-facts.ts` fills blank facts (never `fee`) (30).

### Globals
- `courseShared` (label "Shared course section", admin group Settings): `layout` L, rendered on every course page after the
  course's own blocks; `stats` array ≤6 {`value`*, `label`*} ("Stats band"), rendered as a `stats` band above the course page's
  enquiry form, none when empty (DEC-22). Drafts with autosave and scheduled publish, 25 versions. On IHNA `layout` is empty (DEC-35) and `stats` holds the live course
  pages' 300+ / 3,000+ / 35,000+ figures (`scripts/dev/seed-live-figures.ts`).

### Code, not CMS
- **Pages:** `src/app/(site)/<path>/page.tsx` (home is `(site)/page.tsx`), JSX over the authoring kit `src/components/page/` (20)
  or a template from `src/components/templates/pages.tsx`. Registry `src/content/pages.ts` (`path`, `title`, `template`,
  `section` (drives `SectionNav`; `sections` holds the five section navs), `noindex`, `description`, `text` for search,
  `route: 'existing'` for routes with their own handler such as `/blog/`, `/news/` and the payment pages; `pageAt`,
  `pagesByTemplate`, `sectionLinks`): 151 rows, 11 of them `existing` (DEC-61).
- **Landing pages:** route files at their old paths (`/study-at-ihna/…`, `/healthcare-courses-*/`, `/walkin-enquiry/`,
  `/walkin-registration/`, `/lp/ihna-enterpreneurship-program/`); registries `src/content/landing.ts` (38 rows, `landingAt`) and
  `landing-routes.ts` (one lazy import per row), `60-landing.md`, DEC-62.
- **Site constants** (DEC-63), all in `src/content/`:

| File | Holds |
|---|---|
| `site.ts` | site settings: contact lines and `contact` (campuses, mailboxes), social links, `enquiryDialog`, `attributionCookies` (`ihna_attr`, `ihna_attr_first`), `payPath` `/pay-online/` (DEC-11), `allowedEmbedHosts` (DEC-5), `tracking` (ids `null`, DEC-63) |
| `nav.ts`, `footer.ts` | header menu, footer |
| `forms.ts` | the 30 form definitions (DEC-2, 40) |
| `enquiry-routing.ts` | recipient groups, alert addresses, default source id (DEC-19) |
| `campaign-codes.ts` | 57 campaign codes, including the fallback rows `default` and `lp_default` (DEC-101) |
| `course-crm.ts` | CRM course and campus reference data keyed by KH id and code (35 courses), read by the enquiry conditions and adapters (DEC-102) |
| `hubspot-map.ts`, `dynamics-map.ts` | HubSpot properties and Dynamics bodies (40) |
| `redirects.ts` | 27 exact redirects, 6 permanent (DEC-30, DEC-64) |
| `staff-paths.ts` | `/<person>/` profile map; empty on IHNA (DEC-65) |
| `documents.ts` | `DOCUMENT_PREFIXES` (8) and `DOCUMENT_ALIASES` (none) of the `documents` collection (DEC-68) |
| `static-paths.ts` | the 18 `demo/` stand-ins and the 3 empty-200 PHP URLs (DEC-113) |
| `news.ts` | what `/news/` and `/category/india/news/` list: `source: 'items'`, the 4 root posts (DEC-42) |
| `campuses.ts` | `campusContacts` (empty), `galleryCampuses` (the four city campuses: key, App Runner id, campus page path; also the home page's campus list) |
| `library/catalogue.ts` | the reading list of `/library/ebooks/` and `/library/eresources/`: unit groups (core, elective) → units → references (citation, title, catalogue link), taken from the live pages |
| `course-siblings.ts` | domestic course slug → its international page where the slugs do not follow `<slug>-international` (5 pairs); the course route's student-type switch |
| `payments.ts` | `paymentSite`, the payment pipeline's site settings (DEC-109) |

### Access (`src/lib/access.ts`)
Staff = a `users` doc; alumni are never staff. Every collection declares its operations explicitly.

| Collection | Read | Create / update | Delete |
|---|---|---|---|
| courses | published, or any staff | create marketing; update marketing, finance (finance reaches only `fees` and the fee fact text, below) | admin |
| posts, staff, testimonials | published, or any staff | marketing | admin |
| events | published, or any staff | marketing, events | admin |
| blogCategories, lookups | `active`, or any staff | marketing | admin |
| galleries | `active`, or any staff | marketing, events | admin |
| media | anyone | marketing, events | admin |
| documents | anyone | marketing | admin |
| products | `active`, or any staff | create finance; update marketing, finance | admin |
| enquiries | marketing, finance | nobody (system writes with `overrideAccess`, DEC-3) | nobody |
| payments | finance | nobody (system writes) | nobody |
| users | self, admin | create admin; update self, admin | admin |
| alumni | self, admin | create admin; update self, admin | admin |
| `courseShared` | anyone | marketing | — |

Admin is included in every role list. `viewer` reads drafts and inactive rows and writes nothing.
Field-level: every course field except `fees` is marketing (`lockFields`); `courses.fees` finance; the `facts` and
`factsInternational` groups admit marketing and finance, and inside them `show` and every `value`/`detail` are marketing except
`fee.value` and `fee.detail`, which are finance (DEC-67); a finance save publishes like any other (DEC-72).
`products.priceCents`, `currency`, `studentDiscountPercent` finance; `documents.publicPath` marketing on create, admin only on
update (a live URL never changes); `documents.notes` and `staff.email` staff read; lookups `enquiryEmail` marketing; `users.roles`
update admin; import system fields, `posts.import.apprunnerId`, `galleries.apprunnerId` admin. Alumni cannot reach `/admin`
(`access.admin: () => false`) and cannot set `_verified` or change their email.

### Hooks (`src/collections/shared/hooks.ts` unless noted)
1. **Path** (courses, posts, `beforeValidate`): `path` = `/courses/<slug>/`; for posts `postPathOf` (`src/lib/blog-paths.ts`):
   `/blog/<urlDate>/<slug>/` when `urlDate` is set, else `/blog/<slug>/`, or `/news/<slug>/` for the `news` category. `urlDate`
   is the live URL's month, never derived from `publishedAt` (DEC-104). `assertPathFree` rejects a path another doc of the same
   collection uses.
2. **A live URL never changes** (courses, posts): `captureLiveUrl` + `refuseUrlChange` refuse to publish a doc under a new `path`
   when the old one is live. A developer adds the old URL to `src/content/redirects.ts`, then saves with `context.allowUrlChange`;
   `context.importing` also bypasses (DEC-64). A draft that has never been published changes slug freely.
3. **Review**: `stampReview` sets `reviewedBy`/`reviewedAt` when a person sets `reviewStatus: ok`; scripts cannot set `ok`.
4. **Revalidate** (00 §4): `revalidateHooks` / `contentHooks` expire `<slug>` and `collection:<slug>` plus doc tags (`course:`,
   `post:`, `event:`, `staff:`, `product:`); lookups also expire `courses`, blog categories `posts`; courses and posts add
   `sitemap`; `courseShared` expires `global:courseShared`, `courses` and `collection:courses`. Skipped under `context.importing` /
   `context.disableRevalidate`. Documents use their own hooks (`src/collections/Documents.ts`): `beforeValidate` normalises
   `publicPath` (pasted URL → decoded path); `afterChange`/`afterDelete` expire `documents`, `collection:documents` and
   `document:<publicPath>` at once (`{ expire: 0 }`, skipped under `context.importing`).
5. **Embed hosts** (`validateEmbedHosts`, `beforeValidate`, DEC-29): on `courses.sections` (and `posts`, which have no layout, so
   it never fires there); rejects an `iframeEmbed` whose host is not built in or in `site.allowedEmbedHosts`, and a `mapEmbed`
   that is not a Google Maps embed URL.
6. **Media size** (`limitMediaSize`, `src/collections/Media.ts`): 413 above 20 MB.
7. **Alumni** (`src/lib/alumni/hooks.ts`): login and forgot-password rate limits (10/min per IP, 3/h per
   email) and the password policy. `Alumni.ts`
   `beforeChange` drops `_verified` and keeps the stored email when an alumnus saves, and stamps `passwordSetAt` on a password change.

### Versions
Drafts + autosave (1.5 s) + scheduled publish, 25 versions: courses, posts, events, testimonials, staff, `courseShared`.
Versions only: products. None: lookups, blogCategories, galleries, media, documents, enquiries, payments, users, alumni.
`livePreview` URLs: courses, posts.
Draft preview: `GET /api/preview/?path=<site path>&secret=<PREVIEW_SECRET>` (`src/app/api/preview/route.ts`, helpers in
`src/lib/preview.ts` and the pure `src/lib/preview-url.ts`) turns Next draft mode on for a signed-in staff user and redirects to
the path; `/api/preview/exit/` turns it off. The course and post routes fetch with `draft: true` while draft mode is on; otherwise
they show the published version. The `livePreview` URLs in `Courses.ts` and `Posts.ts` are built by `previewUrl(path)`, so the
admin live-preview pane goes through this route and shows the draft. With `PREVIEW_SECRET` unset the route answers 503 and
preview shows published content only.

### Auth
- `users`: 5 attempts then 15 min lock, 8 h token, `SameSite=Strict` cookie (secure in production), token removed from responses.
- `alumni`: same lockout, 12 h token, `SameSite=Lax`; email verification link `/alumni/verify/?token=`, reset link
  `/alumni/reset-password/?token=` (1 h). Accounts are created by staff or an import; `/alumni/register/` is a request form
  (`alumni-signup`) through the enquiry pipeline (DEC-47).

## 3. Admin capabilities
Marketing edits, schedules and publishes courses (including key facts except the fee text), posts, blog categories, galleries,
events, staff, testimonials, media, documents, lookups and the shared course section; works the review queue (`reviewStatus`);
reads enquiries. Events staff edit events, galleries and media. Finance edits course fees, the fee fact text and product prices,
and reads enquiries and payments. Pages, landing pages, menus, footer, site settings, forms, recipients, campaign codes and
redirects are code.

## 4. Front-end behaviour
Server components read through the Local API, cached under the tags in 00 §4; unknown or unpublished → `notFound()`. Code pages
read no collection for their own text; template pages read the courses, posts, galleries, staff, events, testimonials or lookups
they list. Staff: `/academic-staff/` lists active staff and `/staff-profile/?id=N` shows one by `legacyId`
(`src/components/templates/staffById.ts`, DEC-111). Galleries: `/all-events/` (`?campus=<App Runner campus id>` through
`galleryCampuses`, and `?year=`) and the four campus pages. Events: `/iCalendar/scheduler.php?id=<legacyId>` serves a published
event as ICS, else the plain "Invalid link". Documents: served at `publicPath` through the index `getDocumentIndex()`
(`src/app/(site)/pdf/documents.ts`); `/policies-links-forms/` links them in JSX, and no page reads `documents.listings`.

## 5. URLs
Code page = its route file path; its row in `src/content/pages.ts` must match. Course `/courses/<slug>/`; post
`/blog/YYYY/MM/<slug>/` or `/blog/<slug>/` (its stored live URL; the other shape renders the post with the canonical on the live
one, DEC-104); a `news`-category post `/news/<slug>/`; staff profile `/staff-profile/?id=<legacyId>`; document = its
`publicPath`. Resolution order: 00 §4.

## 6. Integrations
`DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL` (default `http://localhost:3001`), `EMAIL_FROM`, `RESEND_API_KEY` /
`SMTP_HOST`, `SMTP_PORT`, `PREVIEW_SECRET`.

## 7. Import / seed
Per `30-import.md`. Idempotency keys: `import.wpId` (courses), `import.apprunnerId` (posts), `galleries.apprunnerId`,
`blogCategories.legacyCode`, `slug` (lookups), `legacyId` (staff, alumni), `media.legacyPath`, `documents.publicPath`,
`products.sku`. Courses come from `wp-courses` (bodies, facts, fees) and `course-live` (`khId` from the live page, DEC-8);
posts, blog categories and galleries from `npm run import -- apprunner` (DEC-105); lookups from
`scripts/import/seeds/ihna-course-groups.json` (`lookups` step) plus the campuses, delivery modes and durations each course page
states (`wp-courses`); staff from the live `/academic-staff/` and `/staff-profile/?id=` pages (`staff` step; emails are never
stored); documents from the PDF stores in `public/` (`documents` step, which also sets `listings`). `scripts/dev/seed-live-figures.ts`
[--dry] [--force] sets what the live site shows today for two marketing values: `courses.featured`/`featuredOrder` of the live
home's 14 courses and `courseShared.stats`; a value marketing has changed is kept unless `--force`. `seedProducts()`
(`src/collections/seed/products.ts`) creates the 12 English-test products (`legacyE2Btn` 1–12); `scripts/dev/seed-admin.ts`
creates the dev admin from `DEV_ADMIN_EMAIL` / `DEV_ADMIN_PASSWORD`.

## 8. Acceptance checks
1. `npm run generate:types && npm run typecheck` pass; no `*_blocks_*` tables exist (`blocksAsJSON`):
   `psql -h 127.0.0.1 -p 5432 -U postgres -d ihna -Atc "select count(*) from information_schema.tables where table_name like '%\_blocks\_%'"` → 0.
2. `tests/collections/courses.test.ts`: path `/courses/<slug>/`, `showStartDates` default false; marketing cannot update `fees`,
   finance can and cannot touch other fields; marketing edits every key fact but the fee text, finance edits only the fee text;
   a viewer reads but cannot write; a published course cannot be republished under a new URL; `allowUrlChange` and `importing`
   bypass; duplicate slug rejected. `tests/courses/brochure.test.ts`: only `brochure` documents can be picked, marketing sets it,
   finance cannot.
3. `tests/collections/posts.test.ts`: `/blog/YYYY/MM/<slug>/` from `urlDate` (not `publishedAt`), `/blog/<slug>/` without it, a
   malformed `urlDate` rejected, a published post refused under a new URL, `allowUrlChange` bypasses.
4. `tests/collections/access.test.ts`: alumni auth and verification, enquiries and payments read/write rules, product price
   field access, lookups active-only and hidden `enquiryEmail`, users self-read and roles lock.
5. `tests/collections/content.test.ts`: `seedProducts` idempotent with `legacyE2Btn` 1–12 unique; lookup relations.
6. `tests/collections/documents.test.ts`: `publicPath` rules and normalisation, access, admin-only path change, uniqueness,
   PDF-only upload, served at its path with 200 `application/pdf`, 404 for traversal and unknown paths.
   `tests/collections/upload-limits.test.ts`: 50 MB parser cap, 20 MB `media` cap.
7. `tests/courses/course-facts.test.ts`: fallbacks, order, `show = false`, the international override, the rendered strip.
8. `tests/seo/page-files.test.ts`: one `pages.ts` row per content route file and a route file per row (`route: 'existing'` rows
   and `/courses/`, `/search/`, `/blog/`, `/news/`, `/pay/`, `/lp/`, the alumni account routes and the landing paths excepted).
9. DB counts match §2: `psql -h 127.0.0.1 -p 5432 -U postgres -d ihna -Atc "select (select count(*) from courses),
   (select count(*) from posts), (select count(*) from blog_categories), (select count(*) from galleries),
   (select count(*) from staff), (select count(*) from documents), (select count(*) from products), (select count(*) from media),
   (select count(*) from levels), (select count(*) from disciplines), (select count(*) from categories),
   (select count(*) from universities), (select count(*) from campuses), (select count(*) from delivery_modes),
   (select count(*) from durations)"` → `21|186|26|62|33|167|12|895|3|4|6|1|4|3|6`;
   the import reports `scripts/import/out/ihna-wp-courses.report.json` (21 courses, kh 17/4, `showStartDates` 16) and
   `ihna-apprunner.report.json` (186 posts: 172 dated, 14 flat; 26 categories; 62 galleries, 263 items) agree.

## 9. Differences from ihm-web
Collections shared with ihm-web follow `SHARED-FILES.md`; IHNA differs as follows.
- IHNA has `blogCategories` and `galleries` (App Runner content, DEC-105); ihm-web has neither.
- IHNA posts store their live URL month (`urlDate`) and have `topic`, `featured`, `cardImage`, `import.apprunnerId`; ihm-web
  posts live at `/blog/<slug>/` and have none of these fields.
- IHNA staff profiles are `/staff-profile/?id=<legacyId>` (DEC-111) and `staff-paths.ts` is empty; ihm-web serves `/<person>/`
  through `staff-paths.ts` (DEC-9).
- IHNA's lookups are the four groups of `ihna-course-groups.json` plus what the course pages state; `courseShared.layout` is empty
  (DEC-35) and `courseShared.stats` holds the live figures band.
- A finance save of the fee text publishes on IHNA; ihm-web stores it as a draft (DEC-72).
- IHNA's `cricos` fact behaves like the others (`show` default true); on ihm-web `facts.cricos.show` means "also show to domestic
  students" and CRICOS always shows to the international audience.
- ihm-web normalises rich-text link URLs on save (`normaliseLinkUrl`) and keeps `documents.retiredPaths`; IHNA has neither.
  IHNA's `DOCUMENT_PREFIXES` are `src/content/documents.ts`; ihm-web's are in `src/collections/Documents.ts`.
- IHNA-only registries: `campaign-codes.ts`, `course-crm.ts`, `hubspot-map.ts`, `dynamics-map.ts`, `course-siblings.ts`,
  `news.ts` (`source: 'items'`; ihm-web's `/news/` lists news posts), `static-paths.ts`, `payments.ts`, `documents.ts`.

## 10. Open questions
Owner decisions:
1. Are staff emails public? `staff.email` is staff-read and the staff import stores none.
2. Production storage for `media` and `documents` (local disk in dev).

Blocked on access:
1. WordPress database dump: SEO postmeta, `khId` of the 4 `kh-unresolved` courses (DEC-8), events and testimonials (both empty),
   the lookup tables' own ids (`legacyId` empty on campuses, delivery modes, durations, universities, categories).
2. App Runner ownership and switch-off date: posts, blog categories and galleries refresh from it (DEC-53, DEC-105).
3. Where the course brochures live: no `brochure` document exists; 15 courses link FlipHTML5 through `brochureUrl` (DEC-69).
4. Live `ihna_portal` campus ids for `campuses.portalCampusId`, and the HubSpot EU1 campus values for
   `campuses.hubspotCampusValue` (both empty).
