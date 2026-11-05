'use client'

import { Suspense, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'

// Shows its children only when the URL carries `?intent=<intent>`. Read on the client so the thank-you page itself stays cacheable.
function Gate({ intent, children }: { intent: string; children: ReactNode }) {
  return useSearchParams().get('intent') === intent ? <>{children}</> : null
}

export function ThankYouIntent({ intent, children }: { intent: string; children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Gate intent={intent}>{children}</Gate>
    </Suspense>
  )
}
