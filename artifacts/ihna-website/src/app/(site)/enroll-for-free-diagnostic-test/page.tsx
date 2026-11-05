// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, Hero, IframeEmbed, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Enroll For Free Diagnostic Test',
  path: '/enroll-for-free-diagnostic-test/',
  description: 'Enroll For Free Diagnostic Test',
})

export default function EnrollForFreeDiagnosticTestRoute() {
  return (
    <>
      <Hero heading="Enroll For Free Diagnostic Test" variant="split" look="orbit" audienceSwitch={false} image={img({ src: '/images/ihna/pages/enroll-for-free-diagnostic-test.webp', alt: 'Student holding a folder', width: 736, height: 920 })} />
      <IframeEmbed url="https://forms.monday.com/forms/embed/b2b587eab3be4d86035c1457925295e9?r=use1" title="Embedded content" height={500} />
    </>
  )
}
