import { describe, expect, it } from 'vitest'
// Next's own route builder: the same code that turns next.config redirects into the matchers the server runs.
import { buildCustomRoute } from 'next/dist/lib/build-custom-route'
import { trailingSlashRedirects } from '@/lib/trailing-slash'
import { site } from '@/content/site'

// 45 §5: `/airwallex-webhook` without the slash must reach the webhook with its body, so next.config.ts replaces Next's trailing-slash
// redirects with the same rules minus `site.postWithoutSlash`. Every other path must redirect exactly as Next's internal rules do (rule 1).
const internal = [
  { source: '/:file((?!\\.well-known(?:/.*)?)(?:[^/]+/)*[^/]+\\.\\w+)/', destination: '/:file', permanent: true, internal: true },
  { source: '/:notfile((?!\\.well-known(?:/.*)?)(?:[^/]+/)*[^/\\.]+)', destination: '/:notfile/', permanent: true, internal: true },
]
type Built = { regex: string; destination: string }
const build = (routes: object[], internalRoutes: boolean): Built[] =>
  routes.map((r) => buildCustomRoute('redirect', r as never, (internalRoutes ? undefined : ['/_next']) as string[]) as unknown as Built)

/** The redirect target the first matching rule gives, or null. */
function target(rules: Built[], path: string): string | null {
  for (const r of rules) {
    const m = new RegExp(r.regex).exec(path)
    if (m) {
      const value = m.groups?.file ?? m.groups?.notfile ?? m[1]
      return r.destination.replace(/:(file|notfile)/, value)
    }
  }
  return null
}

const PATHS = [
  '/', '/contact', '/contact/', '/courses/diploma-of-nursing', '/courses/diploma-of-nursing/', '/blog/2020/01/x', '/blog/2020/01/x/',
  '/pdf/foo.pdf', '/pdf/foo.pdf/', '/robots.txt', '/sitemap.xml', '/.well-known/security.txt', '/.well-known/x', '/api/enquire',
  '/api/enquire/', '/airwallex-webhook/', '/airwallex-webhook-x', '/x/airwallex-webhook', '/lp/a/thanks.php', '/lp/a/thanks.php/',
  '/study-at-ihna/domestic/diploma-nursing-int-thanks.php', '/a.b/c', '/wp-content/uploads/2020/01/a.jpg',
]

describe('trailing-slash redirects without Next\'s built-in rules (next.config.ts)', () => {
  const ours = build(trailingSlashRedirects(site.postWithoutSlash), false)
  const next = build(internal, true)

  it('redirect every path exactly as Next\'s internal rules do', () => {
    for (const p of PATHS) expect(target(ours, p), p).toBe(target(next, p))
  })

  it('leave only the webhook paths without a slash alone (the proxy rewrites their POST and 308s the rest)', () => {
    expect(site.postWithoutSlash).toContain('/airwallex-webhook')
    expect(target(next, '/airwallex-webhook')).toBe('/airwallex-webhook/')
    expect(target(ours, '/airwallex-webhook')).toBeNull()
    expect(target(ours, '/airwallex-webhook-x')).toBe('/airwallex-webhook-x/')
  })

  it('never redirect a slashed path to itself', () => {
    for (const p of PATHS.filter((x) => x.endsWith('/'))) expect(target(ours, p), p).not.toBe(p)
  })
})
