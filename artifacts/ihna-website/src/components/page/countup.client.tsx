'use client'

import { useEffect, useRef, useState } from 'react'

/** A figure such as "35,000+" or "220+" that counts up once it scrolls into view; anything else is shown as written. */
export function CountUp({ value, ms = 1400 }: { value: string; ms?: number }) {
  const m = /^(\D*)([\d,]+(?:\.\d+)?)(.*)$/.exec(value)
  const target = m ? Number(m[2].replace(/,/g, '')) : NaN
  const [n, setN] = useState<number | null>(null)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !Number.isFinite(target) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / ms)
        setN(Math.round(target * (1 - Math.pow(1 - p, 3))))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [target, ms])
  if (!m || !Number.isFinite(target)) return <span>{value}</span>
  const shown = n === null ? m[2] : n.toLocaleString('en-AU')
  // the final text is always in the DOM for readers; the animated digits are only visual
  return (
    <span ref={ref}>
      <span aria-hidden>{m[1]}{shown}{m[3]}</span>
      <span className="sr-only">{value}</span>
    </span>
  )
}
