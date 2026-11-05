'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Audience } from '@/blocks/types'

const Ctx = createContext<{ audience: Audience; setAudience: (a: Audience) => void }>({
  audience: 'domestic',
  setAudience: () => {},
})

export const useAudience = () => useContext(Ctx)

// Mounted once in the site layout. The wrapper carries data-audience so audience-aware blocks can render
// both versions on the server and let CSS hide the inactive one (20-blocks §2): works without JS, defaults to domestic.
export function AudienceProvider({ children }: { children: ReactNode }) {
  const [audience, setAudience] = useState<Audience>('domestic')
  const value = useMemo(() => ({ audience, setAudience }), [audience])
  return (
    <Ctx.Provider value={value}>
      <div data-audience={audience} className="group/aud flex min-h-dvh flex-col">{children}</div>
    </Ctx.Provider>
  )
}
