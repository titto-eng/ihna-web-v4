import { Music2 } from 'lucide-react'

// lucide v1 ships no brand icons, so the five networks are inline 24px line glyphs; TikTok uses lucide's note.
const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'size-5' } as const

export type Network = 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'x' | 'tiktok'

export const networkLabel: Record<Network, string> = { facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn', youtube: 'YouTube', x: 'X', tiktok: 'TikTok' }

export function SocialIcon({ network }: { network: Network }) {
  switch (network) {
    case 'facebook':
      return <svg {...svg}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
    case 'instagram':
      return <svg {...svg}><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><path d="M17.5 6.5h.01" /></svg>
    case 'linkedin':
      return <svg {...svg}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
    case 'youtube':
      return <svg {...svg}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><path d="M9.75 15.02 15.5 11.75 9.75 8.48z" /></svg>
    case 'x':
      return <svg {...svg}><path d="M4 4l16 16M20 4L4 20" /></svg>
    case 'tiktok':
      return <Music2 aria-hidden className="size-5" />
  }
}
