'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play, X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import type { CourseFilm } from '@/content/course-videos'
import { announcePlay, newPlayerId, registerPlayer } from '@/components/media/exclusivePlayback'
import { cn } from '@/lib/cn'

// The moving parts of the course video banner (CourseVideoHero): the muted background loop, its pause control and progress line,
// and the "watch the film" player with sound. The loop waits for the first frame before fading in over the poster, stops while the
// banner is off screen, and never starts for visitors who ask for reduced motion (WCAG 2.2.2: the pause button is always there).

/** Background loop: 16:9 on tablet and up, a 3:4 crop on phones; the poster shows until the first frame is ready. */
export function FilmLoop({ film }: { film: CourseFilm }) {
  const ref = useRef<HTMLVideoElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [userPaused, setUserPaused] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { v.dataset.userPaused = '1'; return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !v.dataset.userPaused) void v.play().catch(() => {})
      else v.pause()
    }, { threshold: 0.15 })
    io.observe(v)
    return () => io.disconnect()
  }, [])

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) { delete v.dataset.userPaused; setUserPaused(false); void v.play().catch(() => {}) }
    else { v.dataset.userPaused = '1'; setUserPaused(true); v.pause() }
  }

  return (
    <>
      <picture className="absolute inset-0 -z-30">
        <source media="(max-width: 767px)" srcSet={film.posterMobile} />
        <img src={film.poster} alt="" className="size-full object-cover" fetchPriority="high" />
      </picture>
      <video
        ref={ref}
        aria-hidden
        tabIndex={-1}
        muted
        loop
        playsInline
        preload="auto"
        className={cn('film-drift absolute inset-0 -z-20 size-full object-cover transition-opacity duration-[1400ms]', ready ? 'opacity-100' : 'opacity-0')}
        onLoadedData={() => setReady(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget
          if (bar.current && v.duration) bar.current.style.transform = `scaleX(${v.currentTime / v.duration})`
        }}
      >
        <source src={film.loop} type="video/mp4" media="(min-width: 768px)" />
        <source src={film.loopMobile} type="video/mp4" />
      </video>
      {/* the loop's progress, along the banner's bottom edge */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 z-10 h-[3px] bg-ink-foreground/10">
        <span ref={bar} className="block h-full origin-left scale-x-0 bg-gradient-to-r from-primary via-sun to-secondary transition-transform duration-300 ease-linear" />
      </span>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={!playing}
        className="absolute top-8 right-8 z-20 inline-flex size-10 items-center justify-center rounded-full border border-ink-foreground/25 bg-ink/50 text-ink-foreground backdrop-blur transition hover:border-secondary hover:text-secondary md:top-14 md:right-14"
      >
        {playing && !userPaused ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
        <span className="sr-only">{playing && !userPaused ? 'Pause the background video' : 'Play the background video'}</span>
      </button>
    </>
  )
}

/** "Watch the film": a play button with a turning text ring that opens the film with sound in a dialog. */
export function FilmPlayer({ film, title }: { film: CourseFilm; title: string }) {
  const [open, setOpen] = useState(false)
  const player = useRef<HTMLVideoElement>(null)
  const [id] = useState(newPlayerId)
  // one video at a time: this player pauses the page's other videos and is paused when another starts
  useEffect(() => registerPlayer({ id, pause: () => player.current?.pause() }), [id])
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger className="group relative inline-flex size-32 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary md:size-40">
        <svg aria-hidden viewBox="0 0 200 200" className="film-ring absolute inset-0 size-full text-ink-foreground/85">
          <defs><path id="film-ring-path" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
          <text className="fill-current font-mono text-[14px] uppercase">
            <textPath href="#film-ring-path" textLength="486" lengthAdjust="spacing">Watch the video · Watch the video ·</textPath>
          </text>
        </svg>
        <span aria-hidden className="film-ping absolute size-16 rounded-full bg-secondary/40 md:size-20" />
        <span className="relative inline-flex size-16 items-center justify-center rounded-full bg-secondary text-ink shadow-2xl shadow-secondary/40 transition-transform duration-300 group-hover:scale-110 md:size-20">
          <Play aria-hidden className="ml-1 size-7 fill-current md:size-8" />
        </span>
        <span className="sr-only">Watch the {title} video</span>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,1100px)] -translate-x-1/2 -translate-y-1/2 outline-none data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0">
          <DialogPrimitive.Title className="sr-only">{title}: course video</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{film.label}</DialogPrimitive.Description>
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/15">
            {open && <video ref={player} onPlay={() => announcePlay(id)} src={film.full} poster={film.poster} controls autoPlay playsInline className="size-full" aria-label={film.label} />}
          </div>
          <DialogPrimitive.Close className="absolute -top-12 right-0 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-secondary">
            <X aria-hidden className="size-4" /> Close
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
