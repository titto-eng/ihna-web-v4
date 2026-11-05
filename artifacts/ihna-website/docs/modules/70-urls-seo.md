# 70 — URLs, redirects, SEO (ihna-web)

## 1. Purpose
Every live URL of ihna.edu.au answers at the same path with the same outcome (AGENTS.md rule 1, DEC-10). This module owns the request order, exact redirects, the trailing-slash rules, page metadata, JSON-LD, `/sitemap.xml`, `/robots.txt`, `/wp-sitemap.xml`, the legacy image and document URL handlers, the static stand-ins, and the parity crawl.

## 2. Data model
- **Exact redirects:** `src/content/redirects.ts`, `Redirect = { from, to, permanent, note }`, 27 rows: 6 `permanent: true` (301), 21 `false` (302), each the status live answers (DEC-30, DEC-64). `next.config.ts` `redirects()` maps them with `statusCode: 301 | 302` (not Next's 308/307). Paths without an extension are written with their trailing slash.
- **Prefix and substring rules:** `src/lib/legacy-redirects.ts` (`LEGACY_RULES`, `LEGACY_EXCEPTIONS`, `matchLegacyRule`, matched on the lower-cased path), run by `src/proxy.ts`. Both lists are empty (DEC-108): the old theme's `header.php` "URL contains" rules ran only for WordPress URLs, so a substring rule would catch live landing pages such as `/study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability/`.
- **Trailing slash:** `src/lib/trailing-slash.ts` (`trailingSlashRedirects(except)`), `site.postWithoutSlash` (`['/airwallex-webhook']`) in `src/content/site.ts`.
- **Page registry:** `src/content/pages.ts` (`PageEntry`: `path`, `title` (the live `<title>` without the " – Welcome to IHNA" suffix), `template`, `section?`, `noindex?`, `description?`, `route?`, `text?`). 151 rows, 21 of them `noindex: true`, 11 `route: 'existing'` (pages another module renders, e.g. `/blog/`, `/news/`, `/payment-options/`). One row per hardcoded route file under `src/app/(site)/`; `tests/seo/page-files.test.ts` checks both directions. Feeds the sitemap, `/search/`, the hubs and the section navs. Each route file sets its own `metadata` with `pageMetadata()`.
- **Landing registry:** `src/content/landing.ts`, 38 rows, each with `noindex`; only `/study-at-ihna/flinders-pathways/` is `noindex: false` (the only landing page in the old `sitemap.xml`). Landing route files use `landingMetadata(path)` (`src/components/templates/landing/pages.tsx`).
- **Staff profile URLs:** `src/content/staff-paths.ts` is empty; IHNA profiles are `/staff-profile/?id=N` (DEC-65, DEC-111).
- **Site SEO constants:** `src/content/site.ts`: `siteName` ("Institute of Health and Nursing Australia"), `titleTemplate: '%s | IHNA'`, `defaultDescription`, `defaultOgImage: null`, `logo: null`.
- **Courses and posts:** plugin-seo `meta` group (`title`, `description`, `image`; `generateTitle` = the bare title (the suffix comes from `site.titleTemplate` at render), `generateURL` = `NEXT_PUBLIC_SITE_URL` + path, `src/payload.config.ts`) and the `seo` group from `seoExtras()` in `src/collections/shared/fields.ts` (`noindex`, `canonical`, `structuredData` JSON). `path` is computed on save: courses `/courses/<slug>/` (`courseUrl`, `src/lib/paths.ts`); posts by `postPathOf` (`src/lib/blog-paths.ts`): `/blog/<urlDate>/<slug>/` when `urlDate` (`YYYY/MM`) is set, else `/blog/<slug>/` (DEC-104). The shared `news` post category (`/news/<slug>/`) holds no IHNA post.
- **`media.legacyPath`:** the original `wp-content/uploads/...` path (unique), used by the uploads handler.
- **`documents.publicPath`:** unique, under one of `DOCUMENT_PREFIXES` (`/pdf/`, `/ihna-policies/`, `/ihna-procedures/`, `/IHNA_International_Course_Guide/`, `/alumni/docs/`, `/wp-content/uploads/pdf/`, `/wp-content/uploads/guides/`, `/brochures/`), ending `.pdf`, stored decoded (DEC-68). `DOCUMENT_ALIASES` (an old file name served with 200 from another document) is empty. Both are site constants in `src/content/documents.ts`, re-exported by `src/collections/Documents.ts`.
- **Static stand-ins** (DEC-113): `src/content/static-paths.ts`: `UNAVAILABLE_DEMO_PATHS` (the 18 live `demo/` pages) and `EMPTY_200_PATHS` (`/RDynamics.php`, `/campaign_codes.php`, `/e2btns.php`). The inactive landing stubs answer through `src/components/templates/landing/stub.ts` (60-landing).
- **News archive:** `src/content/news.ts` (`newsListing`, `source: 'items'`): the four WordPress posts at the site root, each a route file (DEC-42).

## 3. Admin capabilities
- Marketing edits `meta` (title, description, image) and `seo` (`noindex`, `canonical`, `structuredData`) on courses and posts.
- A published course or post keeps its URL. `refuseUrlChange` (`src/collections/shared/hooks.ts`) rejects a save that would publish a different `path` ("A live URL never changes"), including a change of `posts.urlDate`. To rename, a developer adds the old URL to `src/content/redirects.ts`, deploys, then saves with `context.allowUrlChange`. `context.importing` also bypasses. `assertPathFree` rejects a path that another document in the same collection already uses.
- Documents: marketing uploads a replacement file and the URL stays the same. Marketing sets `publicPath` on create; only admin can change it later (`docs/HOW-TO-REPLACE-A-POLICY-PDF.md`).
- Redirects, page titles and descriptions, landing pages, news items and stand-ins are code. A developer edits the file and deploys.

## 4. Front-end behaviour
**Trailing slashes:** `trailingSlash: true`. An extensionless path without a slash gets one 308 to the slashed path; a slashed path answers itself. Paths with an extension (`.pdf`, `.php`, `.html`) never get a slash, and `/file.ext/` 308s to `/file.ext`. The query string never affects routing. Next's built-in slash redirects are off (`skipTrailingSlashRedirect`); `next.config.ts` lists the same two rules first in `redirects()` (`trailingSlashRedirects`), leaving out the paths of `site.postWithoutSlash` (`/airwallex-webhook`): the proxy rewrites a POST there to the slashed route with its body and 308s every other method (45 §5). `tests/payments/webhook-slash.test.ts` compiles both rule sets with Next's route builder and checks that they redirect the same paths and that no slashed path redirects to itself.

**Request order:**
1. `next.config.ts` redirects: the trailing slash first (`trailingSlashRedirects`), then `redirects.ts` (query kept). Then the `beforeFiles` rewrite of `/payway-response/?EncryptedParameters=…` to the PayWay return handler (45).
2. `src/proxy.ts`, on every path except `_next/static`, `_next/image`, `favicon.ico`, `media/` and `api/media/`:
   - A `site.postWithoutSlash` path: POST is rewritten to the slashed route, any other method 308s.
   - `/wp-json`, `/xmlrpc.php`, `/wp-login.php` and `/wp-admin` (and below) → 410 (DEC-58).
   - `/admin` guard (see 90).
   - `matchLegacyRule` (no rules).
   - A `.pdf` under one of `DOCUMENT_PREFIXES` is rewritten to `/pdf/~<path>`, so the `documents` collection answers before a static copy in `public/`.
   - `/wp-content/uploads/*` passes through untouched.
   - Everything else gets the security headers and CSP (90).
3. A route file under `src/app/(site)/`: a hardcoded page, a landing page (`/study-at-ihna/…`, `/healthcare-courses-*/`, `/walkin-*/`, `/lp/…`, 60-landing), `courses/[slug]`, `blog/[[...parts]]`, `news/[[...parts]]`, `demo/[...path]`, or a stand-in route.
4. The catch-all `src/app/(site)/[...slug]/page.tsx` serves only the keys of `staff-paths.ts` (none), so every other path gets `notFound()`, a real 404.

Config redirects run before every route, so a `from` in `redirects.ts` must never equal a route file's path.

**Metadata:**
- **Hardcoded pages:** `pageMetadata({ title, path, metaTitle?, description?, noindex?, canonical?, image? })` (`src/components/page/metadata.ts`) calls `buildMetadata` (`src/lib/seo/metadata.ts`) with `site`. That sets:
  - `<title>`: `site.titleTemplate` applied to `metaTitle || title`, as an absolute title.
  - description: the given one, else `site.defaultDescription`.
  - canonical: `NEXT_PUBLIC_SITE_URL` + path with the query stripped, or `canonical`.
  - OG and Twitter: OG image from `image`, else `site.defaultOgImage` (`null`, so no default image). `og:locale` is `en_AU`.
- **Landing pages:** `landingMetadata(path, extra?)` calls the same builder with the registry row (`metaTitle`, `description`, `canonical`) and the row's `noindex`; `extra.noindex: true` forces noindex (campaign-suffix URLs). Landing thank-you URLs are always noindex (60-landing).
- **Robots (`resolveRobots`, shared with the sitemap):**
  - `NEXT_PUBLIC_ROBOTS=noindex` → noindex,nofollow.
  - `/search/` → noindex,follow.
  - `noindex` set → noindex,nofollow.
  - `/lp/*` and `/enquirenow/*` → noindex unless the doc passes `noindex: false`.
- **Courses and posts:** `generateMetadata` in `src/app/(site)/courses/[slug]/page.tsx` and `blogMetadata` in `src/components/templates/blogRoute.tsx` pass the document to `getSeoMetadata` (`src/lib/seo/get-metadata.ts`, `buildMetadata` with `site`):
  - title `meta.title || title` through `site.titleTemplate` (one ` | IHNA`).
  - description `meta.description || excerpt`, else `site.defaultDescription`.
  - canonical `seo.canonical || path` (so a blog alias URL canonicalises to the live URL); robots from `resolveRobots` (`seo.noindex`, `NEXT_PUBLIC_ROBOTS`).
  - OG type `website` for courses; `article` for posts, with `publishedTime`, `modifiedTime` and the hero image.
  - Blog listing: the registry title ("IHNA Blogs") plus "(page N)", with a canonical for each page. `/news/`: `newsListing.metaTitle`.
- **Layout** (`src/app/(site)/layout.tsx`): `metadataBase` = `NEXT_PUBLIC_SITE_URL`, default title `site.siteName`, template `site.titleTemplate`.

**JSON-LD:** the builders are in `src/lib/seo/jsonld.ts` and the components in `src/components/seo/`. The Home, Course, Post and breadcrumb types render through `<JsonLd>`, which escapes `<` (`safeJsonLd`) and renders nothing for empty data. `FAQPage` is rendered as a `<script type="application/ld+json">` with `safeJsonLd` in `src/blocks/accordion/Component.tsx` and `src/components/page/blocks.tsx` (`Accordion`) when at least one item has answer text (DEC-26).

| Where | Types |
|---|---|
| Home (`HomePage`, `src/components/templates/pages.tsx`) | `EducationalOrganization` (name, url, phone, email, `sameAs` from the footer social links) + `WebSite` with a `SearchAction` to `/search/?q=` |
| Course (`CourseDetail`) | `Course` (`courseCode`, provider, `hasCourseInstance` from the portal start dates when `khId` is set and `showStartDates` is true, DEC-7) + `BreadcrumbList` Home › Courses › X |
| Post (`BlogPost`) | `BlogPosting` + `BreadcrumbList` Home › Blog › X |
| Accordion block and the `Accordion` page component, any variant except `plain` | `FAQPage` built from the items that have answer text |

`seo.structuredData` is merged into `Course` and `BlogPosting`. It cannot change `@type`.

**Revalidation:**
- Publishing a course or post revalidates its collection tags, its doc tag and `sitemap`.
- A `documents` change expires `documents`, `collection:documents` and `document:<publicPath>` at once.
- `POST /api/revalidate/` (header `x-revalidate-secret`) takes `tags`, `paths` or `all`; the import CLI calls it after every step (DEC-33).
- Code pages change on deploy.

## 5. URLs
- **`../inventory/v2/ihna/pages.csv`:** 511 rows: 466 distinct paths plus 45 query variants (all `/all-events/?campus=…`). Query variants answer like their path, and canonicals drop the query. 400 rows are not `sitemap-only` and must answer 200.
- **`../inventory/v2/ihna/landing-pages.csv`:** 391 rows (`live` 75, `gone` 295, `redirected` 15, `live-stub` 4, `forbidden-403` 1, `not-checked` 1).
- **`redirects.ts` (27 rows):**

| Group | Rows |
|---|---|
| `header.php` rules whose target is live, at the exact URL each answers on live (DEC-108) | `/international-policies/` → `/policies-links-forms/` 302, `/industry-partnerships/` → `/industry/` 302, `/courses/hltaid011-provide-first-aid/` → `/courses/provide-first-aid/` 301, `/courses/certificate-iii-individual-support-ageing-disability/` and its `-int/` twin → `/courses/certificate-iii-in-individual-support-ageing-and-disability/` 302 |
| `functions.php` and server rules | `/ihna-global-covid-nursing-award/` and `/awards/` → `/awards-and-rankings-ihna/` 301 (one hop), `/clp/diploma-of-nursing/` → `/courses/diploma-of-nursing/` 301 |
| Old landing pages → `/domestic-students/` (17 rows, 302 as live) | the 12 `/study-at-ihna/*-int.php`, `/healthcare-courses-ballarat/`, `…/courses.php`, `…/courses/`, `/healthcare-courses-bendigo/`, `…/courses.php` |
| Blog URLs of the old sitemap that no post answers (301) | `/blog/2014/06/ihna-represented-at-amsterdam-for-the-netnep-conference-5th-international-nurse-education-conference/` → the post `…-5th-international-nurse-conference/` (slug typo); `/blog/2021/10/what-is-the-difference-between-the-two-qualifications-…-health-administration/` → `/blog/` (post not in the blog) |

  The other 10 `header.php` rules point at pages that are 404 on live and are not listed (DEC-31).
- **Blog** (`blog/[[...parts]]`, `src/lib/blog-paths.ts`, DEC-104): a post answers at its stored live URL (`path`): `/blog/YYYY/MM/<slug>/` (172 posts) or `/blog/<slug>/` (14). The other shape is an alias rendered with 200 and the canonical on the live URL: `/blog/<slug>/` for a dated post, `/blog/<YYYY/MM of publishedAt, Melbourne>/<slug>/` for a flat one (`postAliasPath`). Any other date in the URL is a 404. The sitemap lists `path` only. `/blog/` lists published posts, 10 per page (`/blog/page/N/`), with `?title=` search; a page number past the last, up to 6, 308s to the last page. `/blog/thanks/` is the noindex thank-you of `blog-enquiry`; `/latest-blogs/` shows the newest three. `/blog/category/…` has no route (404, as live). `/feed/` is RSS 2.0 of the 20 newest posts (`src/lib/seo/rss.ts`).
- **News** (DEC-39, DEC-42): `/news/` (`news/[[...parts]]`) and the WordPress category archive `/category/india/news/` list the four root news pages of `src/content/news.ts`; `/news/page/N/` and `/news/<slug>/` are 404.
- **Galleries** (DEC-105): `/all-events/` accepts `?campus=<App Runner campus id>` (or a campus key) and `?year=`; each gallery's anchor is its App Runner id (`#<id>`).
- **Staff profiles** (DEC-111): `/staff-profile/?id=N`; an unknown or missing id lists the staff (200).
- **Static stand-ins** (DEC-113): the 18 `demo/` URLs answer a noindex "Page not available" page (`src/app/(site)/demo/[...path]/page.tsx`); other `/demo/` URLs 404. The 3 PHP include URLs answer an empty 200 with `X-Robots-Tag: noindex` (`src/lib/empty-200.ts`, one route file each), never their source. `/moodletest/` and `/goto-postsurvey/` are noindex utility pages. Store folders (`/pdf/`, `/ihna-policies/`, …) answer 404 where live answers 403.
- **404 URLs:** a path with no route returns 404. This covers the 295 `gone` rows in `landing-pages.csv`, `/makepayment/` (DEC-45) and the store folders.
- **Document URLs** (a `.pdf` under `DOCUMENT_PREFIXES`): the proxy rewrites them to `src/app/(site)/pdf/[...path]/route.ts`, which calls `serveDocumentPath` (`serve.ts`). Lookup order:
  1. A `documents` row whose `publicPath` (or alias) matches. Its stored file under `media/documents` is served with 200 `application/pdf`, `inline`, an ETag (304 on a matching `If-None-Match`) and `Cache-Control: public, max-age=0, must-revalidate`. A row whose file is not on local disk is re-read from the database, then fetched from Payload's file endpoint (cloud storage).
  2. Otherwise the static copy under `public/`.
  3. Otherwise 404 (`Cache-Control: public, max-age=60`).

  `publicPathOf` rejects `.`/`..`/slash/backslash/NUL segments, foreign prefixes and non-PDF names. `fileInside` refuses files that resolve outside their root (symlinks resolved). The index (`getDocumentIndex`, `src/app/(site)/pdf/documents.ts`) is cached under the document tags for 24 h. `/policies-links-forms/` links the policy and procedure documents (DEC-68).
- **`/wp-content/uploads/<path>`** (DEC-59): `src/app/(site)/wp-content/uploads/[...path]/route.ts` calls `handleLegacyMedia` (`src/app/api/legacy-media/handler.ts`).
  - It looks up `media.legacyPath`, then the WordPress look-alikes (`-WxH`, `-scaled`, `-e<digits>`).
  - A hit answers 301 to `/api/media/file/<filename>` (cached 1 h).
  - No hit answers 404 (cached 60 s). A failed lookup answers 503.
  - PDFs under `/wp-content/uploads/pdf/` and `/guides/` are documents (above).
- **`/sitemap.xml`** (`src/app/(site)/sitemap.xml/route.ts`, built by `src/lib/seo/sitemap.ts` and `sitemap-data.ts`):
  - One urlset. `loc` = `NEXT_PUBLIC_SITE_URL` + path. `lastmod` = `updatedAt`, or the server start time for code pages and landing rows.
  - Entries are cached under tag `sitemap` and refreshed hourly. The response sends `s-maxage=3600, stale-while-revalidate=86400`.
  - In: `pages.ts` rows without `noindex`, published courses and posts without `seo.noindex`, and landing rows with `noindex: false`.
  - Out (`EXCLUDED_PATH`): the payment paths (`airwallex`, `payway`, `secure-pay`, `pay-online`, `makepayment`, `make-a-payment`, `pay`), `search`, `alumni/login`, thank-you paths, `/page/N/` and `/courses/test-N/` (DEC-34, matches nothing on IHNA).
  - Documents are not listed.
- **`/robots.txt`** (`src/app/(site)/robots.txt/route.ts`, `src/lib/seo/robots.ts`, read per request):
  - Production: `Allow: /`, `Allow: /api/media/`, `Disallow:` `/admin/`, `/api/`, `/pay/` and `/search/`, then `Sitemap:`.
  - With `NEXT_PUBLIC_ROBOTS=noindex`: only `Disallow: /`.
- **`/wp-sitemap.xml`** (`src/app/(site)/wp-sitemap.xml/route.ts`): a sitemap index naming `/sitemap.xml` (the URL answers 200 on live as WordPress's sitemap index).

## 6. Integrations
- Env: `NEXT_PUBLIC_SITE_URL` (origin for canonicals, OG, sitemap and robots; default `http://localhost:3001`), `NEXT_PUBLIC_ROBOTS` (`index|noindex`), `REVALIDATE_SECRET`.
- The course JSON-LD reads the portal start dates (50-portal-data). Nothing else calls out at runtime.

## 7. Import / seed
- The media import writes `media.legacyPath` (895 rows). `scripts/import/steps/documents.ts` creates one `documents` row per PDF of the static stores (167 rows), skips the paths in `scripts/import/seeds/static-held.json` (DEC-32) and the alias names, and never replaces a file without `--force`.
- `npm run import -- apprunner` writes post `meta.title` / `meta.description` from App Runner's `meta_title` / `meta_description` (171 / 170 of 186 posts). No step writes course `meta`, so course titles and descriptions fall back to `title` and `excerpt`.

**Parity crawl:** `scripts/parity/crawl.ts` (shared, SHARED-FILES.md), run as `npm run parity -- [--site=ihna] [--new-origin=<url>] [--limit=N] [--only=<substring>] [--refresh] [--reuse-new]`. `--site` defaults to the repo's site (`SITE` in `scripts/import/lib/config.ts`, `ihna`); the per-site wiring (origins, sources, skip pattern, title suffix) is the `SITES` table in the script, which also carries ihm-web's entry.
- **Inputs:**
  - `../inventory/v2/ihna/landing-pages.csv` (carries the expectations) and `../inventory/v2/ihna/pages.csv` (blog posts at their live shape). No extra URL list.
  - Each path is deduplicated without its trailing slash, and the query is dropped.
  - Skipped: other hosts; `/_AUTO_DEPLOYMENT/`, handler and `/api/` paths, and rows whose category names a thank-you. `.php` URLs are GET pages and are crawled.
  - It does not read `src/content/redirects.ts`. A 301 target is the landing row's `redirects_to`.
- **Live side** (`https://ihna.edu.au`):
  - GET only, one request per second (one global gate), User-Agent `Mozilla/5.0 (parity check)`.
  - Follows up to 4 redirects, 20 s timeout, and retries once after 15 s on 429/503.
  - Responses are cached in `scripts/parity/out/cache-live.json`; `--refresh` fetches them again.
- **New side** (`http://localhost:3001`, or `--new-origin`): follows up to 5 redirects, 4 requests at a time, 60 s timeout (the dev server compiles a route on its first request). Answers are cached in `scripts/parity/out/cache-new-ihna.json`; `--reuse-new` re-evaluates the last crawl from them (errors are fetched again).
- **Expectations:**

| Source row | Expected on the new site |
|---|---|
| Landing `gone` | 404 |
| Landing `live` with `recommendation=redirect` | 301 or 308 to `redirects_to` |
| Other landing `live` | 200 |
| Landing `redirected` | A redirect to the same final URL as live |
| `pages.csv` row that is not `sitemap-only` | 200 |
| `sitemap-only` rows | The live outcome |

  A trailing-slash hop counts as the same outcome. A live 5xx sets no expectation (`LIVE_5XX`, DEC-40). A key of `DOCUMENT_ALIASES` (none on IHNA) would be `OK` with `exp=alias200`. Titles are compared without the brand suffix ("– Welcome to IHNA", "- IHNA Alumni", the site name), and a live H1 that is the site name is ignored (DEC-38).
- **Accepted differences** (`scripts/parity/accept.ts`, pure, `tests/seo/parity-accept.test.ts`): a non-OK row that a site rule explains becomes `ACCEPTED`, its note starting `ACCEPTED(<rule>): <reason>; was <result>`. IHNA rules: `live-redirect-to-404`, `slash-form` (`/study-at-ihna/diploma-nursing-int/`), `demo-placeholder`, `payment-page` (a payment page whose title differs from live by design, 45-payments), `live-403-folder`, `blog-catch-all` (live answers an empty "IHNA Blogs" page for any `/blog/*`), `blog-template-title` (live titles every post "IHNA Blogs"), `empty-stub`.
- **Output:** `scripts/parity/out/parity-ihna.csv` with the columns `url,category,live_status,new_status,live_final,new_final,title_match,h1_match,result,note`.
  - The status columns hold the first response code.
  - `result`: `OK|ACCEPTED|STATUS_DIFF|TITLE_DIFF|REDIRECT_DIFF|NEW_ERROR`.
  - `note` flags include `H1_DIFF`, `CANONICAL_DIFF`, `LIVE_NO_TITLE`, `LIVE_H1_IS_LOGO`, `LIVE_5XX`, `LIVE_NOT_200`, `LIVE_ERROR` and `NEW_ERROR`.
- **Summary:** `scripts/parity/out/parity-ihna.summary.json` holds `results`, `accepted_by_rule`, `by_category` and `gate` (`expected_live_status_diff`, `gone_not_404`, `redirect_diff`, `new_error`). The current run: 821 targets; OK 599, ACCEPTED 222 (`blog-template-title` 186, `demo-placeholder` 17, `live-403-folder` 10, `payment-page` 4, `live-redirect-to-404` 2, `blog-catch-all` 2, `slash-form` 1), every other result 0.
- **Gate:** every `gate` counter is 0. `TITLE_DIFF` is report-only.

**Status sheet** (DEC-37): `npm run status-sheet` runs `../inventory/v2/status_sheet.py ihna` (through `scripts/dev/inventory-sheet.ts`), which refreshes `pages.csv` and `landing-pages.csv` status columns and the tracking sheet from the parity CSV, the CMS and the code registries; `npm run tracking-sheet` runs the tracking step alone. The tracking sheet (`TRACKING.csv`, 30-import §7.7) holds one row per URL plus `form`, `payment` and `integration` rows, each with an automatic `status` and the human QA columns `qa_status` (blank, `pass`, `fail`, `blocked`, `n/a`), `qa_by`, `qa_date`, `qa_notes`. Human QA results live in `../inventory/v2/ihna/QA.csv`, edited directly or in the QA columns of the workbook's `Tracking` sheet; each refresh reads the workbook's edits back into `QA.csv` before rewriting it, so no QA result is lost. The workbook's `QA checklist` sheet lists what to check per row type.

## 8. Acceptance checks
Against the dev server (`npm run dev -- -p 3001`) and the dev database `ihna`:
1. `curl -sI localhost:3001/about-us` → 308, `Location: /about-us/`; `/about-us/` → 200.
2. `curl -sI localhost:3001/industry-partnerships/` → 302 `/industry/`. `/courses/hltaid011-provide-first-aid/` → 301 `/courses/provide-first-aid/`. `/healthcare-courses-bendigo/` → 302 `/domestic-students/`.
3. `/study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability/` is not redirected (`tests/seo/ihna-shell.test.ts` also checks every redirect row: listed once, never to itself, slashed `from`).
4. `/wp-json/` and `/wp-login.php` → 410. `/makepayment/` → 404.
5. `/demo/landing-page/index.html` → 200 (noindex); `/demo/x.html` → 404; `/RDynamics.php` → 200, empty body.
6. A dated post answers at `/blog/YYYY/MM/<slug>/` (200), at `/blog/<slug>/` (200, canonical on the dated URL), and 404 at any other date. `psql -h 127.0.0.1 -p 5432 -U postgres -d ihna -Atc "select count(*), count(*) filter (where url_date<>'') from posts"` → `186|172`.
7. `tests/collections/courses.test.ts` and `tests/collections/posts.test.ts`: a published course or post cannot change its URL; `context.allowUrlChange` and `context.importing` bypass; a duplicate path is rejected; `urlDate` paths.
8. `tests/seo/metadata.test.ts`: fallbacks, canonical without query, OG image order, `noindex` rules, `NEXT_PUBLIC_ROBOTS=noindex`.
9. `tests/seo/jsonld.test.ts`: Course, BlogPosting, BreadcrumbList, Organization + WebSite, FAQPage, `<` escaped, no empty tag.
10. `tests/seo/sitemap.test.ts`: sitemap entries and exclusions, XML shape, robots for production and staging. `tests/seo/route-metadata.test.ts`: landing `noindex: false` is indexable, every landing `thankYouPath` has a route file, course and post metadata honour `seo.noindex`, `seo.canonical` and `NEXT_PUBLIC_ROBOTS=noindex`, one title suffix, `/payment-options/` out of the sitemap, Course JSON-LD reads start dates only when `showStartDates` is true.
11. `tests/legacy-media/legacy-media.test.ts`: `legacyPathOf`, look-alike candidates, resolution.
12. Documents: `tests/seo/document-urls.test.ts` and `tests/collections/documents.test.ts` pass; against the running server, `npx tsx scripts/dev/check-document-links.ts --base=http://localhost:3001 --all` exits 0.
13. With `NEXT_PUBLIC_ROBOTS=noindex`, `/robots.txt` is `User-agent: *` / `Disallow: /`. `/wp-sitemap.xml` → 200, one `<sitemap>` naming `/sitemap.xml`.
14. `tests/import/apprunner.test.ts`: blog URL shapes (`splitApiSlug`, `postPathOf`, `postAliasPath`, `parseBlogParts`, `servesPost`), the `?campus=` filter and the RSS builder.
15. `tests/payments/webhook-slash.test.ts`: the written-out slash rules redirect exactly as Next's own, except `/airwallex-webhook`; no slashed path redirects to itself.
16. `npm run parity -- --site=ihna`: every counter in `parity-ihna.summary.json` `gate` is 0 (current run: 821 targets, OK 599, ACCEPTED 222).

## 9. Differences from ihm-web
- The mechanisms (request order, redirects loader, documents, uploads handler, metadata, sitemap, robots, crawler) are shared; the site constants are IHNA's (`redirects.ts`, `documents.ts`, `static-paths.ts`, `news.ts`, `pages.ts`, `landing.ts`).
- IHNA has no prefix or substring rules (DEC-108); ihm-web's proxy runs `/enquirenow/*`, `learning-hub` and `emergency-services` rules.
- IHNA's exact redirects keep live's mix of 301 and 302; ihm-web's are all 301.
- IHNA writes the trailing-slash rules out (`src/lib/trailing-slash.ts`) to leave `/airwallex-webhook` POSTs alone; ihm-web uses Next's built-in slash redirects.
- IHNA blog posts keep dated live URLs with an alias shape (DEC-104) and add `/feed/`, `/latest-blogs/`, `/blog/thanks/`; ihm-web posts are `/blog/<slug>/`.
- IHNA serves `/wp-sitemap.xml`, the DEC-113 stand-ins and `/category/india/news/`; ihm-web has none of these. IHNA has no `/<person>/` staff URLs (DEC-65).
- The IHNA parity crawl crawls `.php` and thank-you URLs, has no extra URL list, and applies accept rules (`accept.ts`); ihm-web's skips them and has no accept rules.

## 10. Open questions
1. Keep the DEC-113 stand-ins (`demo/` pages, the 3 empty PHP URLs, the test and Moodle stubs) or let them 404: owner decision.
2. Keep 302 or switch to 301 for the 17 redirects to `/domestic-students/` (DEC-30): owner decision.
3. Landing pages are noindex except `/study-at-ihna/flinders-pathways/`: which should be indexed?
4. Course SEO titles and descriptions from WordPress postmeta need the WordPress database dump; no step reads it.
5. The live server rules (`.htaccess`, vhost) behind `/awards/`, `/clp/diploma-of-nursing/` and the `-int.php` / Ballarat / Bendigo 302s are not available; the redirects follow the live answers.
