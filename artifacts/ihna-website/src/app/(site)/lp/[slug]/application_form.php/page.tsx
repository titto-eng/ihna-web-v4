import type { Metadata } from 'next'
import { applicationMetadata, lpPath, renderApplication } from '@/components/templates/landing/route'
import { notFound } from 'next/navigation'

// /lp/<slug>/application_form.php: the parent's portal iframe (60 §5). Only parents whose import found a portal course id have one.
type Params = Promise<{ slug: string }>
type Search = Promise<{ enquiry_src?: string | string[] }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return applicationMetadata(lpPath((await params).slug))
}

export default async function ApplicationFormPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { slug } = await params
  return (await renderApplication(lpPath(slug), await searchParams)) ?? notFound()
}
