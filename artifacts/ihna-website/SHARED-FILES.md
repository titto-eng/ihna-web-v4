# Paths shared between ihna-web and ihm-web

`ihna-web` (ihna.edu.au) and `../ihm-web` (ihm.edu.au) run the same codebase. The paths below hold the same code in both repos;
site-specific values live in `src/content/*`, `src/components/tracking/defaults.ts` and env, so a shared file needs no site check.
A change to a shared path keeps the other site's behaviour through that configuration and is made in both repos. Before copying a
file across, diff it (`diff -r ihna-web/<path> ihm-web/<path>`) and carry over only the change you mean; never overwrite the other
side wholesale. Record the copy in the commit message (`sync: <path> ← ihna-web@<sha>` or `← ihm-web@<sha>`).

```
AGENTS.md (rules and commands sections)   .claude/agents/**
src/blocks/**                              src/components/ui/**         src/components/layout/**
src/components/page/**                     src/lib/paths.ts             src/proxy.ts (realm string differs)
src/lib/portal/client.ts (not queries.ts)  src/lib/adapters/**          src/lib/payments/**
src/lib/enquiries/**                       src/lib/access.ts            src/lib/portal/payments-write.ts
src/lib/cn.ts                              src/lib/media-sizes.ts       src/lib/security/**
src/lib/seo/metadata.ts                    src/lib/preview.ts           src/lib/preview-url.ts (preview.ts imports it)
src/app/api/preview/**                     src/app/api/enquire/**       src/app/api/payments/**
src/jobs/**                                scripts/import/** (except seeds/)                scripts/parity/**
docs/modules/** (structure; site-specific facts and numbers differ)
```

Listed paths that hold site-specific text by design: the basic-auth realm in `src/proxy.ts` (`IHNA CMS` / `IHM CMS`); the agent
prompts in `.claude/agents/**` (paths, ports, step order); site branches in `scripts/import/**` and the per-site entries of
`SITES` in `scripts/parity/crawl.ts`.

Site-specific (never copied): `src/styles/theme.css`, `src/lib/portal/queries.ts`, `src/lib/portal/ihna.ts`,
`src/lib/portal/legacy-endpoints.ts`, `src/lib/legacy-redirects.ts`, `src/lib/blog-paths.ts`, `src/lib/empty-200.ts`, `.env*`,
`scripts/import/seeds/`, the facts and numbers in `docs/modules/*`, everything under `src/content/**` (site settings, nav, footer,
forms, enquiry routing, campaign codes, CRM maps, payments settings, documents prefixes, page and landing registries, redirects,
static stand-ins, news items, staff paths), `src/components/tracking/defaults.ts`, and every page route file under
`src/app/(site)/**` except the shared routes (`pay/**`, `courses/**`, `blog/**`, `news/**`, `wp-content/**`, `sitemap.xml`,
`robots.txt`; the alumni route files hold site content).

## Shared files that differ from ihm-web
The IHNA copies below carry behaviour that ihm-web's copies lack. Each keeps ihm-web's behaviour when ihm-web supplies the named
configuration file with its own (often empty) values; take the file and its configuration together.

| IHNA files | What they add | ihm-web needs with them |
|---|---|---|
| `src/lib/enquiries/{campaign,captcha,config,lookups,process,request,thankYou,types}.ts`, new `conditions.ts`; `src/lib/adapters/{index,types,util,transport,live,email,hubspot,dynamics,portalCrm}.ts`, new `ihnaOnline.ts`; `src/jobs/deliverEnquiry.ts` | campaign-code table (DEC-101), `when` conditions, autoresponder variants and thank-you rules (DEC-102), HubSpot property map and v3 notes, Dynamics body map, portal CRM extras, the `ihnaOnline` adapter (DEC-103) | `src/content/{campaign-codes,course-crm,hubspot-map,dynamics-map}.ts` (IHM values: `tests/enquiries/fixtures/site-ihm.ts`) |
| `src/lib/payments/{after,handlers,settle,start}.ts`, `src/lib/payments/gateways/payway.ts`, `src/lib/portal/payments-write.ts` | site settings read from `paymentSite` and `site.payPath` (DEC-109); portal IP column `ip_address` | `src/content/payments.ts` (pay path `/makepayment/`, PayWay provider 2, `['autoenrol']`, no Skilldemy), `site.payPath`, the fixture column `ip_address` |
| `src/proxy.ts` | document rewrite built from `DOCUMENT_PREFIXES` | `src/content/documents.ts` with ihm-web's prefixes and aliases |
| `src/components/layout/Footer.tsx` | optional `footer.acknowledgementLink` | nothing (absent = no link) |
| `src/app/(site)/courses/[slug]/page.tsx`, `src/app/(site)/blog/[[...parts]]/page.tsx` | domestic/international sibling links; `?title=` blog search; the `courseShared.stats` band passed to `CourseDetail` (`sharedStats`) | `src/content/course-siblings.ts` (an empty map); the `stats` field of `src/globals/CourseShared.ts` with its migration and `CourseDetail`'s `sharedStats` / `sharedStatsBlock` (an empty `stats` renders no band) |
| `scripts/import/**` (`lib/{config,data,formkeys,images-plan,images-select,recover-missing,upsert}.ts`, `html-to-blocks.ts`, `section-mapper.ts`, `refresh-live.ts`, the steps, new `steps/{course-live,apprunner,live-files,link-course-brochures}.ts`, `lib/apprunner.ts`, `course-ihna.ts`, `ihna/*`) | `SITE` typed `'ihm' \| 'ihna'` with site branches, App Runner import key, site lists read from `seeds/documents.ts` | `scripts/import/seeds/documents.ts` with ihm-web's lists |
| `scripts/parity/crawl.ts`, new `scripts/parity/accept.ts` | per-site `SITES` entry, accepted-difference rules, `--new-origin`, `--reuse-new` | nothing |
| `.claude/agents/**` | IHNA paths, ports and step order | keep ihm-web's site text |

ihm-web's copies of other shared files (blocks, carousel, header, metadata) can be ahead of these; diff before copying either way.
