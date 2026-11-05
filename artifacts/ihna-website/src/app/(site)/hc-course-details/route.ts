import { hcCourseDetailsResponse, legacyRoute } from '@/lib/portal/legacy-endpoints'

// Live AJAX URL of the old theme (template-hc-course-details.php: the portal course row by ?course_id=.) 50-portal-data §5.
export const dynamic = 'force-dynamic'

// 30 requests per minute per IP (429), unknown ids 404 (src/lib/portal/legacy-endpoints.ts).
export const GET = legacyRoute(hcCourseDetailsResponse)
