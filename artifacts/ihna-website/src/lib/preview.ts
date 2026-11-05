import { getPayload } from 'payload'
import config from '@payload-config'
import { isStaff } from '@/lib/access'

// Draft preview (10-content-model §Versions). `GET /api/preview/?path=&secret=` turns Next draft mode on for a staff session
// and redirects to `path`; the course and post routes then read `draftMode()` and fetch with `draft: true`.
// `PREVIEW_SECRET` comes from `.env`; without it the route answers 503 and preview stays off. URL helpers: ./preview-url.ts.
export { PREVIEW_ROUTE, PREVIEW_EXIT_ROUTE, previewSecret, previewUrl, isSitePath } from './preview-url'

/** True for a signed-in staff user (`users` collection); every staff role reads drafts (10-content-model §Access). */
export async function canPreview(headers: Headers): Promise<boolean> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })
  return isStaff(user as Parameters<typeof isStaff>[0])
}
