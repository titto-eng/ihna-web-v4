'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

// Button -> dialog holding the (server-rendered) brochure enquiry form. The brochure link is released by the form's thank-you.
export function BrochureDialog({ label, courseTitle, children }: { label: string; courseTitle: string; children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">{label}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle className="display text-2xl">{label}</DialogTitle>
        <DialogDescription>Tell us where to send the {courseTitle} brochure.</DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  )
}
