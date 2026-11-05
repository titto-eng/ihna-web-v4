// Old demo / mock-up pages (src/content/static-paths.ts): a minimal noindex page in the site design; their old HTML is not rendered
// (rule 5). Other /demo/ URLs are 404.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Cta, Hero, pageMetadata, Rich } from '@/components/page'
import { UNAVAILABLE_DEMO_PATHS } from '@/content/static-paths'

type Props = { params: Promise<{ path: string[] }> }

const pathOf = (segments: string[]) => `/demo/${segments.map((s) => decodeURIComponent(s)).join('/')}`
const known = (path: string) => (UNAVAILABLE_DEMO_PATHS as readonly string[]).includes(path)

export function generateStaticParams() {
  return UNAVAILABLE_DEMO_PATHS.map((p) => ({ path: p.split('/').slice(2) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = pathOf((await params).path)
  if (!known(path)) return {}
  return pageMetadata({ title: 'Page not available', path, description: 'This demonstration page is not available.', noindex: true })
}

export default async function DemoUnavailableRoute({ params }: Props) {
  const path = pathOf((await params).path)
  if (!known(path)) notFound()
  return (
    <>
      <Hero heading="This page is not available" variant="compact" audienceSwitch={false} />
      <Rich>
        <p>This was a demonstration page and is no longer part of the IHNA website.</p>
      </Rich>
      <Cta heading="Looking for a course?" links={[{ label: 'Browse courses', href: '/courses/', style: 'primary' }, { label: 'Contact us', href: '/contact/', style: 'secondary' }]} />
    </>
  )
}
