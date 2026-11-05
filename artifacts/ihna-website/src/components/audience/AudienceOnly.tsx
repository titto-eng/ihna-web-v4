import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { Audience } from '@/blocks/types'

// Server-rendered; the inactive version is hidden by CSS from the provider's data-audience attribute.
export function AudienceOnly({ audience, className, children }: { audience: Audience; className?: string; children: ReactNode }) {
  return (
    <div
      data-audience-version={audience}
      className={cn(audience === 'domestic' ? 'group-data-[audience=international]/aud:hidden' : 'group-data-[audience=domestic]/aud:hidden', className)}
    >
      {children}
    </div>
  )
}
