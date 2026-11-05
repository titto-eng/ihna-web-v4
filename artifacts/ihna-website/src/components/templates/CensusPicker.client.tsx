'use client'

import { useRef } from 'react'

// Progressive enhancement for the census pickers (Census.tsx): the form is a plain GET form with a submit button. With JavaScript, changing a
// select clears the selects below it and submits, as the old cascading AJAX selects did.
export function CensusAutoSubmit({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLFormElement>(null)
  return (
    <form
      ref={ref}
      method="get"
      action="#census-table"
      className="grid gap-4 md:grid-cols-4"
      onChange={(e) => {
        const form = ref.current
        const target = e.target as unknown
        if (!form || !(target instanceof HTMLSelectElement)) return
        const selects = [...form.querySelectorAll('select')]
        for (const s of selects.slice(selects.indexOf(target) + 1)) s.value = ''
        // Empty selects are left out of the query so a shorter selection gives a shorter URL.
        for (const s of selects) s.disabled = s.value === ''
        form.submit()
      }}
    >
      {children}
    </form>
  )
}
