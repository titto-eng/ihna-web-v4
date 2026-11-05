// Runs the inventory tracker scripts (../inventory/v2/{status_sheet,tracking_sheet}.py, DEC-37) for this repo's site, so
// package.json carries no site name: the site is `SITE` in scripts/import/lib/config.ts.
//   npx tsx scripts/dev/inventory-sheet.ts status|tracking [--no-xlsx] [--db=postgres://...]
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { ROOT, SITE } from '../import/lib/config'

const [kind, ...rest] = process.argv.slice(2)
if (kind !== 'status' && kind !== 'tracking') {
  console.error('usage: inventory-sheet.ts status|tracking [--no-xlsx] [--db=...]')
  process.exit(2)
}
const script = resolve(ROOT, '../inventory/v2', `${kind}_sheet.py`)
const res = spawnSync('python3', [script, SITE, ...rest], { stdio: 'inherit' })
process.exit(res.status ?? 1)
