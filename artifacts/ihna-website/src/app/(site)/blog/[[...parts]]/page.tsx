import type { Metadata } from 'next'
import { BlogRoute, blogMetadata } from '@/components/templates/blogRoute'

type Params = Promise<{ parts?: string[] }>
type Search = Promise<Record<string, string | string[] | undefined>>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return blogMetadata('blog', (await params).parts)
}

export default async function Page({ params, searchParams }: { params: Params; searchParams: Search }) {
  const title = (await searchParams).title
  return <BlogRoute base="blog" parts={(await params).parts} query={{ title: typeof title === 'string' ? title : undefined }} />
}
