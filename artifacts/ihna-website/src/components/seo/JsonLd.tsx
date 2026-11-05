import { safeJsonLd } from '@/components/blocks/lexicalText'
import type { JsonLdObject } from '@/lib/seo/jsonld'

// The only permitted `dangerouslySetInnerHTML` besides the Lexical renderer (DEC-26): `safeJsonLd` escapes `<`.
// Never emits an empty tag (the live site shipped six raw ones, some empty).
export function JsonLd({ data }: { data: JsonLdObject | null | undefined | false }) {
  if (!data || !Object.keys(data).length) return null
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
}
