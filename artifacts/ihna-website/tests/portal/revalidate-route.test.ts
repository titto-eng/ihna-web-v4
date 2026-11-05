import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidateTag = vi.fn()
const revalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: (...a: unknown[]) => revalidateTag(...a),
  revalidatePath: (...a: unknown[]) => revalidatePath(...a),
}))

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/revalidate/route'
import { cached } from '@/lib/portal/cache'

// 90-security §4: the secret is compared in constant time; 50-portal-data §5: `all` and `portal*` tags clear the negative cache.
const SECRET = 'test-revalidate-secret-16+'
const post = (body: unknown, secret: string | null = SECRET) =>
  POST(new NextRequest('http://localhost:3000/api/revalidate/', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(secret === null ? {} : { 'x-revalidate-secret': secret }) },
    body: JSON.stringify(body),
  }))

beforeEach(() => {
  process.env.REVALIDATE_SECRET = SECRET
  revalidateTag.mockClear()
  revalidatePath.mockClear()
})

describe('POST /api/revalidate', () => {
  it('answers 401 without the secret, with a wrong one, with a prefix of it, and when the variable is unset', async () => {
    expect((await post({ all: true }, null)).status).toBe(401)
    expect((await post({ all: true }, 'wrong')).status).toBe(401)
    expect((await post({ all: true }, SECRET.slice(0, -1))).status).toBe(401)
    expect((await post({ all: true }, `${SECRET}x`)).status).toBe(401)
    delete process.env.REVALIDATE_SECRET
    expect((await post({ all: true })).status).toBe(401)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('revalidates tags and paths with the right secret', async () => {
    const res = await post({ tags: ['course:x', 7], paths: ['/courses/', 'nope'] })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, tags: 1, paths: 1, all: false })
    expect(revalidateTag).toHaveBeenCalledWith('course:x', 'max')
    expect(revalidatePath).toHaveBeenCalledWith('/courses/')
  })

  it('{all:true} clears the portal negative cache', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fn = vi.fn(async () => { throw new Error('down') })
    await cached('neg-route', 51, [], fn, [] as string[])
    await cached('neg-route', 51, [], fn, [] as string[])
    expect(fn).toHaveBeenCalledTimes(1)
    expect((await post({ all: true })).status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(revalidateTag).toHaveBeenCalledWith('portal', { expire: 0 })
    await cached('neg-route', 51, [], fn, [] as string[])
    expect(fn).toHaveBeenCalledTimes(2)
    warn.mockRestore()
  })

  it('a portal:<khId> tag clears that course only; `portal` clears every scope', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const a = vi.fn(async () => { throw new Error('down') })
    const b = vi.fn(async () => { throw new Error('down') })
    await cached('neg-route', 52, [], a, [] as string[])
    await cached('neg-route', 53, [], b, [] as string[])
    await post({ tags: ['portal:52'] })
    expect(revalidateTag).toHaveBeenCalledWith('portal:52', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('portal:52', { expire: 0 })
    await cached('neg-route', 52, [], a, [] as string[])
    await cached('neg-route', 53, [], b, [] as string[])
    expect(a).toHaveBeenCalledTimes(2)
    expect(b).toHaveBeenCalledTimes(1)
    await post({ tags: ['portal'] })
    await cached('neg-route', 53, [], b, [] as string[])
    expect(b).toHaveBeenCalledTimes(2)
    warn.mockRestore()
  })
})
