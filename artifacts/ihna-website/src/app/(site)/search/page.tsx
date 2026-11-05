import type { Metadata } from 'next'
import { SearchView } from '@/components/templates/SearchResults'
import { searchContent } from '@/components/templates/search'
import { buildMetadata } from '@/lib/seo/metadata'

type Props = { searchParams: Promise<{ q?: string | string[] }> }

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ title: 'Search', path: '/search/', noindex: true }, { title: 'Search', path: '/search/' })
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  return <SearchView results={await searchContent(q)} />
}
