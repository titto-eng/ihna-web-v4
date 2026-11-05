import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ALL_STEPS, ALL_STEPS_BY_SITE, OUT_DIR, SITE } from '../../scripts/import/lib/config'
import { selectSteps } from '../../scripts/import/lib/steps'

// `npm run import -- all` runs the site's step list from lib/config.ts. On IHNA it never runs `wp-posts`: the 4 WordPress posts are
// route files at the site root (DEC-42), and the step would add them as posts at /blog/<slug>/.
const STEPS_DIR = resolve(__dirname, '../../scripts/import/steps')
const stepFiles = readdirSync(STEPS_DIR).filter((f) => f.endsWith('.ts')).map((f) => readFileSync(resolve(STEPS_DIR, f), 'utf8'))
const discovered = stepFiles.map((src) => ({
  name: /export const name = '([^']+)'/.exec(src)![1],
  order: Number(/export const order = (\d+)/.exec(src)?.[1] ?? 100),
}))
const names = (steps: { name: string }[]) => steps.map((s) => s.name)

describe('import step list per site', () => {
  it('IHNA: `all` is the configured list, in its order, without wp-posts', () => {
    expect(SITE).toBe('ihna')
    const ihna = ALL_STEPS_BY_SITE.ihna!
    expect(ALL_STEPS).toBe(ihna)
    const { steps, unknown } = selectSteps('all', discovered, ALL_STEPS)
    expect(unknown).toEqual([])
    expect(names(steps)).toEqual([...ihna])
    expect(names(steps)).not.toContain('wp-posts')
    expect(names(steps)).not.toContain('wp-json-check')
  })

  it('IHNA: each step runs after the steps whose output it reads', () => {
    const at = (n: string) => ALL_STEPS_BY_SITE.ihna!.indexOf(n)
    const before: [string, string][] = [
      ['course-live', 'media'], ['media', 'theme-photos'], ['course-live', 'wp-courses'], ['media', 'wp-courses'], ['lookups', 'wp-courses'],
      ['wp-courses', 'assign-images'], ['staff', 'assign-images'], ['theme-photos', 'assign-images'], ['lookups', 'assign-images'],
      ['wp-courses', 'link-course-managers'], ['staff', 'link-course-managers'],
      ['static', 'live-files'], ['live-files', 'documents'], ['documents', 'link-course-brochures'], ['wp-courses', 'link-course-brochures'],
    ]
    for (const [a, b] of before) expect(at(a), `${a} before ${b}`).toBeLessThan(at(b))
  })

  it('IHNA: every step with an IHNA report in scripts/import/out is in the list', () => {
    const reported = existsSync(OUT_DIR)
      ? readdirSync(OUT_DIR).flatMap((f) => /^ihna-(.+)\.report\.json$/.exec(f)?.[1] ?? [])
      : []
    for (const step of reported) expect(ALL_STEPS_BY_SITE.ihna, step).toContain(step)
  })

  it('ihm-web: `all` is every step by ascending order; a comma list keeps its own order; unknown names are reported', () => {
    expect(ALL_STEPS_BY_SITE.ihm).toBeNull()
    const ihm = names(selectSteps('all', discovered, ALL_STEPS_BY_SITE.ihm).steps)
    expect(ihm).toContain('wp-posts')
    expect(ihm.indexOf('course-live')).toBeLessThan(ihm.indexOf('wp-json-check'))
    expect(names(selectSteps('documents,static', discovered, ALL_STEPS).steps)).toEqual(['documents', 'static'])
    expect(selectSteps('static,nope', discovered, ALL_STEPS).unknown).toEqual(['nope'])
  })
})
