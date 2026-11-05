<#
  Builds the release package for the server team (see docs/DEPLOYMENT-HANDOVER.md):
    deploy\ihna-release-<date>\ihna-db-<date>.dump              Postgres custom-format dump (pg_restore)
    deploy\ihna-release-<date>\ihna-db-<date>.sql               the same as plain SQL (psql)
    deploy\ihna-release-<date>\ihna-media-<date>.tgz            uploads: media/ (images) and media/documents/ (PDFs)
    deploy\ihna-release-<date>\ihna-public-static-<date>.tgz    the gitignored public/ folders filled by the import
    deploy\ihna-release-<date>\SHA256SUMS.txt, DEPLOYMENT-HANDOVER.md
  The dump is a cleaned copy of the dev database: enquiries, payments, alumni, sessions, jobs, locks and preferences are emptied
  (no personal data, AGENTS.md rule 4) and the shipped migrations are marked as applied. The dev database itself is not changed.
  Run in PowerShell from the project folder, with the Docker stack up (dc up -d):
    powershell -ExecutionPolicy Bypass -File .\scripts\deploy\make-release.ps1
  -SkipFiles makes only the database dump.
#>
param([switch]$SkipFiles)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $root
$compose = @('compose', '-f', 'docker-compose.yml', '-f', 'docker-compose.dev.yml')
function dc { docker @compose @args; if ($LASTEXITCODE -ne 0) { throw "docker compose $($args -join ' ') failed (exit $LASTEXITCODE)" } }
function dk { docker @args; if ($LASTEXITCODE -ne 0) { throw "docker $($args -join ' ') failed (exit $LASTEXITCODE)" } }

$stamp = Get-Date -Format 'yyyyMMdd'
$name = "ihna-release-$stamp"
$rel = "deploy\$name"
New-Item -ItemType Directory -Force (Join-Path $root $rel) | Out-Null
$pg = docker @compose ps -q postgres
if (-not $pg) { throw 'The postgres container is not running. Run  dc up -d  first.' }

if (-not $SkipFiles) {
  Write-Host '1/7 Packing media/ (uploaded images and documents)' -ForegroundColor Cyan
  dc exec -T app tar -czf "deploy/$name/ihna-media-$stamp.tgz" media
  Write-Host '2/7 Packing the public static folders' -ForegroundColor Cyan
  $static = @('pdf', 'ihna-policies', 'ihna-procedures', 'IHNA_International_Course_Guide', 'alumni/docs', 'wp-content', 'emailers', 'brochures', 'course-urls.json')
  $present = @($static | Where-Object { Test-Path (Join-Path $root "public/$_") })
  $missing = @($static | Where-Object { $present -notcontains $_ })
  if ($missing.Count) { Write-Warning "Not in public/: $($missing -join ', '). If they should ship, run  dc exec app npm run import -- static,live-files,documents  and re-run this script." }
  if ($present.Count) { dc exec -T app tar -czf "deploy/$name/ihna-public-static-$stamp.tgz" -C public @present }
} else { Write-Host '1-2/7 Skipping media and static files (-SkipFiles)' -ForegroundColor DarkGray }

Write-Host '3/7 Stopping the app so nothing writes during the copy' -ForegroundColor Cyan
dc stop app
try {
  Write-Host '4/7 Copying the database to ihna_release and cleaning the copy' -ForegroundColor Cyan
  dc exec -T postgres psql -U postgres -v ON_ERROR_STOP=1 -c 'DROP DATABASE IF EXISTS ihna_release;' -c 'CREATE DATABASE ihna_release TEMPLATE ihna;'
  $migs = Get-ChildItem (Join-Path $root 'src\migrations') -Filter '*.ts' | Where-Object { $_.BaseName -ne 'index' } | Sort-Object Name | ForEach-Object { "('$($_.BaseName)')" }
  $sql = @"
TRUNCATE enquiries, payments, alumni, alumni_sessions, users_sessions, payload_jobs, payload_locked_documents, payload_preferences, payload_kv RESTART IDENTITY CASCADE;
DELETE FROM payload_migrations WHERE batch = -1;
INSERT INTO payload_migrations (name, batch)
  SELECT v.n, 1 FROM (VALUES $($migs -join ', ')) AS v(n)
  WHERE NOT EXISTS (SELECT 1 FROM payload_migrations m WHERE m.name = v.n);
"@
  $sql | docker @compose exec -T postgres psql -U postgres -d ihna_release -v ON_ERROR_STOP=1
  if ($LASTEXITCODE -ne 0) { throw 'Cleaning the release copy failed.' }

  Write-Host '5/7 What the release holds' -ForegroundColor Cyan
  dc exec -T postgres psql -U postgres -d ihna_release `
    -c 'SELECT (SELECT count(*) FROM courses) AS courses, (SELECT count(*) FROM posts) AS posts, (SELECT count(*) FROM galleries) AS galleries, (SELECT count(*) FROM staff) AS staff, (SELECT count(*) FROM media) AS media, (SELECT count(*) FROM documents) AS documents, (SELECT count(*) FROM enquiries) AS enquiries, (SELECT count(*) FROM payments) AS payments;' `
    -c 'SELECT id, email FROM users ORDER BY id;' `
    -c 'SELECT name, batch FROM payload_migrations ORDER BY id;'

  Write-Host '6/7 Dumping' -ForegroundColor Cyan
  dc exec -T postgres pg_dump -U postgres -d ihna_release -Fc --no-owner --no-acl -f /tmp/ihna-db.dump
  dc exec -T postgres pg_dump -U postgres -d ihna_release --no-owner --no-acl -f /tmp/ihna-db.sql
  dk cp "${pg}:/tmp/ihna-db.dump" "$rel\ihna-db-$stamp.dump"
  dk cp "${pg}:/tmp/ihna-db.sql" "$rel\ihna-db-$stamp.sql"

  Write-Host '7/7 Test restore of the dump into a scratch database' -ForegroundColor Cyan
  dc exec -T postgres psql -U postgres -v ON_ERROR_STOP=1 -c 'DROP DATABASE IF EXISTS ihna_restore_check;' -c 'CREATE DATABASE ihna_restore_check;'
  dc exec -T postgres pg_restore -U postgres -d ihna_restore_check --no-owner --no-acl /tmp/ihna-db.dump
  $courses = docker @compose exec -T postgres psql -U postgres -d ihna_restore_check -tAc 'SELECT count(*) FROM courses;'
  Write-Host "    Restore OK: $($courses.Trim()) courses" -ForegroundColor Green
} finally {
  docker @compose exec -T postgres psql -U postgres -c 'DROP DATABASE IF EXISTS ihna_restore_check;' -c 'DROP DATABASE IF EXISTS ihna_release;' | Out-Null
  docker @compose exec -T postgres rm -f /tmp/ihna-db.dump /tmp/ihna-db.sql | Out-Null
  Write-Host 'Starting the app again' -ForegroundColor Cyan
  docker @compose start app | Out-Null
}

$dir = Join-Path $root $rel
Copy-Item (Join-Path $root 'docs\DEPLOYMENT-HANDOVER.md') $dir -Force
Get-ChildItem $dir -File | Where-Object { $_.Name -notin @('SHA256SUMS.txt', 'DEPLOYMENT-HANDOVER.md') } | Get-FileHash -Algorithm SHA256 |
  ForEach-Object { "$($_.Hash.ToLower())  $(Split-Path $_.Path -Leaf)" } | Set-Content (Join-Path $dir 'SHA256SUMS.txt') -Encoding ascii
Write-Host "`nRelease package ready: $dir" -ForegroundColor Green
Get-ChildItem $dir -File | Format-Table Name, @{ n = 'MB'; e = { [math]::Round($_.Length / 1MB, 1) } } -AutoSize
