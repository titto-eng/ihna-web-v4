import { after, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { hasRole } from '@/lib/access'
import { queueDeliverEnquiry, runJobNow } from '@/jobs/queue'
import { resetEnquiries, type AdminAction } from './admin'

/** Shared body of the two admin routes. Staff session cookie required; role admin or marketing (DEC-20). */
export async function adminAction(req: Request, actions: AdminAction[]): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401 })
  if (!hasRole(user as never, 'admin', 'marketing')) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })

  let body: { action?: string; ids?: unknown } = {}
  try { body = (await req.json()) as typeof body } catch { /* empty body: act on every matching row */ }
  const action = (actions.includes(body.action as AdminAction) ? body.action : actions[0]) as AdminAction
  const ids = Array.isArray(body.ids) ? body.ids.filter((i): i is string | number => typeof i === 'string' || typeof i === 'number').slice(0, 200) : undefined

  const result = await resetEnquiries(payload, action, async (p, id) => {
    const jobId = await queueDeliverEnquiry(p, id)
    try { after(() => runJobNow(p, jobId)) } catch { /* no request scope */ }
  }, { ids })
  return NextResponse.json({ ok: true, action, ...result }, { headers: { 'Cache-Control': 'no-store' } })
}
