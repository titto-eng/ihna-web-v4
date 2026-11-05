import { describe, expect, it } from 'vitest'
import type { PayloadRequest } from 'payload'
import config from '@/payload.config'
import { limitMediaSize, MEDIA_MAX_BYTES, Media } from '@/collections/Media'

// 90-security §4 "Uploads": 50 MB per file at the multipart parser (documents are PDFs), 20 MB for `media`.
describe('upload limits', () => {
  it('the parser caps a file at 50 MB and the whole request a little above it', async () => {
    const cfg = await config
    expect(cfg.upload?.limits?.fileSize).toBe(50 * 1024 * 1024)
    expect(cfg.upload?.requestSizeLimit).toBe(51 * 1024 * 1024)
  })
  it('media rejects a file over 20 MB before validation and accepts one under it', () => {
    expect(MEDIA_MAX_BYTES).toBe(20 * 1024 * 1024)
    expect(Media.hooks?.beforeValidate).toContain(limitMediaSize)
    const call = (size?: number) =>
      limitMediaSize({ data: { alt: 'x' }, req: { file: size === undefined ? undefined : { size } } as unknown as PayloadRequest, operation: 'create', collection: Media as never, context: {} } as never)
    expect(() => call(MEDIA_MAX_BYTES + 1)).toThrow(/limited to 20 MB/)
    expect(call(MEDIA_MAX_BYTES)).toEqual({ alt: 'x' })
    expect(call(undefined)).toEqual({ alt: 'x' })
  })
})
