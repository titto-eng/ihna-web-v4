import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type CtaStyle = 'primary' | 'secondary' | 'link' | 'ink' | 'light' | null | undefined
export type CtaItem = { id?: string | null; label: string; href: string; style?: CtaStyle }

const variantFor = (style: CtaStyle) =>
  style === 'secondary' ? 'outline' : style === 'link' ? 'link' : style === 'ink' ? 'ink' : style === 'light' ? 'light' : 'default'

// Every block button goes through here: rounded pill, BON arrow on external links.
export function CtaLink({ cta, size }: { cta: CtaItem; onDark?: boolean; size?: 'default' | 'lg' | 'sm' }) {
  const external = /^https?:\/\//i.test(cta.href)
  const inner = (
    <>
      {cta.label}
      {external && <ArrowUpRight aria-hidden />}
    </>
  )
  return (
    // long labels wrap instead of pushing the page wider than the viewport
    <Button asChild variant={variantFor(cta.style)} size={size} className={cta.style === 'link' ? 'max-w-full whitespace-normal' : 'h-auto min-h-12 max-w-full py-2.5 text-center whitespace-normal'}>
      {external ? <a href={cta.href} target="_blank" rel="noopener noreferrer">{inner}</a> : <Link href={cta.href}>{inner}</Link>}
    </Button>
  )
}

export function CtaRow({ items, className }: { items?: CtaItem[] | null; onDark?: boolean; className?: string }) {
  if (!items?.length) return null
  return (
    <div className={className ?? 'mt-8 flex flex-wrap items-center gap-3'}>
      {items.map((cta, i) => <CtaLink key={cta.id ?? `${cta.href}-${i}`} cta={cta} />)}
    </div>
  )
}
