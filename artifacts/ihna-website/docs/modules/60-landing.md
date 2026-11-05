# 60 — Landing pages

## 1. Purpose
Serve every live IHNA landing URL at its old path from route files (DEC-62): the campaign pages under `/study-at-ihna/` (domestic course and Diploma of Nursing city pages, the international `.php` pages, the enquiry and reception pages, the IHNA Expo page), `/healthcare-courses-adelaide/`, the Ballarat pages, `/walkin-enquiry/`, `/walkin-registration/` (the newer copy of the walk-in page: Brisbane added, preferred contact method instead of a message) and `/lp/ihna-enterpreneurship-program/`, each registered in `src/content/landing.ts`. Templates compose blocks around the route file's JSX; every form posts to `/api/enquire/` (40). Thank-you URLs keep their old handler paths (`thanks.php`, `-int-thanks.php`) because GTM counts conversions on them (80).

## 2. Data model
**Registry row** (`src/content/landing.ts`, `LandingEntry`, read with `landingAt(path)`, which also matches `aliases`; 38 rows):
- `path` (trailing slash, or the old `.php` name), `section` (`study-at-ihna` 30, `healthcare-courses` 5, `walkin` 2, `lp` 1), `slug`, `title`
- `template`: `CourseLanding` (18: 15 domestic course pages, flinders-pathways, 2 international `.php` pages) | `NursingCity` (8) | `Regional` (5: Adelaide and the 4 Ballarat pages) | `EnquiryPage` (3) | `EventInvite` (2: `IHNA-Expo/`, the entrepreneurship page) | `WalkIn` (2)
- `formKey` (a key in `src/content/forms.ts`), `thankYouPath` (`<page>thanks.php`, `<name>-int-thanks.php`, `/lp/<slug>/thanks.php`; 29 rows; `null` on the 9 pages whose form answers inline)
- `course` (CMS course slug, 24 rows), `campus` (CMS campus slug; no row sets one): course facts, brochure and start dates
- CRM keys used when the form has no picker (40): `courseCode`, `khId`, `campusKey`, `studentType`
- Attribution (41): `campaignFallback` (`lp_default`), `fixedCampaign` (`tollfree`), `hubspotCampaignSource` (the source the old page hard-coded)
- Form shaping: `formFields` (the fields of the form this page shows; the definition keeps the superset and the server validates against it) and `fieldOptions` (narrows a select, e.g. the campuses a page offers)
- `funding` (a note under the course facts, 10 rows), `aliases` (old `.htaccess` aliases with their own route file: `/study-at-ihna/diploma-nursing-int/`, `/healthcare-courses-ballarat/contact/`), `campaignSuffix` (`diploma-nursing-int.php`)
- `noindex` (only flinders-pathways is `false`), optional `canonical` (`contact1.php`), `metaTitle`, `description`; `applicationCourseId` (DEC-55; no IHNA row has one)

**Route file**: `export const metadata = landingMetadata(PATH)` and a default export rendering one of `CourseLandingPage | NursingCityPage | EnquiryLandingPage | EventInvitePage | RegionalPage | WalkInPage` from `src/components/templates/landing/pages.tsx` with `path`, `hero` (hero block props) and the JSX slots `lead`, `body`, `trail`; optional `ownForm` and `has`. Body JSX uses the authoring kit `src/components/page/` (`Rich`, `Pic`, `img`, `ImageText`, `Tabs`, `Accordion`, `CardGrid`, `Cta`; 20-blocks). The route files are the source: content changes are edits to them.

**Images** of the landing pages are files under `public/landing/<old path>` (216 files: png, webp, svg, jpg); `next.config.ts` allows `/landing/**` in `images.localPatterns`.

**Lazy route map** (`src/content/landing-routes.ts`): path → `import()` of the route file, used by the campaign-suffix routes. 38 entries, the registry paths.

**CMS reads** (`loadLanding` in `pages.tsx`): the published course by slug (`unstable_cache`, revalidated by `course:<slug>`, `collection:courses`, `courses`, 300 s) and the campus by slug.

## 3. Admin capabilities
None. A content change is an edit to the route file and a deploy. Enquiries from landing pages are found in the `enquiries` list by `formKey`, `pageUrl` or `campaignCode` (40).

## 4. Front-end behaviour
**Templates** (`src/components/templates/landing/`; slots in order):

| Template | Composition |
|---|---|
| `CourseLanding` | Hero (split; eyebrow "Course", or "RTO ID … · CRICOS …" from `site.organisation` for `studentType: 'international'`) → CourseFacts (row has a course) → funding note (domestic rows with `funding`) → *lead* → *body* with sticky sidebar form ("Enquire about this course") → *trail* → BrochureDownload (course has a brochure, page `has` none) → CTA banner "Ready to start?" → EnquiryForm card → sticky mobile CTA |
| `NursingCity` | Hero (split, eyebrow "Diploma of Nursing", plus "· <campus>" when the row names a campus) → funding note → *lead* → StartDates (course set, page `has` none) → *body* with sidebar form ("Let us know more about you") → *trail* → CTA "From aspiration to achievement" → EnquiryForm card → sticky mobile CTA |
| `EnquiryPage` | Hero (compact) → EnquiryForm card ("Your details") → *lead* → *body* → *trail* (no sticky CTA) |
| `EventInvite` | Hero (full) → *lead* → *body* → *trail* → EnquiryForm card ("Register your interest") → sticky "Register" CTA |
| `Regional` | Hero (compact) → "Quick enquiry" form card → *lead* (course cards) → *body* (why study, campuses) → *trail* (no sticky CTA) |
| `WalkIn` | Hero (compact) → form card (answers inline) → *body* |
| ThankYou view | Hero (compact, "Thank you") → next-steps message with the phone number, links to `/courses/` and `/`, an IHNA Online link → BrochureDownload when the URL has `?intent=brochure` and the course has a brochure |

`CampusBachelor` and `CampusMaster` are in the folder and used by no IHNA row.

- `heroBlock` (`shared.tsx`) turns a split hero into compact when there is no image or the heading is longer than 48 characters, and a full hero into compact without an image. A hero without CTAs gets "Enquire now" → `#enquiry-end`.
- `LandingForm` (`shared.tsx`) renders the page's form: the `enquiryForm` block, or, when the row has `formFields` / `fieldOptions`, the same client form with only those fields (hidden fields kept) and options. The sidebar form (`#enquiry`, lg and up) renders only when the page has a `body`; the end form is `#enquiry-end`.
- Campaign, UTM and click ids are read on the client (41), so the HTML does not vary.

**Companion routes** (logic in `src/components/templates/landing/route.tsx`):
- `<page>thanks.php` and the flat `<name>-int-thanks.php` (plus the extensionless `-int-thanks/` form targets): one route file each (`thanks.php/page.tsx`), rendering the ThankYou view for the registry page (`renderLandingThankYou`, `landingThankYouMetadata`: noindex, canonical to the URL served). `/lp/<slug>/thanks.php` is the generic `src/app/(site)/lp/[slug]/thanks.php/` route; `/lp/<slug>/thankyou.php` and `/lp/<slug>/thankyou/` answer only for an `EventInvite` row; `/lp/<slug>/index.php` 308s to `/lp/<slug>/`; `/lp/<slug>/application_form.php` answers only for a row with `applicationCourseId` (none on IHNA: 404).
- `index.php` of the self-post pages (`/study-at-ihna/course-enquiry/`, `course-enquiry-ihna/`, `tollfree/`, `domestic/course-enquiry/`, `/walkin-enquiry/`, `/walkin-registration/`): 308 to the page with the query kept (`redirectIndexPhp`).
- Aliases: `/study-at-ihna/diploma-nursing-int/` renders `diploma-nursing-int.php` (noindex, canonical to the `.php` URL); `/healthcare-courses-ballarat/contact/` renders `contact.php`.
- Campaign suffix: `/study-at-ihna/diploma-nursing-int/<code>/` and `/lp/<slug>/<code>/` render the base page with `CampaignCookie` (41); canonical to the base page, noindex; a malformed code 404s.
- Stubs (`stub.ts`, route handlers; DEC-113): `/study-at-ihna/course-enquiry/` ("URL trying to access is invalid"), `/study-at-ihna/test/` ("test"), `/study-at-ihna/domestic/certificate-iii-in-early-childhood-education-and-care-perth-funding/` and `/study-at-ihna/domestic/diploma-nursing-perth-Abiraj-BKP/` ("Not Active", also their `thanks.php`): 200, `text/plain`, `X-Robots-Tag: noindex, nofollow`, no page.
- `/healthcare-courses-ballarat/thanks/`: 302 to `/courses/`, as the old handler answers.
- `/study-at-ihna/domestic/phone_number_validation/`: a small noindex page (the old phone-widget test page).

**Forms on landing pages** post `pageUrl`; the server matches it (exact, with its trailing slash, or its parent path; aliases included) to the registry row of the posted form for the thank-you path, the CRM keys and the campaign fallback (40 §2, 41).

## 5. URLs
- 38 registry pages: 15 domestic course pages, 8 Diploma of Nursing pages, `IHNA-Expo/` and `course-enquiry/` under `/study-at-ihna/domestic/`; `/study-at-ihna/{flinders-pathways,course-enquiry-ihna,tollfree}/`; `/study-at-ihna/{certificate3-individual-suport-int,diploma-nursing-int}.php`; `/lp/ihna-enterpreneurship-program/`; `/healthcare-courses-adelaide/`; `/healthcare-courses-ballarat/{contact,contact1,courses1,courses2}.php`; `/walkin-enquiry/`, `/walkin-registration/`. Plus the 4 stubs, the utility page and the companions above.
- `../inventory/v2/ihna/landing-pages.csv` (391 rows): 75 `live` and 4 `live-stub` rows answer 200 (the landing rows here, plus the alumni, demo, PHP and static rows owned by other modules); the 15 `redirected` rows (the 12 `-int.php` pages and the Ballarat and Bendigo `courses.php`, 302 to `/domestic-students/`; `/clp/diploma-of-nursing/`, 301 to the course) are rows of `src/content/redirects.ts` (70); `gone` rows (old backups, `NOT_ACTIVE`, flipbooks) have no route and answer 404.
- Robots: landing pages are noindex unless the row has `noindex: false` (flinders-pathways, the only landing page in the old sitemap); thank-you, alias and campaign-suffix URLs are always noindex. Only `noindex: false` rows enter the sitemap (`src/lib/seo/sitemap-data.ts`).

## 6. Integrations
- `/api/enquire/` and the thank-you computation (40); campaign capture and attribution (41); course data blocks through `src/lib/portal/` (50).
- GTM on the thank-you URLs (80).
- Env: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `NEXT_PUBLIC_SITE_URL`.

## 7. Import / seed
None at run time: the route files and `public/landing/` are the source and are edited by hand. `scripts/dev/registry-json.ts` prints the registry as JSON for `npm run status-sheet`.

**Adding a landing page**
1. Create the route file at the exact old path as in §2. Images are `img({...})`/`Pic` references to `public/landing/` files or media; never write a form inline: the template mounts the form.
2. Add the row to `src/content/landing.ts` (`noindex: true` unless marketing asks otherwise; CRM keys and `campaignFallback: 'lp_default'`), the lazy import to `src/content/landing-routes.ts` and, when the row has a `thankYouPath`, a `thanks.php/page.tsx` companion.
3. A new form is a definition in `src/content/forms.ts` (40). A retired page keeps its URL through a row in `src/content/redirects.ts` (70), never a 404.

Form keys in use: `lp-hubspot-note` 21, `lp-course-enquiry` 7, `lp-dynamics` 3, `lp-ihna-online` 2, `walkin-enquiry` 2, `lp-hubspot` 1, `lp-kh-int` 1, `event-lp` 1.

## 8. Acceptance checks
Automated (`npm run test:int`):
1. `tests/seo/landing-routes.test.ts`: every registry row and alias has a route file rendering its path; `landing-routes.ts` holds exactly the registry paths; paths are unique and keep their slash or `.php` name; every row names a real form, its `formFields` exist and include every required field, its `fieldOptions` are the form's own options; CRM keys and campaign codes exist in the site tables; the stubs are route handlers; the self-post pages keep `index.php`.
2. `tests/seo/route-metadata.test.ts`: a `noindex: false` row is indexable, `noindex: true` is not; every `thankYouPath` has a route file.
3. `tests/seo/metadata.test.ts`, `tests/seo/sitemap.test.ts`: landing rows enter the sitemap only when `noindex` is `false`.
4. `tests/enquiries/ihna-forms.test.ts`, `tests/enquiries/thankyou-ratelimit.test.ts`: the landing thank-you wins, keeps `?campaign=` and applies only to the row's own form.

Manual against the dev server (`npm run dev -- -p 3001`):
5. Every registry page answers 200 (prints `38 200`): `npx tsx scripts/dev/registry-json.ts | python3 -c 'import json,sys; [print(r["path"]) for r in json.load(sys.stdin)["landing"]]' | while read -r p; do curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3001$p"; done | sort | uniq -c`. The same loop over `r["thankYouPath"]` (rows that have one) prints `29 200`.
6. `curl -s http://localhost:3001/study-at-ihna/test/` prints `test`; `/study-at-ihna/course-enquiry/` prints `URL trying to access is invalid`; `curl -sI http://localhost:3001/healthcare-courses-ballarat/thanks/` → 302 `/courses/`; `curl -sI 'http://localhost:3001/study-at-ihna/tollfree/index.php?campaign=x1'` → 308 `/study-at-ihna/tollfree/?campaign=x1`.
7. `/study-at-ihna/diploma-nursing-int/gamelb/` → 200, canonical `/study-at-ihna/diploma-nursing-int.php`, noindex, sets `ihna_attr`; `/study-at-ihna/diploma-nursing-int/x/` → 404.
8. A submission from a domestic course page, a Diploma of Nursing page and `diploma-nursing-int.php` stores an `enquiries` row with its `campaignCode` and `dry_run` deliveries whose recorded requests carry the attribution (41 §8.5); the e2e suite posts every landing key from its own page (40 §8.7).
9. `npm run parity -- --site=ihna`: the landing categories of `scripts/parity/out/parity-ihna.summary.json` (`landing:study-at-ihna/*`, `landing:lp`, `landing:healthcare-courses-*`, `landing:walkin-enquiry`) hold 220 URLs, 219 `OK` and 1 `ACCEPTED` (`/study-at-ihna/diploma-nursing-int/`, rule `slash-form`), no status, title or redirect diff.

## 9. Differences from ihm-web
- IHNA landing pages live at their old paths (`/study-at-ihna/...`, `/healthcare-courses-<city>/`, `/walkin-*/`, one `/lp/` page); ihm-web's 55 rows are all under `/lp/<slug>/` and `/enquirenow/`.
- IHNA adds the `NursingCity`, `Regional` and `WalkIn` templates, the international variant of `CourseLanding`, the funding note, `LandingForm` field subsets (`formFields`, `fieldOptions`), CRM keys and attribution keys on the rows, companions at any depth (ihm-web's only under `/lp/<slug>/`), the text stubs (`stub.ts`) and the `public/landing/` image folder.
- ihm-web serves `/lp/<slug>/application_form.php` for 8 rows (DEC-55); no IHNA row has one.
- `src/content/landing.ts`, `landing-routes.ts` and the route files are site-specific (`SHARED-FILES.md`).

## 10. Open questions
1. Robots: the old landing pages carry no robots meta (indexable) except the international, enquiry and walk-in pages; all rows but flinders-pathways are noindex. Which should be indexed (marketing)?
2. Which domestic pages are current ad destinations, and should the `V1/` variant and the stubs stay (their CSV rows say drop-after-traffic-check)?
3. Ballarat: the old forms capture nothing (the old handler redirects to `/courses/`); the pages post `lp-course-enquiry` with the `regional` group added. Keep, or mark the rows `redirect` with marketing?
4. flinders-pathways, course-enquiry-ihna and the 2023 entrepreneurship event page: keep or retire?
5. Keep the stubs and the utility page (DEC-113) or let them 404?
6. The route-file bodies keep the old pages' wording as plain text blocks; the key-facts strips and step graphics deserve a design pass (stats, steps, logo strip blocks).
7. Old cached landing HTML may still POST to `thanks.php` or `index.php`; those posts are not fed into the pipeline.
