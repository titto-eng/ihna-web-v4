# ihna-web — agent guide

Next.js 16 + Payload 3.91 (Postgres) site for **ihna.edu.au** (Institute of Health and Nursing Australia). Sister project
`../ihm-web` (ihm.edu.au) runs the same codebase; `SHARED-FILES.md` lists the paths both repos hold in common.
The inventory of the old site is `../inventory/` (read by scripts; do not redo it). The old WordPress repo is `../ihna-web-2.0/`
(read-only input for the import scripts).

## Goal
Every live URL of ihna.edu.au renders in the new design, with working enquiries and payments. Most of the site is code: route files
under `src/app/(site)/**` and constants under `src/content/`, edited by a developer and deployed. The CMS (`/admin`) holds what
changes often or is many: courses (including their key facts), blog posts, galleries, staff, media, documents (policy and form
PDFs), lookups, products, and the enquiry and payment records.

## Hard rules (a PR that breaks one is rejected)
1. **Never change a URL.** Every row in `../inventory/v2/ihna/pages.csv` whose `wp_type` is not `sitemap-only` is live and returns 200 at the same path; `sitemap-only` rows follow the parity crawl's live status. In `landing-pages.csv`, `live_status=live` rows return 200, or a 301 only when the row's `recommendation` is `redirect` and the target is in `src/content/redirects.ts`; `redirected` rows redirect to the same target with the same status; `gone` rows stay 404. A live URL never becomes a 404. Trailing slashes are kept (308 to the slashed form). A published course or post cannot change its URL (`refuseUrlChange`); add the old URL to `src/content/redirects.ts` first. A document's `publicPath` is its URL: only an admin can change it, and the old path then needs a redirect.
2. **Never drop a form submission or a payment record.** Save to Postgres first, then send. If saving fails, show the user an error.
3. **No secrets in code.** `.env` only. Scripts that read the old repo (`../ihna-web-2.0`) never copy a credential out of it.
4. **No personal data from the old repos** (CVs, uploaded files, error logs, agent emails, enquiry history) enters this repo or the import. Recipient addresses are typed by a person into `src/content/enquiry-routing.ts`, never copied from old code.
5. **No old HTML, CSS classes or inline styles reach the database or a page.** CMS content enters only as blocks produced by `scripts/import/html-to-blocks.ts`; code pages are plain JSX written with `src/components/page/` (`Hero`, `Rich`, `Tabs`, ...). No `dangerouslySetInnerHTML` with content, no theme class names. The one exception is JSON-LD through the escaped `safeJsonLd` helper (DEC-26).
6. **Every amount, price and payment id is set server-side.** The browser never decides what is charged.
7. **A module is done when its acceptance checks in `docs/modules/<n>.md` pass**, not when it compiles.

## Stack (fixed)
Next 16 App Router · Payload 3.91 (`@payloadcms/db-postgres` with `blocksAsJSON: true`; plugin: seo; email: Resend or SMTP via nodemailer) · Tailwind v4 only (tokens in `src/styles/theme.css`, the IHNA teal/orange palette) · shadcn/ui copied into `src/components/ui/` · react-hook-form + zod · `mysql2` for the portal DB `ihna_portal` · Payload built-in auth · vitest + Playwright · **npm** (not pnpm).
Payload API reference for agents: `.claude/skills/payload/SKILL.md`.

## Where things live
| What | Where | How to change it |
|---|---|---|
| A content page (`/about-us/`, `/governance/`, ...) | `src/app/(site)/<path>/page.tsx` | edit the JSX; `pageMetadata({...})` is the SEO |
| Home, schools, campuses, contact, calendar, staff directory, events, alumni hub | same, rendering a template from `src/components/templates/pages.tsx` (`HomePage`, `SchoolPage`, `CampusPage`, ...) | edit the JSX children / hero props |
| Landing pages (`/study-at-ihna/...`, `/healthcare-courses-*/`, `/walkin-enquiry/`, `/walkin-registration/`, `/lp/ihna-enterpreneurship-program/`) and their `thanks.php` companions | route files at those paths + rows in `src/content/landing.ts` and `landing-routes.ts` | edit the slots; the row holds the form, thank-you path and CRM keys |
| Page registry (sitemap, search, section navigation, hubs) | `src/content/pages.ts` | add a row for every new content page |
| Header nav, footer, site settings (phones, campus contacts, social links, WhatsApp, embed hosts, pay path) | `src/content/nav.ts`, `footer.ts`, `site.ts` | edit the constants |
| Tracking ids (GTM, Clarity, HubSpot EU1, LiveChat, Meta pixels) | `TRACKING_DEFAULTS` in `src/components/tracking/defaults.ts` (the ids in `site.tracking` are `null`; a non-null one overrides) | edit the constant (80) |
| The 30 enquiry forms, recipient groups, campaign codes and CRM reference tables | `src/content/forms.ts`, `enquiry-routing.ts`, `campaign-codes.ts`, `course-crm.ts`, `hubspot-map.ts`, `dynamics-map.ts` | edit; the browser never sees destinations |
| Payment site settings (pay path, PayWay provider, Skilldemy, Convera/Flywire links) | `src/content/payments.ts` | edit the constants (45) |
| Exact redirects (old URLs) | `src/content/redirects.ts` (loaded by `next.config.ts`) | add a row and restart; `src/lib/legacy-redirects.ts` holds prefix rules (none on IHNA) |
| Stand-ins for old URLs whose content is not carried over (`demo/` pages, empty PHP URLs) | `src/content/static-paths.ts` | edit the list (DEC-113) |
| `/news/` archive items | `src/content/news.ts` | edit the list |
| Courses (incl. key facts and fee text), blog posts, galleries, blog categories, staff, media, lookups, products | Payload `/admin` | marketing edits content; finance edits fee text and product prices |
| Policy, procedure and form PDFs at their old URLs | Payload `/admin` → Documents, served by `src/app/(site)/pdf/[...path]/route.ts` | marketing replaces the file (`docs/HOW-TO-REPLACE-A-POLICY-PDF.md`) |
| Portal-backed pages (start dates, census dates, calendars, agent list) | `src/lib/portal/` (`queries.ts`, `ihna.ts`, `legacy-endpoints.ts`) | code (50) |
| Enquiry records, payments, alumni, users | Payload `/admin` | system-written; staff read |

## Modules (`docs/modules/`)
| Doc | Owns |
|---|---|
| `00-architecture.md` | routes, proxy (`src/proxy.ts`), env, caching, storage, jobs, deploy |
| `05-design-system.md` | tokens, typography, layout components, templates, the page authoring kit, the `CourseFacts` component |
| `10-content-model.md` | every collection and global, fields (including course key facts), access, hooks; the code registries |
| `20-blocks.md` | block configs, renderers, registry |
| `30-import.md` | `html-to-blocks` and the import steps (courses, App Runner posts and galleries, staff, media, documents, ...) |
| `40-enquiries.md`, `41-campaigns.md` | the form pipeline, adapters, conditional destinations; campaign codes and attribution |
| `45-payments.md` | gateways, flows, jobs, receipts, signed invoice links |
| `50-portal-data.md` | portal DB queries, caching, legacy AJAX URLs, fixtures |
| `60-landing.md` | the landing templates, route files and companions |
| `70-urls-seo.md`, `80-tracking.md` | redirects, blog and document URLs, metadata, sitemap, parity crawl; GTM, pixels, chat |
| `90-security.md` | access matrix, admin guard, rate limits, CSP |
| `DECISIONS.md` | the standing decisions (DEC-n), cited from code comments |

## Working rules for agents
- Read `docs/modules/DECISIONS.md`, then your module doc, before writing code. Read `.claude/skills/payload/SKILL.md` before touching Payload config. Code comments cite DEC numbers: keep them stable. DEC-1 to DEC-99 mean the same as in ihm-web; IHNA-only decisions are DEC-101 and up.
- Docs describe the system as it is, in the present tense. When you change behaviour, update the module doc (and the DEC row) in the same change; never add change history.
- A change to a path listed in `SHARED-FILES.md` keeps ihm-web's behaviour through configuration (site values live in `src/content/*` or env); say so in the report so the other repo can take the same change.
- One writer per path set. Work in the worktree you were given; never edit files outside your module's paths without saying so.
- Big data (`../inventory/data/*.json`, `html-analysis.csv`) is read by scripts, never pasted into context. Reports go to `scripts/import/out/ihna-*.report.json` (or `scripts/dev/out/`, gitignored).
- The live site and the App Runner API (`APPRUNNER_API_URL`): GET only, at most 1 request per second.
- Schema changes: dev pushes the schema from `npm run dev`; ship a migration with `npm run payload migrate:create` and run `npm run generate:types`.
- Before reporting done: `npm run check` green, plus your module's acceptance checks.
- Report ≤150 words: what was built, check results, file paths, open questions. No code dumps.
- Never send to a real CRM, gateway or email service from dev or tests. `DRY_RUN=1` (the default) records instead of sending; an enquiry adapter sends only when `DRY_RUN` is not `1`, it is listed in `ENQUIRY_LIVE_ADAPTERS` and its variables are set (DEC-50). Turning one on is the owner's call. Mailpit catches dev email.

## Commands
```
docker compose up -d          # project ihna-web: postgres:16 (host port 5434, db ihna), mysql:8 portal fixtures (3308, db ihna_portal), Mailpit (1025/8025)
docker compose up -d postgres portal-mysql   # when ihm-web's Mailpit already holds 1025/8025 (one Mailpit per machine)
npm run dev -- -p 3001        # own terminal; http://localhost:3001 (ihm-web owns :3000), admin at /admin; pushes the dev schema on the first request
                              # dev DB: the Homebrew Postgres on 127.0.0.1:5432, database ihna (DEC-27); DATABASE_URL decides
npx tsx scripts/dev/seed-admin.ts   # first admin from DEV_ADMIN_EMAIL / DEV_ADMIN_PASSWORD (needs the schema: load a page first, or `npm run payload -- migrate`)
npm run payload migrate       # production: apply src/migrations/
npm run generate:types
npm run check                 # generate:types, typecheck, lint, check:blocks, test:int, test:blocks
npm run import -- <step>      # docs/modules/30-import.md. IHNA order: course-live, media, theme-photos, lookups, apprunner, wp-courses, staff,
                              # assign-images, link-course-managers, link-course-brochures, static, live-files, documents, wp-json-check
                              # (name the steps; `all` also runs wp-posts, which has no IHNA input: the 4 root posts are route files)
npm run import -- apprunner --refresh   # re-pull blog posts and galleries from App Runner
npm run import:refresh        # re-pull the live site, re-import changed items
npm run parity -- --site=ihna # crawl ihna.edu.au vs :3001 (live side cached), writes scripts/parity/out/parity-ihna.csv + .summary.json
npm run status-sheet          # refresh ../inventory/v2/ihna/*.csv + TRACKING.csv + ../inventory/v2/IHNA-inventory.xlsx (DEC-37)
npm run verify:gateways       # auth-only gateway credential check (VERIFY_GATEWAYS=1)
npm run test:e2e:enquiries    # Playwright against :3001 (PLAYWRIGHT_BASE_URL overrides); dev server already running
npm run test:e2e:payments     # same; the gateway test secrets live in the test process only
HEADER_BASE_URL=http://localhost:3001 npm run test:e2e:header
```

## Inputs you will be pointed at
`../inventory/v2/ihna/{pages,landing-pages,enquiries,routing-matrix,payments,features,html-analysis}.csv`, `../inventory/data/ihna/{pages,posts,courses}.json` and `../inventory/data/ihna/apprunner/` (App Runner snapshots), `../inventory/03-ihna-theme.md`, `../inventory/06-ihna-enquiries-integrations.md`, `../inventory/07-ihna-static-and-urls.md`, `../inventory/09-databases-data-sources.md`, `../inventory/10-tracking-seo-cross-cutting.md`, the old theme `../ihna-web-2.0/wp-content/themes/mwt-ihna/`, design source `~/Projects/ihm/bon/`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
