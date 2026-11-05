import { site } from '@/content/site'
import { organizationLd, websiteLd } from '@/lib/seo/jsonld'
import { JsonLd } from './JsonLd'

/** Home only: Organization + WebSite (SearchAction). `sameAs` comes from the caller (e.g. footer social links). */
export function OrganizationJsonLd({ sameAs = [] }: { sameAs?: string[] }) {
  return (
    <>
      <JsonLd data={organizationLd(site, undefined, sameAs)} />
      <JsonLd data={websiteLd(site)} />
    </>
  )
}
