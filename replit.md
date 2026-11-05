# IHNA reviewer website

The existing IHNA Next.js/Payload website is imported into `artifacts/ihna-website`, not rebuilt in Vite. Preserve its design, routes, CMS, and content.

## IHNA operations

- Main service: `artifacts/ihna-website: web`. Uses the artifact-assigned `PORT`.
- Preview currently runs the production build (`start`) for reviewer validation. Rebuild after source changes, or switch the managed development command back to `dev` for editing.
- `pnpm --filter @workspace/ihna-website typecheck` and `pnpm --filter @workspace/ihna-website build` validate the imported application.
- Payload uses the restored Replit PostgreSQL database. `DISABLE_DB_PUSH=1` prevents automatic schema changes. Never run the scaffold's Drizzle push against this database.
- `/api/*` belongs to Next.js/Payload; the template API service owns only `/api/healthz`.
- Media and document uploads use App Storage via Payload's GCS adapter. Imported public assets are backed up under `ihna/public/`; the build restores missing public files from that prefix.
- The source ZIP's environment files were excluded. Runtime derives a distinct Payload key from `SESSION_SECRET` using HKDF when `PAYLOAD_SECRET` is absent. Keep the base secret stable to avoid invalidating CMS sessions.
- This is a reviewer test: keep `DRY_RUN=1`, `PAYMENTS_DRY_RUN=1`, `NEXT_PUBLIC_ROBOTS=noindex`, `TRACKING_ENABLED=0`, `PORTAL_ENABLED=0`, and `ENQUIRY_AUTORUN=0`.
- Production address is configured as `https://ihnav4.replit.app`; reCAPTCHA secrets are supplied. Before publishing, select restricted access and initialize the production database with current development data. Add the publishing hostname to the reCAPTCHA allowed domains. The original production startup requires `RECAPTCHA_SECRET_KEY`.
- The supplied ZIP has no legacy policy PDF archive and the imported `documents` collection is empty. Do not claim policy/document parity until those files are supplied.
- Uploaded backups and diagnostic outputs are kept in ignored `generated-artifacts/ihna-import/`, not served or deployed.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
