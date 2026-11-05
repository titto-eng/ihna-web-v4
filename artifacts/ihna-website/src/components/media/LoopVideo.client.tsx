'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'

/** A short muted loop (decorative), with a pause button; it never starts for visitors who ask for reduced motion. */
export function LoopVideo({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    const v = ref.current
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) void v.play().catch(() => {}); else v.pause() }, { threshold: 0.2 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  const toggle = () => { const v = ref.current; if (!v) return; if (v.paused) void v.play().catch(() => {}); else v.pause() }
  return (
    <>
      <video ref={ref} aria-hidden tabIndex={-1} muted loop playsInline preload="metadata" poster={poster} className={className} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}>
        <source src={src} type="video/mp4" />
      </video>
      <button type="button" onClick={toggle} className="absolute right-4 bottom-4 z-10 inline-flex size-10 items-center justify-center rounded-full border border-white/40 bg-ink/50 text-white backdrop-blur transition hover:border-secondary hover:text-secondary">
        {playing ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
        <span className="sr-only">{playing ? 'Pause the video' : 'Play the video'}</span>
      </button>
    </>
  )
}
