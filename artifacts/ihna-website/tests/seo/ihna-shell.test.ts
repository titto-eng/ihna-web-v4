import { describe, expect, it } from 'vitest'
import { redirects } from '@/content/redirects'
import { matchLegacyRule } from '@/lib/legacy-redirects'
import { nav } from '@/content/nav'
import { footer } from '@/content/footer'
import { EMPTY_200_PATHS, UNAVAILABLE_DEMO_PATHS } from '@/content/static-paths'
import { GET as empty200 } from '@/lib/empty-200'

// IHNA shell (70-urls-seo §4, 05 §4.2): exact redirects, no "contains" rule that could hijack a live landing page, internal menu
// links in the site's URL form, and the static stand-ins.

const internal = (href: string) => href.startsWith('/')

describe('IHNA redirects', () => {
  it('lists each old URL once, never redirects to itself and keeps the live status code', () => {
    const froms = redirects.map((r) => r.from)
    expect(new Set(froms).size).toBe(froms.length)
    for (const r of redirects) {
      expect(r.from).not.toBe(r.to)
      expect(r.to, r.from).toMatch(/^\/.*\/$/)
      // without a file extension the source keeps the trailing slash (Next 308s the slash-less form first)
      if (!/\.[a-z]+$/i.test(r.from)) expect(r.from, r.from).toMatch(/\/$/)
    }
    // 25 server/theme rules (26 redirect URLs: /industry-partnerships (no slash) is the 308 + the slashed rule) + 2 blog sitemap URLs
    expect(redirects).toHaveLength(27)
    expect(redirects.filter((r) => r.permanent).map((r) => r.from).sort()).toEqual([
      '/awards/',
      '/blog/2014/06/ihna-represented-at-amsterdam-for-the-netnep-conference-5th-international-nurse-education-conference/',
      '/blog/2021/10/what-is-the-difference-between-the-two-qualifications-certificate-iii-in-health-administration-and-certificate-iv-in-health-administration/',
      '/clp/diploma-of-nursing/',
      '/courses/hltaid011-provide-first-aid/',
      '/ihna-global-covid-nursing-award/',
    ])
  })
  it('never redirects a live landing page that contains an old header.php needle', () => {
    for (const p of [
      '/study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability/',
      '/study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability-melbourne/',
      '/study-at-ihna/domestic/certificate-iii-individual-support-ageing-disability-perth/',
    ]) {
      expect(matchLegacyRule(p), p).toBeNull()
      expect(redirects.some((r) => r.from === p), p).toBe(false)
    }
  })
})

describe('IHNA header and footer', () => {
  const links = [
    ...nav.utilityLinks,
    ...nav.menu.flatMap((m) => m.groups.flatMap((g) => g.links)),
    ...(nav.primaryCta ? [nav.primaryCta] : []),
    ...footer.columns.flatMap((c) => c.links),
    ...(footer.acknowledgementLink ? [footer.acknowledgementLink] : []),
  ]
  it('writes every internal link with its trailing slash, and never links a URL that is 404 on live', () => {
    for (const l of links.filter((x) => internal(x.href))) expect(l.href, l.label).toMatch(/\/$/)
    const dead = ['/articulation-pathways/', '/school-of-management/', '/india/', '/agent-list/', '/makepayment/']
    for (const l of links) expect(dead, l.href).not.toContain(l.href)
  })
  it('has the live top-level menu', () => {
    expect(nav.menu.map((m) => m.label)).toEqual(['About', 'Courses', 'Campuses', 'Partnership', 'Students', 'Login'])
  })
})

describe('static stand-ins', () => {
  it('lists the 18 demo pages and the 3 empty PHP includes', () => {
    expect(UNAVAILABLE_DEMO_PATHS).toHaveLength(18)
    expect(UNAVAILABLE_DEMO_PATHS.every((p) => p.startsWith('/demo/') && p.endsWith('.html'))).toBe(true)
    expect(EMPTY_200_PATHS).toEqual(['/RDynamics.php', '/campaign_codes.php', '/e2btns.php'])
  })
  it('an old PHP include answers an empty 200, noindex', async () => {
    const res = empty200()
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('')
    expect(res.headers.get('x-robots-tag')).toBe('noindex')
  })
})
