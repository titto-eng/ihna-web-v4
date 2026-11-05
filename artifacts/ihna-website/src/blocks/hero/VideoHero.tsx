'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useReducedMotion } from '@/components/ui/carousel'

const noopSubscribe = () => () => {}

export type VideoHeroSlide = {
  eyebrow?: string | null
  heading: string
  subheading?: string | null
  ctas?: { label: string; href: string; style?: 'primary' | 'secondary' | 'link' | null }[] | null
}
export type VideoHeroMedia = { webm?: string; mp4?: string; poster: string; posterWidth?: number; posterHeight?: number; alt?: string }
export type VideoHeroHighlight = { value: string; label: string }

/** Milliseconds per text slide (autoplay never runs under reduced motion and pauses on hover, focus and hidden tabs). */
export const VIDEO_HERO_MS = 7000

const isExternal = (href: string) => /^https?:\/\//.test(href)

// `*phrase*` marks the emphasised phrase (Emphasis.tsx convention); each word animates in with its own delay.
function AnimatedHeading({ text, active }: { text: string; active: boolean }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean)
  let i = 0
  const out: ReactNode[] = []
  parts.forEach((part, pi) => {
    const em = part.startsWith('*') && part.endsWith('*')
    const words = (em ? part.slice(1, -1) : part).split(/(\s+)/)
    words.forEach((w, wi) => {
      if (!w) return
      if (/^\s+$/.test(w)) { out.push(' '); return }
      const n = i++
      out.push(
        <span key={`${pi}-${wi}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <span className={cn(active && 'hero-word', em && 'font-normal text-secondary italic')} style={{ '--i': n } as CSSProperties}>{w}</span>
        </span>,
      )
    })
  })
  return <>{out}</>
}

/**
 * Home hero: one background video that never changes (it loops behind every slide) and a text slider on top. Every slide's text is
 * in the server HTML (SEO); slide one carries the h1. The poster image is the LCP element (priority); the video is attached only after
 * hydration, and not at all under reduced motion or Save-Data, so it never delays first paint. Pause/Play stops both the slider and
 * the video (WCAG 2.2.2).
 */
export function VideoHero({ slides, media, highlights = [], interval = VIDEO_HERO_MS }: { slides: VideoHeroSlide[]; media: VideoHeroMedia; highlights?: VideoHeroHighlight[]; interval?: number }) {
  const [index, setIndex] = useState(0)
  // null = follow the visitor's motion preference; true/false = the Pause/Play button's choice.
  const [choice, setChoice] = useState<boolean | null>(null)
  const [hover, setHover] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const reduced = useReducedMotion()
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const saveData = useSyncExternalStore(noopSubscribe, () => !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData, () => false)
  const playing = choice ?? !reduced
  const setPlaying = (f: (p: boolean) => boolean) => setChoice(f(playing))
  // The video is attached after hydration only, and not under reduced motion (unless Play is pressed) or Save-Data.
  const loadVideo = hydrated && !saveData && (!reduced || choice === true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const touchX = useRef<number | null>(null)
  const count = slides.length

  const go = useCallback((n: number) => setIndex(((n % count) + count) % count), [count])

  // Autoplay of the text slides.
  useEffect(() => {
    if (!playing || hover || count < 2) return
    const t = window.setTimeout(() => go(index + 1), interval)
    return () => window.clearTimeout(t)
  }, [index, playing, hover, count, interval, go])

  // Pause/Play also drives the video; a hidden tab pauses it.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (playing) v.play().catch(() => {})
    else v.pause()
  }, [playing, loadVideo])
  useEffect(() => {
    const onVis = () => { if (document.hidden) videoRef.current?.pause(); else if (playing) videoRef.current?.play().catch(() => {}) }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [playing])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1) }
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Welcome to IHNA"
      onKeyDown={onKey}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={() => setHover(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null }}
      onTouchEnd={(e) => {
        const start = touchX.current; touchX.current = null
        const end = e.changedTouches[0]?.clientX
        if (start != null && end != null && Math.abs(end - start) > 50) go(index + (end < start ? 1 : -1))
      }}
      className="relative isolate flex min-h-[max(36rem,calc(100svh-76px))] flex-col overflow-hidden bg-ink text-white lg:min-h-[max(40rem,calc(100svh-120px))]"
    >
      {/* constant background: poster (LCP) under the looping video */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image src={media.poster} alt="" fill priority sizes="100vw" className={cn('object-cover', !reduced && 'hero-kenburns')} />
        {loadVideo && (
          <video
            ref={videoRef}
            className={cn('absolute inset-0 size-full object-cover transition-opacity duration-1000', videoReady ? 'opacity-100' : 'opacity-0')}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={media.poster}
            onCanPlay={() => setVideoReady(true)}
          >
            {/* the MP4 first: the browser takes the first source it can play, and the H.264 file is about a third of the WebM's size */}
            {media.mp4 && <source src={media.mp4} type="video/mp4" />}
            {media.webm && <source src={media.webm} type="video/webm" />}
          </video>
        )}
        {/* legibility + brand tint */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/70 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-primary-strong/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.07)_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="absolute -bottom-40 -left-40 size-[34rem] rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute top-10 right-[8%] size-72 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-site flex-1 items-center px-5 pt-14 pb-40 md:px-8 md:pt-20 md:pb-44">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          {/* stacked slides: every slide is in the HTML, only the active one is visible */}
          <div className="grid" aria-live={playing && !hover ? 'off' : 'polite'}>
            {slides.map((s, i) => {
              const active = i === index
              const H = i === 0 ? 'h1' : 'h2'
              return (
                <div
                  key={i}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}`}
                  aria-hidden={!active}
                  inert={!active}
                  className={cn('col-start-1 row-start-1 max-w-3xl transition-opacity duration-500', active ? 'opacity-100' : 'pointer-events-none opacity-0')}
                >
                  {s.eyebrow && (
                    <p className={cn('inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-1.5 pr-4 pl-2 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-md md:text-sm', active && 'hero-fade-up')}>
                      <span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-secondary opacity-75" /><span className="relative inline-flex size-2.5 rounded-full bg-secondary" /></span>
                      {s.eyebrow}
                    </p>
                  )}
                  <H className="display mt-6 text-[clamp(2.4rem,6.2vw,5.4rem)] leading-[1.02] font-light text-white">
                    <AnimatedHeading text={s.heading} active={active} />
                  </H>
                  {s.subheading && (
                    <p className={cn('mt-6 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg', active && 'hero-fade-up')} style={{ '--d': '450ms' } as CSSProperties}>
                      {s.subheading}
                    </p>
                  )}
                  {!!s.ctas?.length && (
                    <div className={cn('mt-9 flex flex-wrap gap-3', active && 'hero-fade-up')} style={{ '--d': '600ms' } as CSSProperties}>
                      {s.ctas.map((c, ci) => {
                        const primary = (c.style ?? (ci === 0 ? 'primary' : 'secondary')) === 'primary'
                        return (
                          <Link
                            key={c.href + c.label}
                            href={c.href}
                            {...(isExternal(c.href) ? { target: '_blank', rel: 'noopener' } : {})}
                            className={cn(
                              'group/hc inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-bold transition-all duration-300 hover:-translate-y-0.5',
                              primary
                                ? 'bg-secondary text-ink shadow-[0_14px_30px_-12px_hsl(33_93%_54%/0.9)] hover:bg-[#ffa940]'
                                : 'border border-white/40 bg-white/5 text-white backdrop-blur-md hover:border-white hover:bg-white hover:text-primary-strong',
                            )}
                          >
                            {c.label}
                            <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover/hc:translate-x-1" />
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* floating glass highlights (desktop) */}
          {highlights.length > 0 && (
            <ul className="hidden flex-col gap-4 lg:flex" aria-label="IHNA at a glance">
              {highlights.slice(0, 3).map((h, i) => (
                <li
                  key={h.label}
                  className={cn('hero-float rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-ink/40 backdrop-blur-xl', i === 1 && 'ml-8')}
                  style={{ animationDelay: `${i * 1.2}s` }}
                >
                  <p className="display text-4xl font-normal text-white">{h.value}</p>
                  <p className="mt-1 text-sm leading-snug text-white/75">{h.label}</p>
                  <span aria-hidden className="mt-3 block h-1 w-10 rounded-full bg-gradient-to-r from-secondary to-primary" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* controls: slide tabs with progress, prev/next, pause */}
      <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-ink/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-site items-stretch gap-4 px-5 md:px-8">
          <div role="tablist" aria-label="Choose a slide" className="grid flex-1 gap-2 md:gap-4" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
            {slides.map((s, i) => {
              const active = i === index
              return (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Slide ${i + 1}: ${s.eyebrow ?? s.heading.replace(/\*/g, '')}`}
                  onClick={() => go(i)}
                  className="group/tab relative py-4 text-left md:py-5"
                >
                  <span className="block h-[3px] overflow-hidden rounded-full bg-white/20">
                    {active && (
                      <span
                        key={`${index}-${playing && !hover}`}
                        className={cn('block h-full rounded-full bg-secondary', playing && !hover && !reduced ? 'hero-progress' : 'w-full')}
                        style={{ '--hero-ms': `${interval}ms` } as CSSProperties}
                      />
                    )}
                  </span>
                  <span className={cn('mt-3 hidden text-xs font-semibold tracking-wide transition-colors md:line-clamp-1', active ? 'text-white' : 'text-white/55 group-hover/tab:text-white/85')}>
                    <span className="mr-2 font-mono text-secondary">{String(i + 1).padStart(2, '0')}</span>
                    {s.eyebrow ?? s.heading.replace(/\*/g, '')}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="grid size-10 place-items-center rounded-full border border-white/25 transition-colors hover:border-secondary hover:bg-secondary hover:text-ink"><ChevronLeft aria-hidden className="size-5" /></button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="grid size-10 place-items-center rounded-full border border-white/25 transition-colors hover:border-secondary hover:bg-secondary hover:text-ink"><ChevronRight aria-hidden className="size-5" /></button>
            <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause the slideshow and video' : 'Play the slideshow and video'} aria-pressed={!playing} className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white hover:text-ink">
              {playing ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
