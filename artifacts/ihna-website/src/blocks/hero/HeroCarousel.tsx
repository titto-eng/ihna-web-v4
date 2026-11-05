import type { HeroBlock } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { SlideCarousel } from '@/components/blocks/SlideCarousel'
import { HeroContent, Hero } from './Component'

export type HeroSlide = Omit<HeroBlock, 'blockType'> & { blockType?: 'hero' }

/** Milliseconds per hero slide when autoplay is on (it never runs under reduced motion and pauses on hover and focus). */
export const HERO_AUTOPLAY_MS = 8000

/**
 * Several split heroes in one section, one per view (05 §4.6 Hero carousel). Slide one carries the page h1 and the preloaded
 * image and is in the server HTML; later slides use h2 and lazy images. One slide renders as the plain hero.
 */
export function HeroCarousel({ slides, label = 'Highlights', autoplay = HERO_AUTOPLAY_MS }: { slides: HeroSlide[]; label?: string; autoplay?: number | false }) {
  if (!slides.length) return null
  const blocks = slides.map((s) => ({ ...s, blockType: 'hero' as const }))
  if (blocks.length === 1) return <Hero block={blocks[0]} />
  const first = blocks[0]
  return (
    // The slides pad themselves (the image glow and shadow sit inside the carousel viewport), so the section pads less.
    <Section tone={first.tone ?? 'default'} spacing={first.spacing ?? 'default'} anchorId={first.anchorId} className="overflow-hidden pt-6 pb-12 md:pt-14 md:pb-20">
      <div data-hero-carousel>
        <SlideCarousel label={label} perView={1} loop autoplay={autoplay || undefined} onDark={first.tone === 'ink'} slideClassName="overflow-x-clip pt-10 pb-14">
          {blocks.map((b, i) => (
            <HeroContent key={b.id ?? i} block={b} headingAs={i === 0 ? 'h1' : 'h2'} priority={i === 0} />
          ))}
        </SlideCarousel>
      </div>
    </Section>
  )
}
