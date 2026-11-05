# One-command local start on Windows (Docker Desktop must be running). Usage, from the repo root in PowerShell:
#   powershell -ExecutionPolicy Bypass -File docker\dev-up.ps1
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  $secret = -join ((48..57) + (97..122) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
  (Get-Content .env) `
    -replace '^PAYLOAD_SECRET=.*', "PAYLOAD_SECRET=$secret" `
    -replace '^DEV_ADMIN_EMAIL=.*', 'DEV_ADMIN_EMAIL=admin@ihna.local' `
    -replace '^DEV_ADMIN_PASSWORD=.*', 'DEV_ADMIN_PASSWORD=ChangeMe-Local-123' | Set-Content .env
  Add-Content .env "`n# Docker Desktop: host path of the old WordPress folder (read-only mount for the import scripts)`nOLD_WP_PATH=E:/wamp64/www/ihna-web-2.0`nINVENTORY_PATH=../inventory"
  function New-Key([int]$n) { -join (1..$n | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) }) }
  Add-Content .env "REVALIDATE_SECRET=$(New-Key 24)`nPAYMENTS_DATA_KEY=$(New-Key 32)`nCRON_SECRET=$(New-Key 24)`nPREVIEW_SECRET=$(New-Key 16)`nRATE_LIMIT_STORE=memory`nNEXT_PUBLIC_ROBOTS=noindex"
  Write-Host 'Created .env (admin: admin@ihna.local / ChangeMe-Local-123). Edit it if you need other values.'
}
# Docker reads .env as-is: save it with LF line endings (PowerShell writes CRLF).
$envText = (Get-Content .env -Raw) -replace "`r`n", "`n"
[IO.File]::WriteAllText((Join-Path (Get-Location) '.env'), $envText)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build --remove-orphans
if ($LASTEXITCODE -ne 0) {
  Write-Host 'docker compose failed (see the error above). A port in use? Set MAILPIT_UI_PORT / POSTGRES_PORT / PORTAL_MYSQL_PORT in .env and run again.' -ForegroundColor Red
  exit 1
}
$tries = 0
Write-Host 'Waiting for the dev server (first start runs npm ci: a few minutes)...'
do {
  Start-Sleep -Seconds 5; $tries++
  try { $ok = (Invoke-WebRequest -UseBasicParsing http://localhost:3001/ -TimeoutSec 120).StatusCode -eq 200 } catch { $ok = $false }
  if (-not $ok -and ($tries % 6 -eq 0)) { docker compose -f docker-compose.yml -f docker-compose.dev.yml logs --tail 5 app }
  if ($tries -gt 180) { Write-Host 'The site did not answer after 15 minutes: check `docker compose -f docker-compose.yml -f docker-compose.dev.yml logs app`.' -ForegroundColor Red; exit 1 }
} until ($ok)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec app npx tsx scripts/dev/seed-admin.ts
Write-Host 'Ready: http://localhost:3001  ·  admin: http://localhost:3001/admin  ·  mail: http://localhost:8026'
