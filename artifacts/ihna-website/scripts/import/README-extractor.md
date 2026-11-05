# html-to-blocks extractor (prototype)

Files: `html-to-blocks.ts` (`extract(html, {url, wpType})`), `extract-samples.ts` (CLI), `out/extract-samples.report.json`, `out/samples/<wpId>.json` (66 layouts).
Run: `npx tsx scripts/import/extract-samples.ts` (prints a summary table only). `tsc` is clean for these files; `eslint` cannot start in this repo (circular-JSON error loading `eslint.config.mjs`, not touched here).

`extract` returns `{layout, confidence, unplaced, stats, warnings, unknownClasses}` (the last two are extras for the report).

## Sample set (deterministic: sort by wp id, 10 evenly spaced)
A (10, all posts), B (10), C-lite (10: class C whose `interactive_components` are only accordion/tabs/youtube-embed, iframe allowed only beside youtube-embed), C (10, non-course, non-lite), courses (all 26). 66 items.

## Result of this round
| group | avg confidence | items < 0.6 |
|---|---|---|
| A | 1.000 | 0 |
| B | 1.000 | 0 |
| C-lite | 1.000 | 0 |
| C | 0.520 | 6 (all staff profiles) |
| courses | 0.978 | 0 |

Block totals over the 66 samples (nested blocks included): richText 674 (9 flagged `reviewStatus: check`), cta 236, videoEmbed 216, hero 50, table 59, accordion 47, tabs 34, testimonial 25, courseData 42 (courseManagers 23, startDates 19), cardGrid 19, enquiryForm 1, imageText 1.

Confidence is the plan's definition (share of text that landed in a non-fallback block). It is a weak signal alone, so the report also carries `coveragePct` = extracted text / source text (non-space chars). That check found three real content-loss bugs during development (invalid `ul > p` nesting, `<h3>..</h5>` swallowing the following list, malformed accordion nesting); all fixed. Remaining coverage < 95% is deliberate: `d-none` / `display:none` content, `fixed-cta-btns` (floating duplicate of Apply/Enquire), the student-type switcher, orphan tab panes (see below).

## What works
- sanitize-html first pass (script/style/noscript, on*, `javascript:`, iframes not YouTube/Vimeo/Google Maps), then class/id/style used for recognition and never emitted. Output HTML is built by our own serialiser and only contains p,h2,h3,h4,ul,ol,li,a[href],strong,em,img[src,alt],br. Checked across all 66 outputs: zero `class=`/`style=`/`id=`, zero script/iframe.
- Bootstrap tabs/pills (nav + `.tab-content`, label to pane by `data-bs-target`/`href`/`aria-controls`/id, panes extracted recursively); accordion (`.accordion-item`, `.card` + `.collapse`, tolerant of the unclosed-div nesting WordPress produces); tables; YouTube `iframe` and the theme's `div.youtube-player[data-id]`; carousels of linked cards become `cardGrid`; `div.testimony-item` and `blockquote` become `testimonial`; `form` becomes `enquiryForm{formKey:"TODO:<action>"}`; stand-alone `a.*btn*` and groups of them become `cta`; first `h1` becomes `hero`.
- Links: absolute `ihm.edu.au` links relativised; theme images (`/wp-content/themes/`) and YouTube thumbnails dropped (stat `themeImagesDropped`).

## Course-data shortcodes (selectors, grepped in `../ihmv3/wp-content/themes/mwt-ihm/`)
| kind | wrapper chosen | source |
|---|---|---|
| startDates | `ul.start-date-ul`; replace its closest `.row` when that row holds only the `h2` campus, `p>strong` delivery label and the `ul` | `functions.php:1309` (`start_dates`), row `:1338`, h2 `:1392`, p `:1398/:1423/:1439`, ul `:1399/:1424`, `add_shortcode` `:1470` |
| startDates (census) | a `table` whose header has "Course Intake" and "Census Date", plus the `h2.captionBG` and `.container` around it | `functions.php:4410-4426` -> `ihm-census-dates-sc.php:23-27` |
| courseManagers | `.cmCard` (`div.courseManagers-card`); replace the highest ancestor holding only cmCards and `h2.captionBG`; also the course-body slot `section#courseManagers` | `functions.php:3520-3537` -> `course-manager-sc.php:23-46` |
| (all three) | literal unexpanded `[StartDates ...]`, `[IHMCensusDate]`, `[CourseManagers]` text (16 items) | `functions.php:1470, 4426, 3537` |
| fees | **no IHM shortcode or partial exists** (no `add_shortcode` for fees; "fees" in the theme is only payment and micro-credential templates). IHM fees are hand-written tables in the "Fees and Charges" tab pane, so they stay `table` blocks and the item gets warning `fees-static-table-kept`. `FEES_WRAPPER_SELECTORS` is an empty hook for IHNA. | none |

## What does not work / open
1. Staff profiles (42 pages, class C): research, grants, activities, supervision are rendered client-side from `researchData/grantsData/activitiesData` arrays in an inline script. The HTML has headings only, so tabs come out nearly empty. Flagged `js-rendered-data-lost`; the char count of the lost data is counted as fallback. These must go through `staff.ts`, not this extractor.
2. Widgets we only flatten: `owl-carousel` (video testimonials, text testimonials not matching `testimony-item`), bootstrap `modal` (full testimonial texts duplicated from the carousel), `search-box`/pagination. Their text becomes `richText` with `reviewStatus: check`; video carousels keep their `videoEmbed` blocks.
3. Orphan tab panes: panes whose tab button is commented out in the source (FEE-HELP, Apply, Application and Initial Payment on 4 courses). Not visible live, so not emitted; listed in `unplaced` (`orphan-tab-pane`). Decide with marketing.
4. Accordion body is a minimal HTML string, so tables/iframes inside an accordion are flattened (`accordion-body-flattened`, 15 courses). Tables inside richText likewise (`table-flattened-in-richText`).
5. Google Maps iframe has no block in the slug list (`map-iframe-not-represented`); URL is in `unplaced`. Other iframes (Matterport, monday forms) are dropped by sanitising (`iframe-dropped:<host>`).
6. `imageText` fired once and `enquiryForm` once (library search form, `formKey` still `TODO:`): the sample is mostly prose and tabs. Not yet validated on more two-column pages. The `imageText` rule is deliberately strict (exactly two `col-*`, one image-only, one text-only).
7. In-page anchors (`#quickContact`) are kept on `cta` but dropped on inline links.
8. Hero image detection (background-image url or sibling img) found none in the samples (theme images are dropped), so hero is heading-only so far. No `Hero.subheading` hit either.
9. Unknown wrapper classes are tallied in the report (`topUnknownClasses`): `item`, `videoBoxCT`/`pressmeetVideo`, `testimony-item`, `job-box`, `ag-timeline_*` (timeline, 14), `italic-content-box`, `news-thumb-box`, `campus-details-box`. The timeline and `job-box` content currently flows as plain richText (confidence counts it as placed); a `Timeline` block may be wanted.

## The 10 worst by confidence
| wpId | URL | conf | why |
|---|---|---|---|
| 8656 | /dr-sumathi-p-v/ | 0.133 | staff profile, JS data (14.8k chars) not in HTML |
| 10045 | /dr-joseph-musasizi/ | 0.143 | same |
| 6965 | /dr-abhishek-sharma/ | 0.154 | same (16.2k chars) |
| 10297 | /dr-sajal-roy/ | 0.179 | same |
| 8791 | /taranjot-kaur/ | 0.252 | same |
| 9163 | /israel-olatunji-gabriel/ | 0.342 | same |
| 305 | /courses/nclex-for-rns/ | 0.647 | long student-testimonial carousel/modal text flattened to fallback richText |
| 10036 | /courses/master-of-nursing-international/ | 0.781 | testimonial modals + carousel, plus an orphan FEE-HELP pane |
| 96 | /courses/master-of-nursing/ | 0.786 | same modal + video-caption carousel |
| 6355 | /courses/graduate-certificate-in-advanced-nursing-australian-nursing-practice/ | 0.880 | programme modals, orphan "Application and Initial Payment" pane |

## Next round (suggested)
Run on 10 more pages per class with different spacing, add a `Timeline` block decision, route staff pages to `staff.ts`, decide orphan tab panes, and have the real build convert `richText.html` to Lexical.
