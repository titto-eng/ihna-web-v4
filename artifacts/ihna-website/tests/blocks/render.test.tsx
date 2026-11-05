import { describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import type { ComponentType, ReactElement } from 'react'
import { blockComponents, blockConfigs } from '@/blocks'
import { defaults } from '@/blocks/defaults'
import { parseVideoUrl, hostAllowed, isMapEmbedUrl, videoSrc } from '@/blocks/embeds'
import { RenderBlocks } from '@/components/RenderBlocks'

// The enquiry form's client component calls useRouter; no app router is mounted here.
vi.mock('next/navigation', async (orig) => ({ ...(await orig<typeof import('next/navigation')>()), useRouter: () => ({ push: () => {}, replace: () => {}, refresh: () => {} }) }))

type AnyComponent = ComponentType<{ block: unknown; ctx?: { depth: number } }>
const ctx = { depth: 0 }

// Async server components are awaited into elements; sync ones render directly.
async function renderBlock(Component: AnyComponent, block: unknown) {
  const isAsync = Component.constructor.name === 'AsyncFunction'
  const ui = isAsync ? await (Component as unknown as (p: object) => Promise<ReactElement>)({ block, ctx }) : <Component block={block} ctx={ctx} />
  return render(ui)
}

describe('registry', () => {
  it('has a config, a component and a default for every slug', () => {
    const slugs = blockConfigs.map((b) => b.slug).sort()
    expect(Object.keys(blockComponents).sort()).toEqual(slugs)
    expect(Object.keys(defaults).sort()).toEqual(slugs)
  })
})

describe('every block renders its default props without throwing', () => {
  for (const slug of Object.keys(blockComponents)) {
    it(slug, async () => {
      const Component = (await blockComponents[slug as keyof typeof blockComponents]()) as unknown as AnyComponent
      const { container } = await renderBlock(Component, defaults[slug as keyof typeof defaults])
      expect(container).toBeTruthy()
      cleanup()
    })
  }
})

describe('RenderBlocks', () => {
  it('skips unknown blocks and renders siblings', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const tree = await RenderBlocks({ blocks: [{ ...defaults.richText }, { blockType: 'nope' }, { ...defaults.cta }] })
    const { container } = render(tree as ReactElement)
    expect(container.querySelectorAll('section').length).toBe(2)
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })

  it('skips blocks nested deeper than three levels', async () => {
    expect(await RenderBlocks({ blocks: [{ ...defaults.richText }], ctx: { depth: 4 } })).toBeNull()
  })
})

describe('embeds', () => {
  it('builds the video src from the id, never the stored url', () => {
    const yt = parseVideoUrl('https://youtu.be/M7lc1UVf-VE')!
    expect(videoSrc(yt)).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/M7lc1UVf-VE/)
    expect(parseVideoUrl('https://vimeo.com/123456789')?.provider).toBe('vimeo')
    expect(parseVideoUrl('https://www.google.com/maps/embed?pb=1')).toBeNull()
    expect(parseVideoUrl('javascript:alert(1)')).toBeNull()
  })

  it('enforces the iframe and map allowlists', () => {
    expect(hostAllowed('https://my.matterport.com/show', ['my.matterport.com'])).toBe(true)
    expect(hostAllowed('https://my.matterport.com/show', [])).toBe(false)
    expect(hostAllowed('http://my.matterport.com/show', ['my.matterport.com'])).toBe(false)
    expect(isMapEmbedUrl('https://www.google.com/maps/embed?pb=1')).toBe(true)
    expect(isMapEmbedUrl('https://www.google.com/search?q=x')).toBe(false)
  })

  it('iframeEmbed renders only allowlisted hosts', async () => {
    const Component = (await blockComponents.iframeEmbed()) as unknown as AnyComponent
    const ok = await renderBlock(Component, defaults.iframeEmbed)
    expect(ok.container.querySelector('iframe')).toBeTruthy()
    cleanup()
    const bad = await renderBlock(Component, { ...defaults.iframeEmbed, url: 'https://evil.example.com/x' })
    expect(bad.container.querySelector('iframe')).toBeNull()
  })
})
