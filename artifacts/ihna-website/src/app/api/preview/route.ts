import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse, type NextRequest } from 'next/server'
import { canPreview, isSitePath, previewSecret } from '@/lib/preview'
import { safeEqual } from '@/lib/security/safeEqual'

// Turns Next draft mode on and redirects to `path`. Requires `?secret=` equal to PREVIEW_SECRET and a staff session cookie
// (Payload's live preview frames the site from /admin, so the cookie travels with the request). See src/lib/preview.ts.
export async function GET(req: NextRequest) {
  const secret = previewSecret()
  if (!secret) return NextResponse.json({ error: 'preview disabled' }, { status: 503 })
  const q = req.nextUrl.searchParams
  if (!safeEqual(q.get('secret') ?? '', secret)) return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  const path = q.get('path')
  if (!isSitePath(path)) return NextResponse.json({ error: 'bad path' }, { status: 400 })
  if (!(await canPreview(req.headers))) return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
  const draft = await draftMode()
  draft.enable()
  redirect(path)
}
