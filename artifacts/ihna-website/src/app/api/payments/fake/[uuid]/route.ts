import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { handleFakeDecision, resultPath } from '@/lib/payments/handlers'

// POST /api/payments/fake/[uuid]/ (dev and DRY_RUN only; 404 in production): the buttons on /pay/fake/[uuid]/.
export const dynamic = 'force-dynamic'

export async function POST(req: Request, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params
  const form = await req.formData().catch(() => null)
  const d = form?.get('decision')
  const decision = d === 'approve' || d === 'decline' || d === 'abandon' ? d : null
  const payload = await getPayload({ config })
  if (!decision) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  const out = await handleFakeDecision(payload, uuid, decision)
  if (out.status !== 200) return NextResponse.json(out.body, { status: out.status })
  return NextResponse.redirect(new URL(resultPath(uuid), req.url), 303)
}
