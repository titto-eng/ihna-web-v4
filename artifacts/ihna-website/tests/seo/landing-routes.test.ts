import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { landingPages } from '@/content/landing'
import { formByKey } from '@/content/forms'
import { crmCampuses, crmCourseByKhId } from '@/content/course-crm'
import { campaignByCode } from '@/content/campaign-codes'

// Every landing registry row is a route file at its exact old path (rule 1, 60 §2), with its lazy import, a known form and CRM keys.
const routeFile = (path: string) => `src/app/(site)${path.replace(/\/$/, '')}/page.tsx`

// Live stub URLs (60 §5): route handlers answering the old few bytes of text, no registry row.
const STUBS = [
  '/study-at-ihna/course-enquiry/',
  '/study-at-ihna/test/',
  '/study-at-ihna/domestic/certificate-iii-in-early-childhood-education-and-care-perth-funding/',
  '/study-at-ihna/domestic/diploma-nursing-perth-Abiraj-BKP/',
]

describe('landing registry and route files', () => {
  it('every registry row has a route file that renders its own path', () => {
    for (const row of landingPages) {
      const file = routeFile(row.path)
      expect(existsSync(file), `${row.path} -> ${file}`).toBe(true)
      expect(readFileSync(file, 'utf8')).toContain(`'${row.path}'`)
    }
  })

  it('every alias has its own route file', () => {
    for (const row of landingPages) for (const alias of row.aliases ?? []) expect(existsSync(routeFile(alias)), alias).toBe(true)
  })

  it('landing-routes.ts lazily imports exactly the registry paths', async () => {
    const { landingRoutes } = await import('@/content/landing-routes')
    expect(Object.keys(landingRoutes).sort()).toEqual(landingPages.map((r) => r.path).sort())
  })

  it('paths are unique, keep the old trailing slash (or the .php name) and every row names a real form', () => {
    expect(new Set(landingPages.map((r) => r.path)).size).toBe(landingPages.length)
    for (const row of landingPages) {
      expect(row.path, row.path).toMatch(/(\/|\.php)$/)
      const form = formByKey(row.formKey)
      expect(form, `${row.path}: ${row.formKey}`).not.toBeNull()
      for (const f of row.formFields ?? []) expect(form!.fields.some((x) => x.name === f), `${row.path}: field ${f}`).toBe(true)
      // a required field hidden on the page could never be filled
      for (const f of form!.fields.filter((x) => x.required)) if (row.formFields?.length) expect(row.formFields, `${row.path}: required ${f.name}`).toContain(f.name)
      for (const [name, values] of Object.entries(row.fieldOptions ?? {})) {
        const options = form!.fields.find((x) => x.name === name)?.options?.map((o) => o.value) ?? []
        for (const v of values) expect(options, `${row.path}: ${name}=${v}`).toContain(v)
      }
    }
  })

  it('CRM keys and campaign codes on the rows exist in the site tables', () => {
    for (const row of landingPages) {
      if (row.khId) expect(crmCourseByKhId(row.khId), `${row.path}: KH ${row.khId}`).toBeDefined()
      if (row.campusKey) expect(crmCampuses[row.campusKey], `${row.path}: ${row.campusKey}`).toBeDefined()
      if (row.campaignFallback) expect(campaignByCode(row.campaignFallback), row.path).not.toBeNull()
      if (row.fixedCampaign) expect(campaignByCode(row.fixedCampaign), row.path).not.toBeNull()
    }
  })

  it('the live stubs are route handlers, not pages', () => {
    for (const path of STUBS) {
      expect(existsSync(`src/app/(site)${path.replace(/\/$/, '')}/route.ts`), path).toBe(true)
      expect(existsSync(routeFile(path)), path).toBe(false)
      expect(landingPages.some((r) => r.path === path)).toBe(false)
    }
  })

  it('self-post pages keep their old index.php as a redirect', () => {
    for (const row of landingPages.filter((r) => r.thankYouPath === null && r.path.endsWith('/'))) {
      if (row.path.startsWith('/healthcare-courses-ballarat/')) continue
      expect(existsSync(`src/app/(site)${row.path}index.php/page.tsx`), row.path).toBe(true)
    }
  })
})
