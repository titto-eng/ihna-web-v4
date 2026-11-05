import { site } from '@/content/site'
import { env } from '@/env'
import { buildTrackingConfig } from './config'
import { TrackingScripts } from './TrackingScripts'

/**
 * The single gate for every third-party tag (80-tracking §4). Renders once in `(site)/layout.tsx`.
 * Ids come from src/content/site.ts (`tracking`); a CMP or Consent Mode v2 would be added here only.
 * No consent banner today (80 §4 Consent). Empty ids fall back to the defaults in ./defaults.ts.
 */
export function Tracking() {
  return <TrackingScripts config={buildTrackingConfig(site.tracking, env.TRACKING_ENABLED === '1')} />
}
