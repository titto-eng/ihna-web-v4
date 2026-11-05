// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, EnquiryForm, Hero, Rich, Link, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Alumni Registration',
  path: '/alumni-registration/',
  description: 'IHNA graduates can register here to stay connected with the IHNA alumni community.',
})

export default function AlumniRegistrationRoute() {
  return (
    <>
      <Hero heading="Alumni Registration" eyebrow="IHNA Alumni" variant="split" look="mosaic" audienceSwitch={false} image={img({ src: '/images/ihna/pages/alumni-registration.webp', alt: 'IHNA graduates celebrating', width: 576, height: 720 })} />
      <Rich spacing="compact">
        <p>IHNA graduates can register here to stay connected with the IHNA alumni community. Enter your registration details below.</p>
        <p>Read graduate stories and the alumni newsletter on the <Link href="/ihna-alumni/">IHNA Alumni</Link> page, or email <a href="mailto:alumni@ihna.edu.au">alumni@ihna.edu.au</a>.</p>
      </Rich>
      <EnquiryForm formKey="alumni-signup" heading="Registration details" />
    </>
  )
}
