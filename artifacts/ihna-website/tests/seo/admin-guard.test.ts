import { describe, expect, it } from 'vitest'
import { adminGuardDecision, basicAuthOk, sha256Hex } from '@/lib/security/adminGuard'
import { safeEqual } from '@/lib/security/safeEqual'

// 90-security §4 "/admin guard": basic auth with a constant-time compare; the Cloudflare Access header counts only when
// ADMIN_GUARD_TRUST_CF_ACCESS=1.
const basic = (u: string, p: string) => `Basic ${Buffer.from(`${u}:${p}`).toString('base64')}`

describe('safeEqual', () => {
  it('compares equal and unequal strings, including different lengths and unicode', () => {
    expect(safeEqual('abc', 'abc')).toBe(true)
    expect(safeEqual('abc', 'abd')).toBe(false)
    expect(safeEqual('abc', 'abcd')).toBe(false)
    expect(safeEqual('', '')).toBe(true)
    expect(safeEqual('', 'a')).toBe(false)
    expect(safeEqual('é', 'é')).toBe(true)
    expect(safeEqual('é', 'e')).toBe(false)
  })
})

describe('adminGuardDecision', () => {
  const hashP = sha256Hex('correct horse')
  it('allows everything when ADMIN_BASIC_* is unset', async () => {
    expect(await adminGuardDecision(new Headers(), {})).toBe('allow')
    expect(await adminGuardDecision(new Headers(), { ADMIN_BASIC_USER: 'ops' })).toBe('allow')
  })
  it('challenges without credentials, with a wrong user or a wrong password', async () => {
    const env = { ADMIN_BASIC_USER: 'ops', ADMIN_BASIC_HASH: await hashP }
    expect(await adminGuardDecision(new Headers(), env)).toBe('challenge')
    expect(await adminGuardDecision(new Headers({ authorization: basic('ops', 'wrong') }), env)).toBe('challenge')
    expect(await adminGuardDecision(new Headers({ authorization: basic('other', 'correct horse') }), env)).toBe('challenge')
    expect(await adminGuardDecision(new Headers({ authorization: 'Bearer x' }), env)).toBe('challenge')
    expect(await adminGuardDecision(new Headers({ authorization: 'Basic %%%not-base64' }), env)).toBe('challenge')
  })
  it('allows the configured user and password; the hash may be upper-case; passwords may contain a colon', async () => {
    const env = { ADMIN_BASIC_USER: 'ops', ADMIN_BASIC_HASH: (await hashP).toUpperCase() }
    expect(await adminGuardDecision(new Headers({ authorization: basic('ops', 'correct horse') }), env)).toBe('allow')
    expect(await basicAuthOk(basic('ops', 'a:b'), 'ops', await sha256Hex('a:b'))).toBe(true)
  })
  it('ignores cf-access-authenticated-user-email unless ADMIN_GUARD_TRUST_CF_ACCESS=1', async () => {
    const env = { ADMIN_BASIC_USER: 'ops', ADMIN_BASIC_HASH: await hashP }
    const cf = new Headers({ 'cf-access-authenticated-user-email': 'someone@example.test' })
    expect(await adminGuardDecision(cf, env)).toBe('challenge')
    expect(await adminGuardDecision(cf, { ...env, ADMIN_GUARD_TRUST_CF_ACCESS: '0' })).toBe('challenge')
    expect(await adminGuardDecision(cf, { ...env, ADMIN_GUARD_TRUST_CF_ACCESS: '1' })).toBe('allow')
    expect(await adminGuardDecision(new Headers(), { ...env, ADMIN_GUARD_TRUST_CF_ACCESS: '1' })).toBe('challenge')
  })
})
