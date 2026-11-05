import type { Post } from '@/payload-types'
import { site } from '@/content/site'
import { articleLd, postCrumbs } from '@/lib/seo/jsonld'
import { BreadcrumbJsonLd } from './BreadcrumbList'
import { JsonLd } from './JsonLd'

/** BlogPosting / NewsArticle + BreadcrumbList (Home › Blog|News › X). */
export function ArticleJsonLd({ post }: { post: Post }) {
  const settings = site
  return (
    <>
      <JsonLd data={articleLd(post, { settings })} />
      <BreadcrumbJsonLd items={postCrumbs(post)} />
    </>
  )
}
