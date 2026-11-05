# Local run with Docker Desktop

Runs the whole stack in containers — the Next.js + Payload app, Postgres 16, the portal MySQL fixtures and Mailpit — so nothing but
Docker Desktop is needed on the machine. It is an alternative to the host setup in `README.md` (Homebrew Postgres + host Node).

| Service | URL / port | Notes |
|---|---|---|
| `app` | http://localhost:3001 · admin http://localhost:3001/admin | `npm run dev` inside the container; code is bind-mounted, edits hot-reload |
| `postgres` | host `localhost:5434` (`POSTGRES_PORT`), db `ihna`, user/pass `postgres` | the app reaches it as `postgres:5432` |
| `portal-mysql` | host `localhost:3308` (`PORTAL_MYSQL_PORT`), db `ihna_portal` | fixtures only; `PORTAL_ENABLED=0` by default |
| `mailpit` | http://localhost:8026 (`MAILPIT_UI_PORT`) | every dev email lands here; SMTP stays inside the compose network, so no host port 1025 is taken |

## First start (Windows, PowerShell, from the repo root)

```powershell
powershell -ExecutionPolicy Bypass -File docker\dev-up.ps1
```

The script creates `.env` from `.env.example` when it is missing (random `PAYLOAD_SECRET`, dev admin
`admin@ihna.local` / `ChangeMe-Local-123`, `OLD_WP_PATH=E:/wamp64/www/ihna-web-2.0`), builds and starts the stack, waits for the
site and creates the dev admin. The first start runs `npm ci` inside the container (a few minutes); later starts are fast.

## Manual steps (any OS)

```bash
cp .env.example .env    # set PAYLOAD_SECRET (32+ chars), DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD; optionally OLD_WP_PATH / INVENTORY_PATH
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f app      # wait for "Ready", then open http://localhost:3001/ once
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec app npx tsx scripts/dev/seed-admin.ts
```

`DATABASE_URL`, `SMTP_*` and `PORTAL_DB_HOST/PORT` in `.env` are overridden for the container (service names), so the same `.env`
still works for a host-side `npm run dev`.

## Content (CMS data)

Route-file pages (about, campuses, schools, policies, landing pages, …) render straight from code. Courses, blog posts, galleries,
staff, media and documents live in Postgres and are filled by the import steps (`docs/modules/30-import.md`).

The import's WordPress input is extracted from the database dump `ihna-web-2.0/ihna_wp.sql` into `.inventory/` (gitignored; see
`.inventory/README.md`): `data/ihna/{pages,posts,courses}.json` (144 / 4 / 21 published items), `v2/ihna/pages.csv`, the theme's content
tables and `content-gaps.json`. `.env` has `INVENTORY_PATH=./.inventory`, so Docker mounts it at `/inventory` (the scripts read
`../inventory` from `/app`). The old WordPress folder is mounted read-only at `/ihna-web-2.0` and is never written to. Personal-data
tables of the dump (users, enquiries, registrations, resumes, leads, comments, logs) are not extracted.

```bash
# courses first (wp-courses needs the lookups), then the rest; each step is idempotent
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec app npm run import -- lookups,wp-courses
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec app npm run import -- media,theme-photos,staff,assign-images,link-course-managers,link-course-brochures,documents
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec app npm run import -- apprunner   # blog posts and galleries (App Runner API)
```


## Running `npm run dev` on Windows instead of in the container

`npm run dev` works straight in PowerShell. Its `predev` preflight (`scripts/dev/ensure-deps.mjs`, plain Node):

1. installs the Windows `node_modules` with `npm ci` when the dev binaries are missing or `package-lock.json` changed (the container's
   Linux packages live in a Docker volume and are never visible to Windows), so *'cross-env' is not recognized* cannot happen;
2. starts the Docker Postgres and Mailpit (`docker compose ... up -d postgres mailpit`) when nothing answers on the `DATABASE_URL` port
   (`.env`: `127.0.0.1:5434`, the Docker Postgres);
3. stops with a clear message when port 3001 is taken (usually the `app` container: `docker compose -f docker-compose.yml -f docker-compose.dev.yml stop app`).

The site is then on http://localhost:3001. Mail goes to the Docker Mailpit through `127.0.0.1:1026` (`.env` `SMTP_HOST` / `SMTP_PORT`;
`MAILPIT_SMTP_PORT` changes the host port) and shows at http://localhost:8026. `docker\host-dev.ps1` does the same in one script.
Skip the preflight with `SKIP_ENSURE_DEPS=1`.

Run the site in **one** place at a time (the container *or* the host), not both.

## Everyday commands

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml stop            # stop (data kept)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d           # start again
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec app npm run check
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v         # wipe everything incl. the database
```

Troubleshooting:
- "port is already allocated" → set `POSTGRES_PORT`, `PORTAL_MYSQL_PORT`, `MAILPIT_UI_PORT` or `MAILPIT_SMTP_PORT` in `.env` (3001 is the app's own port).
- **Build Error "Module not found" for a file that exists**, or changes not picked up → the dev cache is stale. On the host: `npm run dev:clean`
  (deletes `.next`, then starts). In the container: `docker compose -f docker-compose.yml -f docker-compose.dev.yml restart app`. The
  container runs `next dev --webpack` with `WATCHPACK_POLLING` (`npm run dev:docker`), because Turbopack cannot poll and file events
  over a Windows bind mount are unreliable.
- Dependency change → `package-lock.json` hash changes; the entrypoint (container) or the preflight (host) re-runs `npm ci`.
- Fonts are self-hosted (`src/fonts/`), so dev and build work offline; no "Failed to fetch font" errors.
- The "(stale)" label next to the Next.js version in the error overlay only means a newer Next.js release exists; it is not an error.
