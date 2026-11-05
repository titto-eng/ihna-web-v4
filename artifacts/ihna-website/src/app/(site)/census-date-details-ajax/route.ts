import { censusDetailsResponse, legacyRoute } from '@/lib/portal/legacy-endpoints'

// Live AJAX URL of the old theme (template-census-date-details-ajax.php: the census pickers' JSON (campus, course, batch, semester).) 50-portal-data §5.
export const dynamic = 'force-dynamic'

// 30 requests per minute per IP (429), unknown ids 404 (src/lib/portal/legacy-endpoints.ts).
export const GET = legacyRoute(censusDetailsResponse)
