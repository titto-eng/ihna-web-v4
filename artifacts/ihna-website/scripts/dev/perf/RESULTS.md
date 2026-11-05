# Course page performance (IHM)

Target: warm course page <= 300 ms application time on the dev server, with `PORTAL_ENABLED=0`.

## Status: HTTP timings NOT yet taken

No dev server was running on :3000 and the brief said not to start one, so the before/after `time_starttransfer` numbers are missing.
To fill them in: start the app's preview (`PERF_TIMING=1` in its environment prints `[perf] <step> <ms>` lines), then

    bash scripts/dev/perf/course-timing.sh            # 5 URLs, first hit discarded, then 3 warm hits each
    PORT=3100 bash scripts/dev/perf/course-timing.sh  # if the server is elsewhere

To get the "before" column, run it once with `PORTAL_ENABLED=1` (portal live, same code), then with `PORTAL_ENABLED=0`.
Production-shaped numbers need `next build`, which also was not allowed here.

| URL | before (s, warm) | after, PORTAL_ENABLED=0 (s, warm) |
|---|---|---|
| /courses/bachelor-of-nursing-international/ | 1.5-4 (IHM-STATUS §4) | pending |
| /courses/bachelor-of-social-work/ | 1.5-4 | pending |
| /courses/graduate-certificate-in-advanced-nursing-australian-nursing-practice/ | 1.5-4 | pending |
| /courses/diabetes-nursing/ | 1.5-4 | pending |
| /courses/master-of-nursing-international/ | 1.5-4 | pending |

## Measured without a server (`npx tsx scripts/dev/perf/course-doc-size.mts`, `course-queries.mts`)

* Payload queries are not the cost: `courses.find` 8-30 ms warm at any depth (depth 2 is no slower than 1); `getPayload` 180 ms once.
* The course doc is 62-128 KB of JSON with 24-45 `richText` blocks, up to 21 `videoEmbed`, plus `censusDates` and `courseManagers` blocks inside the layout itself (so those blocks run even when CourseDetail's own `ensure()` skips them).
* Portal: 4-100 ms per query against the fixture. The "census join error" in IHM-STATUS §4 was the timing script passing `khId 61` and no `today` (mysql2: undefined bind parameter), not a fixture schema problem; the "hang" was the script never ending its pool, not a page-render hang. The real risks were: a failed bundle retried on every view, three separate portal reads per page (census block, start dates, JSON-LD), and `pool.execute` leaving queued work behind after a lost timeout race.

## Likely remaining cost (needs the `[perf]` log to confirm)

Everything not in the `[perf]` lines (`loadCourse`, `shared`, `sibling`) is React rendering: ~25-45 Lexical `richText` blocks, each behind a dynamic `import()` in `RenderBlocks`, in dev (unminified React). A normal page has a handful. If it dominates, next steps are to render the course's Lexical content once per cache entry, or to measure on a production build.

## What changed

* `PORTAL_ENABLED` (default 0): lib/portal returns `{ unavailable: true }` synchronously; no pool, no query, no await.
* One portal bundle (census + start dates) per course page: request-scoped `cache` + `unstable_cache` (`portal:<khId>`, 15 min); failures cached 60 s in-process, cleared by `revalidatePortal`.
* Every query: <= 3 s hard cap (connect + query), connection released on success, destroyed on error/timeout, returned unused if it arrives after the deadline.
* Course route: `getCourse` shared between metadata and page (`cache`), `getSibling` under `unstable_cache` (was a Payload query per view), related courses and course managers under `unstable_cache` with `select` (related courses no longer loads 6 full course bodies).
