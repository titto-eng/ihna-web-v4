'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  BookOpenCheck, Calculator, ChevronDown, ClipboardCheck, FileSearch, GraduationCap, HandHeart, Landmark, Presentation, Scale,
  Stethoscope, Users,
} from 'lucide-react'
import { cn } from '@/lib/cn'

// OrgChart: a governance structure drawn in code (/governance/). Wide screens get a top-down tree whose connectors are measured
// and drawn as SVG (solid reporting lines; dashed "dotted lines" between bodies), drawing themselves when the chart scrolls into
// view; narrow screens get an indented tree. Hover or focus a body to light its line of reporting (up to the top and down through
// its committees) and dim the rest; a body with committees can be folded and unfolded. The markup is a nested list, so screen
// readers get the same structure.

export type OrgIcon = 'board' | 'academic' | 'audit' | 'course' | 'nursing' | 'teaching' | 'students' | 'community' | 'exams' | 'appeals' | 'finance'
export type OrgNode = { id: string; name: string; short?: string; icon?: OrgIcon; children?: OrgNode[] }
/** A dotted line: from one or more bodies to a group of bodies (drawn as dashes joining that group's connector). */
export type OrgDotted = { from: string[]; to: string }

const ICONS: Record<OrgIcon, typeof Users> = {
  board: Landmark, academic: GraduationCap, audit: FileSearch, course: BookOpenCheck, nursing: Stethoscope, teaching: Presentation,
  students: Users, community: HandHeart, exams: ClipboardCheck, appeals: Scale, finance: Calculator,
}
const TONES = ['var(--color-primary-strong)', 'var(--color-primary)', 'var(--color-ocean)', 'var(--color-mint)']

type Flat = { node: OrgNode; parent: string | null; depth: number }
function flatten(n: OrgNode, parent: string | null = null, depth = 0, out: Map<string, Flat> = new Map()) {
  out.set(n.id, { node: n, parent, depth })
  n.children?.forEach((c) => flatten(c, n.id, depth + 1, out))
  return out
}
const descendants = (n: OrgNode): string[] => (n.children ?? []).flatMap((c) => [c.id, ...descendants(c)])

type Line = { d: string; dashed?: boolean; ids: string[] }

export function OrgChart({ root, dotted = [] }: { root: OrgNode; dotted?: OrgDotted[] }) {
  const flat = useMemo(() => flatten(root), [root])
  const [folded, setFolded] = useState<Set<string>>(new Set())
  const [active, setActive] = useState<string | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [shown, setShown] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const boxes = useRef(new Map<string, HTMLElement>())

  // the active body's line of reporting: its ancestors and descendants
  const lit = useMemo(() => {
    if (!active) return null
    const s = new Set<string>([active])
    let p = flat.get(active)?.parent ?? null
    while (p) { s.add(p); p = flat.get(p)?.parent ?? null }
    const n = flat.get(active)?.node
    if (n) descendants(n).forEach((d) => s.add(d))
    return s
  }, [active, flat])

  const measure = useCallback(() => {
    const el = wrap.current
    if (!el) return
    const tree = el.querySelector<HTMLElement>('[data-org-tree="wide"]')
    if (!tree || tree.offsetParent === null) { setLines([]); return }
    const base = el.getBoundingClientRect()
    const r = (id: string) => {
      const b = boxes.current.get(id)?.getBoundingClientRect()
      return b ? { l: b.left - base.left, r: b.right - base.left, t: b.top - base.top, b: b.bottom - base.top, cx: b.left - base.left + b.width / 2, cy: b.top - base.top + b.height / 2 } : null
    }
    const out: Line[] = []
    const busY = new Map<string, { y: number; x1: number; x2: number }>()
    for (const [id, f] of flat) {
      const kids = f.node.children ?? []
      if (!kids.length || folded.has(id)) continue
      const p = r(id)
      const cs = kids.map((k) => ({ id: k.id, b: r(k.id) })).filter((k) => k.b) as { id: string; b: NonNullable<ReturnType<typeof r>> }[]
      if (!p || !cs.length) continue
      const y = p.b + (Math.min(...cs.map((c) => c.b.t)) - p.b) / 2
      const x1 = Math.min(p.cx, ...cs.map((c) => c.b.cx))
      const x2 = Math.max(p.cx, ...cs.map((c) => c.b.cx))
      busY.set(id, { y, x1, x2 })
      out.push({ d: `M${p.cx} ${p.b} V${y}`, ids: [id] })
      if (x2 - x1 > 1) out.push({ d: `M${x1} ${y} H${x2}`, ids: [id, ...cs.map((c) => c.id)] })
      for (const c of cs) out.push({ d: `M${c.b.cx} ${y} V${c.b.t}`, ids: [id, c.id] })
    }
    // dotted lines: down from each source into the gap left of the target group, then along to the group's connector
    for (const dl of dotted) {
      const bus = busY.get(dl.to)
      const kids = flat.get(dl.to)?.node.children ?? []
      const first = kids[0] && r(kids[0].id)
      if (!bus || !first) continue
      // the gap left of the group: halfway between the nearest box on its left and the group's first box
      let leftEdge = -Infinity
      for (const [id] of flat) { const b = r(id); if (b && b.r <= first.l + 1 && b.b > first.t) leftEdge = Math.max(leftEdge, b.r) }
      const gx = Number.isFinite(leftEdge) ? (leftEdge + first.l) / 2 : first.l - 20
      const srcs = dl.from.map((id) => ({ id, b: r(id) })).filter((s) => s.b) as { id: string; b: NonNullable<ReturnType<typeof r>> }[]
      const midY = srcs.length > 1 ? srcs[1].b.cy : srcs[0]?.b.cy
      for (const [k, s] of srcs.entries()) {
        const top = busY.get(s.id)
        if (k === 0 && top && s.b.cx < gx) {
          // from a parent: continue its own trunk below its connector, then across to the gap
          out.push({ d: `M${s.b.cx} ${top.y} V${midY} H${gx}`, dashed: true, ids: [s.id, ...kids.map((k) => k.id)] })
        } else {
          out.push({ d: `M${s.b.r} ${s.b.cy} H${gx}`, dashed: true, ids: [s.id, ...kids.map((k) => k.id)] })
        }
      }
      out.push({ d: `M${gx} ${midY} V${bus.y} H${bus.x1}`, dashed: true, ids: [...dl.from, ...kids.map((k) => k.id)] })
    }
    setLines(out)
    setSize({ w: base.width, h: base.height })
  }, [flat, folded, dotted])

  useLayoutEffect(() => { measure() }, [measure])
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } }, { threshold: 0.15 })
    io.observe(el)
    void document.fonts?.ready.then(() => measure())
    return () => { ro.disconnect(); io.disconnect() }
  }, [measure])

  const toggle = (id: string) => setFolded((f) => { const n = new Set(f); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const dim = (id: string) => lit !== null && !lit.has(id)

  const box = (n: OrgNode, depth: number, i: number, wide: boolean) => {
    const Icon = ICONS[n.icon ?? 'board']
    const kids = n.children?.length ?? 0
    const tone = TONES[Math.min(depth, TONES.length - 1)]
    return (
      <div
        key={n.id}
        ref={wide ? (el) => { if (el) boxes.current.set(n.id, el); else boxes.current.delete(n.id) } : undefined}
        tabIndex={0}
        onMouseEnter={() => setActive(n.id)}
        onMouseLeave={() => setActive(null)}
        onFocus={() => setActive(n.id)}
        onBlur={() => setActive(null)}
        className={cn(
          'org-box group relative flex items-center gap-3 rounded-2xl border border-border bg-card text-left shadow-[0_14px_30px_-18px_hsl(189_100%_15%/0.45)] outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-secondary',
          wide ? 'w-[11.5rem] px-3 py-3 2xl:w-[13rem]' : 'px-4 py-3',
          lit?.has(n.id) && 'z-10 -translate-y-1 border-transparent shadow-[0_22px_44px_-18px_hsl(189_100%_15%/0.6)] ring-2 ring-secondary',
          dim(n.id) && 'opacity-35 saturate-50',
        )}
        style={{ '--tone': tone, '--i': i } as CSSProperties}
      >
        <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${tone}, var(--color-secondary))` }} />
        <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" style={{ background: tone }}>
          <Icon className="size-5" strokeWidth={1.7} />
        </span>
        <span className="min-w-0 flex-1 text-sm leading-snug font-semibold text-foreground">{n.name}</span>
        {kids > 0 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggle(n.id) }}
            aria-expanded={!folded.has(n.id)}
            className={cn(
              'flex shrink-0 items-center justify-center rounded-full text-primary-strong transition hover:bg-secondary hover:text-ink',
              wide ? 'absolute -bottom-3 left-1/2 z-10 size-6 -translate-x-1/2 border border-border bg-card shadow-md' : 'relative -mr-1 size-7 bg-muted',
            )}
          >
            <ChevronDown aria-hidden className={cn('size-4 transition-transform duration-300', folded.has(n.id) && '-rotate-90')} />
            <span className="sr-only">{folded.has(n.id) ? `Show the committees under ${n.name}` : `Hide the committees under ${n.name}`}</span>
          </button>
        )}
      </div>
    )
  }

  let order = 0
  // wide: a top-down tree (each body above a row of its committees)
  const wideNode = (n: OrgNode, depth: number): React.JSX.Element => {
    const i = order++
    const open = n.children?.length && !folded.has(n.id)
    return (
      <li key={n.id} className="flex flex-col items-center">
        {box(n, depth, i, true)}
        {open ? (
          <ul className={cn('mt-12 flex items-start justify-center', depth === 0 ? 'gap-12 2xl:gap-16' : 'gap-3 2xl:gap-5')}>
            {n.children!.map((c) => wideNode(c, depth + 1))}
          </ul>
        ) : null}
      </li>
    )
  }
  // narrow: an indented tree with guide lines
  const narrowNode = (n: OrgNode, depth: number): React.JSX.Element => {
    const open = n.children?.length && !folded.has(n.id)
    const dottedTo = dotted.filter((d) => d.to === flat.get(n.id)?.parent)
    return (
      <li key={n.id} className={cn('relative', depth > 0 && 'pl-6 before:absolute before:top-0 before:left-2 before:h-7 before:w-4 before:rounded-bl-lg before:border-b-2 before:border-l-2 before:border-primary/40')}>
        {box(n, depth, 0, false)}
        {dottedTo.length > 0 && (
          <p className="mt-1.5 ml-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span aria-hidden className="h-0 w-5 border-t-2 border-dashed border-secondary-strong" />
            <span className="sr-only">Dotted line to </span>{dottedTo.flatMap((d) => d.from).map((f) => flat.get(f)?.node.name).join(' · ')}
          </p>
        )}
        {open ? (
          <ul className="relative mt-3 space-y-3 before:absolute before:top-0 before:bottom-7 before:left-2 before:border-l-2 before:border-primary/40">
            {n.children!.map((c) => narrowNode(c, depth + 1))}
          </ul>
        ) : null}
      </li>
    )
  }

  return (
    <div ref={wrap} className={cn('org-chart relative', shown && 'is-shown')} data-org-chart="">
      <svg aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-visible xl:block" width={size.w} height={size.h}>
        {lines.map((l, i) => (
          <path
            key={i}
            d={l.d}
            pathLength={l.dashed ? undefined : 1}
            className={cn('org-line transition-[stroke,opacity] duration-300', l.dashed && 'org-dashed')}
            style={{ '--i': i } as CSSProperties}
            fill="none"
            stroke={lit && l.ids.every((id) => lit.has(id)) ? 'var(--color-secondary)' : l.dashed ? 'var(--color-secondary-strong)' : 'var(--color-primary-strong)'}
            strokeOpacity={lit && !l.ids.every((id) => lit.has(id)) ? 0.2 : 0.85}
            strokeWidth={lit && l.ids.every((id) => lit.has(id)) ? 3 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <ul className="relative hidden justify-center xl:flex" data-org-tree="wide">{wideNode(root, 0)}</ul>
      <ul className="relative mx-auto max-w-2xl xl:hidden" data-org-tree="narrow">{narrowNode(root, 0)}</ul>
      <div aria-hidden className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2"><span className="w-8 border-t-2 border-primary-strong" /> Reporting line</span>
        {dotted.length > 0 && <span className="inline-flex items-center gap-2"><span className="w-8 border-t-2 border-dashed border-secondary-strong" /> Dotted line</span>}
        <span className="hidden xl:inline">Hover a body to follow its line</span>
      </div>
    </div>
  )
}
