'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import {
  Award, Building2, Flag, GraduationCap, Handshake, MapPin, Rocket, ShieldCheck, Sparkles, Stethoscope, Users,
} from 'lucide-react'
import { cn } from '@/lib/cn'

// Roadmap: a winding road of milestones (HCI Australia, "Take a look at HCI Growth"). The milestones sit in rows that snake back and
// forth (4 a row on desktop, 3 on tablet, 2 on large phones, a single column on phones); the road is drawn between the measured
// milestone circles as an SVG, coloured from gold through teal and plum to orange like the old roadmap graphic, and it draws itself
// segment by segment when it scrolls into view while a glowing marker travels along it. The last stop is the goal, a pulsing star.

export type RoadmapIcon = 'award' | 'campus' | 'course' | 'partner' | 'launch' | 'quality' | 'people' | 'care' | 'brand' | 'flag' | 'pin'
export type RoadmapItem = { year: string; title: string; detail?: string; org?: string; icon?: RoadmapIcon }

const ICONS: Record<RoadmapIcon, typeof Award> = {
  award: Award, campus: Building2, course: GraduationCap, partner: Handshake, launch: Rocket, quality: ShieldCheck,
  people: Users, care: Stethoscope, brand: Sparkles, flag: Flag, pin: MapPin,
}

// the old graphic's colour run: gold → olive → green → teal → navy → plum → crimson → orange
const STOPS: [number, number, number][] = [[44, 82, 52], [70, 45, 40], [145, 50, 36], [178, 100, 30], [189, 80, 22], [200, 55, 22], [285, 35, 30], [350, 65, 42], [16, 80, 50], [33, 93, 54]]
function hueAt(t: number): string {
  const x = Math.min(0.9999, Math.max(0, t)) * (STOPS.length - 1)
  const i = Math.floor(x)
  const f = x - i
  const [a, b] = [STOPS[i], STOPS[i + 1]]
  let dh = b[0] - a[0]
  if (dh > 180) dh -= 360
  if (dh < -180) dh += 360
  const h = (a[0] + dh * f + 360) % 360
  return `hsl(${h.toFixed(0)} ${(a[1] + (b[1] - a[1]) * f).toFixed(0)}% ${(a[2] + (b[2] - a[2]) * f).toFixed(0)}%)`
}

const colsFor = (w: number) => (w >= 1024 ? 4 : w >= 760 ? 3 : w >= 520 ? 2 : 1)

type Seg = { d: string; from: string; to: string; x1: number; y1: number; x2: number; y2: number }

export function Roadmap({ items, goal }: { items: RoadmapItem[]; goal?: { year: string; title: string } }) {
  const wrap = useRef<HTMLDivElement>(null)
  const dots = useRef<(HTMLSpanElement | null)[]>([])
  const [cols, setCols] = useState(4)
  const [segs, setSegs] = useState<Seg[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [shown, setShown] = useState(false)

  const all = goal ? [...items, { year: goal.year, title: goal.title, goal: true }] : items
  const n = all.length
  const colour = (i: number) => hueAt(n > 1 ? i / (n - 1) : 0)

  // rows that snake: even rows left to right, odd rows right to left
  const rows: number[][] = []
  for (let i = 0; i < n; i += cols) rows.push(Array.from({ length: Math.min(cols, n - i) }, (_, k) => i + k))

  const measure = useCallback(() => {
    const el = wrap.current
    if (!el) return
    const c = colsFor(el.clientWidth)
    if (c !== cols) { setCols(c); return }
    const box = el.getBoundingClientRect()
    const pts = dots.current.slice(0, n).map((d) => {
      if (!d) return { x: 0, y: 0 }
      const r = d.getBoundingClientRect()
      return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 }
    })
    const out: Seg[] = []
    for (let i = 0; i < n - 1; i++) {
      const a = pts[i]
      const b = pts[i + 1]
      let d: string
      if (Math.abs(a.y - b.y) < 4 || c === 1) d = `M${a.x} ${a.y} L${b.x} ${b.y}`
      else {
        // a U-turn at the end of a row, bulging outwards
        const out = a.x > box.width / 2 ? 1 : -1
        const room = out > 0 ? box.width - a.x : a.x
        // the curve's peak (3/4 of the control offset) runs close to the edge, clear of the milestone text
        const dx = out * Math.max(24, (room - 10) / 0.75)
        d = `M${a.x} ${a.y} C${a.x + dx} ${a.y} ${b.x + dx} ${b.y} ${b.x} ${b.y}`
      }
      out.push({ d, from: colour(i), to: colour(i + 1), x1: a.x, y1: a.y, x2: b.x + 0.01, y2: b.y + 0.01 })
    }
    setSegs(out)
    setSize({ w: box.width, h: box.height })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols, n])

  useLayoutEffect(() => { measure() }, [measure])
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } }, { threshold: 0.12 })
    io.observe(el)
    // web fonts change the text heights once they load
    void document.fonts?.ready.then(() => measure())
    return () => { ro.disconnect(); io.disconnect() }
  }, [measure])

  const route = segs.map((s, i) => (i === 0 ? s.d : s.d.replace(/^M[^LC]+/, ''))).join(' ')
  const single = cols === 1

  return (
    <div ref={wrap} className={cn('roadmap relative', shown && 'is-shown')} data-roadmap="">
      {/* the road */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" width={size.w} height={size.h}>
        <defs>
          {segs.map((s, i) => (
            <linearGradient key={i} id={`rm-g-${i}`} gradientUnits="userSpaceOnUse" x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}>
              <stop offset="0" stopColor={s.from} />
              <stop offset="1" stopColor={s.to} />
            </linearGradient>
          ))}
        </defs>
        {segs.map((s, i) => (
          <path key={`r${i}`} d={s.d} pathLength={1} className="roadmap-seg" style={{ '--i': i } as CSSProperties} fill="none" stroke={`url(#rm-g-${i})`} strokeWidth={single ? 8 : 16} strokeLinecap="round" />
        ))}
        {!single && segs.map((s, i) => (
          <path key={`c${i}`} d={s.d} className="roadmap-lane" style={{ '--i': i } as CSSProperties} fill="none" stroke="white" strokeOpacity={0.75} strokeWidth={2} strokeDasharray="7 11" strokeLinecap="round" />
        ))}
      </svg>
      {/* a glowing marker travelling the road */}
      {route && <span aria-hidden className="roadmap-traveller absolute top-0 left-0 z-10 size-4 rounded-full bg-white shadow-[0_0_0_5px_hsl(33_93%_54%/0.55),0_0_24px_6px_hsl(33_93%_54%/0.7)]" style={{ offsetPath: `path('${route}')` } as CSSProperties} />}

      <div className="relative flex flex-col gap-y-12 md:gap-y-16">
        {rows.map((row, r) => (
          <ol key={r} className="grid gap-x-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, direction: !single && r % 2 ? 'rtl' : 'ltr' }} start={row[0] + 1}>
            {row.map((i) => {
              const it = all[i] as RoadmapItem & { goal?: boolean }
              const c = colour(i)
              const Icon = ICONS[it.icon ?? 'flag']
              return (
                <li key={i} dir="ltr" className={cn('roadmap-stop group relative', single ? 'flex items-center gap-5 text-left' : 'flex flex-col items-center text-center')} style={{ '--c': c, '--i': i } as CSSProperties}>
                  {it.goal ? (
                    <span ref={(el) => { dots.current[i] = el }} className="relative flex size-36 shrink-0 items-center justify-center md:size-44">
                      <span aria-hidden className="roadmap-star-glow absolute inset-0 rounded-full bg-[radial-gradient(circle,hsl(350_80%_55%/0.55),transparent_65%)]" />
                      <svg aria-hidden viewBox="0 0 100 100" className="roadmap-star absolute inset-0 size-full drop-shadow-[0_14px_28px_hsl(350_70%_40%/0.45)]">
                        <defs><linearGradient id="rm-star" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="hsl(352 78% 50%)" /><stop offset="1" stopColor="hsl(16 86% 52%)" /></linearGradient></defs>
                        <path d="M50 0 C55 35 65 45 100 50 C65 55 55 65 50 100 C45 65 35 55 0 50 C35 45 45 35 50 0Z" fill="url(#rm-star)" />
                      </svg>
                      <span className="relative font-display text-2xl font-semibold text-white md:text-3xl">{it.year}</span>
                    </span>
                  ) : (
                    <span ref={(el) => { dots.current[i] = el }} className="relative flex size-24 shrink-0 items-center justify-center md:size-28">
                      <span aria-hidden className="absolute inset-0 rounded-full bg-[var(--c)] opacity-25 transition-transform duration-500 group-hover:scale-125 group-hover:opacity-40" />
                      <span className="relative flex size-[86%] flex-col items-center justify-center rounded-full border-[5px] border-[var(--c)] bg-card shadow-[0_18px_40px_-18px_var(--c)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105">
                        <Icon aria-hidden className="size-7 text-[var(--c)] transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 md:size-8" strokeWidth={1.6} />
                        {it.org && <span className="label-mono mt-1 max-w-[90%] truncate text-[9px] tracking-[0.12em] text-muted-foreground">{it.org}</span>}
                      </span>
                      <span className="absolute -top-3 rounded-full bg-[var(--c)] px-3 py-0.5 font-display text-sm font-semibold text-white shadow-lg">{it.year}</span>
                    </span>
                  )}
                  <div className={cn('min-w-0', single ? '' : 'mt-4 max-w-[13rem]')}>
                    {it.goal && <p className="label-mono text-[10px] text-secondary-strong">The goal</p>}
                    <p className={cn('leading-snug font-semibold text-foreground', it.goal ? 'font-display text-xl' : 'text-[15px]')}>{it.title}</p>
                    {it.detail && <p className="mt-1 text-sm leading-snug text-muted-foreground">{it.detail}</p>}
                  </div>
                </li>
              )
            })}
          </ol>
        ))}
      </div>
    </div>
  )
}
