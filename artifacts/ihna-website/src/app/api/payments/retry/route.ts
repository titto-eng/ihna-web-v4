import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { hasRole } from '@/lib/access'
import { retryDeadSteps } from '@/lib/payments/retry'

// POST /api/payments/retry/  { paymentIds?: string[] }  (admin, finance; DEC-20). Re-queues afterPaid steps that went `dead`.
export const dynamic = 'force-dynamic'

export async function POST(req: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })
  if (!hasRole(user as never, 'admin', 'finance')) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })

  let body: { paymentIds?: unknown } = {}
  try { body = (await req.json()) as typeof body } catch { /* empty body: every payment with a dead step */ }
  const paymentIds = Array.isArray(body.paymentIds) ? body.paymentIds.filter((i): i is string => typeof i === 'string') : undefined
  const result = await retryDeadSteps(payload, { paymentIds, by: `user ${String((user as { id?: unknown }).id ?? '')}` })
  return NextResponse.json({ ok: true, ...result }, { headers: { 'Cache-Control': 'no-store' } })
}
