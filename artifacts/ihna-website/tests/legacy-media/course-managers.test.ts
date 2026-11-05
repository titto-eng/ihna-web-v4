import { describe, expect, it } from 'vitest'
import { matchStaff, nameTokens, readManagersSection, type StaffRef } from '../../scripts/import/steps/link-course-managers'

const staff: StaffRef[] = [
  { id: 12, name: 'Assoc. Prof. Helen Mary Almond' },
  { id: 14, name: 'Dr. Parul' },
  { id: 17, name: 'Dr Maria Rani Dasari' },
  { id: 21, name: 'Dr. Philomina Jacob' },
  { id: 41, name: 'Dr. Bindu K Abraham' },
]

describe('course manager name matching', () => {
  it('strips honorifics and punctuation', () => {
    expect(nameTokens('Associate Prof. Helen Almond')).toEqual(['helen', 'almond'])
    expect(nameTokens('Dr. Parul')).toEqual(['parul'])
  })
  it('matches exact, first+last, and single-name records', () => {
    expect(matchStaff('Dr. Maria Rani Dasari', staff)).toMatchObject({ how: 'exact', staff: { id: 17 } })
    expect(matchStaff('Associate Prof. Helen Almond', staff)).toMatchObject({ how: 'first-last', staff: { id: 12 } })
    expect(matchStaff('Dr. Parul', staff)).toMatchObject({ how: 'exact', staff: { id: 14 } })
  })
  it('never matches a different person who shares one name', () => {
    expect(matchStaff('Dr. Abraham Francis', staff).staff).toBeNull()
  })
  it('reports ambiguity instead of picking', () => {
    const m = matchStaff('Helen Almond', [...staff, { id: 99, name: 'Helen Jane Almond' }])
    expect(m.how).toBe('ambiguous')
  })
})

describe('readManagersSection', () => {
  it('reads card names and ignores commented-out sections', () => {
    const html = `<!--<section id="courseManagers">[CourseManagers]</section>--><section id="courseManagers"><div class="courseManagers-card cmCard"><p class="name-info">Dr. Parul</p><p><a href="mailto:x@y">x@y</a></p></div></section>`
    expect(readManagersSection(html)).toEqual({ kind: 'cards', names: ['Dr. Parul'] })
  })
  it('flags a bare shortcode and an absent section', () => {
    expect(readManagersSection('<section id="courseManagers"> [CourseManagers] </section>')).toEqual({ kind: 'shortcode' })
    expect(readManagersSection('<p>none</p>')).toEqual({ kind: 'absent' })
  })
})
