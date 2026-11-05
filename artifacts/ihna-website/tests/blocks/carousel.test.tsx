import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { defaults } from '@/blocks/defaults'
import { Testimonials } from '@/blocks/testimonials/Component'
import { TestimonialsBlock as config } from '@/blocks/testimonials/config'
import { groupVideoRuns, optionalVideoUrl, quoteOrVideo } from '@/blocks/testimonials/video'
import { HeroCarousel } from '@/blocks/hero/HeroCarousel'
import { SlideCarousel } from '@/components/blocks/SlideCarousel'
import { RenderBlocks, type AnyBlock } from '@/components/RenderBlocks'
import type { TestimonialsBlock } from '@/payload-types'
import { html } from '../templates/html'

// 05 §4.6 carousel rules and 20-blocks `testimonials` (carousel default, video items play in their card).

const setReducedMotion = (reduce: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (q: string) => ({ matches: reduce && q.includes('reduce'), media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }),
  })
}
afterEach(() => { cleanup(); setReducedMotion(false) })

// YouTube ids are 11 characters (src/blocks/embeds.ts)
const ytId = (id: string) => id.padEnd(11, 'x')
const video = (title: string, id: string) => ({ blockType: 'videoEmbed', id, title, url: `https://www.youtube.com/watch?v=${ytId(id)}`, variant: 'inline' })
const quote = (q: string, name: string) => ({ quote: q, name })
const block = (extra: Partial<TestimonialsBlock>): TestimonialsBlock => ({ blockType: 'testimonials', inline: [quote('Great labs', 'Pat'), quote('Kind staff', 'Sam')], ...extra })

describe('testimonials block', () => {
  it('defaults to the carousel variant (config and renderer)', () => {
    const field = config.fields.find((f) => 'name' in f && f.name === 'variant') as { defaultValue?: string }
    expect(field.defaultValue).toBe('carousel')
    expect(defaults.testimonials.variant).toBe('carousel')
    const { container } = render(<Testimonials block={block({ variant: undefined })} ctx={{ depth: 0 }} />)
    expect(container.querySelector('[aria-roledescription="carousel"]')).toBeTruthy()
    expect(container.querySelectorAll('[aria-roledescription="slide"]')).toHaveLength(2)
    expect(container.querySelector('[data-slot="carousel-controls"]')).toBeTruthy()
  })

  it('renders the grid variant without a carousel', () => {
    const { container } = render(<Testimonials block={block({ variant: 'grid' })} ctx={{ depth: 0 }} />)
    expect(container.querySelector('[aria-roledescription="carousel"]')).toBeNull()
    expect(container.querySelectorAll('[data-testimonial="quote"]')).toHaveLength(2)
  })

  it('plays a video item inside its card: a facade first, the iframe only after play', () => {
    const { container, getByRole } = render(
      <Testimonials block={block({ inline: [{ name: 'Vedika', videoUrl: 'https://youtu.be/abc123def45' }, quote('Great labs', 'Pat')] })} ctx={{ depth: 1 }} />,
    )
    const card = container.querySelector('[data-testimonial="video"]')!
    expect(card).toBeTruthy()
    expect(card.querySelector('iframe')).toBeNull()
    fireEvent.click(getByRole('button', { name: 'Play video: Video testimonial: Vedika' }))
    const frame = card.querySelector('iframe')!
    expect(frame.getAttribute('src')).toContain('https://www.youtube-nocookie.com/embed/abc123def45')
  })

  it('shortens long quotes behind a Read more toggle', () => {
    const long = 'Words '.repeat(80)
    const { getByRole } = render(<Testimonials block={block({ inline: [quote(long, 'Pat')] })} ctx={{ depth: 0 }} />)
    const toggle = getByRole('button', { name: 'Read more' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
  })

  it('needs a quote unless the item has a video link', () => {
    expect(quoteOrVideo('', { siblingData: { videoUrl: '' } })).not.toBe(true)
    expect(quoteOrVideo('', { siblingData: { videoUrl: 'https://vimeo.com/123456' } })).toBe(true)
    expect(quoteOrVideo('Loved it', { siblingData: {} })).toBe(true)
    expect(optionalVideoUrl('')).toBe(true)
    expect(optionalVideoUrl('https://evil.example/x')).not.toBe(true)
  })
})

describe('groupVideoRuns (course sections)', () => {
  const rich = { blockType: 'richText', content: null }

  it('turns consecutive videoEmbed blocks into one testimonials carousel', () => {
    const out = groupVideoRuns([rich, video('Vedika', 'a1'), video('Rosemary', 'b2'), video('Miho', 'c3'), rich] as AnyBlock[])
    expect(out.map((b) => b.blockType)).toEqual(['richText', 'testimonials', 'richText'])
    const t = out[1] as TestimonialsBlock
    expect(t.variant).toBe('carousel')
    expect(t.inline?.map((i) => i.name)).toEqual(['Vedika', 'Rosemary', 'Miho'])
    expect(t.inline?.[0].videoUrl).toBe(`https://www.youtube.com/watch?v=${ytId('a1')}`)
  })

  it('leaves a single video as a videoEmbed', () => {
    expect(groupVideoRuns([rich, video('One', 'a1'), rich] as AnyBlock[]).map((b) => b.blockType)).toEqual(['richText', 'videoEmbed', 'richText'])
  })

  it('keeps the rendered section the same size whatever the number of videos', async () => {
    const markup = async (n: number) =>
      html((await RenderBlocks({ blocks: groupVideoRuns(Array.from({ length: n }, (_, i) => video(`Student ${i}`, `id${i}`)) as AnyBlock[]) as AnyBlock[], ctx: { depth: 1 } })) as ReactElement)
    for (const n of [3, 24]) {
      const out = await markup(n)
      expect((out.match(/aria-roledescription="carousel"/g) ?? []).length).toBe(1)
      expect((out.match(/data-testimonial="video"/g) ?? []).length).toBe(n)
      expect(out).not.toContain('<iframe')
    }
  })
})

describe('SlideCarousel', () => {
  it('labels the region and each slide, and shows a counter for many slides', () => {
    const { container, getByRole } = render(
      <SlideCarousel label="Stories">{Array.from({ length: 10 }, (_, i) => <p key={i}>Slide {i}</p>)}</SlideCarousel>,
    )
    expect(getByRole('region', { name: 'Stories' })).toBeTruthy()
    expect(container.querySelectorAll('[aria-roledescription="slide"]')[0].getAttribute('aria-label')).toBe('1 of 10')
    expect(container.querySelector('[data-slot="carousel-previous"]')).toBeTruthy()
    expect(container.querySelector('[data-slot="carousel-next"]')).toBeTruthy()
  })

  it('offers a pause control when autoplay is on, and pauses on focus', () => {
    const { container, getByRole } = render(<SlideCarousel label="Hero" perView={1} autoplay={5000}><p>A</p><p>B</p></SlideCarousel>)
    const region = container.querySelector('[aria-roledescription="carousel"]')!
    expect(region.getAttribute('data-autoplay')).toBe('running')
    const pause = getByRole('button', { name: 'Pause slideshow' })
    act(() => { fireEvent.focus(pause) })
    expect(region.getAttribute('data-autoplay')).toBe('paused')
    fireEvent.click(pause)
    expect(getByRole('button', { name: 'Play slideshow' })).toBeTruthy()
  })

  it('never autoplays under prefers-reduced-motion', () => {
    setReducedMotion(true)
    const { container, queryByRole } = render(<SlideCarousel label="Hero" perView={1} autoplay={5000}><p>A</p><p>B</p></SlideCarousel>)
    expect(container.querySelector('[aria-roledescription="carousel"]')!.hasAttribute('data-autoplay')).toBe(false)
    expect(queryByRole('button', { name: /slideshow/ })).toBeNull()
  })
})

describe('HeroCarousel', () => {
  const slide = (heading: string, src: string) => ({
    heading, variant: 'split' as const,
    image: { id: 0, url: src, alt: heading, width: 1200, height: 900, updatedAt: '', createdAt: '' },
  })

  it('keeps one h1 and preloads only the first image', async () => {
    const out = await html(<HeroCarousel slides={[slide('First', '/a.jpg'), slide('Second', '/b.jpg'), slide('Third', '/c.jpg')]} />)
    expect((out.match(/<h1[ >]/g) ?? []).length).toBe(1)
    expect((out.match(/<h2[ >]/g) ?? []).length).toBe(2)
    expect(out).toContain('data-hero-carousel')
    expect((out.match(/loading="lazy"/g) ?? []).length).toBe(2)
  })

  it('renders a single slide as the plain hero', async () => {
    const out = await html(<HeroCarousel slides={[slide('Only', '/a.jpg')]} />)
    expect(out).not.toContain('aria-roledescription="carousel"')
    expect(out).toContain('<h1')
  })
})
