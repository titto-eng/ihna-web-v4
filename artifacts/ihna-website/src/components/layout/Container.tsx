import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

// 05 §4.2: site 1320px, narrow 56rem.
export function Container({ narrow, className, children }: { narrow?: boolean; className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full px-5 md:px-8', narrow ? 'max-w-4xl' : 'max-w-site', className)}>{children}</div>
}
