// Prints the code registries as JSON for scripts outside Node (inventory/v2/status_sheet.py). No database.
//   npx tsx scripts/dev/registry-json.ts
import { landingPages } from '../../src/content/landing'
import { pages } from '../../src/content/pages'
import { redirects } from '../../src/content/redirects'
import { staffPaths } from '../../src/content/staff-paths'

process.stdout.write(
  JSON.stringify({
    pages: pages.map(({ text: _text, ...p }) => p),
    landing: landingPages,
    redirects,
    staffPaths,
  }),
)
