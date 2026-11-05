// This file is the page: edit it freely.
import type { Metadata } from 'next'
import { pageMetadata, CardGrid, Hero } from '@/components/page'

export const metadata: Metadata = pageMetadata({ title: 'Student Login', path: '/student-login/', description: 'Student Login', noindex: true })

export default function StudentLoginRoute() {
  return (
    <>
      <Hero heading="Student Login" variant="compact" audienceSwitch={false} />
      <CardGrid cards={[
        { title: 'Canvas LMS', href: 'https://ihna.instructure.com/' },
        { title: 'Student Hub Login', href: 'https://student.ihna.edu.au/' },
        { title: 'Clinical Placement (Clinsoft)', href: 'https://ihna.clinsoft.com.au/login' },
        { title: 'Online Services Standards', href: '/pdf/IHNA-Online-Service-Standards.pdf' },
      ]} columns="4" variant="grid" />
    </>
  )
}
