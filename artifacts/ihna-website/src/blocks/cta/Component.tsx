import type { CtaBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { CtaRow } from '@/components/CtaLink'
import { Emphasis } from '@/components/Emphasis'
import { cn } from '@/lib/cn'
import type { BlockProps } from '../types'

export function Cta({ block, ctx }: BlockProps<Block>) {
  const variant = block.variant ?? 'centered'
  const dark = variant === 'banner' || block.tone === 'ink'
  const body = (
    <>
      {block.heading && (
        <h2 className={cn('display', variant === 'inline' ? 'text-display-md max-w-2xl' : 'text-display-lg mx-auto max-w-4xl')}>
          <Emphasis text={block.heading} tone={dark ? 'secondary' : 'primary'} />
        </h2>
      )}
      {block.body && <p className={cn('mt-6 text-lg', variant !== 'inline' && 'mx-auto max-w-2xl', dark ? 'text-ink-foreground/75' : 'text-muted-foreground')}>{block.body}</p>}
      <CtaRow items={block.links} onDark={dark} className={cn('mt-10 flex flex-wrap gap-3', variant !== 'inline' && 'justify-center')} />
    </>
  )
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      {variant === 'banner' ? (
        <div className="rounded-card bg-ink px-6 py-14 text-center text-ink-foreground md:px-16 md:py-20">{body}</div>
      ) : variant === 'inline' ? (
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center [&>div]:mt-0"><div>{body}</div></div>
      ) : (
        <div className="reveal text-center">{body}</div>
      )}
    </Section>
  )
}
