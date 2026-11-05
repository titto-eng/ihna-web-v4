// Points lib/portal at the fixture container (docker compose up -d portal-mysql; bash docker/portal-fixtures/load.sh).
// Dev fixture credentials only: they are the ones docker-compose.yml gives the throwaway container.
export function usePortalFixtureDb(timeoutMs = 3000) {
  process.env.PORTAL_ENABLED = '1' // reads are off by default; the fixture tests exercise the live path
  process.env.PORTAL_DB_HOST = '127.0.0.1'
  process.env.PORTAL_DB_PORT = '3308' // ihna-web's portal-mysql (docker-compose.yml); 3307 is ihm-web's
  process.env.PORTAL_DB_NAME = 'ihna_portal'
  process.env.PORTAL_DB_RO_USER = 'portal_ro'
  process.env.PORTAL_DB_RO_PASSWORD = 'portal_ro'
  process.env.PORTAL_QUERY_TIMEOUT_MS = String(timeoutMs)
}

export const AS_OF = '2026-10-16'
