import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { jobsConfig } from '@/jobs'
import { GET as preview } from '@/app/api/preview/route'

// 90-security §4: CRON_SECRET and PREVIEW_SECRET are compared with `safeEqual` (constant time), never `===`.
const env = { CRON_SECRET: process.env.CRON_SECRET, PREVIEW_SECRET: process.env.PREVIEW_SECRET }
afterEach(() => {
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
})

const runAccess = (authorization?: string) =>
  (jobsConfig.access!.run as (a: { req: unknown }) => boolean)({ req: { headers: new Headers(authorization ? { authorization } : {}), user: null } })

describe('CRON_SECRET (/api/payload-jobs/run)', () => {
  it('runs with the exact bearer token only', () => {
    process.env.CRON_SECRET = 'cron-secret-for-tests-0123456789'
    expect(runAccess('Bearer cron-secret-for-tests-0123456789')).toBe(true)
    expect(runAccess('Bearer cron-secret-for-tests-012345678')).toBe(false)
    expect(runAccess('Bearer cron-secret-for-tests-0123456789x')).toBe(false)
    expect(runAccess('cron-secret-for-tests-0123456789')).toBe(false)
    expect(runAccess()).toBe(false)
  })
  it('refuses every token when CRON_SECRET is unset', () => {
    delete process.env.CRON_SECRET
    expect(runAccess('Bearer ')).toBe(false)
    expect(runAccess('Bearer undefined')).toBe(false)
  })
})

describe('PREVIEW_SECRET (/api/preview/)', () => {
  const get = (q: string) => preview(new NextRequest(`http://localhost:3001/api/preview/?${q}`))
  it('answers 401 for a wrong or missing secret before anything else is checked', async () => {
    process.env.PREVIEW_SECRET = 'preview-secret-for-tests-0123456789'
    expect((await get('secret=preview-secret-for-tests-012345678&path=/')).status).toBe(401)
    expect((await get('path=/')).status).toBe(401)
    // the right secret passes the comparison and reaches the path check
    expect((await get('secret=preview-secret-for-tests-0123456789&path=https://evil.example/')).status).toBe(400)
  })
  it('both checks use safeEqual', () => {
    for (const file of ['src/jobs/index.ts', 'src/app/api/preview/route.ts']) {
      const src = readFileSync(resolve(__dirname, '../..', file), 'utf8')
      expect(src, file).toMatch(/safeEqual\(/)
      expect(src, file).not.toMatch(/(===|!==)\s*(secret\b|`Bearer)/)
    }
  })
})
