'use client'

import type { ReactNode } from 'react'
import { SlideCarousel } from './SlideCarousel'

// Card rows (featured courses, related courses, card grids, testimonials): 1 → 2 (md) → 3 (lg) per view, no autoplay (05 §4.6).
// Children are server-rendered cards.
export function CardCarousel({ children, perView = 3, label, onDark }: { children: ReactNode; perView?: 2 | 3 | 4; label: string; onDark?: boolean }) {
  return <SlideCarousel label={label} perView={perView} onDark={onDark}>{children}</SlideCarousel>
}
