import type { StatsBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/blocks/SectionHeader'
import { cn } from '@/lib/cn'
import type { BlockProps } from '../types'

// Six figures wrap to two rows of three: the display numerals stay large without colliding.
const cols: Record<number, string> = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4', 5: 'md:grid-cols-3 lg:grid-cols-5', 6: 'md:grid-cols-3' }

export function Stats({ block, ctx }: BlockProps<Block>) {
  const items = block.items ?? []
  if (!items.length) return null
  const dark = block.tone === 'ink'
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <SectionHeader heading={block.heading} onDark={dark} />
      <dl className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6', cols[Math.min(Math.max(items.length, 2), 6)])}>
        {items.map((s, i) => (
          <div
            key={s.id ?? i}
            className={cn(
              'reveal group relative overflow-hidden rounded-card border p-6 transition-all duration-500 hover:-translate-y-1 md:p-8',
              dark ? 'border-ink-foreground/15 bg-ink-raised hover:border-secondary/60' : 'border-border bg-card shadow-sm hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10',
            )}
          >
            <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-primary to-secondary transition-transform duration-500 group-hover:scale-x-100" />
            <span aria-hidden className="pointer-events-none absolute -right-10 -bottom-10 size-32 rounded-full bg-primary/10 blur-2xl transition-colors group-hover:bg-secondary/20" />
            <dd className={cn('display relative text-[clamp(2.6rem,5vw,4rem)] leading-none', dark ? 'text-secondary' : 'text-primary-strong')}>{s.value}</dd>
            <dt className={cn('relative mt-4 text-base leading-snug font-semibold text-pretty', dark ? 'text-ink-foreground' : 'text-foreground')}>{s.label}</dt>
            {s.note && <dd className={cn('relative mt-2 label-mono text-[10px]', dark ? 'text-ink-foreground/60' : 'text-muted-foreground')}>{s.note}</dd>}
          </div>
        ))}
      </dl>
    </Section>
  )
}
