#!/usr/bin/env bash
# Entry point of the `app` service (docker-compose.dev.yml). Installs dependencies into the node_modules volume when the lockfile
# changes, waits for Postgres, then runs the Next dev server on 0.0.0.0:3001 (the first request pushes the dev schema, DEC-46).
set -euo pipefail
cd /app
STAMP=node_modules/.lock-hash
HASH=$(sha1sum package-lock.json | cut -d' ' -f1)
if [ ! -f "$STAMP" ] || [ "$(cat "$STAMP")" != "$HASH" ]; then
  echo "[app] installing dependencies (npm ci)…"
  npm ci --no-audit --no-fund
  echo "$HASH" > "$STAMP"
fi
until pg_isready -h postgres -U postgres -d ihna >/dev/null 2>&1; do echo "[app] waiting for postgres…"; sleep 2; done
echo "[app] starting dev server on http://localhost:3001"
# Webpack (not Turbopack) in the container: Turbopack cannot poll, and file events over a Windows bind mount are unreliable,
# which showed up as "Module not found" for files that do exist. Webpack with WATCHPACK_POLLING sees every change.
exec npm run dev:docker -- -p 3001 -H 0.0.0.0
