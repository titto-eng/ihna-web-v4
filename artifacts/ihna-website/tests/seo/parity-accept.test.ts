import { describe, expect, it } from 'vitest'
import { acceptedBy, type AcceptContext, type Answer } from '../../scripts/parity/accept'

// 70-urls-seo §7 parity crawl: a known, legitimate difference becomes ACCEPTED with a reason; everything else keeps its verdict.
const ans = (a: Partial<Answer>): Answer => ({ first: 200, slashOnly: false, finalUrl: '', finalStatus: 200, ...a })
const ctx = (c: Partial<AcceptContext>): AcceptContext => ({
  path: '/x/',
  exp: 'live200',
  result: 'STATUS_DIFF',
  live: ans({}),
  next: ans({}),
  ...c,
})
const rule = (site: string, c: Partial<AcceptContext>) => acceptedBy(site, ctx(c))?.id

describe('parity accepted differences', () => {
  it('never re-classifies OK or NEW_ERROR rows, and IHM has no rules', () => {
    const folder = { live: ans({ first: 403, finalStatus: 403 }), next: ans({ first: 404, finalStatus: 404 }) }
    expect(rule('ihna', { ...folder, result: 'OK' })).toBeUndefined()
    expect(rule('ihna', { ...folder, result: 'NEW_ERROR' })).toBeUndefined()
    expect(rule('ihm', folder)).toBeUndefined()
    expect(rule('ihna', folder)).toBe('live-403-folder')
  })

  it('a live 403 folder must be a 404 here, not a 200 or a 500', () => {
    const live = ans({ first: 403, finalStatus: 403 })
    expect(rule('ihna', { live, next: ans({ first: 500, finalStatus: 500 }) })).toBeUndefined()
    expect(rule('ihna', { live, next: ans({ first: 308, slashOnly: true, finalStatus: 404 }) })).toBe('live-403-folder')
  })

  it('the live /blog/* catch-all (empty "IHNA Blogs" 200) accepts a 404 or a redirect here, not on /blog/ itself', () => {
    const live = ans({ title: 'IHNA Blogs', h1: '' })
    expect(rule('ihna', { path: '/blog/2023/01/x/', live, next: ans({ first: 404, finalStatus: 404 }) })).toBe('blog-catch-all')
    expect(rule('ihna', { path: '/blog/x/', live, next: ans({ first: 301, finalStatus: 200, finalUrl: '/blog/' }) })).toBe(
      'blog-catch-all',
    )
    expect(rule('ihna', { path: '/blog/', live, next: ans({ first: 404, finalStatus: 404 }) })).toBeUndefined()
    // a real post (a heading) is not the catch-all
    expect(rule('ihna', { path: '/blog/x/', live: ans({ title: 'IHNA Blogs', h1: 'A post' }), next: ans({ first: 404, finalStatus: 404 }) })).toBeUndefined()
  })

  it('a live redirect into a 404 accepts a 404 here; a live 200 does not', () => {
    const next = ans({ first: 404, finalStatus: 404 })
    expect(rule('ihna', { live: ans({ first: 302, finalStatus: 404 }), next })).toBe('live-redirect-to-404')
    expect(rule('ihna', { live: ans({ first: 302, finalStatus: 200 }), next })).toBeUndefined()
  })

  it('demo/ placeholders, payment titles and the slashed .htaccess form are accepted only where listed', () => {
    const placeholder = ans({ title: 'Page not available | IHNA' })
    expect(rule('ihna', { path: '/demo/x/index.html', result: 'TITLE_DIFF', next: placeholder })).toBe('demo-placeholder')
    expect(rule('ihna', { path: '/about-us/', result: 'TITLE_DIFF', next: placeholder })).toBeUndefined()
    expect(rule('ihna', { path: '/pay-online/', result: 'TITLE_DIFF' })).toBe('payment-page')
    expect(rule('ihna', { path: '/pay-online/', result: 'STATUS_DIFF', next: ans({ first: 404, finalStatus: 404 }) })).toBeUndefined()
    expect(rule('ihna', { path: '/news/', result: 'TITLE_DIFF' })).toBeUndefined()
    const live404 = ans({ first: 404, finalStatus: 404 })
    expect(rule('ihna', { path: '/study-at-ihna/diploma-nursing-int/', exp: 'gone404', live: live404 })).toBe('slash-form')
    expect(rule('ihna', { path: '/study-at-ihna/other/', exp: 'gone404', live: live404 })).toBeUndefined()
  })

  it('an empty live stub accepts any non-404, non-5xx answer', () => {
    const live = ans({ bytes: 0 })
    expect(rule('ihna', { live, next: ans({ first: 301, finalStatus: 200 }) })).toBe('empty-stub')
    expect(rule('ihna', { live, next: ans({ first: 404, finalStatus: 404 }) })).toBeUndefined()
    expect(rule('ihna', { live: ans({ bytes: 900, textLen: 40 }), next: ans({ first: 301, finalStatus: 200 }) })).toBeUndefined()
  })
})
