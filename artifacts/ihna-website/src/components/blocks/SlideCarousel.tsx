'use client'

import { Children, useCallback, useEffect, useState, type ReactNode } from 'react'
import { Pause, Play } from 'lucide-react'
import {
  Carousel, CarouselContent, CarouselCounter, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious, useCarousel, useReducedMotion, type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/cn'

// The site carousel (05 §4.6, DEC-71): embla via src/components/ui/carousel.tsx. Server components pass the slides as children,
// so every slide is in the server HTML and the first one paints before hydration.
export type SlideCarouselProps = {
  children: ReactNode
  /** Accessible name of the carousel region. */
  label: string
  /** Slides per view at the widest breakpoint: 1 = always one; 2 = 1 → 2 (md); 3 = 1 → 2 (md) → 3 (lg); 4 = 1 → 2 (md) → 4 (lg). */
  perView?: 1 | 2 | 3 | 4
  /** Dots by default; a "02 / 12" counter once there are more than 8 slides. */
  indicator?: 'dots' | 'counter'
  /** Milliseconds per slide. Off by default; never runs under reduced motion; pauses on hover and focus; shows a pause button. */
  autoplay?: number
  loop?: boolean
  onDark?: boolean
  className?: string
  /** Extra classes for every slide wrapper. */
  slideClassName?: string
}

/** Announces "Slide n of N" after a move; silent while autoplay runs (WAI carousel pattern). */
function Status({ live }: { live: boolean }) {
  const { selectedIndex, snapCount } = useCarousel()
  return (
    <p className="sr-only" aria-live={live ? 'polite' : 'off'} aria-atomic="true">
      {snapCount > 1 ? `Slide ${selectedIndex + 1} of ${snapCount}` : ''}
    </p>
  )
}

/** Prev / next, indicator, pause. Hidden (space kept, so nothing shifts) once embla finds every slide already in view. */
function ControlsRow({ children }: { children: ReactNode }) {
  const { snapCount } = useCarousel()
  return (
    <div className={cn('mt-6 flex items-center gap-2', snapCount === 1 && 'invisible')} data-slot="carousel-controls">
      {children}
    </div>
  )
}

const BASIS: Record<NonNullable<SlideCarouselProps['perView']>, string> = {
  1: 'basis-full',
  2: 'basis-full md:basis-1/2',
  3: 'basis-full md:basis-1/2 lg:basis-1/3',
  4: 'basis-full md:basis-1/2 lg:basis-1/4',
}

export function SlideCarousel({ children, label, perView = 3, indicator, autoplay, loop = false, onDark, className, slideClassName }: SlideCarouselProps) {
  const slides = Children.toArray(children)
  const [api, setApi] = useState<CarouselApi>()
  const reducedMotion = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const canAutoplay = !!autoplay && slides.length > 1 && !reducedMotion
  const running = canAutoplay && !paused && !hovered && !focused

  const advance = useCallback(() => {
    if (!api || document.hidden) return
    if (api.canScrollNext()) api.scrollNext()
    else api.scrollTo(0)
  }, [api])

  useEffect(() => {
    if (!running || !api) return
    const t = window.setInterval(advance, autoplay)
    return () => window.clearInterval(t)
  }, [running, api, advance, autoplay])

  const kind = indicator ?? (slides.length > 8 ? 'counter' : 'dots')
  if (!slides.length) return null

  return (
    <Carousel
      opts={{ align: 'start', loop }}
      setApi={setApi}
      aria-label={label}
      data-autoplay={canAutoplay ? (running ? 'running' : 'paused') : undefined}
      className={cn('min-w-0 max-w-full', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false) }}
    >
      <CarouselContent className="-ml-4">
        {slides.map((slide, i) => (
          <CarouselItem key={i} aria-label={`${i + 1} of ${slides.length}`} className={cn('pl-4', BASIS[perView], slideClassName)}>
            {slide}
          </CarouselItem>
        ))}
      </CarouselContent>
      <Status live={!running} />
      {slides.length > 1 && (
        <ControlsRow>
          <CarouselPrevious variant="outline" className={cn('static size-10 translate-y-0', onDark && 'border-ink-foreground/30 bg-transparent text-ink-foreground hover:bg-ink-foreground/10')} />
          <CarouselNext variant="outline" className={cn('static size-10 translate-y-0', onDark && 'border-ink-foreground/30 bg-transparent text-ink-foreground hover:bg-ink-foreground/10')} />
          {kind === 'dots' ? (
            <CarouselDots className="ml-2" onDark={onDark} />
          ) : (
            <CarouselCounter className={cn('ml-3', onDark ? 'text-ink-foreground/75' : 'text-muted-foreground')} />
          )}
          {canAutoplay && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
              className={cn(
                'ml-auto grid size-10 cursor-pointer place-items-center rounded-full border transition-colors',
                onDark ? 'border-ink-foreground/30 text-ink-foreground hover:bg-ink-foreground/10' : 'border-border bg-background hover:bg-muted',
              )}
            >
              {paused ? <Play aria-hidden className="size-4 fill-current" /> : <Pause aria-hidden className="size-4 fill-current" />}
            </button>
          )}
        </ControlsRow>
      )}
    </Carousel>
  )
}
