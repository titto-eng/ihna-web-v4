'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { primoSearchUrl } from './library'

// The library catalogue search of template-library-course-units-page.php (Primo, HCI library). The old form posted to Primo with
// `query=any,contains,<term>` built in the browser; here the browser navigates to the same search URL (no cross-site form post).
export function LibrarySearch() {
  const [term, setTerm] = useState('')
  return (
    <form
      role="search"
      className="flex max-w-2xl flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault()
        if (term.trim()) window.location.assign(primoSearchUrl(term))
      }}
    >
      <label htmlFor="library-search" className="sr-only">Search our library collection</label>
      <Input id="library-search" type="search" required value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search our library collection..." className="h-12 flex-1" />
      <Button type="submit" size="lg">Search</Button>
    </form>
  )
}
