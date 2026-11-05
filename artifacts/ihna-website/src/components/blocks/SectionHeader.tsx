import { cn } from '@/lib/cn'
import { Emphasis } from '@/components/Emphasis'

// BON section header: mono eyebrow (optionally with a numbered pill), display h2, short intro on the right.
export function SectionHeader({
  eyebrow, heading, intro, onDark = false, className, children,
}: {
  eyebrow?: string | null
  heading?: string | null
  intro?: string | null
  onDark?: boolean
  className?: string
  children?: React.ReactNode
}) {
  if (!eyebrow && !heading && !intro) return null
  return (
    <div className={cn('mb-12 grid gap-6 md:mb-14', intro && 'md:grid-cols-2 md:items-end', className)}>
      <div>
        {eyebrow && <p className={cn('label-mono mb-5', onDark ? 'text-secondary' : 'text-accent')}>{eyebrow}</p>}
        {heading && (
          <h2 className="display text-display-md">
            <Emphasis text={heading} tone={onDark ? 'secondary' : 'primary'} />
          </h2>
        )}
      </div>
      {intro && <p className={cn('max-w-md md:justify-self-end', onDark ? 'text-ink-foreground/70' : 'text-muted-foreground')}>{intro}</p>}
      {children}
    </div>
  )
}
