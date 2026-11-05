import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import { boot, Cleanup, makeStaff, nonce, rejectsWith } from './helpers'

// Posts keep the URL they have on the old site (rule 1, 70-urls-seo §5): `urlDate` (YYYY/MM of the live URL) is stored, never derived.
let payload: Payload
const cleanup = new Cleanup()
const n = nonce()
const content = { root: { type: 'root', format: '', indent: 0, version: 1, direction: null, children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: null, textFormat: 0, children: [{ type: 'text', text: 'Body', format: 0, detail: 0, mode: 'normal', style: '', version: 1 }] }] } }

describe('posts: live URL with or without the date', () => {
  beforeAll(async () => {
    payload = await boot()
  })
  afterAll(async () => {
    await cleanup.run(payload)
  })

  const create = async (slug: string, urlDate: string | undefined, publishedAt = '2023-11-10T00:00:00.000Z') => {
    const doc = await payload.create({
      collection: 'posts',
      data: { title: `Post ${slug}`, slug, ...(urlDate !== undefined ? { urlDate } : {}), category: 'blog', publishedAt, content: content as never, _status: 'published' },
      overrideAccess: true,
    })
    cleanup.track('posts', doc.id)
    return doc
  }

  it('dated post: /blog/YYYY/MM/<slug>/ from urlDate, not from publishedAt', async () => {
    const p = await create(`dated-${n}`, '2024/04')
    expect(p.path).toBe(`/blog/2024/04/dated-${n}/`)
  })

  it('flat post: /blog/<slug>/', async () => {
    const p = await create(`flat-${n}`, undefined)
    expect(p.path).toBe(`/blog/flat-${n}/`)
  })

  it('rejects a malformed urlDate', async () => {
    await rejectsWith(create(`bad-${n}`, '2024-04'), /YYYY\/MM/)
  })

  it('a published post cannot move to another URL; allowUrlChange bypasses', async () => {
    const p = await create(`move-${n}`, '2022/05')
    const user = await makeStaff(payload, cleanup, 'marketing', n)
    await rejectsWith(
      payload.update({ collection: 'posts', id: p.id, data: { urlDate: '2022/10' }, user, overrideAccess: false }),
      /live URL never changes/,
    )
    const moved = await payload.update({ collection: 'posts', id: p.id, data: { urlDate: '' }, overrideAccess: true, context: { allowUrlChange: true } })
    expect(moved.path).toBe(`/blog/move-${n}/`)
  })
})
