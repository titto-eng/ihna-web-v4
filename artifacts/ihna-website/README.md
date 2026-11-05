# ihna-web

The ihna.edu.au website (Institute of Health and Nursing Australia): Next.js 16 (App Router) + Payload CMS 3.91 on Postgres,
Tailwind v4. Agents and developers: read `AGENTS.md` first; module docs are in `docs/modules/`.

## Quick start with Docker Desktop (recommended on Windows)

Everything in containers (app, Postgres, MySQL fixtures, Mailpit): `powershell -ExecutionPolicy Bypass -File docker\dev-up.ps1`,
or see `docs/LOCAL-DOCKER.md` for the manual steps. Site on http://localhost:3001, admin on /admin, mail on http://localhost:8026.

## Quick start (local)

Requirements: Node 20.18+ (22 in use), npm (not pnpm), Docker, and a local Postgres on 5432 (Homebrew) for the dev database.

```
cp .env.example .env          # fill in DATABASE_URL, PAYLOAD_SECRET (a random string of 32+ chars; the app refuses to boot with
                              # fewer), DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD
docker compose up -d          # portal MySQL fixtures on 3308 (db ihna_portal), Mailpit on 1025/8025, a spare postgres:16 on 5434 (db ihna)
                              # (`docker compose up -d postgres portal-mysql` when ihm-web's Mailpit already holds 1025/8025)
createdb -h 127.0.0.1 -p 5432 ihna   # the dev database (DEC-27)
npm install
npm run dev -- -p 3001        # in its own terminal (it keeps running): http://localhost:3001 (ihm-web uses :3000)
```

The dev server pushes the schema the first time Payload loads, so open http://localhost:3001/ once (or run
`npm run payload -- migrate` instead) before seeding. Then, in a second terminal:

```
npx tsx scripts/dev/seed-admin.ts   # first admin user from DEV_ADMIN_EMAIL / DEV_ADMIN_PASSWORD (dev only)
```

Then sign in at http://localhost:3001/admin. Dev email lands in Mailpit (http://localhost:8025). `DRY_RUN=1` (the default) records
enquiry deliveries and payments instead of sending them; `PORTAL_ENABLED=0` (the default) shows course pages without portal data.

`DATABASE_URL` for the dev database: `postgres://<user>:<password>@127.0.0.1:5432/ihna`; the Docker one is on port 5434. To use
the portal fixtures, run `docker/portal-fixtures/load.sh` and set `PORTAL_ENABLED=1` and the `PORTAL_DB_*` values.

Content comes from the import steps (`npm run import -- <step>`, see `docs/modules/30-import.md`); they read `../inventory/`,
`../ihna-web-2.0/`, the live site and the App Runner API (GET only, at most 1 request per second).

## Checks

```
npm run check                 # generate:types, typecheck, lint, check:blocks, test:int (vitest, node), test:blocks (vitest, happy-dom)
npm run test:e2e:enquiries    # Playwright against the running dev server on :3001 (also test:e2e:payments; see AGENTS.md)
npm run parity -- --site=ihna # old vs new crawl, scripts/parity/out/parity-ihna.csv
```

## Production

- `npm run build && npm run start`.
- Apply migrations with `npm run payload migrate` (`src/migrations/`, baseline `20261021_120328_ihna_baseline`); every schema
  change ships `npm run payload migrate:create`.
- Uploads (`media`, `documents`) are stored on local disk under `media/`: persist that directory.
- Static files that are not documents (`public/` stores, `emailers/`, `course-urls.json`) are gitignored and filled by
  `npm run import -- static,live-files`: run it on the build host.
- Scheduled jobs run in-process (`autoRun`); `/api/payload-jobs/run` with `Authorization: Bearer $CRON_SECRET` runs a queue on demand.
- Env names and their meaning: `src/env.ts`, `.env.example`, `docs/modules/00-architecture.md` §6.
