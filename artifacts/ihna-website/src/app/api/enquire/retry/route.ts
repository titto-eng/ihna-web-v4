import { adminAction } from '@/lib/enquiries/adminRoute'

// POST /api/enquire/retry/  { action?: 'retry-dead' | 'requeue-stuck', ids?: number[] }  (admin, marketing)
export const dynamic = 'force-dynamic'
export const POST = (req: Request) => adminAction(req, ['retry-dead', 'requeue-stuck'])
