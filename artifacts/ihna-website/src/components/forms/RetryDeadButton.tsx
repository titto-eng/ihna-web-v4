'use client'

import { useState } from 'react'

// "Retry dead" / "Release held" on the enquiries list (40 §3), wired through Enquiries.ts admin.components.beforeListTable.
// Endpoints: /api/enquire/retry/ and /api/enquire/release/ (admin and marketing only, DEC-20).
export function RetryDeadButton() {
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function act(url: string, body: Record<string, unknown>) {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch(url, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      const json = (await res.json()) as { ok?: boolean; requeued?: number; skipped?: number; error?: string }
      setMsg(json.ok ? `Queued ${json.requeued ?? 0} enquiry(ies), skipped ${json.skipped ?? 0}.` : `Not allowed: ${json.error ?? res.status}`)
    } catch {
      setMsg('The request failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
      <button type="button" disabled={busy} className="btn btn--style-secondary btn--size-small" onClick={() => act('/api/enquire/retry/', { action: 'retry-dead' })}>Retry dead</button>
      <button type="button" disabled={busy} className="btn btn--style-secondary btn--size-small" onClick={() => act('/api/enquire/release/', {})}>Release held</button>
      {msg && <span role="status">{msg}</span>}
    </div>
  )
}
