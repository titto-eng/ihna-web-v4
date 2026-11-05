import { TRACKING_DEFAULTS, type ToolName } from './defaults'

// Pure tracking config (80-tracking §2/§4): settings -> TrackingConfig on the server, TrackingConfig + pathname -> tags on the client.
export type TrackingConfig = {
  /** `TRACKING_ENABLED=1`. Off = no third-party loads (dataLayer pushes still happen). */
  enabled: boolean
  gtmId?: string
  gtmOverrides: { pathPrefix: string; containerId: string }[]
  clarityId?: string
  hubspot?: { portalId: string; region: 'na1' | 'eu1' }
  airgentic?: { accountId: string; serviceId: string }
  livechatLicence?: string
  /** Each pixel loads only on its listed paths (exact, trailing slash). */
  metaPixels: { pixelId: string; paths: string[] }[]
  exclusions: { tool: ToolName; pathPrefix: string }[]
}

export type ActiveTags = { gtmId?: string; clarityId?: string; hubspot?: TrackingConfig['hubspot']; airgentic?: TrackingConfig['airgentic']; livechatLicence?: string; metaPixelIds: string[] }

// Ids go into inline scripts and URLs, so anything outside this alphabet is dropped (the field is admin-edited).
const ID = /^[A-Za-z0-9_-]{1,40}$/
const id = (v: unknown): string | undefined => (typeof v === 'string' && ID.test(v.trim()) ? v.trim() : undefined)
const prefix = (v: unknown): string | undefined => (typeof v === 'string' && v.startsWith('/') ? (v.endsWith('/') ? v : `${v}/`) : undefined)
const TOOLS: ToolName[] = ['gtm', 'clarity', 'hubspot', 'airgentic', 'livechat', 'metaPixel']

type SettingsTracking = {
  gtmId?: string | null
  clarityId?: string | null
  hubspotPortalId?: string | null
  hubspotRegion?: string | null
  airgenticId?: string | null
  airgenticServiceId?: string | null
  livechatLicence?: string | null
  metaPixels?: { pixelId?: string | null; paths?: { path?: string | null }[] | null }[] | null
  gtmOverrides?: { pathPrefix?: string | null; containerId?: string | null }[] | null
  exclusions?: { tool?: string | null; pathPrefix?: string | null }[] | null
} | null | undefined

/** `site.tracking` (src/content/site.ts) + env -> config. Empty fields fall back to the site defaults; missing arrays use them too. */
export function buildTrackingConfig(t: SettingsTracking, enabled: boolean): TrackingConfig {
  const d = TRACKING_DEFAULTS
  const portalId = id(t?.hubspotPortalId) ?? d.hubspotPortalId
  const accountId = id(t?.airgenticId) ?? d.airgentic.accountId
  const overrides = Array.isArray(t?.gtmOverrides)
    ? t.gtmOverrides.flatMap((o) => (prefix(o.pathPrefix) && id(o.containerId) ? [{ pathPrefix: prefix(o.pathPrefix)!, containerId: id(o.containerId)! }] : []))
    : d.gtmOverrides
  const metaPixels = Array.isArray(t?.metaPixels)
    ? t.metaPixels.flatMap((p) => (id(p.pixelId) ? [{ pixelId: id(p.pixelId)!, paths: (p.paths ?? []).flatMap((x) => (prefix(x.path) ? [prefix(x.path)!] : [])) }] : []))
    : d.metaPixels
  const exclusions = Array.isArray(t?.exclusions)
    ? t.exclusions.flatMap((e) => (TOOLS.includes(e.tool as ToolName) && prefix(e.pathPrefix) ? [{ tool: e.tool as ToolName, pathPrefix: prefix(e.pathPrefix)! }] : []))
    : d.exclusions
  return {
    enabled,
    gtmId: id(t?.gtmId) ?? d.gtmId,
    gtmOverrides: overrides,
    clarityId: id(t?.clarityId) ?? d.clarityId,
    hubspot: portalId ? { portalId, region: t?.hubspotRegion === 'eu1' ? 'eu1' : t?.hubspotRegion === 'na1' ? 'na1' : d.hubspotRegion } : undefined,
    airgentic: accountId ? { accountId, serviceId: id(t?.airgenticServiceId) ?? d.airgentic.serviceId } : undefined,
    livechatLicence: id(t?.livechatLicence) ?? d.livechatLicence,
    metaPixels,
    exclusions,
  }
}

const norm = (p: string) => (p.endsWith('/') ? p : `${p}/`)
const under = (pathname: string, pre: string) => norm(pathname).startsWith(pre)

/** Which tags load on `pathname`: overrides replace the main GTM id (longest prefix wins), exclusions switch tools off. */
export function activeTags(cfg: TrackingConfig, pathname: string): ActiveTags {
  if (!cfg.enabled) return { metaPixelIds: [] }
  const off = (tool: ToolName) => cfg.exclusions.some((e) => e.tool === tool && under(pathname, e.pathPrefix))
  const override = [...cfg.gtmOverrides].sort((a, b) => b.pathPrefix.length - a.pathPrefix.length).find((o) => under(pathname, o.pathPrefix))
  return {
    gtmId: off('gtm') ? undefined : (override?.containerId ?? cfg.gtmId),
    clarityId: off('clarity') ? undefined : cfg.clarityId,
    hubspot: off('hubspot') ? undefined : cfg.hubspot,
    airgentic: off('airgentic') ? undefined : cfg.airgentic,
    livechatLicence: off('livechat') ? undefined : cfg.livechatLicence,
    metaPixelIds: off('metaPixel') ? [] : cfg.metaPixels.filter((p) => p.paths.some((x) => norm(pathname) === x)).map((p) => p.pixelId),
  }
}

export const hubspotScriptUrl = (h: NonNullable<TrackingConfig['hubspot']>) =>
  `https://${h.region === 'eu1' ? 'js-eu1' : 'js'}.hs-scripts.com/${h.portalId}.js`
