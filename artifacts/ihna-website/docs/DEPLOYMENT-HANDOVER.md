# IHNA website (ihna.edu.au): deployment handover

For the server team. The site is a Next.js 16 + Payload CMS 3.91 app with a PostgreSQL 16 database. It runs as one Node 22 container
(the `Dockerfile` in the repo root, port 3000). Uploaded images and PDFs are stored on disk under `/app/media`.

## What you receive

| Item | How it reaches you |
|---|---|
| Source code | the git repository (branch named in the handover email). Build from a clean clone, never from a copy of a developer's folder. |
| `ihna-db-<date>.dump` | PostgreSQL custom-format dump, restored with `pg_restore`. |
| `ihna-db-<date>.sql` | the same dump as plain SQL, if you prefer `psql`. Use one of the two, not both. |
| `ihna-media-<date>.tgz` | the `media/` folder: uploaded images (`media/`) and documents (`media/documents/`). |
| `ihna-public-static-<date>.tgz` | old static files served at their old URLs (`/pdf/...`, `/ihna-policies/...`, `/wp-content/...`, ...). Unpacked into `public/` before the build. |
| `SHA256SUMS.txt` | checksums of the files above. |
| Secrets (database password, API keys, gateway keys) | sent separately by IHNA through a password manager. They are never in the repo, the dump or email. |

The dump holds content only: courses, blog posts, galleries, staff, media and document records, lookups, products and settings.
Enquiries, payments, alumni accounts, sessions and job queues are empty. It contains one CMS admin user (the developer's account):
replace it at go-live (step 7).

## 1. Check the files

```bash
sha256sum -c SHA256SUMS.txt
```

## 2. Create the database (PostgreSQL 16)

```bash
# as a Postgres superuser
createuser --pwprompt ihna_app
createdb --owner=ihna_app ihna
```

## 3. Restore the dump

```bash
pg_restore --no-owner --no-acl --role=ihna_app -h <db-host> -U postgres -d ihna ihna-db-<date>.dump
# or, plain SQL:
psql -h <db-host> -U ihna_app -d ihna -v ON_ERROR_STOP=1 -f ihna-db-<date>.sql
```

Check it:

```bash
psql -h <db-host> -U ihna_app -d ihna -c "SELECT count(*) FROM courses;" -c "SELECT name, batch FROM payload_migrations;"
```

You should see the courses and the two migrations (`20261021_120328_ihna_baseline`, `20261022_015647_course_shared_stats`) at batch 1.

## 4. Production settings (`.env.production`, kept on the server only)

Start from `.env.example` in the repo. The values that matter for go-live:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` (set by the image) |
| `NEXT_PUBLIC_SITE_URL` | `https://ihna.edu.au` (staging: its own https URL). Built into the app: rebuild when it changes. |
| `DATABASE_URL` | `postgres://ihna_app:<password>@<db-host>:5432/ihna` |
| `PAYLOAD_SECRET` | a new random value, at least 32 characters (`openssl rand -hex 32`). Never reuse the developer's. |
| `REVALIDATE_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET` | new random values |
| `ADMIN_BASIC_USER`, `ADMIN_BASIC_HASH` | basic auth in front of `/admin` (hash = SHA-256 hex of the password), or put `/admin` behind Cloudflare Access (`ADMIN_GUARD_TRUST_CF_ACCESS=1` only when the origin is reachable through Cloudflare alone) |
| `TRUSTED_IP_HEADERS` | the client-IP header your proxy or CDN sets, e.g. `cf-connecting-ip` |
| `RATE_LIMIT_STORE` | `postgres` |
| `EMAIL_FROM`, `RESEND_API_KEY` (or `SMTP_HOST`/`SMTP_PORT`) | the mail service |
| `NEXT_PUBLIC_ROBOTS` | `noindex` on staging; empty on production |
| `TRACKING_ENABLED` | `1` on production only |
| `DRY_RUN`, `PAYMENTS_DRY_RUN` | `1` until IHNA signs off sending to the real CRM, email and payment gateways; then `0` with `ENQUIRY_LIVE_ADAPTERS` and the adapter/gateway variables set (IHNA supplies them) |
| `PORTAL_ENABLED`, `PORTAL_DB_*` | `1` and the read-only portal DB user when the server can reach the portal MySQL; otherwise `0` |
| `DISABLE_DB_PUSH` | `1` |
| `DEV_ADMIN_EMAIL`, `DEV_ADMIN_PASSWORD`, `IMPORT_*`, `LEGACY_BASE_URL`, `APPRUNNER_API_URL` | leave unset (developer and import only) |

## 5. Build the image

```bash
git clone <repo> ihna-web && cd ihna-web && git checkout <branch>
tar -xzf /path/to/ihna-public-static-<date>.tgz -C public     # old static files, before the build
# the build reads .env.production as a BuildKit secret; it never enters an image layer
DOCKER_BUILDKIT=1 docker build --secret id=env,src=/secure/path/.env.production -t ihna-web:<date> .
```

The build connects to the database (restore it first). If Postgres runs on the build host, add `--network host`.

## 6. Run

```bash
mkdir -p /srv/ihna/media && tar -xzf ihna-media-<date>.tgz -C /srv/ihna     # gives /srv/ihna/media/...
chown -R 1001:1001 /srv/ihna/media                                          # the image runs as uid 1001 (nextjs)
docker run -d --name ihna-web --restart unless-stopped \
  --env-file /secure/path/.env.production \
  -v /srv/ihna/media:/app/media \
  -p 127.0.0.1:3000:3000 ihna-web:<date>
```

- `/app/media` must be a persistent volume and must be backed up with the database: staff upload images and PDFs through `/admin`.
  With more than one app instance, it must be shared storage.
- Put a reverse proxy (nginx, Caddy, a load balancer or Cloudflare) in front for HTTPS. Allow request bodies of at least 50 MB for admin uploads.
- Migrations: on every later release run `docker exec ihna-web npx payload migrate` (or `npm run payload migrate` from the source). On this
  first release it reports nothing to run, because the dump already marks both migrations as applied.

## 7. Admin account

1. Open `https://<host>/admin`, sign in with the developer's account (IHNA shares it separately) and create the real admin users
   (Users, role admin).
2. Sign in as a new admin and delete the developer's account, or at least change its password.

## 8. Smoke checks

- `/`, `/courses/`, a course page, `/blog/` and a blog post, `/about-us/` return 200 and show images.
- A policy PDF opens, e.g. a link on `/policies-links-forms/`.
- An old URL redirects (any row of `src/content/redirects.ts`), and a trailing-slash-less URL gets a 308 to the slashed form.
- `/admin` asks for the basic-auth or Cloudflare Access login, then the Payload login.
- Submit a test enquiry with `DRY_RUN=1`: it appears under Admin > Enquiries and nothing is sent out.
- `/robots.txt` is `Disallow: /` on staging and allows crawling on production.

## 9. Backups

- Database: `pg_dump -Fc` daily, kept off the server.
- Media: the `/srv/ihna/media` volume, backed up with the same schedule.

## Contacts

Questions about the content or the code: IHNA web team (Titto Robert). Secrets and gateway credentials: IHNA, through the password manager.
