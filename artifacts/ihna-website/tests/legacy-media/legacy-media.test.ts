import { describe, expect, it } from 'vitest'
import { legacyCandidates, legacyPathOf, resolveLegacyMedia, type MediaFinder } from '@/app/api/legacy-media/handler'

const rows = [
  { legacyPath: 'wp-content/uploads/2022/10/team-scaled.jpg', url: '/api/media/file/aaa-team-scaled.jpg' },
  { legacyPath: 'wp-content/uploads/2024/05/image.jpg', url: '/api/media/file/bbb-image.jpg' },
  { legacyPath: 'wp-content/uploads/2024/05/image-300x200.jpg', url: '/api/media/file/ccc-image-300x200.jpg' },
  { legacyPath: 'wp-content/uploads/2023/01/a b.png', url: '/api/media/file/ddd-a%20b.png' },
]
const finder: MediaFinder = async (paths) => rows.filter((r) => paths.includes(r.legacyPath))

describe('legacyPathOf', () => {
  it('prefixes wp-content/uploads and decodes segments', () => {
    expect(legacyPathOf(['2023', '01', 'a%20b.png'])).toBe('wp-content/uploads/2023/01/a b.png')
  })
  it('rejects traversal, empty and malformed input', () => {
    expect(legacyPathOf(['2023', '..', 'x.png'])).toBeNull()
    expect(legacyPathOf(['2023', '%2e%2e', 'x.png'])).toBeNull()
    expect(legacyPathOf(['2023', 'a%2Fb.png'])).toBeNull()
    expect(legacyPathOf(['%E0%A4%A'])).toBeNull()
    expect(legacyPathOf([])).toBeNull()
  })
})

describe('legacyCandidates', () => {
  it('tries the exact path first, then the WordPress size, scaled and edit variants', () => {
    const c = legacyCandidates('wp-content/uploads/2022/10/team-1024x768.jpg')
    expect(c[0]).toBe('wp-content/uploads/2022/10/team-1024x768.jpg')
    expect(c).toContain('wp-content/uploads/2022/10/team.jpg')
    expect(c).toContain('wp-content/uploads/2022/10/team-scaled.jpg')
    expect(legacyCandidates('wp-content/uploads/x/dummy-e1398449111870-1024x732.jpg')).toContain('wp-content/uploads/x/dummy.jpg')
  })
  it('leaves an extensionless path alone', () => {
    expect(legacyCandidates('wp-content/uploads/x/noext')).toEqual(['wp-content/uploads/x/noext'])
  })
})

describe('resolveLegacyMedia', () => {
  it('resolves an exact legacyPath to the media file url', async () => {
    expect(await resolveLegacyMedia(['2024', '05', 'image.jpg'], finder)).toBe('/api/media/file/bbb-image.jpg')
    expect(await resolveLegacyMedia(['2023', '01', 'a%20b.png'], finder)).toBe('/api/media/file/ddd-a%20b.png')
  })
  it('prefers the exact path over a look-alike', async () => {
    expect(await resolveLegacyMedia(['2024', '05', 'image-300x200.jpg'], finder)).toBe('/api/media/file/ccc-image-300x200.jpg')
  })
  it('falls back from a thumbnail to the scaled original', async () => {
    expect(await resolveLegacyMedia(['2022', '10', 'team-768x512.jpg'], finder)).toBe('/api/media/file/aaa-team-scaled.jpg')
  })
  it('is null when no media has the path', async () => {
    expect(await resolveLegacyMedia(['2099', '01', 'nope.jpg'], finder)).toBeNull()
    expect(await resolveLegacyMedia(['..', 'etc'], finder)).toBeNull()
  })
})
