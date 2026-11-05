import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { diffSnapshots, onlyArg, partitionByReview, planSteps, type SnapItem } from '../../scripts/import/lib/refresh'
import { judge } from '../../scripts/import/lib/recover-missing'

const fixture = (name: string) => JSON.parse(readFileSync(resolve(__dirname, 'fixtures/refresh', name), 'utf8')) as SnapItem[]
const prev = fixture('prev.json')
const next = fixture('next.json')

describe('diffSnapshots (id + modified)', () => {
  const d = diffSnapshots(prev, next)

  it('detects a new item', () => {
    expect(d.new.map((e) => e.id)).toEqual([20])
    expect(d.new[0]).toMatchObject({ path: '/news-update/', title: 'News update' })
  })

  it('detects changed items by modified, and a moved link', () => {
    expect(d.changed.map((e) => e.id).sort()).toEqual([10, 13, 14])
    expect(d.changed.find((e) => e.id === 10)).toMatchObject({ prevModified: '2026-01-01T10:00:00', modified: '2026-10-17T08:30:00', reasons: ['modified'] })
    expect(d.changed.find((e) => e.id === 14)).toMatchObject({ reasons: ['url'], prevLink: 'https://ihm.edu.au/moved/', path: '/renamed/' })
  })

  it('detects a deleted item', () => {
    expect(d.deleted.map((e) => e.id)).toEqual([12])
    expect(d.deleted[0].path).toBe('/old-offer/')
  })

  it('counts untouched items and ignores a body change when modified did not move (id 15)', () => {
    expect(d.unchanged).toBe(2) // 11 and 15
    expect(d.changed.some((e) => e.id === 15)).toBe(false)
  })

  it('reports a body-only change as `content` when asked to compare bodies', () => {
    const c = diffSnapshots(prev, next, { compareContent: true })
    expect(c.changed.find((e) => e.id === 15)?.reasons).toEqual(['content'])
    expect(c.changed.find((e) => e.id === 10)?.reasons).toEqual(['modified', 'content'])
    expect(c.unchanged).toBe(1)
  })

  it('is empty when nothing moved', () => {
    expect(diffSnapshots(next, next, { compareContent: true })).toEqual({ new: [], changed: [], deleted: [], unchanged: next.length })
  })

  it('does not call a missing body (fetch error) a change', () => {
    const broken = next.map((i) => (i.id === 11 ? { ...i, content: null } : i))
    expect(diffSnapshots(next, broken, { compareContent: true }).changed).toEqual([])
  })
})

describe('partitionByReview (docs a person marked ok are skipped)', () => {
  const items = [{ id: 10 }, { id: 13 }, { id: 20 }]
  const docs = new Map([[10, { reviewStatus: 'ok' }], [13, { reviewStatus: 'check' }]])

  it('lists ok docs instead of importing them; new and unreviewed ones are importable', () => {
    const { importable, skippedOk } = partitionByReview(items, docs)
    expect(skippedOk.map((i) => i.id)).toEqual([10])
    expect(importable.map((i) => i.id)).toEqual([13, 20])
  })

  it('imports everything when nothing is ok', () => {
    expect(partitionByReview(items, new Map()).skippedOk).toEqual([])
  })
})

describe('planSteps and onlyArg', () => {
  it('routes staff profiles to `staff` and every other WordPress page to the developer list (pages are code, DEC-61): no step for them', () => {
    const plan = planSteps({ pages: [10, 13, 99], posts: [20], courses: [868] }, new Set([13]))
    expect(plan).toEqual({ staff: [13], wpPosts: [20], wpCourses: [868], pages: [10, 99] })
    expect(Object.keys(plan)).not.toContain('wpPages')
  })

  it('never builds an empty --only (the importer reads that as "everything") or one with a comma in a value', () => {
    expect(onlyArg([]).arg).toBeNull()
    expect(onlyArg(['a/b.png', 'x,y.png', 12])).toEqual({ arg: '--only=a/b.png,12', rejected: ['x,y.png'] })
  })
})

describe('judge (what a recovered file must be)', () => {
  const pdf = Buffer.from('%PDF-1.7\n...')
  const html = Buffer.from('<!DOCTYPE html><html></html>')
  const allow = ['pdf', 'png'] as const

  it('accepts a real pdf', () => {
    expect(judge('/pdf/a.pdf', { status: 200, type: 'application/pdf', buf: pdf }, allow, 1000).ok).toBe(true)
  })
  it('refuses a 404, a folder page, a wrong type, wrong bytes and a size over the cap', () => {
    expect(judge('/pdf/a.pdf', { status: 404, type: 'text/html', buf: html }, allow, 1000).reason).toBe('HTTP 404')
    expect(judge('/brochures/NCLEX-RN/', { status: 200, type: 'text/html', buf: html }, allow, 1000).reason).toMatch(/extension not allowed/)
    expect(judge('/pdf/a.pdf', { status: 200, type: 'text/html', buf: html }, allow, 1000).reason).toMatch(/not a pdf file/)
    expect(judge('/pdf/a.pdf', { status: 200, type: 'application/pdf', buf: html }, allow, 1000).reason).toMatch(/bytes do not match/)
    expect(judge('/pdf/a.pdf', { status: 200, type: 'application/pdf', buf: pdf }, allow, 5).reason).toMatch(/too large/)
    expect(judge('/x/a.php', { status: 200, type: 'application/pdf', buf: pdf }, allow, 1000).ok).toBe(false)
  })
})

describe('IHNA: root WordPress posts stay route files, refresh and smoke files are named for the site', () => {
  it('the site run leaves out wp-posts, so WordPress posts are never imported (DEC-42)', async () => {
    const { ALL_STEPS, DEV_SITE_URL, SITE, WP_POSTS_IMPORTED, outPath, reportPath } = await import('../../scripts/import/lib/config')
    expect(SITE).toBe('ihna')
    expect(ALL_STEPS).not.toContain('wp-posts')
    expect(WP_POSTS_IMPORTED).toBe(false)
    expect(DEV_SITE_URL).toBe('http://localhost:3001')
    expect(outPath('import-smoke.json')).toMatch(/\/ihna-import-smoke\.json$/)
    expect(reportPath('media')).toMatch(/\/ihna-media\.report\.json$/)
  })

  it('the wp-posts step refuses on IHNA and writes nothing', async () => {
    const { run } = await import('../../scripts/import/steps/wp-posts')
    const report = { failed: [] as { id: string | number; reason: string }[] }
    const payload = new Proxy({}, { get: () => { throw new Error('wp-posts touched the database') } })
    await run({ report, payload, dry: false, args: { flags: {} }, wanted: () => true, log: () => {}, opts: {} } as never)
    expect(report.failed).toEqual([{ id: 'step', reason: expect.stringContaining('DEC-42') }])
  })

  it('refresh, recovery and smoke scripts use the site-named files and the configured dev URL', () => {
    for (const file of ['refresh-live.ts', 'lib/recover-missing.ts', 'smoke.ts', 'smoke-courses.ts', 'shots-images.ts', 'measure-overflow.ts']) {
      const src = readFileSync(resolve(__dirname, '../../scripts/import', file), 'utf8')
      expect(src, file).not.toMatch(/['`]ihm-[a-z-]+\.(json|report\.json)/)
      expect(src, file).not.toContain("'http://localhost:3000'")
    }
    const refresh = readFileSync(resolve(__dirname, '../../scripts/import/refresh-live.ts'), 'utf8')
    expect(refresh).toContain("if (WP_POSTS_IMPORTED) run('wp-posts'")
  })
})
