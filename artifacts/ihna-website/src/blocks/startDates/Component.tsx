import Link from 'next/link'
import type { StartDatesBlock as Block } from '@/payload-types'
import { Section } from '@/components/layout/Section'
import { AudienceOnly } from '@/components/audience/AudienceOnly'
import { courseOf, warnNoCourse } from '@/components/templates/courseContext'
import { PortalNotice } from '@/components/templates/PortalNotice'
import { describeStartDates, getStartDates, type StartDateCampus, type StudentType } from '@/lib/portal'
import type { BlockProps } from '../types'

function Campuses({ campuses }: { campuses: StartDateCampus[] }) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {campuses.map((c) => (
        <div key={c.campusId}>
          <h3 className="display text-2xl">{c.campusName}</h3>
          {c.sections.map((s) => (
            <div key={s.mode} className="mt-4">
              <p className="label-mono text-muted-foreground">{s.label}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {s.entries.map((e, i) => (
                  <li key={i}>
                    <Link href={e.href} className="inline-block rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary-strong">
                      {e.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// DEC-7: renders only when `course.showStartDates` is true. Both audiences are server-rendered; CSS hides the inactive one.
export async function StartDates({ block, ctx }: BlockProps<Block>) {
  const course = courseOf(ctx)
  if (!course) {
    warnNoCourse('startDates')
    return null
  }
  if (!course.showStartDates || !course.khId) return null
  const result = await getStartDates(course.khId)
  const section = (children: React.ReactNode) => (
    <Section tone={block.tone ?? 'default'} spacing={block.spacing ?? 'default'} anchorId={block.anchorId} depth={ctx?.depth}>
      <div data-course-block="startDates">
        <h2 className="display text-display-md">Course Start Dates</h2>
        <div className="mt-8">{children}</div>
      </div>
    </Section>
  )
  if (result.unavailable) return section(<PortalNotice />)
  const mode = block.mode ?? 'all'
  const types: StudentType[] = course.studentType === 'domestic' ? ['domestic'] : course.studentType === 'international' ? ['international'] : ['domestic', 'international']
  const views = types.map((t) => ({ t, campuses: describeStartDates(result.data, t, course.khId!, mode) })).filter((v) => v.campuses.length)
  if (!views.length) return null
  return section(
    views.map((v) =>
      types.length === 1 ? (
        <Campuses key={v.t} campuses={v.campuses} />
      ) : (
        <AudienceOnly key={v.t} audience={v.t}>
          <Campuses campuses={v.campuses} />
        </AudienceOnly>
      ),
    ),
  )
}
