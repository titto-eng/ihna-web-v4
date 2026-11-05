import { agentDetailsResponse, legacyRoute } from '@/lib/portal/legacy-endpoints'

// Live AJAX URL of the old theme (template-agent-details.php: education agents by ?country= (agency fields only).) 50-portal-data §5.
export const dynamic = 'force-dynamic'

// 30 requests per minute per IP (429), unknown ids 404 (src/lib/portal/legacy-endpoints.ts).
export const GET = legacyRoute(agentDetailsResponse)
