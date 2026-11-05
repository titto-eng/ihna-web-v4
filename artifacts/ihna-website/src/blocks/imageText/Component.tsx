import Image from '@/components/blocks/MediaImage'
import type { ImageTextBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { Prose, proseClassName } from '@/components/layout/Prose'
import { CtaRow } from '@/components/CtaLink'
import { Emphasis } from '@/components/Emphasis'
import { Badge } from '@/components/ui/badge'
import { mediaOf } from '@/components/blocks/media'
import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'
import type { BlockProps } from '../types'

/** A logo image (file name with "logo", or the brand folder): shown at the header logo's size. */
export const isLogo = (url?: string | null) => Boolean(url && /logo|\/brand\//i.test(url))

// `children` replaces the Lexical `content` on hardcoded pages (src/components/page).
export function ImageTextView({ block, ctx, children }: BlockProps<Block> & { children?: ReactNode }) {
  const image = mediaOf(block.media)
  const right = block.imageSide === 'right'
  return (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <div className={cn('grid items-start gap-10 lg:gap-14', image && 'lg:grid-cols-[0.9fr_1.1fr]')}>
        {image && isLogo(image.url) && (
          // a brand logo keeps the header logo's size (never blown up to a photo): shown on a soft brand card
          <figure className={cn('relative isolate flex aspect-[5/4] items-center justify-center overflow-hidden rounded-card bg-gradient-to-br from-primary/10 via-card to-secondary/10 ring-1 ring-border', right && 'lg:order-2')}>
            <span aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(hsl(189_100%_15%/0.08)_1px,transparent_1px)] [background-size:20px_20px]" />
            <span aria-hidden className="course-spin absolute size-72 rounded-full border-2 border-dashed border-primary/25" />
            <span aria-hidden className="absolute size-52 rounded-full bg-card shadow-2xl shadow-primary-strong/15" />
            <Image src={image.url!} alt={image.alt ?? ''} width={image.width ?? 1453} height={image.height ?? 665} sizes="180px" className="relative h-12 w-auto md:h-[52px]" />
          </figure>
        )}
        {image && !isLogo(image.url) && (
          <figure className={cn('relative overflow-hidden rounded-card', right && 'lg:order-2')}>
            <Image src={image.url!} alt={image.alt ?? ''} width={image.width ?? 1200} height={image.height ?? 960} sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-[5/4] w-full object-cover" />
            {block.imageCaption && (
              <figcaption className="label-mono absolute bottom-3 left-3 rounded-full bg-foreground/70 px-3 py-1 text-[10px] tracking-widest text-background">
                {block.imageCaption}
              </figcaption>
            )}
          </figure>
        )}
        <div>
          {block.eyebrow && <p className="label-mono mb-5 text-accent">{block.eyebrow}</p>}
          {block.heading && <h2 className="display mb-6 text-display-md"><Emphasis text={block.heading} /></h2>}
          {children ? <div className={cn(proseClassName, 'max-w-none')}>{children}</div> : <Prose data={block.content} className="max-w-none" />}
          {block.chips && block.chips.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {block.chips.map((c, i) => (
                <li key={c.id ?? i}><Badge variant="outline" className="rounded-full border-border bg-card px-4 py-2 text-sm font-medium">{c.text}</Badge></li>
              ))}
            </ul>
          )}
          <CtaRow items={block.ctas} />
        </div>
      </div>
    </Section>
  )
}

export const ImageText = (props: BlockProps<Block>) => <ImageTextView {...props} />
