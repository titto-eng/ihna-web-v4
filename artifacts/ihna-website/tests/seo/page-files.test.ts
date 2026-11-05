import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { pages, sectionLinks, sections, type SectionKey } from '@/content/pages'
import { formByKey } from '@/content/forms'

// The hardcoded pages (DEC-61): every route file under src/app/(site)/ is plain JSX over the kit, and src/content/pages.ts has
// exactly one row per route file. Machinery routes (auth, payments, listings, dynamic segments) have no registry row.
const ROOT = 'src/app/(site)'
const MACHINERY = /^\/(alumni\/(dashboard|forgot-password|login|register|reset-password|verify)\/|makepayment\/|search\/|pay\/|lp\/|courses\/|blog\/|news\/)/

function routeFiles(dir = ROOT): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...routeFiles(p))
    else if (name === 'page.tsx') out.push(p)
  }
  return out
}
const pathOf = (file: string) => {
  const rel = relative(ROOT, file).replace(/\/?page\.tsx$/, '')
  if (!rel) return '/'
  return /\.(php|html)$/.test(rel) ? `/${rel}` : `/${rel}/`
}
const fileOf = (path: string) => join(ROOT, path === '/' ? '' : path.replace(/^\/|\/$/g, ''), 'page.tsx')

const files = routeFiles().filter((f) => !f.includes('['))
// `route: 'existing'` rows are pages another module renders (payments, blog listing): listed for the sitemap, not hardcoded content.
const existing = new Set(pages.filter((p) => p.route === 'existing').map((p) => p.path))
// Landing pages and their companions (thanks.php, index.php, aliases) have their own registry and test (src/content/landing.ts,
// tests/seo/landing-routes.test.ts).
const LANDING = /^\/(study-at-ihna|healthcare-courses-[a-z]+|walkin-enquiry|walkin-registration)\//
const contentFiles = files.filter((f) => !MACHINERY.test(pathOf(f)) && !LANDING.test(pathOf(f)) && !existing.has(pathOf(f)))

describe('hardcoded page files', () => {
  it('contain no old markup: no class/style attributes, raw HTML injection or theme class names', () => {
    const bad: string[] = []
    for (const f of contentFiles) {
      const src = readFileSync(f, 'utf8')
      const hits = [
        /\bclass=/, /\bstyle=/, /dangerouslySetInnerHTML/, /wp-content\/themes/, /<iframe\b/, /<script\b/,
        /\b(btn-[a-z]|col-(xs|sm|md|lg|xl)-\d|owl-carousel|tab-pane|accordion-item|pShipList|staff-thumb-box|youtube-player|bl-light-txt|req-p)\b/,
      ].filter((re) => re.test(src))
      if (hits.length) bad.push(`${f}: ${hits.map(String).join(' ')}`)
    }
    expect(bad).toEqual([])
  })

  it('set their metadata through pageMetadata()', () => {
    const missing = contentFiles.filter((f) => !/pageMetadata\(/.test(readFileSync(f, 'utf8')))
    expect(missing).toEqual([])
  })

  // An unknown key renders nothing, so a typo would silently drop a form.
  it('use only form keys defined in src/content/forms.ts', () => {
    const unknown: string[] = []
    for (const f of contentFiles) for (const m of readFileSync(f, 'utf8').matchAll(/formKey[=:]\s*["']([^"']+)["']/g)) if (!formByKey(m[1])) unknown.push(`${f}: ${m[1]}`)
    expect(unknown).toEqual([])
  })
})

describe('src/content/pages.ts registry', () => {
  it('has one row per route file, and every row has its route file', () => {
    const rows = new Set(pages.map((p) => p.path))
    expect(rows.size).toBe(pages.length)
    const withoutRow = contentFiles.map(pathOf).filter((p) => !rows.has(p))
    const withoutFile = pages.filter((p) => p.route !== 'existing' && !existsSync(fileOf(p.path))).map((p) => p.path)
    expect(withoutRow).toEqual([])
    expect(withoutFile).toEqual([])
    expect(pages.filter((p) => p.route !== 'existing').length).toBe(contentFiles.length)
  })

  it('keeps paths in the stored form (leading slash; trailing slash unless a file name)', () => {
    for (const p of pages) expect(p.path, p.path).toMatch(/^\/(?:[^?#]*\/|[^?#]*\.(php|html))?$/)
  })

  it('section navs only link pages that exist (or external and document links)', () => {
    for (const key of Object.keys(sections) as SectionKey[]) {
      const links = sectionLinks(key)
      expect(links.length, key).toBeGreaterThan(1)
      for (const l of links) {
        if (/^https?:|^\/pdf\//.test(l.href)) continue
        const known = pages.some((p) => p.path === l.href) || /^\/(course-calendar|pay-online)\//.test(l.href)
        expect(known, `${key} -> ${l.href}`).toBe(true)
      }
    }
  })

  it('thank-you pages are noindex', () => {
    for (const p of pages.filter((x) => /thanks\/$/.test(x.path) && !x.route)) expect(p.noindex, p.path).toBe(true)
  })
})
