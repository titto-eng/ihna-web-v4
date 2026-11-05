'use client'

import { cn } from '@/lib/cn'
import type { Audience } from '@/blocks/types'
import { useAudience } from './AudienceProvider'

const options: Audience[] = ['domestic', 'international']

// BON segmented pill: radiogroup with aria-checked (05 §8 check 9).
export function AudienceSwitch({ label = 'Show me details for', onDark = false, className }: { label?: string; onDark?: boolean; className?: string }) {
  const { audience, setAudience } = useAudience()
  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      <span className={cn('text-sm', onDark ? 'text-ink-foreground/70' : 'text-muted-foreground')}>{label}</span>
      <div role="radiogroup" aria-label="I am a" className="flex rounded-full border border-border bg-card p-1 text-sm text-card-foreground">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={audience === o}
            onClick={() => setAudience(o)}
            className={cn(
              'rounded-full px-5 py-2.5 font-semibold capitalize transition-colors duration-300',
              audience === o ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}
