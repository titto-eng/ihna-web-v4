# 50 — Portal data (`src/lib/portal/`)

## 1. Purpose
Read live data from the admissions portal MySQL database `ihna_portal` and hand typed, cached results to pages, blocks and the old AJAX URLs: course start and census dates, the intake calendar, unit census dates, the education agent directory, the HC course row and the invoice behind a signed pay-form link (§4). Nothing is copied into Postgres. A page never fails because the portal is down or switched off. The portal `payments` table writes (`payments-write.ts`) belong to 45-payments.

`PORTAL_ENABLED` defaults to `0`: no read opens a connection, every read returns `{ unavailable: true }` synchronously, and pages and blocks show the static fallback (DEC-50).

## 2. Data model
**Payload** (`src/collections/Courses.ts`):
- `khId` (number, indexed, nullable): the portal `courses.id`. All portal reads for a course key on it (DEC-8).
- `khIdSource` (`dump | scrape`, read-only).
- `showStartDates` (checkbox, default false): gates the `startDates` block (DEC-7).

**Blocks:** `startDates { mode: all|f2f|online|blended }`, `censusDates { note }`, `intakeCalendar { months: 1–24, default 12 }`, each plus the shared section fields (`src/blocks/<name>/config.ts`).

**Portal tables read.** Base filter **B** on `course_batches`: `partner_id = 1 AND status = 'Active' AND enable = 1 AND show_in_website = 1`.

| Table | Columns used |
|---|---|
| `campuses` | id, campus_name |
| `course_batches` | id, course_id, campus_id, partner_id, status, enable, show_in_website, intake_id (1 fixed, 2 rolling), mod_of_delivery_id (1 face to face, 2 online, 3 blended), start_date, end_date, graduation_day, orientation_date, batch_name, batch_status_id |
| `course_batch_dates` | course_batch_id, enrollment_end_date, semester_census_date, semester, start_date, semester_end_date, sem_flag |
| `courses` | id, course_name, course_code, course_category_id, refer_friend, enable, application_form5 (domestic), application_form6 (international), crm_courseid, crm_staff_id, application_form_flag/2/3/4/7/9 |
| `countries` | id, country_name, enable, default_country |
| `semesters` | id, name |
| `course_units` | id, unit_code, semester |
| `course_unit_of_studies` | id, course_id, course_batch_id, semester_id, user_id (0 = batch template row), course_unit_of_study_id, census_date, eftsl_factor |
| `course_unit_of_study_units`, `course_unit_timetable_details` | unit links; course_batch_id, course_unit_id, start_date_time |
| `ihna_web_packages` | id, name, ihna_course_id |
| `partners`, `partner_association_accesses` | agency fields, partner type, agreement status and expiry, country; association 2 = IHNA |
| `course_document_categories`, `course_documents` | course_id, course_document_type (1 = handbook), document_file |
| `invoices`, `invoice_payments` | id, invoice_number, due_amount, user_id; surcharge_amount |

People tables (`users`, `user_details`, `student_ids`, `staffs`, `partner_staffs`) are not read. Table names are unqualified (the connection database is `PORTAL_DB_NAME`); `tests/portal/no-raw-sql.test.ts` fails on any database-qualified name in `src` (`ihna_portal.`, or the sister portal's `ihmedu_portal.`).

**Return shapes** (`types.ts`; dates are `YYYY-MM-DD` strings, never `Date`):
- `PortalResult<T> = { unavailable: boolean; data: T }` — every public read returns this.
- `StartDates = { campuses: { campusId, campusName, f2f, online, blended: { fixed: string[]; rolling: string[] } }[] }`
- `CensusRow = { start, end, census, orientation }`
- `CalendarEntry = { date, khId, courseName, campusId, campusName, intake: 'fixed'|'rolling', mode: 'f2f'|'blended' }`
- `Country = { id, name }`, `PortalCourse = { khId, name, courseCode, crmCourseId, crmStaffId, formFlags }`
- `CensusCampus`/`CensusBatch`/`CensusSemester = { id, name }`, `CensusCourse = { id, name, code }`, `CensusUnit = { year, unitCode, start, end, census, eftslFactor }`
- `WebPackage = { id, name, khId }`, `Agent` (agency fields), `PortalInvoice = { id, invoiceNumber, dueCents }`, `HcCourse = { id, code, name, categoryId, referFriend }`

## 3. Admin capabilities
Editors set `khId` and `showStartDates` on a course. Dates are never edited in `/admin`; the admin has no portal preview or refresh control.

## 4. Front-end behaviour
**Module** (`src/lib/portal/`; callers import `@/lib/portal` or `@/lib/portal/ihna`, except payments code, which imports `payments-write.ts` and `PortalUnavailable` from `client.ts`, and `src/app/api/revalidate/route.ts`, which imports `revalidatePortal` and the `PortalTag` type from `@/lib/portal/cache`):
- `client.ts`: the only runtime importer of `mysql2` (`queries.ts` imports only its `RowDataPacket` type). Read pool (connectionLimit 4, queueLimit 20, `dateStrings: true`, `timezone: 'Z'`). `runQuery(sql, params)` takes a connection explicitly, releases it after a clean query, destroys it after an error or timeout, and returns a late-arriving connection straight to the pool. Per-read deadline = `PORTAL_QUERY_TIMEOUT_MS`, capped at `PORTAL_MAX_TIMEOUT_MS` = 3000 (also the default). Failures throw `PortalUnavailable(code)` and log `portal.unavailable {code, ms}`. Missing read user → `PortalUnavailable('not-configured')`. Also holds the write-limited payments pool (`runPayWrite`, `runPayRead`) used only by `payments-write.ts`.
- `queries.ts`: Q1–Q13 as constant SQL strings with `?` placeholders (no template literals, no values concatenated in; enforced by `tests/portal/no-raw-sql.test.ts`).
- `cache.ts`: `cached(name, scope, args, fn, empty)` wraps `unstable_cache` with tags `['portal', 'portal:<scope>']` (scope = a kh id or portal course id, or `calendar`, `countries`, `census`, `agents`, `packages`, `courses`) and `revalidate: 900`. A thrown error is not cached (Next keeps serving any stale entry); the failure is remembered in-process for 60 s (`PORTAL_NEGATIVE_SECONDS`), so a down portal costs one attempt per key per minute; the map holds at most `NEGATIVE_MAX_KEYS` (1000) keys, dropping the oldest. Cold cache + error → `{ unavailable: true, data: <empty> }` and a `portal.unavailable {query, scope, code}` log. `revalidatePortal(scope?)` clears the negative cache and expires the tag.
- `index.ts`: shared public reads. `getCoursePortal(khId)` loads census + start dates as one bundle per course and day (React `cache` within a request, `cached('bundle', khId, [today])` across requests); `getStartDates` and `getCensusDates` read from that bundle. Also `getIntakeCalendar(year, month, studentType)`, `getCountries()`, `getCourseByKhId(khId)`. With `PORTAL_ENABLED` ≠ `1` each returns `{ unavailable: true, data: <empty> }` without awaiting anything.
- `ihna.ts`: IHNA public reads (Q6–Q13) under the same rules (`PORTAL_ENABLED` off → synchronous `{ unavailable: true }`, else `cached`), plus `readCensus`, the signed invoice link check, `idParam` (a positive integer of at most 9 digits) and `censusDisplayDate`.
- `legacy-endpoints.ts`: the JSON answers of the old AJAX URLs (§5, DEC-112).
- `format.ts`: `portalToday()` = today as `YYYY-MM-DD` in `PORTAL_TZ` (default `Australia/Melbourne`, `@date-fns/tz`), passed to queries as a parameter instead of `CURDATE()`. Formats: start date `MMM d, yyyy`, census table `dd-MM-yyyy`, intake `MMMM yyyy`. Also `describeStartDates`, `censusTable`, `calendarColour`, `contrastTextColour`, `calendarLabel`.

**Q1 Start dates** (`startDates`): campuses (`SELECT id, campus_name FROM campuses ORDER BY id`) plus one batch query, partitioned in TS by campus × mode × intake:
`… FROM course_batches cb WHERE B AND cb.course_id = ? AND ((cb.intake_id = 1 AND cb.start_date >= today) OR (cb.intake_id = 2 AND cb.end_date >= today AND (cb.mod_of_delivery_id <> 3 OR EXISTS (… course_batch_dates d … d.enrollment_end_date >= today)))) ORDER BY cb.start_date, cb.id`.
Presentation (`describeStartDates`): international = face to face only; domestic = face to face, online, blended. Fixed dates link to `?startDate=<MMM d, yyyy>&campus=<name>#quickContact`. Rolling face to face → one "Enrol any time — every <weekday> from <date> onwards" per row; rolling online/blended → one "Enrol any time" (both link to `#quickContact`). kh 29 (`EPIQRN_KH_ID`): fixed dates link to the enquiry form and rolling dates are hidden; no IHNA course has kh 29. A campus appears only if one of its shown sections has entries.

**Q2 Census** (`censusDates`):
`SELECT cb.id, cb.start_date, cb.graduation_day, cb.orientation_date, d.semester_census_date FROM course_batches cb JOIN course_batch_dates d ON d.course_batch_id = cb.id AND d.semester IN (0, 1) WHERE B AND cb.course_id = ? AND cb.end_date >= ? AND d.enrollment_end_date >= ? ORDER BY cb.start_date, cb.id, d.course_batch_id`, keeping the first row per `start_date`. End = `graduation_day`.

**Q3 Intake calendar** (`intakeCalendar(from, to, studentType, today, campusId = CALENDAR_CAMPUS_ID)`, one query per month): batches joined to enabled `courses` and to `campuses`, B, `(? IS NULL OR cb.campus_id = ?)` with `CALENDAR_CAMPUS_ID = 8` (the old `template-monthly-calendar.php:58`; the campus name comes from `campuses`), `start_date BETWEEN from AND to`, `intake_id IN (1, 2)`, `mod_of_delivery_id IN (1, 3)`, student type via `application_form5` (0 domestic) / `application_form6` (1 international) / both (null), rolling blended only with an open enrolment date; `ORDER BY cb.start_date, cb.course_id`; deduped per (date, course, campus). Colour = `#` + first 6 hex chars of `crc32(course_name)`; labels "Face to Face", "Online (Blended)", "Online (Blended) : Enrol any time".

**Q4 Countries** (`SELECT id, country_name FROM countries WHERE enable = 1 AND default_country = 1 ORDER BY id`; `countryById`) and **Q5 Course by kh_id** (`SELECT id, course_name, course_code, crm_courseid, crm_staff_id, application_form_flag, … FROM courses WHERE id = ?`) are exported, but no page or form calls them; enquiry forms take countries from `src/lib/enquiries/countries.ts`.

**IHNA reads** (`queries.ts` Q6–Q13, public API `src/lib/portal/ihna.ts`):
- Q6 `intakeDates(khId, today, campus = 8)` (the old `[CourseStartDates]` shortcode): DISTINCT `course_batch_dates.start_date`, semester 0/1, `status = 'active'`, enabled, shown, `start_date >= today`. `getIntakeDates`, tag `portal:<khId>`. No page calls it: course pages show start dates through the `startDates` block (DEC-7).
- Q7 unit census (old `template-census-date-*.php`): pickers `censusCampuses` (template rows `user_id = 0`, batch status 1–3, campus 2 excluded, by name), `censusCourses(campus)` (enabled courses, batches from 2018, by name), `censusBatches(campus, course)` (by batch name), `censusSemesters(course, batch)`, and `censusUnits(course, batch, semester)`: one statement with the unit's first timetable start as a correlated subquery, filtered on the unit's own `cu.semester`, ordered by census date, plus the batch's `semester_end_date` (`sem_flag = 1`) as the unit end. `readCensus({campus, course, batch, semester})` reads level by level, each list cached on its own (tag `portal:census`), and reads a level only when the value above it is one of that level's options, so every cached key is a real portal id; it returns the kept selection and `unknown` when a given value is not an option (`getCensus` returns only the data). Display dates `d-M-Y` ("03-Mar-2025"), " - " when missing (`censusDisplayDate`).
- Q8 `countriesAll()` (every enabled country, by name), `getAllCountries`, tag `portal:countries`: the allow-list of `/agent-details/`.
- Q9 `webPackages()` (`ihna_web_packages`: id, name, KH course id), `getWebPackages`, tag `portal:packages`. No page calls it.
- Q10 `agentsByCountry(country, today)`: partners with partner type 5, agreement status 5, expiry ≥ today, enabled, an enabled IHNA association (2), in an enabled country; DISTINCT; agency fields only (facility name, address lines, suburb, state, postcode, website, web name, web email, web phone). `partner_staffs` is not read. `getAgents`, tag `portal:agents`.
- Q11 `handbookUrl(khId)` (the old `[HandBookUrl]`): the first type-1 `course_documents.document_file` → `https://ihna-prod.s3-ap-southeast-2.amazonaws.com/uploads/course_documents/<file>` (URL-encoded), else null. `getHandbookUrl`. No page calls it.
- Q12 `invoiceById(id)`: invoice number and due + surcharge amount in cents, nothing about the student. Reached only through `getInvoiceForLink(id, exp, sig)` (DEC-106): `sig` = hex HMAC-SHA256(`invoice:<id>:<exp>`) under `PORTAL_INVOICE_LINK_KEY` (unset = off), `exp` (unix seconds) in the future and at most `PORTAL_INVOICE_LINK_MAX_DAYS` (1–365, default 30) ahead (`verifyInvoiceLink`, constant-time compare; a bad link never queries). Never cached (the amount due changes when a payment lands). `signedInvoiceParams` format-checks the three values the chooser passes on (45 §4).
- Q13 `hcCourse(id)`: id, course_code, course_name, course_category_id, refer_friend of an enabled course (`enable = 1`), `getHcCourse`, tag `portal:<id>`. `hcCourseIds()`: the ids of the enabled courses, `getHcCourseIds` (one cached list, tag `portal:courses`), the allow-list of the HC endpoints.
- Course fees are not read from the portal (`funding_contracts`, `course_unit_state_fees`): the fee is course content (`courses.fees` and the `fee` key fact, DEC-107).

**Consumers:**
- `src/app/(site)/courses/[slug]/page.tsx` starts `getCoursePortal(khId)` (not awaited) so the blocks and JSON-LD share one read.
- `src/components/templates/CourseDetail.tsx` fees region renders `feesTable`, then `startDates` (only when `showStartDates`), then `censusDates`, each only when the course's own sections do not already contain that block type.
- `startDates` block: nothing without a course context, `khId` or `showStartDates`; unavailable → `PortalNotice`; otherwise heading "Course Start Dates" and campus cards filtered by `mode`. A course with `studentType: 'both'` renders both audiences, each wrapped in `AudienceOnly`.
- `censusDates` block: nothing without `khId`; unavailable → `PortalNotice`; no rows → nothing; else heading "Course Start Dates", the five-column table (Course Intake, Course Start Date, Course End Date, Census Date, Orientation Date) and optional `note`.
- `intakeCalendar` block: `PORTAL_ENABLED` off, or every month unavailable → `PortalNotice`; reads `months` months from the current portal month (campus 8); drops entries whose `khId` has no published Payload course and links each entry to that course's `path`; renders nothing when every month is empty.
- `src/components/seo/Course.tsx`: `hasCourseInstance` from fixed start dates (max 12) when the course has `khId` and `showStartDates === true` (DEC-7); none when unavailable.
- `CensusView` (`src/components/templates/Census.tsx`) and the legacy endpoints (§5).
- `PortalNotice` (`src/components/templates/PortalNotice.tsx`): "Dates coming soon — enquire for the next intake", linking to `#quickContact`.

## 5. URLs
- `/monthly-calendar/` and `/course-calendar/` (route files, `CalendarPage` in `src/components/templates/pages.tsx` → `CalendarView`, `src/components/templates/Calendar.tsx`): the hero, the page's own content, then an `intakeCalendar` block (12 months, muted) when any of the next 12 months has entries at campus 8, else `PortalNotice`. Query strings are ignored.
- `/census-dates-kh/` ("Census Dates in 2018 and after that") and `/census-dates/` ("Census Dates older than 2018") (route files, `force-dynamic`): `CensusView` renders the hero, the census explanation (`censusCopy.tsx`) and a GET form of four selects (campus, course, intake, semester; `CensusPicker.client.tsx` clears the lower selects and submits on change, a no-script button otherwise), then the unit table (#, Year, Unit Code, Start Date, End Date, Census Date, EFTSL Value). Both read the same portal census (batches from 2018). Query values are validated ids (`idParam`); a value that is not among its level's options is dropped with the levels below it (`readCensus`, no query for it). Portal off → `PortalNotice`. `/ihna-census-dates/` is a content page linking the two.
- Old AJAX URLs (DEC-112; route handlers wrapped in `legacyRoute`, `src/lib/portal/legacy-endpoints.ts`, `force-dynamic`, JSON with the old keys and string values, `Cache-Control: public, max-age=300`, `X-Robots-Tag: noindex`). They share one rate limit, 30 requests per minute per IP (`rateLimit` bucket `portal-legacy`, 429 + `Retry-After`), and check every id against a cached list before any deeper read: the census levels (`readCensus`), the enabled course ids (HC endpoints) and `countriesAll` (agents). An id that is not in its list, or a value that is not an id, answers 404 (`{"error":"not_found"}`, `no-store`) without a portal query or a new cache entry; while a list is unavailable (portal off or down) the old empty answer is kept.
  - `/census-date-details-ajax/` and `/census-date-details/` (`?campus=&course=&batch=&semester=` → `courses`, `batches`, `semesters`, `details` by depth; bare GET → empty 200).
  - `/agent-details/?country=` (`{ partners }`, agency fields only, `Access-Control-Allow-Origin: *`; no country → `{ partners: [] }`).
  - `/hc-course-details/?course_id=&type_id=` (course name, code, category, refer_friend; the overview keys are empty: the portal overview HTML is not served, rule 5).
  - `/hc-course-transition/?course_id=&type_id=` (course name and code, `Access-Control-Allow-Origin: *`; credit transfers, pathways and transition text are empty: they live in WordPress tables).
- Cache refresh: `POST /api/revalidate/` with header `x-revalidate-secret: $REVALIDATE_SECRET` and body `{ "tags": ["portal:41"] }` (or `["portal"]`) → `revalidateTag(tag, 'max')`. `portal`, `portal:<id|calendar|countries|census|agents|packages|courses>` and `{ "all": true }` also call `revalidatePortal` (`all` and `portal` with no scope), which clears the 60 s negative cache for that scope (`tests/portal/revalidate-route.test.ts`).

## 6. Integrations
Env (read in `client.ts` and `format.ts`; defaults in brackets; `.env.example` values for this repo):
- `PORTAL_ENABLED` (`0`), `PORTAL_QUERY_TIMEOUT_MS` (3000; reads capped at 3000; the payments pool uses it uncapped, default 5000), `PORTAL_TZ` (`Australia/Melbourne`)
- `PORTAL_DB_HOST` (`127.0.0.1`), `PORTAL_DB_PORT` (3306; `.env.example` 3308, the fixture container), `PORTAL_DB_NAME` (`.env.example` `ihna_portal`). Set `PORTAL_DB_NAME` in every environment: the shared `client.ts` default is ihm-web's database name.
- Read user: `PORTAL_DB_RO_USER` / `PORTAL_DB_RO_PASSWORD` (aliases `PORTAL_DB_READ_USER` / `PORTAL_DB_READ_PASSWORD`). The read config uses `??`, so an empty `PORTAL_DB_RO_USER=` line (as `.env.example` ships) counts as set and hides the alias: fill it in, or delete the line to use the alias. `PORTAL_DB_HOST`, `PORTAL_DB_PORT` and `PORTAL_DB_NAME` also use `??`: an empty line overrides the default.
- Payments user: `PORTAL_DB_PAY_USER` / `PORTAL_DB_PAY_PASSWORD` (aliases `PORTAL_DB_PAYMENTS_USER` / `PORTAL_DB_PAYMENTS_PASSWORD`; an empty `PORTAL_DB_PAY_*=` line counts as unset and falls back to the alias, `tests/portal/pay-user-alias.test.ts`); see 45-payments.
- Signed invoice links: `PORTAL_INVOICE_LINK_KEY`, `PORTAL_INVOICE_LINK_MAX_DAYS` (45 §4).
- Legacy endpoint rate limit: `RATE_LIMIT_STORE` (memory in dev/test, postgres in production, DEC-54).

Users: **read** = `SELECT` only; **payments** = `SELECT, INSERT` and column-level `UPDATE` on `payments` only, no `DELETE`.

Docker (dev and tests only): `portal-mysql` (`mysql:8`, host port 3308, database `ihna_portal`, root `root`, read user `portal_ro`/`portal_ro`) in `docker-compose.yml`. `bash docker/portal-fixtures/load.sh` (container `ihna-web-portal-mysql-1`, database `ihna_portal`) loads `schema.sql`, `data.sql`, `ihna.schema.sql`, `ihna.data.sql`, `payments.schema.sql`, `payments.data.sql`, restricts `portal_ro` to `SELECT`, and creates `portal_pay`/`portal_pay` with the payments grants. The schema files are provisional (column names follow the old PHP queries).
- `schema.sql` + `data.sql`: the shared Q1–Q5 fixture (synthetic batches reproducing recorded census tables, plus synthetic 9xxx courses for every Q1/Q2/Q3 branch).
- `ihna.schema.sql` + `ihna.data.sql`: the IHNA tables and hand-written synthetic rows (no real people; agencies "Fixture …", emails `example.test`), dated for `today = 2026-10-16`: campuses 5 and 8, course 363 (Diploma of Nursing) at campus 8 with intakes, calendar and census units, courses 92xx, the six `ihna_web_packages`, agents 95xx, documents, invoices 99xx; plus dev start dates (batches 62xx/63xx) for the 13 other KH ids of the IHNA course pages, so CourseDetail shows dates with `PORTAL_ENABLED=1`.

## 7. Import / seed
- `npm run import -- course-live` (`scripts/import/steps/course-live.ts`) reads each live course page's `course_id` form field (the brochure form, else the quick-enquiry form) into `scripts/import/out/ihna-course-live.json`. `npm run import -- wp-courses` (`scripts/import/ihna/wp-courses.ts`) sets `courses.khId` and `khIdSource: 'scrape'` from it; a course without one gets `khId: null` and `reviewStatus: kh-unresolved`. It sets `showStartDates` on the courses whose live body has a "Course Start Date(s)" tab (the portal's own output, dropped from the body). Report `scripts/import/out/khid.report.json`: 21 courses, 17 resolved (14 distinct KH ids), 4 unresolved. DEC-8, DEC-7.
- `npx tsx scripts/import/fixtures/portal/build-fixtures.ts` regenerates the shared fixture `docker/portal-fixtures/data.sql` and the recorded census tables `scripts/import/fixtures/portal/census/<slug>.json` (10 courses, `asOf` 2026-10-16) and `fixture-courses.json` from ihm-web's course inventory (`../inventory/data/ihm/courses.json`, see SHARED-FILES.md). Idempotent. `SYNTHETIC_KH_IDS` never reach Payload. `ihna.data.sql` is hand-written.

## 8. Acceptance checks
`npm run test:int` runs `tests/portal/**`. The fixture-DB tests need `docker compose up -d portal-mysql && bash docker/portal-fixtures/load.sh`.
1. `tests/portal/queries.test.ts` (fixture DB): Q2 reproduces the recorded census table for all 10 fixture courses (plus snapshot; `osce-for-rns` is the empty case); census edge rules; Q1 branches (domestic, international, kh 29, excluded rows, `mode` filter); the combined Q1 equals the six per-campus WHERE clauses of the old queries; Q3/Q4/Q5; a slow query is stopped at the timeout; the read user cannot write.
2. `tests/portal/ihna-queries.test.ts` (fixture DB, plus snapshot): intake dates (campus 8, semester 0/1; other-campus, hidden, semester 2 and past rows excluded); Q3 campus 8 by default; census pickers and unit table incl. missing dates, per-student rows ignored, legacy JSON per depth; `idParam` rejects injection strings; all countries; packages; agents (expiry, type, association, DISTINCT, no partner-staff data); handbook URL; HC course row and course by kh id with its code; HC course ids = enabled courses only; invoice amount incl. surcharge; signed links refused without a key, with a wrong signature, expired or too long-lived.
3. `tests/portal/legacy-endpoints.test.ts` (fixture DB): unknown or disabled HC course ids, unknown countries and census values that are not options of the level above answer 404 without the deeper query; the 31st request in a minute → 429 with `Retry-After`.
4. `tests/portal/timeout.test.ts`: hung query or connect → `PortalUnavailable` within the timeout; connections released or destroyed, never leaked; 3 s cap; the public API returns `{ unavailable: true }` and never throws.
5. `tests/portal/cache.test.ts`: tags `portal` + `portal:<khId>`, `revalidate: 900`, key changes with `today`, calendar/countries tags, 60 s negative cache within `NEGATIVE_MAX_KEYS`, one bundle per course and day, `revalidatePortal`. `tests/portal/revalidate-route.test.ts`: the route clears the negative cache per scope.
6. `tests/portal/disabled.test.ts`: with `PORTAL_ENABLED=0` every read is a synchronous `{ unavailable: true }`, no pool is created, and the three date blocks render "Dates coming soon".
7. `tests/portal/format.test.ts`: Melbourne `today`, formats, census columns, calendar colour/contrast, labels.
8. `tests/portal/no-raw-sql.test.ts`: no template-literal or concatenated SQL in `src/lib/portal`; `mysql2` imported only by `client.ts` and (type only) `queries.ts`; no database-qualified table names in `src`. `tests/portal/pay-user-alias.test.ts`: empty PAY lines fall back to the aliases.
9. `tests/payments/portal-user.test.ts`: payments user grants (no DELETE, no other table, column-limited UPDATE).
10. `tests/collections/courses.test.ts`: `showStartDates` defaults to false. In the dev DB: `psql -h 127.0.0.1 -p 5432 -U postgres -d ihna -Atc "select count(*), count(kh_id), count(*) filter (where show_start_dates) from courses"` → `21|17|16`.
11. Route statuses on the dev server (`npm run dev -- -p 3001`): `/monthly-calendar/`, `/course-calendar/`, `/census-dates-kh/`, `/census-dates/`, `/ihna-census-dates/`, `/census-date-details/`, `/census-date-details-ajax/`, `/agent-details/`, `/hc-course-details/`, `/hc-course-transition/` each answer 200 (`curl -s -o /dev/null -w '%{http_code}' http://localhost:3001<path>`); all ten are OK in `scripts/parity/out/parity-ihna.csv`. With the portal on, `/agent-details/?country=1%20OR%201=1` and `/hc-course-details/?course_id=999999` answer 404.

## 9. Differences from ihm-web
`client.ts` and `payments-write.ts` are shared (`SHARED-FILES.md`); `format.ts` and `index.ts` hold the same code as ihm-web's; `cache.ts` and `types.ts` carry the IHNA additions below; `queries.ts`, `ihna.ts` and `legacy-endpoints.ts` are site-specific.
- IHNA reads `ihna_portal` with Q1–Q13 (Q5 also returns `course_code`); ihm-web reads `ihmedu_portal` with Q1–Q5 only.
- `ihna.ts` and `legacy-endpoints.ts` (unit census, agent directory, HC course rows, signed invoice links, the four old AJAX URLs) exist only on IHNA.
- The intake calendar and Q6 read campus 8 only; ihm-web's calendar reads every campus.
- Cache scopes add `census`, `agents`, `packages`, `courses`, and the negative cache is bounded at 1000 keys; ihm-web has `calendar` and `countries` only and no bound.
- KH ids come from the live course pages (`course-live` step); ihm-web's come from evidence in its old theme (`scripts/import/kh-id.ts`).
- Fixture container on 3308 with the extra `ihna.*.sql` files; ihm-web's is on 3307.

## 10. Open questions
1. Live `ihna_portal` access (blocked): read and payments users, MySQL version, server timezone, `SHOW CREATE TABLE` for the tables in §2 (the fixture schemas are provisional), and which campus id 8 is (the calendar and intake dates read only it).
2. kh_id for the 4 unresolved courses: needs the WordPress database dump (`khIdSource: 'dump'`), DEC-8.
3. Owner decision before `PORTAL_ENABLED=1` in production: agent directory contact fields. `/agent-details/` publishes each agency's `web_name`, `web_email` and `web_phone_number` with `Access-Control-Allow-Origin: *`, as the live page does (never the partner staff person). For a sole-trader agent these may name a person; the safe default is to omit `web_name` / `web_email` until the owner confirms they are public.
4. `/hc-course-details/` and `/hc-course-transition/`: serve the portal course overviews (HTML in `course_overviews`) after an html-to-blocks import, or keep the keys empty? Keep these endpoints at all?
5. Legacy census rows (`wp_census_dates`, the source of the live `/census-dates/` "older than 2018" page) and the HC transition tables (`wp_existing_*`, `wp_ah_course_units`, `wp_transition_outs`) live in the WordPress database: blocked on its dump. `/census-dates/` shows the portal census from 2018 until then.
