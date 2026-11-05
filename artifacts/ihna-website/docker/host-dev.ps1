# Run the Next dev server directly on Windows (instead of inside the `app` container), using the Docker Postgres/Mailpit.
# Usage, from the repo root in PowerShell:   powershell -ExecutionPolicy Bypass -File docker\host-dev.ps1
# Why: `npm run dev` on the host needs the host's own node_modules (the container keeps its Linux node_modules in a Docker volume),
# otherwise Windows reports "'cross-env' is not recognized".
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$compose = @('-f', 'docker-compose.yml', '-f', 'docker-compose.dev.yml')

# 1. Host dependencies (Windows binaries), installed once and again whenever package-lock.json changes.
$stamp = 'node_modules\.lock-hash-win'
$hash = (Get-FileHash package-lock.json -Algorithm SHA1).Hash
if (-not (Test-Path $stamp) -or (Get-Content $stamp) -ne $hash) {
  Write-Host 'Installing dependencies for Windows (npm ci)...'
  npm ci --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { Write-Host 'npm ci failed.' -ForegroundColor Red; exit 1 }
  Set-Content $stamp $hash
}

# 2. Databases and mail in Docker; the containerised app is stopped so port 3001 is free.
docker compose @compose up -d postgres mailpit
docker compose @compose stop app 2>$null | Out-Null

# 3. Point this process at the Docker services (host ports), then start the dev server.
$pgPort = if ($env:POSTGRES_PORT) { $env:POSTGRES_PORT } else { '5434' }
$env:DATABASE_URL = "postgres://postgres:postgres@127.0.0.1:$pgPort/ihna"
$env:SMTP_HOST = '127.0.0.1'
$env:SMTP_PORT = if ($env:MAILPIT_SMTP_PORT) { $env:MAILPIT_SMTP_PORT } else { '1026' }
Write-Host "Dev server: http://localhost:3001  (database on 127.0.0.1:$pgPort)"
npm run dev
