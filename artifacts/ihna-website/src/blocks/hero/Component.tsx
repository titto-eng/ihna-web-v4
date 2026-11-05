import Image from '@/components/blocks/MediaImage'
import type { HeroBlock as HeroBlockType } from '@/payload-types'
import { mediaOf } from '@/components/blocks/media'
import { pickSize } from '@/lib/media-sizes'
import { Section } from '@/components/layout/Section'
import { CtaRow } from '@/components/CtaLink'
import { Emphasis } from '@/components/Emphasis'
import { AudienceSwitch } from '@/components/audience/AudienceSwitch'
import { cn } from '@/lib/cn'
import type { BlockProps } from '../types'
import { HeroLookView, type HeroLook } from './looks'

const Pulse = () => (
  <svg viewBox="0 0 600 40" className="my-8 h-8 w-full max-w-[520px] text-primary" aria-hidden="true">
    <path d="M0 20 H190 L208 20 L222 4 L240 36 L256 20 H600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

type SlideOptions = {
  /** The page h1 by default; carousel slides after the first use h2. */
  headingAs?: 'h1' | 'h2'
  /** Preload the image (the first screen); later carousel slides load lazily. */
  priority?: boolean
}

/** Copy and image of a split / compact hero, without the section: one hero, or one slide of `HeroCarousel`. */
export function HeroContent({ block, headingAs = 'h1', priority = true }: { block: HeroBlockType } & SlideOptions) {
  const image = mediaOf(block.image)
  const pic = pickSize(image, 'hero')
  const variant = block.variant === 'compact' ? 'compact' : 'split'
  const dark = block.tone === 'ink'
  const split = variant === 'split'
  const H = headingAs
  const rise = headingAs === 'h1'
  return (
    <div className={cn('grid gap-10', split && pic && 'lg:grid-cols-[1.15fr_1fr] lg:items-center')}>
      <HeroCopy block={block} dark={dark} split={split} compact={!split} centered={false} H={H} rise={rise} />
      {split && pic && (
        <div className="relative">
          <div className="bg-sunrise-glow absolute -top-10 -right-24 h-[115%] w-[85%] rounded-bl-[180px]" aria-hidden />
          <figure className="relative ml-auto aspect-[5/4] w-full max-w-[520px] lg:aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-card shadow-[0_40px_80px_-30px_hsl(189_100%_15%/0.55)]">
            <Image src={pic.url} alt={pic.alt} fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" style={{ objectPosition: pic.position ?? "center 30%" }} priority={priority} />
            {block.imageCaption && (
              <figcaption className="label-mono absolute bottom-3 left-3 rounded-full bg-foreground/70 px-3 py-1 text-[10px] tracking-widest text-background">
                {block.imageCaption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </div>
  )
}

function HeroCopy({ block, dark, split, compact, centered, H, rise }: { block: HeroBlockType; dark: boolean; split: boolean; compact: boolean; centered: boolean; H: 'h1' | 'h2'; rise: boolean }) {
  return (
    <div className={cn('relative z-10 flex flex-col justify-center', centered && 'items-center text-center')}>
      {block.eyebrow && (
        <p className={cn('label-mono mb-6 tracking-[0.22em]', dark ? 'text-secondary' : 'text-accent')}>{block.eyebrow}</p>
      )}
      <H className={cn('display', rise && 'animate-rise', compact ? 'text-display-md' : 'text-display-xl')}>
        <Emphasis text={block.heading} tone={dark ? 'secondary' : 'primary'} />
      </H>
      {split && <Pulse />}
      {block.subheading && (
        <p className={cn('max-w-xl text-lg leading-relaxed', rise && 'animate-rise [animation-delay:120ms]', !split && 'mt-6', dark ? 'text-ink-foreground/75' : 'text-muted-foreground')}>
          {block.subheading}
        </p>
      )}
      <CtaRow items={block.ctas} onDark={dark} className={cn('mt-8 flex flex-wrap items-center gap-3', centered && 'justify-center')} />
      {block.audienceSwitch && <AudienceSwitch className="mt-10" onDark={dark} />}
    </div>
  )
}

/**
 * Page banner: a text-only hero (compact, or split without an image) on the default tone renders as a deep-teal brand band (dot
 * grid, teal/orange glows, the ECG pulse in orange) with light text, so every inner page opens with the same branded header.
 */
function PageBanner({ block, ctx }: BlockProps<HeroBlockType>) {
  return (
    <Section tone="ink" spacing="none" anchorId={block.anchorId} depth={ctx?.depth} className="relative isolate overflow-hidden bg-primary-strong">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-strong via-primary-strong to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.08)_1px,transparent_0)] [background-size:22px_22px] [mask-image:linear-gradient(to_left,black,transparent_75%)]" />
        <div className="absolute -top-32 right-[-6rem] size-[30rem] rounded-full bg-primary/45 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 size-80 rounded-full bg-secondary/20 blur-3xl" />
        <svg viewBox="0 0 600 40" className="absolute right-[-4rem] bottom-10 hidden h-16 w-[44rem] text-secondary/40 lg:block" aria-hidden="true">
          <path d="M0 20 H190 L208 20 L222 4 L240 36 L256 20 H600" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="relative max-w-4xl py-16 md:py-24">
        {block.eyebrow && (
          <p className="animate-rise inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-1.5 pr-4 pl-2 text-xs font-semibold tracking-wide text-white/90 backdrop-blur md:text-sm">
            <span aria-hidden className="size-2.5 rounded-full bg-secondary" />{block.eyebrow}
          </p>
        )}
        <h1 className="display animate-rise mt-6 text-[clamp(2.4rem,5.6vw,4.6rem)] leading-[1.02] text-white">
          <Emphasis text={block.heading} tone="secondary" />
        </h1>
        <span aria-hidden className="mt-6 block h-1 w-20 rounded-full bg-gradient-to-r from-secondary to-primary" />
        {block.subheading && <p className="animate-rise mt-6 max-w-2xl text-lg leading-relaxed text-white/80 [animation-delay:120ms]">{block.subheading}</p>}
        <CtaRow items={block.ctas} onDark className="mt-8 flex flex-wrap items-center gap-3" />
        {block.audienceSwitch && <AudienceSwitch className="mt-10" onDark />}
      </div>
    </Section>
  )
}

export function Hero({ block, ctx }: BlockProps<HeroBlockType>) {
  const image = mediaOf(block.image)
  const pic = pickSize(image, 'hero')
  const variant = block.variant ?? 'split'
  // a code page may pick one of the hero looks for its image hero (`<Hero look="…">`, looks.tsx)
  const look = (block as HeroBlockType & { look?: HeroLook }).look
  if (look && pic && variant !== 'compact') return <HeroLookView look={look} block={block} pic={pic} anchorId={block.anchorId} />

  if ((variant === 'compact' || (variant === 'split' && !pic)) && (block.tone ?? 'default') === 'default') return <PageBanner block={block} ctx={ctx} />

  if (variant === 'full' && pic) {
    return (
      <Section tone="ink" spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth} className="relative isolate overflow-hidden">
        <Image src={pic.url} alt={pic.alt} fill sizes="100vw" className="-z-20 object-cover" style={{ objectPosition: pic.position }} priority />
        <div className="absolute inset-0 -z-10 bg-ink/75" aria-hidden />
        <div className="max-w-3xl py-10 md:py-20">
          <HeroCopy block={block} dark split={false} compact={false} centered={false} H="h1" rise />
        </div>
      </Section>
    )
  }

  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth} className="overflow-hidden">
      {variant === 'full' ? (
        <HeroCopy block={block} dark={block.tone === 'ink'} split={false} compact={false} centered H="h1" rise />
      ) : (
        <HeroContent block={block} />
      )}
    </Section>
  )
}
