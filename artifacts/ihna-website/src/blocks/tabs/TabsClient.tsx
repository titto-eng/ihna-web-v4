'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/cn'

export type TabEntry = { id: string; label: string; anchorId?: string | null; content: ReactNode }

// Opens the tab whose anchorId matches location.hash, so old #overview-style links keep working (20 §5).
export function TabsClient({ tabs, variant }: { tabs: TabEntry[]; variant: 'underline' | 'pill' }) {
  const [value, setValue] = useState(tabs[0]?.id)
  useEffect(() => {
    const pick = () => {
      const hash = window.location.hash.replace('#', '')
      const hit = hash && tabs.find((t) => t.anchorId === hash)
      if (hit) setValue(hit.id)
    }
    pick()
    window.addEventListener('hashchange', pick)
    return () => window.removeEventListener('hashchange', pick)
  }, [tabs])

  const pill = variant === 'pill'
  return (
    <Tabs value={value} onValueChange={setValue} className="gap-8">
      <TabsList
        className={cn('w-full max-w-full justify-start overflow-x-auto', pill ? 'gap-2 rounded-full border border-border p-1' : 'gap-6 border-b border-border p-0')}
        style={{ scrollbarWidth: 'none' }}
        // the tab row scrolls sideways on small screens: keyboard users can focus it to scroll (WCAG scrollable-region-focusable)
        tabIndex={0}
      >
        {tabs.map((t) => (
          <TabsTrigger
            key={t.id}
            value={t.id}
            id={t.anchorId ?? undefined}
            className={cn(
              'flex-none text-base font-semibold whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground',
              pill
                ? 'rounded-full px-5 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-foreground'
                : 'rounded-none border-0 border-b-2 border-transparent px-1 pb-3 data-[state=active]:border-primary data-[state=active]:text-foreground',
            )}
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t.id} value={t.id} className="outline-none">{t.content}</TabsContent>
      ))}
    </Tabs>
  )
}
