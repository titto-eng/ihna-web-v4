# 20 — Blocks: configs, renderers, registry

## 1. Purpose
Every layout block: Payload config, React renderer, registry. Blocks are how structured content reaches a page (AGENTS rule 5). Two sources render through the same components: block JSON stored in the CMS (`courses.sections[].layout`, the `courseShared` global) and the hardcoded route files, which use the authoring kit `src/components/page/`. A block looks and behaves the same from either source.
`Section`, `Prose`, tokens, templates, `CourseFacts`: `05-design-system.md`; collections: `10-content-model.md`.

## 2. Data model

**Files.** `src/blocks/<slug>/config.ts` (Payload `Block`), `src/blocks/<slug>/Component.tsx` (server component; client parts in `*Client.tsx`, `VideoPlayer.tsx`, `BrochureDialog.tsx`, `HeroCarousel.tsx`, `QuoteText.tsx`), `src/blocks/fields.ts` (builders `heading`, `media`, `textList`, `links`, `variant`), `src/blocks/sectionFields.ts` (`tone` default/card/muted/ink/sunrise, `spacing` default/compact/none, `anchorId` on every block), `src/blocks/nested.ts` (child slug lists), `src/blocks/embeds.ts` (pure URL validators), `src/blocks/defaults.ts` (one default per slug), `src/blocks/types.ts` (`BlockCtx`, `BlockProps`), `src/blocks/index.ts` (registry). 29 slugs.

**Config rules.** ≤40 non-empty lines; `interfaceName: '<Name>Block'`; no Local API, `@/lib/portal` or `mysql2` (enforced by `scripts/check-blocks.ts`). Slugs are stored in the JSON (`blocksAsJSON: true`), so renaming one needs a data script.

**Renderer contract.** Every component takes `{ block, ctx }` with `ctx: BlockCtx = { depth, audience?, course? }` and wraps itself in `Section` (tone/spacing/anchor from the block; nested blocks get no background or container).

**Hosts.** `courses.sections[].layout` (one section per slot) and `courseShared.layout`, both `layoutField()` (`src/collections/shared/fields.ts`): a `blocks` field with `blockReferences` to every registered slug. Posts are Lexical rich text only.

### Generic blocks
`*` = required. `links` = array of {label*, href*, style: primary | secondary | link}. Every block also has `tone`, `spacing`, `anchorId`.

| Slug | Fields | Variants | Notes |
|---|---|---|---|
| `hero` | eyebrow, heading* (`*phrase*` = italic accent), subheading, image, imageCaption, audienceSwitch, ctas: links ≤2 | split / full / compact | renders the page h1; split shows the ECG line and the sunrise-glow image frame; full with image = ink overlay; `HeroContent` is the split / compact body without the section, used per slide by `HeroCarousel` (05 §4.6) |
| `richText` | content*: richText, width | prose / wide | `Prose` |
| `imageText` | eyebrow, heading, media*: upload, imageCaption, content*: richText, imageSide (left/right), chips: text list, ctas: links ≤2 | — | |
| `stats` | heading, items 2–6 (value*, label*, note) | — | `dl`, 2 columns → up to 6 |
| `cardGrid` | heading, intro, columns (2/3/4, default 3), cards (image, badge, title*, body, href) | grid / carousel | `href` makes the whole card a link |
| `accordion` | heading, intro, items (title*, blocks) | faq / plain | `faq` emits FAQPage JSON-LD from the item text |
| `tabs` | tabs ≥2 (label*, anchorId, blocks) | underline / pill | opens the tab whose `anchorId` matches `location.hash` (old `#tab` links) |
| `table` | caption, headerRow (default true), rows*: json `string[][]` | striped / plain | horizontal scroll wrapper |
| `cta` | heading, body, links ≤2 | centered / banner / inline | |
| `testimonials` | heading, inline (quote (required unless the item has a video), name*, role, photo, videoUrl (YouTube / Vimeo, validated)) | **carousel** (default) / grid / single | carousel = `CardCarousel`, 1 → 2 (md) → 3 (lg) cards per view, so the section height does not depend on the item count (DEC-71); an item with `videoUrl` is a video card: the `VideoPlayer` facade (photo as poster, no third-party request until play) plays inline inside the card; quotes over 280 characters show seven lines and a Read more toggle in carousel and grid cards; templates map `testimonials` docs (with their `videoUrl`) into `inline`; `groupVideoRuns` (`testimonials/video.ts`) turns two or more consecutive `videoEmbed` blocks into one carousel, used by `CourseDetail` on every section layout |
| `logoStrip` | heading, logos (logo*, alt*, href) | — | |
| `videoEmbed` | url* (YouTube/Vimeo, validated), title*, poster | inline / lightbox | poster facade, iframe only after play; without a poster the facade is a plain play panel; lightbox = dialog; `VideoPlayer` takes `compact` (smaller play button, no title pill: the testimonial card) and `sizes` |
| `iframeEmbed` | url* (https), title*, height (200–2000 px; empty = 16:9) | — | host allowlist below |
| `mapEmbed` | embedUrl* (`https://www.google.com/maps/embed…` only), caption | — | |
| `teamGrid` | heading, members (photo, name*, role, bio) | grid / carousel | bio opens a dialog |
| `gallery` | heading, images: upload hasMany | grid / carousel | lightbox dialog with prev/next |
| `steps` | heading, intro, steps (label, value, title*, body) | numbered / timeline | timeline = BON 03 rising arc (label + big value) |
| `enquiryForm` | formKey*, heading | card / inline / sidebar | default tone muted, default anchor `quickContact` |

### BON blocks
| Slug | BON section | Fields |
|---|---|---|
| `pathways` | 01 "Three ways in" (always ink; A/B/C cards act as tabs) | eyebrow, heading, intro, paths 2–4 (label*, title*, tagline, structure, body, suits, advantages: text list, progression, notice, ctas) |
| `curriculum` | 04 year tabs, semesters in 2 columns | eyebrow, heading, years ≥1 (label*, units (semester, code, title*, credit, kind: core/elective/placement)) |
| `admissionsPanel` | 05 admissions (default tone card) | eyebrow, heading, domestic: richText, international: richText, cards ≤6 (audience: both/domestic/international, label*, value, body), steps: text list, links ≤3 |

`admissionsPanel` renders both audience versions on the server inside `AudienceOnly`; CSS from the `AudienceProvider` hides the inactive one (`05-design-system.md` §4.3).

### Course data blocks
They read the course from `ctx.course` (`courseOf`, `src/components/templates/courseContext.ts`); with no course they render nothing and warn once in dev, except `intakeCalendar`, which renders without a course (all student types). Each also returns nothing when it has no data. `CourseDetail` places them itself (hero, key facts, sections in slot order with `feesTable`, `startDates` and `censusDates` after the `fees` slot, then `courseManagers`, `relatedCourses`, `courseShared.layout`, `brochureDownload`, the `courseShared.stats` band, the `quick-enquiry` form and a CTA banner), unless a section layout already holds that slug.

| Slug | Extra fields | Source and behaviour |
|---|---|---|
| `courseFacts` | show: select hasMany (`FACT_KEYS`) | Thin wrapper around `<CourseFacts>` (`src/components/course/CourseFacts.tsx`): passes the course, `ctx.audience` and `show` (narrows the facts). Reads the course doc only. Default spacing compact. |
| `startDates` | mode: all / f2f / online / blended | Only when `courses.showStartDates` is true (DEC-7; 16 IHNA courses) and the course has `khId`; portal `getStartDates`; per-campus date pills, both audiences behind `AudienceOnly` for `both` courses. |
| `censusDates` | note | Portal `getCensusDates` by `khId`; table Intake / Start / End / Census / Orientation. The CourseDetail default (DEC-7). |
| `feesTable` | (section fields only) | Shows `courses.fees.displayAmount` and `fees.note` (default tone sunrise): the fee text of the live page (DEC-107). Fee tables in a course body stay `table` blocks in the `fees` slot (DEC-15). |
| `intakeCalendar` | months (1–24, default 12) | Portal `getIntakeCalendar` per month (filtered by the course's student type when a course is in context); lists only khIds that have a published course; month cards linking to the course. `/monthly-calendar/` and `/course-calendar/` render it without a course (`src/components/templates/Calendar.tsx`). |
| `relatedCourses` | limit (1–12, default 6) | `courses.relatedCourses`, else published, indexable courses of the same school; carousel of cards; cached 300 s under `course:<slug>`, `collection:courses`, `courses`. |
| `brochureDownload` | label (default "Download the course guide") | Needs a course brochure (`hasBrochure`: `courses.brochure`, else `brochureUrl`; DEC-69); button opens a dialog with the `course-brochure` enquiry form. Its thank-you is the brochure URL when that is on our host (`brochureHrefFor`, `src/lib/courses/brochure.ts`), else the form's thank-you path; IHNA's brochures are FlipHTML5 links (`brochureUrl`, 15 courses), so the form ends on its thank-you page. |
| `courseManagers` | heading (default "Course managers") | Published `staff` whose `courses` contains the course (DEC-60); team grid without emails; cached 300 s under `collection:staff`, `staff`, `collection:media`, `collection:courses`. No IHNA staff has course links, so it renders nothing. |

Portal reads go through `src/lib/portal/cache.ts`: `unstable_cache` under `portal` and `portal:<khId>` (calendar `portal:calendar`), 900 s; a failure is negative-cached for 60 s and, with nothing cached, returns `{ unavailable: true }`, which the date blocks render as `PortalNotice` ("Dates coming soon — enquire…"). With `PORTAL_ENABLED=0` (the default) no portal read opens a connection (DEC-50, `50-portal-data.md`). Payload is imported lazily inside the components that query it.

### Nesting (`nested.ts`, DEC-6)
All blocks are defined once at config level (`payload.config.ts` `blocks: blockConfigs`); `layout` fields and the `tabs`/`accordion` child fields reference them by slug with `blockReferences`.
- `accordion` children: `richText`, `imageText`, `table`, `videoEmbed`, `iframeEmbed`, `mapEmbed`, `cta`, `cardGrid`, `steps` and the 8 course data blocks.
- `tabs` children: the accordion list plus `accordion`, `stats`, `testimonials`, `logoStrip`, `teamGrid`, `gallery`, `pathways`, `curriculum`, `admissionsPanel`, `enquiryForm` (every block except `hero` and `tabs`).
- `RenderBlocks` skips any block list at `ctx.depth` > 3 (`MAX_DEPTH`, dev warning). `tabs` and `accordion` render children at `depth + 1`. CourseDetail renders section layouts at depth 1, so the deepest content the model allows, a leaf in tabs > accordion inside a course section, is at depth 3.

### Registry (`src/blocks/index.ts`) and `RenderBlocks`
`configs` maps slug → config; `blockConfigs: Block[]` feeds `payload.config.ts`; `blockComponents: Record<BlockSlug, Loader>` lazily imports each component, typed so a config without a component fails `tsc`. `src/components/RenderBlocks.tsx` (async server component) maps `blockType` to its component and renders them in order; an unknown slug is skipped with one `console.warn` per slug outside production.

### Embeds (`embeds.ts`, DEC-5, DEC-29)
- `videoEmbed`: `parseVideoUrl` accepts YouTube (`youtube.com`, `www.`, `m.`, `youtube-nocookie.com`, `www.youtube-nocookie.com`, `youtu.be`; watch, embed, shorts, live) and Vimeo (`vimeo.com`, `player.vimeo.com`) and extracts the id; `videoSrc` builds `https://www.youtube-nocookie.com/embed/<id>?…&enablejsapi=1` or `https://player.vimeo.com/video/<id>?…&api=1` itself, never from the stored URL. One video at a time: every YouTube / Vimeo frame (`VideoPlayer`, and `iframeEmbed` when its URL is a video, which gets the same API parameter) is an `ExclusiveFrame` (`src/components/media/`): `exclusivePlayback.ts` listens to the players' postMessage play events and pauses every other registered player when one starts (the course film player registers too); muted background loops never register.
- `iframeEmbed`: `hostAllowed(url, site.allowedEmbedHosts)` accepts https URLs whose host is in `BUILTIN_EMBED_HOSTS` (`www.youtube-nocookie.com`, `www.youtube.com`, `player.vimeo.com`), in `site.allowedEmbedHosts` (`src/content/site.ts`: `my.matterport.com`, `forms.monday.com`, `ihna.online`, `hrms.ihna.edu.au`, `portal.ihna.edu.au`, `student.ihna.edu.au`), or a Google Maps embed. The field validator checks https only; the host check runs at save in the `courses` `beforeValidate` hook `validateEmbedHosts` (`src/collections/shared/hooks.ts`, walks nested blocks) and again in the renderer, which renders nothing (dev warning) for a disallowed host.
- `mapEmbed`: `isMapEmbedUrl` = https, host `www.google.com`, path `/maps/embed…`, at save and render.
- Both render a lazy `<iframe>` with `title` and `referrerPolicy="strict-origin-when-cross-origin"`. CSP `frame-src` includes `site.allowedEmbedHosts` (`src/lib/seo/csp.ts`, DEC-21, `90-security.md`).

### EnquiryForm (DEC-4)
`formKey` names one of the 30 definitions in `src/content/forms.ts` (DEC-2, `40-enquiries.md`); the block stores no fields and no thank-you path. The server component loads the definition (`getFormView`) and renders nothing for an unknown or inactive key. The client form (`src/components/forms/EnquiryFormClient.tsx`, react-hook-form + zod) posts JSON to `/api/enquire/`: `formKey`, `submissionId` (UUID created on mount), `fields`, attribution (`campaign`, UTM and click ids from the URL, else the `site.attributionCookies` `ihna_attr` / `ihna_attr_first`), `hutk`, `pageUrl`, `referrer`, `landingPath`, honeypot `_hp_url`, and a reCAPTCHA v3 token when the definition has `captcha` and `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set. The course field is preset from `ctx.course` (or `?course=<id>`); hidden fields fill from URL params. On success it pushes one dataLayer conversion per submission (`generate_lead`, or `brochure_download` for a brochure form; `80-tracking.md`) and navigates to the server-computed `thankYouPath` (a site path, or an `https://api.whatsapp.com/send?` link), else shows an inline thank-you; field errors (400) mark the fields; other errors show an inline message and do not navigate. The site-wide `EnquiryDialog` (`src/components/forms/`, keys `site.enquiryDialog.keys`: `quick-enquiry`, `whatsapp`) renders the same form in a dialog.

### Rich text
`richText`, `imageText` and `admissionsPanel` rich text render through `Prose` (`src/components/layout/Prose.tsx`): `@payloadcms/richtext-lexical/react` with custom converters (h1 → h2, internal links → `docHref`, external links `rel="noopener noreferrer"`, upload → `MediaImage` or a download link). No raw-HTML converter. The editor is `lexicalEditor()` with its default features (`payload.config.ts`).

### JSON-LD
`accordion` (faq) and the kit `Accordion` emit FAQPage JSON-LD through `safeJsonLd` (`src/components/blocks/lexicalText.ts`), the only permitted `dangerouslySetInnerHTML` outside the Lexical renderer (DEC-26).

### Authoring kit (`src/components/page/`)
For hardcoded pages (`index.ts` re-exports everything).
- `blocks.tsx` wraps each block as a component taking the block's fields as props plus `depth`: `Hero`, `Cta`, `CardGrid`, `Table`, `VideoEmbed`, `IframeEmbed`, `MapEmbed`, `Stats`, `Steps`, `Testimonials`, `LogoStrip`, `Gallery`, `TeamGrid`, `Pathways`, `Curriculum`, `AdmissionsPanel`, `EnquiryForm`, and the course data blocks `CourseFacts`, `StartDates`, `CensusDates`, `FeesTable`, `IntakeCalendar`, `RelatedCourses`, `BrochureDownload`, `CourseManagers`. Each renders through `RenderBlocks` with `ctx = { depth }` and no course, so the course data wrappers render nothing on a hand-written page except `IntakeCalendar`; for key facts on a hand-written course page, import `CourseFacts` from `@/components/course/CourseFacts` and pass the course doc.
- JSX-children helpers: `Rich` (JSX children styled with `proseClassName`; `width` prose/wide), `Pic` (image in `Rich`, or a download link), `Tabs` (`tabs: {label, anchorId, content}[]`), `Accordion` (`items: {title, content, text}[]`; FAQPage JSON-LD from `text` unless `variant="plain"`), `ImageText` (children replace the Lexical `content`), `EmptyNotice`; re-exports `Link` and `Prose`.
- `img.ts`: `img({src, alt, width, height, mimeType, focal, sizes})` builds the `Media`-shaped object a block's upload field expects.
- `metadata.ts`: `pageMetadata({title, path, metaTitle, description, noindex, canonical, image})` (`70-urls-seo.md`).
- Nested kit components take an explicit `depth` (e.g. `<Rich depth={1}>` inside a `Tabs` panel).
- On IHNA the route files use `Rich`, `Hero`, `Pic`, `CardGrid`, `Cta`, `ImageText`, `Tabs`, `EnquiryForm`, `Accordion`, `Testimonials`, `VideoEmbed`, `Table`, `IframeEmbed`, `Stats`, `Steps`, `MapEmbed`, `Gallery`, `TeamGrid` and `Pathways`; no route file uses `LogoStrip`, `Curriculum`, `AdmissionsPanel` or the course data wrappers.

### Extractor output
The course importer (`scripts/import/html-to-blocks.ts`, `section-mapper.ts`, `course-ihna.ts`, `ihna/wp-courses.ts`, `lib/to-payload.ts`; `30-import.md` §7.3–7.4) can emit `hero`, `richText`, `tabs`, `accordion`, `table`, `videoEmbed`, `imageText`, `cardGrid`, `testimonials` (inline), `enquiryForm`, `cta`, `iframeEmbed`, `mapEmbed`, and `censusDates`, `startDates` and `courseManagers` where a body holds course-data shortcode output. The 21 IHNA course layouts hold `richText` (542), `videoEmbed` (71), `table` (63), `accordion` (42) and `testimonials` (4); the portal start-date tab of the live pages is dropped and `showStartDates` set instead (DEC-7). All other blocks are placed by `CourseDetail`, templates or marketing.

## 3. Admin capabilities
Marketing adds, reorders, duplicates and nests blocks in a course's section layouts and in `courseShared` (Settings → Shared course section, drafts + autosave, `marketing` role), picks variants, tone, spacing and anchors, and gives an `enquiryForm` one of the 30 form keys. Embeds take a URL only; no HTML, classes, colours or iframe code can be entered. Hardcoded pages are not edited in the admin.

## 4. Front-end behaviour
Templates call `RenderBlocks`; route files use the kit. Course pages are cached under `course:<slug>` / `collection:courses` and `courseShared` under `global:courseShared`, revalidated by the collection and global hooks; hardcoded pages change on deploy; portal data refreshes every 15 min. Tabs, accordion, dialogs and carousels are Radix/shadcn (keyboard + ARIA). Hero text uses `animate-rise` on the page h1, off under `prefers-reduced-motion` (`src/styles/theme.css`).

## 5. URLs
Blocks serve no routes. Internal links are relative paths.

## 6. Integrations
YouTube/Vimeo, Google Maps and the hosts in `site.allowedEmbedHosts` (CSP `frame-src`); reCAPTCHA v3 (`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`). Portal and enquiry env vars: `50-portal-data.md`, `40-enquiries.md`.

## 7. Import / seed
Course content arrives via `npm run import -- wp-courses` (`30-import.md`); the IHNA course step keeps every fragment on its course, so `courseShared.layout` is empty (DEC-22, DEC-35); `courseShared.stats` (the figures band, not a block field) is seeded by `scripts/dev/seed-live-figures.ts`. `staff.courses` for `courseManagers` is written by the `link-course-managers` step (DEC-60); IHNA course pages carry no manager cards, so it links none. `defaults.ts` holds one default per slug for tests.

## 8. Acceptance checks
1. `npm run check:blocks` (`scripts/check-blocks.ts`): fails if any `src/blocks/*/config.ts` has more than 40 non-empty lines or matches `getPayload(`, `payload.find`, `.findByID(`, `mysql2` or an `@/lib/portal` import.
2. `npm run test:blocks` → `tests/blocks/render.test.tsx`: registry keys = `blockConfigs` slugs = `defaults` keys (29); every slug renders its default without throwing; `RenderBlocks` skips an unknown slug between two valid blocks and returns null at depth 4; the video src is built from the id (nocookie / Vimeo); `hostAllowed` / `isMapEmbedUrl` enforce the allowlists; `iframeEmbed` renders no iframe for a non-allowlisted host. `tests/blocks/nesting-depth.test.tsx`: tabs > accordion > richText at section depth 1 renders the leaf. `tests/blocks/carousel.test.tsx`: testimonials carousel default, video cards, Read more, `groupVideoRuns`, hero carousel (one h1, pause control, no autoplay under reduced motion).
3. `npm run test:int` → `tests/import/embed-hosts.test.ts` (embeds found at any depth; disallowed hosts rejected by the pure check; its `courses` save case is `it.skip`, so the hook on `courses.sections` has no running test), `tests/courses/blocks.test.ts` (censusDates, startDates DEC-7, courseFacts, feesTable), `tests/courses/course-facts.test.ts` (the `courseFacts` block wraps `<CourseFacts>` and honours `show` and `ctx.audience`), `tests/courses/brochure.test.ts`, `tests/import/html-to-blocks.test.ts` and `tests/courses/section-mapper.test.ts` (extractor output and slot mapping), `tests/courses/course-ihna.test.ts` (IHNA course bodies and sibling links).
4. `npm run typecheck` passes (a config without a component fails `tsc`).
5. Stored block types: `psql -h 127.0.0.1 -p 5432 -U postgres -d ihna -Atc "select jsonb_path_query(layout, 'strict \$.**.blockType') #>> '{}' from courses_sections" | sort | uniq -c` → richText 542, videoEmbed 71, table 63, accordion 42, testimonials 4; `select count(*) from course_shared` → 0.

## 9. Differences from ihm-web
`src/blocks/**` is on the sync list in `SHARED-FILES.md`; the configs and the registry are the same in both repos. IHNA differs in:
- Embed hosts: `site.allowedEmbedHosts` lists IHNA's hosts (above).
- Video facade: ihm-web falls back to the YouTube thumbnail when a video has no poster and plays one video at a time on a page; IHNA shows a plain play panel and each player is independent.
- Rich-text heading levels: ihm-web passes `ctx.headingLevel` so a `richText` heading starts below its course slot heading; IHNA's `BlockCtx` has no `headingLevel` (only h1 is demoted).
- Hero: ihm-web shows the split image landscape and at most 40vh below `lg` and loads the second carousel slide eagerly; IHNA keeps the 4:5 frame at every width and loads later slides lazily.
- Testimonials: ihm-web's block takes a code-only `kind` prop (testimonial / tutorial / video) that names the video cards; IHNA's has none.
- Attribution cookies are `ihna_attr` / `ihna_attr_first` from `site.attributionCookies`; ihm-web reads `ihm_attr` / `ihm_attr_first`.
- IHNA course layouts hold no `tabs` or course data blocks, and `courseShared.layout` is empty (DEC-35).

## 10. Open questions
1. Where the course brochures live (DEC-69): with FlipHTML5 links only, `brochureDownload` ends on the form's thank-you page instead of opening the brochure.
2. Course managers: no IHNA course page names its managers, so `courseManagers` renders nothing; the owner decides whether staff are linked to courses in the admin.
3. Live `ihna_portal` access (schema, campus ids): `startDates`, `censusDates` and `intakeCalendar` read the provisional fixtures in
   dev and show `PortalNotice` with `PORTAL_ENABLED=0`.
