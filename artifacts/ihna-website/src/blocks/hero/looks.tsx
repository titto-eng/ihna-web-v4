import type { CSSProperties } from 'react'
import Image from '@/components/blocks/MediaImage'
import type { HeroBlock as HeroBlockType } from '@/payload-types'
import { CtaRow } from '@/components/CtaLink'
import { Emphasis } from '@/components/Emphasis'
import { AudienceSwitch } from '@/components/audience/AudienceSwitch'
import type { PickedImage } from '@/lib/media-sizes'
import { cn } from '@/lib/cn'

/**
 * Hero looks for code pages (`<Hero look="…">` in src/app/(site)/**): six banner designs for an image hero, chosen per page to suit
 * its content, in place of the arched split banner. Each shows only the hero's own fields (eyebrow, heading, subheading, CTAs,
 * image, audience switch) and differs in layout and motion:
 * - `spotlight`  ink stage, the photo full-bleed on the right fading into it, a heartbeat line drawn across (corporate, careers)
 * - `orbit`      light stage, the photo in a circle with turning dashed orbits and travelling dots (student life, support)
 * - `mosaic`     light stage, the photo cut into three staggered tiles beside colour tiles (community, culture, partners)
 * - `panorama`   a wide cinematic photo with a frosted copy card rising over its lower edge (international, arrival, places)
 * - `editorial`  a large headline over a long rounded photo strip that eases into place (fees, policies, forms, library)
 * - `ribbon`     a slanted teal ribbon behind a morphing blob-shaped photo with an orange outline (course and landing pages)
 * Not a CMS field: the CMS hero keeps its `variant` select.
 */
export type HeroLook = 'spotlight' | 'orbit' | 'mosaic' | 'panorama' | 'editorial' | 'ribbon'
export const HERO_LOOKS: HeroLook[] = ['spotlight', 'orbit', 'mosaic', 'panorama', 'editorial', 'ribbon']

type LookProps = { block: HeroBlockType; pic: PickedImage; anchorId?: string | null }

const Pulse = ({ className, stroke = 'currentColor' }: { className?: string; stroke?: string }) => (
  <svg viewBox="0 0 600 40" className={className} aria-hidden="true">
    <path className="course-pulse-line" d="M0 20 H190 L208 20 L222 4 L240 36 L256 20 H600" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** The hero's words: eyebrow, h1 rising word by word, subheading, CTAs, audience switch. */
function Copy({ block, dark, size = 'lg', pulse, center }: { block: HeroBlockType; dark?: boolean; size?: 'lg' | 'xl'; pulse?: boolean; center?: boolean }) {
  const words = block.heading.split(/\s+/).filter(Boolean)
  return (
    <div className={cn('relative z-10 min-w-0', center && 'mx-auto text-center')}>
      {block.eyebrow && (
        <p className={cn('hero-fade-up inline-flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-2 text-xs font-semibold tracking-wide md:text-sm', dark ? 'border border-white/20 bg-white/10 text-white/90 backdrop-blur' : 'border border-primary/20 bg-primary/8 text-primary-strong')}>
          <span aria-hidden className="size-2.5 rounded-full bg-secondary" />{block.eyebrow}
        </p>
      )}
      <h1 className={cn('display mt-6 text-balance', size === 'xl' ? 'text-[clamp(2.6rem,6.6vw,5.6rem)]' : 'text-[clamp(2.3rem,5vw,4.3rem)]', 'leading-[1.04]', dark && 'text-white')}>
        {/* the heading keeps its *emphasis* markup; words rise one after another */}
        {/\*/.test(block.heading) ? (
          <span className="hero-fade-up block"><Emphasis text={block.heading} tone={dark ? 'secondary' : 'primary'} /></span>
        ) : (
          words.map((w, i) => (
            <span key={`${w}-${i}`}>
              <span className="inline-block overflow-hidden pb-[0.12em] align-bottom"><span className="hero-word" style={{ '--i': i } as CSSProperties}>{w}</span></span>{' '}
            </span>
          ))
        )}
      </h1>
      {pulse && <Pulse className={cn('mt-6 h-8 w-full max-w-[460px]', center && 'mx-auto')} stroke="var(--color-secondary)" />}
      {block.subheading && (
        <p className={cn('hero-fade-up mt-5 max-w-xl text-lg leading-relaxed [--d:240ms]', center && 'mx-auto', dark ? 'text-white/80' : 'text-muted-foreground')}>{block.subheading}</p>
      )}
      <div className="hero-fade-up [--d:320ms]">
        <CtaRow items={block.ctas} onDark={dark} className={cn('mt-8 flex flex-wrap items-center gap-3', center && 'justify-center')} />
      </div>
      {block.audienceSwitch && <AudienceSwitch className={cn('mt-10', center && 'justify-center')} onDark={dark} />}
    </div>
  )
}

const Photo = ({ pic, className, sizes, style }: { pic: PickedImage; className?: string; sizes: string; style?: CSSProperties }) => (
  <Image src={pic.url} alt={pic.alt} fill priority quality={90} sizes={sizes} className={cn('object-cover', className)} style={{ objectPosition: pic.position ?? 'center 30%', ...style }} />
)

function Spotlight({ block, pic, anchorId }: LookProps) {
  return (
    <section id={anchorId ?? undefined} data-hero-look="spotlight" className="relative isolate overflow-hidden bg-ink text-white">
      <div aria-hidden className="absolute inset-y-0 right-0 -z-20 w-full md:w-[66%] md:[mask-image:linear-gradient(to_right,transparent,black_40%)]">
        <Photo pic={pic} sizes="(min-width: 768px) 62vw, 100vw" className="look-pan" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/10 md:via-ink/70 md:to-transparent" />
        <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent md:hidden" />
        <span className="course-aurora absolute -top-40 -left-40 size-[34rem] rounded-full bg-primary/40 blur-3xl" />
        <span className="absolute inset-0 bg-[radial-gradient(hsl(180_30%_99%/0.06)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_right,black,transparent_60%)]" />
        <span className="look-beam absolute inset-y-0 left-[52%] hidden w-px bg-gradient-to-b from-transparent via-secondary to-transparent md:block" />
        <Pulse className="absolute right-0 bottom-10 h-16 w-[56rem] max-w-none opacity-50" stroke="var(--color-secondary)" />
      </div>
      <div className="mx-auto w-full max-w-site px-5 py-20 md:px-8 md:py-28 lg:py-32">
        <div className="max-w-2xl"><Copy block={block} dark /></div>
      </div>
    </section>
  )
}

function Orbit({ block, pic, anchorId }: LookProps) {
  return (
    <section id={anchorId ?? undefined} data-hero-look="orbit" className="relative isolate overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="course-aurora absolute -top-32 right-[-10rem] size-[38rem] rounded-full bg-primary/20 blur-3xl" />
        <span className="course-aurora absolute -bottom-40 left-[-8rem] size-[30rem] rounded-full bg-secondary/20 blur-3xl [animation-delay:-9s]" />
        <span className="absolute inset-0 bg-[radial-gradient(hsl(189_100%_15%/0.07)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>
      <div className="mx-auto grid w-full max-w-site items-center gap-14 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <Copy block={block} pulse />
        <div className="hero-fade-up relative mx-auto aspect-square w-full max-w-[30rem] [--d:160ms]">
          <span aria-hidden className="look-orbit absolute -inset-4 rounded-full border-2 border-dashed border-primary/40" />
          <span aria-hidden className="look-orbit-rev absolute -inset-10 rounded-full border border-dashed border-secondary/50 max-sm:hidden" />
          <span aria-hidden className="look-orbit absolute -inset-4"><span className="absolute top-1/2 -left-2 size-4 -translate-y-1/2 rounded-full bg-secondary shadow-[0_0_18px_4px_hsl(33_93%_54%/0.6)]" /></span>
          <span aria-hidden className="look-orbit-rev absolute -inset-10 max-sm:hidden"><span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_14px_4px_hsl(178_100%_31%/0.55)]" /></span>
          <div className="absolute inset-4 overflow-hidden rounded-full shadow-[0_40px_80px_-30px_hsl(189_100%_15%/0.6)] ring-8 ring-card">
            <Photo pic={pic} sizes="(min-width: 1024px) 34vw, 86vw" className="look-pan" />
          </div>
          <span aria-hidden className="hero-float absolute right-2 bottom-8 size-16 rounded-2xl bg-gradient-to-br from-secondary to-coral shadow-xl md:size-20" />
          <span aria-hidden className="hero-float absolute top-6 left-0 size-10 rounded-full bg-gradient-to-br from-primary to-ocean shadow-xl [animation-delay:-3s]" />
        </div>
      </div>
    </section>
  )
}

function Mosaic({ block, pic, anchorId }: LookProps) {
  const tile = 'hero-fade-up relative overflow-hidden rounded-[1.75rem] shadow-xl shadow-primary-strong/20'
  return (
    <section id={anchorId ?? undefined} data-hero-look="mosaic" className="relative isolate overflow-hidden bg-muted/60">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -top-40 left-1/3 size-[34rem] rounded-full bg-sun/20 blur-3xl" />
        <span className="absolute -right-40 -bottom-40 size-[30rem] rounded-full bg-primary/20 blur-3xl" />
      </div>
      <div className="mx-auto grid w-full max-w-site items-center gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1fr_1.05fr]">
        <Copy block={block} pulse />
        <div aria-hidden className="grid h-[24rem] grid-cols-3 grid-rows-6 gap-3 md:h-[30rem] md:gap-4">
          <div className={cn(tile, 'col-span-2 row-span-4 [--d:120ms]')}><Photo pic={pic} sizes="(min-width: 1024px) 34vw, 62vw" className="look-pan" /></div>
          <div className={cn(tile, 'row-span-2 bg-gradient-to-br from-secondary to-coral [--d:220ms]')}><span className="absolute inset-0 bg-[radial-gradient(hsl(0_0%_100%/0.25)_1.5px,transparent_1.5px)] [background-size:14px_14px]" /></div>
          <div className={cn(tile, 'row-span-3 [--d:300ms]')}><Photo pic={pic} sizes="(min-width: 1024px) 17vw, 31vw" style={{ objectPosition: '85% 40%', transform: 'scale(1.6)' }} /></div>
          <div className={cn(tile, 'row-span-2 bg-gradient-to-br from-primary to-primary-strong [--d:380ms]')}><Pulse className="absolute inset-x-3 top-1/2 h-8 -translate-y-1/2 text-white/80" /></div>
          <div className={cn(tile, 'row-span-2 [--d:460ms]')}><Photo pic={pic} sizes="(min-width: 1024px) 17vw, 31vw" style={{ objectPosition: '20% 60%', transform: 'scale(1.8)' }} /></div>
          <div className={cn(tile, 'row-span-1 bg-gradient-to-r from-mint to-primary [--d:540ms]')} />
        </div>
      </div>
    </section>
  )
}

function Panorama({ block, pic, anchorId }: LookProps) {
  return (
    <section id={anchorId ?? undefined} data-hero-look="panorama" className="relative isolate bg-background pb-12 md:pb-16">
      <div className="relative h-[22rem] overflow-hidden md:h-[30rem] lg:h-[34rem]">
        <Photo pic={pic} sizes="100vw" className="look-pan-wide" />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-ink/20" />
        <span aria-hidden className="look-sweep absolute -inset-y-1/4 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-xl" />
      </div>
      <div className="relative mx-auto -mt-40 w-full max-w-site px-5 md:-mt-48 md:px-8">
        <div className="look-rise relative max-w-3xl overflow-hidden rounded-[2rem] border border-white/60 bg-card/90 p-7 shadow-2xl shadow-primary-strong/25 backdrop-blur-xl md:p-12">
          <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-sun to-secondary" />
          <Copy block={block} />
        </div>
      </div>
    </section>
  )
}

function Editorial({ block, pic, anchorId }: LookProps) {
  const slats = 4
  return (
    <section id={anchorId ?? undefined} data-hero-look="editorial" className="relative isolate overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -top-24 right-0 size-[26rem] rounded-full bg-secondary/12 blur-3xl" />
        <span className="absolute bottom-0 left-1/4 size-[22rem] rounded-full bg-primary/10 blur-3xl" />
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>
      <div className="mx-auto grid w-full max-w-site items-center gap-12 px-5 py-16 md:px-8 md:py-20 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="min-w-0">
          <Copy block={{ ...block, subheading: null, ctas: null, audienceSwitch: false } as HeroBlockType} size="xl" />
          <span aria-hidden className="mt-8 block h-1 w-24 rounded-full bg-gradient-to-r from-primary to-secondary" />
          <div className="hero-fade-up [--d:240ms]">
            {block.subheading && <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{block.subheading}</p>}
            <CtaRow items={block.ctas} className="mt-6 flex flex-wrap items-center gap-3" />
            {block.audienceSwitch && <AudienceSwitch className="mt-8" />}
          </div>
        </div>
        {/* the photo cut into vertical slats that slide up one after another */}
        <div aria-hidden className="relative mx-auto grid aspect-[4/4.6] w-full max-w-[30rem] grid-cols-4 gap-2 md:gap-3">
          {Array.from({ length: slats }, (_, i) => (
            <div key={i} className={cn('look-slat relative overflow-hidden rounded-[1.25rem] shadow-xl shadow-primary-strong/20', i % 2 ? 'mt-8 mb-0' : 'mt-0 mb-8')} style={{ '--d': `${150 + i * 120}ms` } as CSSProperties}>
              <div className="absolute inset-y-0 w-[400%]" style={{ left: `${-i * 100}%` }}>
                <Photo pic={pic} sizes="(min-width: 1024px) 34vw, 90vw" />
              </div>
            </div>
          ))}
          <span className="absolute -right-4 -bottom-4 -z-10 size-28 rounded-[1.5rem] bg-gradient-to-br from-secondary to-coral" />
          <span className="absolute -top-4 -left-4 -z-10 size-20 rounded-full border-2 border-dashed border-primary/50" />
        </div>
      </div>
    </section>
  )
}

function Ribbon({ block, pic, anchorId }: LookProps) {
  return (
    <section id={anchorId ?? undefined} data-hero-look="ribbon" className="relative isolate overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="look-ribbon absolute top-[18%] -right-1/4 h-[58%] w-[120%] -rotate-6 bg-gradient-to-r from-primary via-primary-strong to-ink lg:top-[12%] lg:-right-[12%] lg:w-[70%] lg:-rotate-12" />
        <span className="absolute top-[18%] -right-1/4 h-[58%] w-[120%] -rotate-6 bg-[radial-gradient(hsl(0_0%_100%/0.08)_1px,transparent_1px)] [background-size:18px_18px] lg:top-[12%] lg:-right-[12%] lg:w-[70%] lg:-rotate-12" />
        <span className="absolute -bottom-32 -left-32 size-[26rem] rounded-full bg-secondary/18 blur-3xl" />
      </div>
      <div className="mx-auto grid w-full max-w-site items-center gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] bg-background/85 p-1 backdrop-blur-sm lg:bg-transparent lg:p-0 lg:backdrop-blur-none"><Copy block={block} pulse /></div>
        <div className="hero-fade-up relative mx-auto aspect-[1/1.05] w-full max-w-[28rem] [--d:160ms]">
          <span aria-hidden className="look-blob absolute -inset-3 translate-x-4 translate-y-4 border-[3px] border-secondary" />
          <div className="look-blob absolute inset-0 overflow-hidden shadow-[0_40px_80px_-30px_hsl(189_100%_8%/0.7)]">
            <Photo pic={pic} sizes="(min-width: 1024px) 32vw, 86vw" className="look-pan" />
          </div>
          <span aria-hidden className="hero-float absolute -bottom-4 -left-4 flex size-20 items-center justify-center rounded-full bg-card shadow-2xl">
            <Pulse className="h-6 w-14 text-primary" />
          </span>
        </div>
      </div>
    </section>
  )
}

const LOOKS: Record<HeroLook, (p: LookProps) => React.JSX.Element> = { spotlight: Spotlight, orbit: Orbit, mosaic: Mosaic, panorama: Panorama, editorial: Editorial, ribbon: Ribbon }

export function HeroLookView({ look, ...props }: LookProps & { look: HeroLook }) {
  const View = LOOKS[look] ?? Spotlight
  return <View {...props} />
}
