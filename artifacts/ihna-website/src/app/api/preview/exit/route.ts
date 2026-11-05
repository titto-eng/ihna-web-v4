import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { isSitePath } from '@/lib/preview'

// Turns draft mode off and redirects to `path` (default `/`). No secret needed: leaving preview is harmless.
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path')
  const draft = await draftMode()
  draft.disable()
  redirect(isSitePath(path) ? path : '/')
}
