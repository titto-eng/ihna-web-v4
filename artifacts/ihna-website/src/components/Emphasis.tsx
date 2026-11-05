import { Fragment } from 'react'

// Headings may mark one phrase with *asterisks*: it renders as BON's italic orange <em>.
export function Emphasis({ text, tone = 'primary' }: { text: string; tone?: 'primary' | 'secondary' | 'none' }) {
  const parts = text.split(/\*([^*]+)\*/g)
  const cls = tone === 'secondary' ? 'italic font-normal text-secondary' : tone === 'none' ? 'italic' : 'italic font-normal text-primary-strong'
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <em key={i} className={cls}>{part}</em> : <Fragment key={i}>{part}</Fragment>))}
    </>
  )
}
