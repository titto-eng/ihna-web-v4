/**
 * Link check for the `documents` collection: every PDF href on the rendered /policies-procedures/ page, the four fee PDFs the course
 * pages link, and the alias URLs must answer 200 with Content-Type application/pdf. `--all` also HEADs every document's publicPath
 * (read from the public REST API).
 * Run against a running server: `npx tsx scripts/dev/check-document-links.ts [--base=<url>] [--all]` (default CHECK_BASE_URL, else
 * NEXT_PUBLIC_SITE_URL, else `DEV_SITE_URL`: :3001 on IHNA). Exit 1 on any failure.
 */
import { DEV_SITE_URL } from '../import/lib/config'

const arg = (k: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=')
const BASE = (arg('base') ?? (process.env.CHECK_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || DEV_SITE_URL)).replace(/\/$/, '')
const ALL = process.argv.includes('--all')

const COURSE_FEE_LINKS = [
  '/pdf/policies/Fees_Charges_and_Refunds_for_International_Students_Policy.pdf',
  '/pdf/policies/IHM_Fees_Charges_and_Refunds_for_Domestic_Students_Policy.pdf',
  '/pdf/procedures/Fees_Charges_and_Refunds_for_International_Students_Procedure.pdf',
  '/pdf/procedures/IHM_Fees_Charges_and_Refunds_for_Domestic_Students_Procedure.pdf',
]
const ALIAS_LINKS = ['/pdf/policies/Fraud&Corruption_Prevention&Control_Policy.pdf', '/IHM_Domestic_SHB/Domestic-SHB.pdf']
const DOC_PREFIX = /^\/(pdf|brochures|IHM_Domestic_SHB|International-SHB)\//

const decodeEntities = (s: string) => s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')

async function check(path: string, method: 'GET' | 'HEAD'): Promise<string | null> {
  try {
    const res = await fetch(BASE + path, { method, redirect: 'manual', signal: AbortSignal.timeout(60_000) })
    if (method === 'GET') await res.arrayBuffer()
    const type = res.headers.get('content-type') ?? ''
    return res.status === 200 && type.startsWith('application/pdf') ? null : `${res.status} ${type}`
  } catch (e) {
    return e instanceof Error ? e.message : String(e)
  }
}

async function main() {
  const html = await (await fetch(`${BASE}/policies-procedures/`)).text()
  // Inactive tabs are not in the DOM until clicked: their links are read from the RSC payload embedded in the HTML.
  const hrefs = [
    ...[...html.matchAll(/href="([^"]+)"/g)].map((m) => decodeEntities(m[1])),
    ...[...html.matchAll(/\\"href\\":\\"([^"\\]+)\\"/g)].map((m) => m[1]),
  ]
  const pageLinks = hrefs.filter((h) => DOC_PREFIX.test(h))
  const odd = hrefs.filter((h) => /\.pdf$/i.test(h) && !DOC_PREFIX.test(h))
  const unique = [...new Set([...pageLinks, ...COURSE_FEE_LINKS, ...ALIAS_LINKS])]
  const failures: string[] = []
  for (const p of unique) {
    const err = await check(p, 'GET')
    if (err) failures.push(`${p}: ${err}`)
  }
  console.log(`page: ${pageLinks.length} PDF links (${new Set(pageLinks).size} distinct); checked ${unique.length} URLs incl. 4 course fee links and ${ALIAS_LINKS.length} aliases`)
  if (odd.length) failures.push(...odd.map((h) => `${h}: PDF link outside the document prefixes`))

  if (ALL) {
    const r = await fetch(`${BASE}/api/documents?limit=0&depth=0&select[publicPath]=true`)
    const { docs } = (await r.json()) as { docs: { publicPath: string }[] }
    let bad = 0
    for (const d of docs) {
      const err = await check(encodeURI(d.publicPath), 'HEAD')
      if (err) {
        bad++
        failures.push(`${d.publicPath}: ${err}`)
      }
    }
    console.log(`all documents: ${docs.length} HEAD-checked, ${docs.length - bad} OK`)
  }

  for (const f of failures) console.log(`FAIL ${f}`)
  console.log(failures.length ? `${failures.length} failure(s)` : 'all OK: 200 application/pdf')
  process.exit(failures.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
