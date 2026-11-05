import { breadcrumbLd } from '@/lib/seo/jsonld'
import { JsonLd } from './JsonLd'

type Crumb = { name: string; path: string }

/** `items` start with Home (`courseCrumbs`, `postCrumbs`). A single crumb renders nothing. */
export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  return <JsonLd data={breadcrumbLd(items)} />
}
