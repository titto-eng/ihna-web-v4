import { describe, expect, it } from 'vitest'
import { passwordProblem } from '@/lib/alumni/password'
import { safeNext } from '@/lib/alumni/session'

describe('alumni password policy (90-security §4)', () => {
  it('accepts a 12+ character password that is not common', () => {
    expect(passwordProblem('Correct-Horse-Battery-9', 'jo@example.com')).toBeNull()
  })
  it('rejects short, long, common and email-derived passwords', () => {
    expect(passwordProblem('short1')).toMatch(/at least 12/)
    expect(passwordProblem('x'.repeat(129))).toMatch(/at most 128/)
    expect(passwordProblem('Password123456')).toMatch(/too common/)
    expect(passwordProblem('1234 5678 9012')).toMatch(/too common/)
    expect(passwordProblem('xx-jane.citizen-xx-yy', 'jane.citizen@example.com')).toMatch(/email/)
    expect(passwordProblem(undefined)).toBeTruthy()
  })
})

describe('safeNext', () => {
  it('only passes same-site /alumni/ paths', () => {
    expect(safeNext('/alumni/dashboard/')).toBe('/alumni/dashboard/')
    for (const bad of ['https://evil.test/', '//evil.test', '/alumni//evil.test', '/admin', '/alumni/../admin', '/alumni/x?y=1', undefined, 5]) expect(safeNext(bad)).toBeNull()
  })
})
