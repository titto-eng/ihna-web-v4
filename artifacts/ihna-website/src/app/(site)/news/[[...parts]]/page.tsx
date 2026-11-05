import type { Metadata } from 'next'
import { BlogRoute, blogMetadata } from '@/components/templates/blogRoute'

type Params = Promise<{ parts?: string[] }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return blogMetadata('news', (await params).parts)
}

export default async function Page({ params }: { params: Params }) {
  return <BlogRoute base="news" parts={(await params).parts} />
}
