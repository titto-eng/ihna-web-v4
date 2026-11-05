import { adminAction } from '@/lib/enquiries/adminRoute'

// POST /api/enquire/release/  { ids?: number[] }  releases enquiries the captcha held (admin, marketing)
export const dynamic = 'force-dynamic'
export const POST = (req: Request) => adminAction(req, ['release-held'])
