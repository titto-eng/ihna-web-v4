# Windows, GitHub, and Replit

Canonical repository: https://github.com/titto-eng/ihna-web-v4

Clone the **whole repository**, not only artifacts/ihna-website. This is a pnpm
workspace. Keep its root lockfile and workspace configuration.

## 1. Install on Windows

Install Git for Windows, Node.js 24 LTS, and PostgreSQL 16 or newer (include
pgAdmin and command-line tools). Open a new PowerShell window.
Install pnpm with `npm install --global pnpm@10`.
If PostgreSQL commands are not found, add its `bin` directory to PATH.
Use `pnpm.cmd` if PowerShell execution policy blocks the pnpm.ps1 shim.

```powershell
git clone https://github.com/titto-eng/ihna-web-v4.git
cd ihna-web-v4
pnpm install --frozen-lockfile
Copy-Item artifacts/ihna-website/.env.example artifacts/ihna-website/.env.local
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Put the generated value into PAYLOAD_SECRET in `.env.local`. Set DATABASE_URL
to your **local** PostgreSQL login. URL-encode special characters in the password.
Do not copy Replit database credentials, cloud storage settings, or live-service
credentials to your local configuration. Never commit secrets.

## 2. Restore the original database and assets

Create a **new empty local database** in pgAdmin named `ihna_local`, or:

```powershell
createdb -h localhost -U postgres ihna_local
pg_restore -h localhost -U postgres -d ihna_local --no-owner --no-acl --exit-on-error --single-transaction "C:\path\to\ihna-db-20261105.dump"
```

Use the database dump from your original deployment resources. Do not restore
over an existing database. To refresh later, back it up and restore into a new
database first, then change the local DATABASE_URL after verification.

The original dump predates cloud storage columns. In pgAdmin's Query Tool,
connected to **ihna_local only**, run once:

```sql
ALTER TABLE media ADD COLUMN IF NOT EXISTS prefix varchar;
ALTER TABLE media ADD COLUMN IF NOT EXISTS _objectkey varchar;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS prefix varchar;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS _objectkey varchar;
```

From your full source ZIP, copy `public/` and `media/` into
`artifacts/ihna-website/`. Keep their contents and subfolders intact. Do not copy
node_modules, .next, environment files, or the ZIP's package.json over this clone.
Remove `public/robots.txt` if present: the app generates that route.
The supplied archive does not contain the missing legacy policy PDFs.

These large asset folders and database backups are intentionally excluded from
Git. A clone alone is not a complete database/media backup.

## 3. Run locally

From the repository root:

```powershell
pnpm --filter @workspace/ihna-website dev
```

Open http://localhost:3001 and http://localhost:3001/admin/.
Use the CMS account from the restored database. This setup does not reset it.
Local uploads are written to media/; Replit continues to use cloud storage.
Schema auto-push is disabled to protect the restored data.

Email is not configured locally. Password reset email will not work until a
development mail service is configured. For form testing, use separate reCAPTCHA
development credentials that allow localhost. Production-mode startup requires
a reCAPTCHA secret. Do not enable real payments or outbound services for local tests.

## 4. Code changes in either direction

Before editing in **either environment**, commit or stash current work, then:

```powershell
git pull --ff-only
pnpm install --frozen-lockfile
```

If Git reports divergent branches, stop and merge/rebase deliberately. Do not
force-push or discard edits. Avoid editing the same files in both places at once.

After editing:

```powershell
pnpm --filter @workspace/ihna-website typecheck
git status
git add <the-files-you-changed>
git diff --cached
git commit -m "Describe the website change"
git push
```

Pull in the other environment. Local `dev` refreshes code automatically.
In Replit, use the managed website workflow to start/restart Preview.
Replit Preview is configured for development mode; the published site uses a
separate production build. Pulling does **not** republish the live site.

Check Preview, then click Republish. Keep password-protected access for reviewers.
Do not run root-level `db:push`: the scaffold's Drizzle database is not this CMS.

## 5. Database structure versus content

**Schema:** commit Payload collection/config changes and reviewed Payload
migration files. Apply changes deliberately to the local and Replit **development**
databases before publishing. Do not rerun the old baseline migrations blindly
against the restored database: reconcile the imported schema/migration history
first. Keep DISABLE_DB_PUSH=1 until a reviewed migration is ready.
Replit Publishing compares its development schema to production and applies the
approved schema changes. Review rename/drop warnings. Never run Payload
production migrations from a build hook or server startup.

**Content:** posts, course records, users, and CMS edits live in PostgreSQL, not
Git. Neither pulling nor normal republishing transfers those records.
For this reviewer test, choose ONE content-editing database at a time.
Keep a dated backup before any content transfer.

For a complete local development snapshot, use pgAdmin Backup (Custom format),
then restore into a new empty development database when deliberately replacing
a development copy. Transfer backups privately (for example OneDrive), never Git.
They may contain user data and password hashes. A full restore is replacement,
not a merge; do not run it over a database with edits you need to keep.

For first publishing, initialise production with development data. For a later
deliberate test reset, the Publishing overwrite-data option replaces production
data—it is not routine sync and can erase newer users/submissions/content.
Only use it after backup and explicit approval. Do not use it on a live
enrolment/payment site.

For ongoing content editing in multiple databases, a collection-scoped
export/import tool with stable IDs, relation mapping, conflict previews, and
asset transfer is needed. That automated content merge is **not implemented**.
Until then, edit reviewer content in one authoritative CMS and transfer
snapshots deliberately, or edit published content directly in its CMS.

## 6. Assets

New local uploads are not included in a Git push. Copy the corresponding files
with any database snapshot. Replit's media records need matching cloud objects.
For a small number of additions, upload through the target CMS and update its
references there. Do not copy records whose files have not also been transferred.

Static public files are also excluded from Git. Share changed public assets
separately; they must be copied into the Replit public directory AND its durable
storage backup before publishing. The existing build restores missing public
files from storage; it does not upload local edits. Do not treat GitHub as an
automatic asset synchronisation service.

## Environment boundaries

| Environment | Database | Uploads | Update |
| --- | --- | --- | --- |
| Windows | Local PostgreSQL | Local media folder | Git pull + dev restart as needed |
| Replit Preview | Replit development DB | App Storage | Git pull + workflow restart |
| Published site | Separate production DB | App Storage | Publish/Republish |

Replit Preview and published media currently use the same storage prefix.
Avoid deleting or replacing shared media from Preview; database isolation alone
does not isolate those files.
