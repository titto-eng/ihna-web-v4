import Image from 'next/image'
import Link from 'next/link'
import { site } from '@/content/site'
import { cn } from '@/lib/cn'

type Size = 'sm' | 'md' | 'lg'
const heights: Record<Size, string> = { sm: 'h-10', md: 'h-12 md:h-[52px]', lg: 'h-16 md:h-20' }

// The IHNA brand logo (src/content/site.ts `logo` / `logoLight`, public/images/ihna/brand/). `onDark` swaps to the version with a
// white strapline. Falls back to a text wordmark so the header never breaks without a logo file.
export function SiteLogo({ onDark = false, size = 'md', priority = false, className }: { onDark?: boolean; size?: Size; priority?: boolean; className?: string }) {
  const name = site.siteName
  const logo = onDark ? (site.logoLight ?? site.logo) : site.logo
  return (
    <Link href="/" aria-label={`${name}, home`} className={cn('group/logo inline-flex shrink-0 items-center', className)}>
      {logo?.url ? (
        <Image
          src={logo.url}
          alt={name}
          width={logo.width ?? 1453}
          height={logo.height ?? 665}
          sizes="(min-width: 768px) 180px, 140px"
          className={cn('w-auto transition-transform duration-500 ease-out group-hover/logo:scale-[1.03]', heights[size])}
          priority={priority}
        />
      ) : (
        <span className="display grid size-10 place-items-center rounded-full bg-foreground text-lg text-background">{site.shortName.slice(0, 3)}</span>
      )}
    </Link>
  )
}
