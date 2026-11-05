import { describe, expect, it } from 'vitest'
import { calendarColour, calendarLabel, censusTable, contrastTextColour, formatCensusDate, formatIntake, formatStartDate, portalToday } from '@/lib/portal/format'

describe('portal formats (Australia/Melbourne)', () => {
  it('today is the Melbourne date, not the server date', () => {
    expect(portalToday(new Date('2026-10-16T14:30:00Z'))).toBe('2026-10-17') // AEDT, UTC+11
    expect(portalToday(new Date('2026-06-30T13:59:00Z'))).toBe('2026-06-30') // AEST, UTC+10, 23:59
    expect(portalToday(new Date('2026-06-30T14:00:00Z'))).toBe('2026-07-01')
  })
  it('formats', () => {
    expect(formatStartDate('2026-11-02')).toBe('Nov 2, 2026')
    expect(formatCensusDate('2026-11-02')).toBe('02-11-2026')
    expect(formatIntake('2027-01-04')).toBe('January 2027')
    expect(formatCensusDate('')).toBe('')
  })
  it('census table columns', () => {
    expect(censusTable([{ start: '2026-11-02', end: '2027-05-03', census: '2026-12-02', orientation: '2026-11-02' }])).toEqual([
      { intake: 'November 2026', start: '02-11-2026', end: '03-05-2027', census: '02-12-2026', orientation: '02-11-2026' },
    ])
  })
  it('calendar colour is the first 6 hex chars of crc32 and the text colour follows the legacy contrast rule', () => {
    expect(calendarColour('Master of Nursing')).toMatch(/^#[0-9a-f]{6}$/)
    expect(calendarColour('Master of Nursing')).toBe(calendarColour('Master of Nursing'))
    expect(contrastTextColour('#ffffff')).toBe('#000000')
    expect(contrastTextColour('#000000')).toBe('#FFFFFF')
  })
  it('calendar labels', () => {
    expect(calendarLabel({ mode: 'f2f', intake: 'fixed' })).toBe('Face to Face')
    expect(calendarLabel({ mode: 'blended', intake: 'fixed' })).toBe('Online (Blended)')
    expect(calendarLabel({ mode: 'blended', intake: 'rolling' })).toBe('Online (Blended) : Enrol any time')
  })
})
