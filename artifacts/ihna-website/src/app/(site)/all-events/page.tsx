// /all-events/ (old template-all-events-gallery.php): the event galleries, filtered by `?campus=<old App Runner campus id>` (the
// links the campus pages and old emails carry) and `?year=`; each gallery sits under its old `#<id>` anchor.
import type { Metadata } from 'next'
import { pageMetadata, Hero } from '@/components/page'
import { AllEventsView, filterGalleries, getGalleries } from '@/components/templates/Galleries'
import { galleryCampusOf } from '@/content/campuses'

export const metadata: Metadata = pageMetadata({
  title: 'Beyond the Books',
  metaTitle: 'All event gallery page',
  path: '/all-events/',
  description: 'Photos from graduation ceremonies, celebrations and events at the IHNA campuses.',
})

type Search = Promise<Record<string, string | string[] | undefined>>
const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : undefined)

export default async function AllEventsRoute({ searchParams }: { searchParams: Search }) {
  const q = await searchParams
  const campus = galleryCampusOf(one(q.campus))
  const all = await getGalleries()
  const years = [...new Set(filterGalleries(all, campus, null).map((g) => g.year).filter((y): y is string => !!y))].sort().reverse()
  const year = one(q.year) && years.includes(one(q.year)!) ? one(q.year)! : null
  return (
    <>
      <Hero heading="Beyond the Books" subheading="Discover our campuses and events" variant="compact" audienceSwitch={false} eyebrow="Events gallery" />
      <AllEventsView galleries={filterGalleries(all, campus, year)} campus={campus} year={year} years={years} />
    </>
  )
}
