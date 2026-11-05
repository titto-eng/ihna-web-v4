import { describe, expect, it, vi } from 'vitest'
import { announcePlay, registerFrame, registerPlayer } from '@/components/media/exclusivePlayback'

// One video at a time (20-blocks "VideoEmbed"): a playing player pauses the others.
function fakeFrame(src: string) {
  const posted: unknown[] = []
  const win = { postMessage: vi.fn((m: unknown) => posted.push(typeof m === 'string' ? JSON.parse(m) : m)) }
  const frame = { src, contentWindow: win, addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as HTMLIFrameElement
  return { frame, win, posted }
}

describe('exclusive playback', () => {
  it('pauses the other YouTube player when one reports that it is playing', () => {
    const a = fakeFrame('https://www.youtube-nocookie.com/embed/aaaaaaaaaaa?enablejsapi=1')
    const b = fakeFrame('https://www.youtube-nocookie.com/embed/bbbbbbbbbbb?enablejsapi=1')
    const offA = registerFrame(a.frame, 'a')
    const offB = registerFrame(b.frame, 'b')
    window.dispatchEvent(new MessageEvent('message', { origin: 'https://www.youtube-nocookie.com', source: a.win as never, data: JSON.stringify({ event: 'onStateChange', info: 1 }) }))
    expect(b.posted).toContainEqual({ event: 'command', func: 'pauseVideo', args: [] })
    expect(a.posted).not.toContainEqual({ event: 'command', func: 'pauseVideo', args: [] })
    offA(); offB()
  })

  it('pauses Vimeo players and other registered players when a new video starts', () => {
    const v = fakeFrame('https://player.vimeo.com/video/123456789?api=1')
    const offV = registerFrame(v.frame, 'v')
    const pause = vi.fn()
    const offP = registerPlayer({ id: 'film', pause })
    announcePlay('new')
    expect(v.posted).toContainEqual({ method: 'pause' })
    expect(pause).toHaveBeenCalled()
    offV(); offP()
  })

  it('ignores messages from other origins', () => {
    const a = fakeFrame('https://www.youtube-nocookie.com/embed/aaaaaaaaaaa?enablejsapi=1')
    const b = fakeFrame('https://www.youtube-nocookie.com/embed/bbbbbbbbbbb?enablejsapi=1')
    const offA = registerFrame(a.frame, 'a2')
    const offB = registerFrame(b.frame, 'b2')
    window.dispatchEvent(new MessageEvent('message', { origin: 'https://evil.example', source: a.win as never, data: JSON.stringify({ event: 'onStateChange', info: 1 }) }))
    expect(b.posted).not.toContainEqual({ event: 'command', func: 'pauseVideo', args: [] })
    offA(); offB()
  })
})
