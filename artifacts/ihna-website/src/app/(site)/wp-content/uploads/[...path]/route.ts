import { handleLegacyMedia } from '@/app/api/legacy-media/handler'

// GET /wp-content/uploads/<y>/<m>/<file> → 301 to the media file (looked up by `media.legacyPath`). The proxy lets this path through untouched.
export const dynamic = 'force-dynamic'
export const GET = handleLegacyMedia
export const HEAD = handleLegacyMedia
