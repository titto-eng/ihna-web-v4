'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { alumniApi, genericError } from './api'
import { FormError, FormNotice } from './FormError'

// A GET must not change state (mail scanners open links), so the link lands here and the button does the POST to Payload's verify endpoint.
export function VerifyConfirm({ token }: { token: string }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function confirm() {
    setState('busy')
    setError(null)
    const r = await alumniApi(`verify/${encodeURIComponent(token)}/`)
    if (r.ok) return setState('done')
    setState('idle')
    setError(r.status === 400 || r.status === 403 ? 'This verification link is invalid, has expired or was already used. If you cannot sign in, ask for help below.' : genericError(r))
  }

  if (state === 'done') {
    return (
      <div className="grid gap-5">
        <FormNotice>Your email address is confirmed.</FormNotice>
        <Button asChild><Link href="/alumni/login/">Sign in</Link></Button>
      </div>
    )
  }
  return (
    <div className="grid gap-5">
      <FormError>{error}</FormError>
      <Button type="button" onClick={confirm} disabled={state === 'busy'}>{state === 'busy' ? 'Confirming…' : 'Confirm my email address'}</Button>
      <Link href="/contact/" className="text-sm font-semibold text-primary-strong underline underline-offset-4">Contact the alumni team</Link>
    </div>
  )
}
