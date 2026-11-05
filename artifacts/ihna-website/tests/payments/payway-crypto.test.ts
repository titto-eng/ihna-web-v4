import { describe, expect, it } from 'vitest'
import { decryptPaywayParameters, encryptPaywayParameters, pkcs5Unpad } from '@/lib/payments/gateways/payway-crypto'
import { SignatureError } from '@/lib/payments/types'
import { verifyPaywayReturn } from '@/lib/payments/gateways/payway'
import { PAYWAY_TEST_KEY } from './helpers'

// Test key only: the vector is generated from PAYWAY_TEST_KEY (see helpers.ts), never a real PayWay key.

// 45 §8 check 1. The vector below was produced with `openssl enc -aes-128-cbc` (zero IV, PKCS5) and `openssl dgst -md5`, i.e. NOT with our
// own code, so a bug in both our encrypt and decrypt helpers cannot hide. The key is a test key. Real recorded PayWay responses are still needed
// (45 §10): they replace this vector when the sandbox account arrives.
const VECTOR = {
  key: PAYWAY_TEST_KEY,
  EncryptedParameters: 'FTSLW1loWfPj4QLdZCU92AJyp9qfhAqppaN0HS3TtYWf5DQJM3pYkxTjPoiaoAvDIo30Zl7exhDYgx+45wwuajUzotJRQNri0VzbRrYFd60aUiflXTVzrWShx3HWfz+BsgK89H5o59a6EW1rO/a+1yBT3xokLZRJv1nixaMzx7D54MXDnNKEF9mih2SgSzsa8tODSfM60er7/8DEAeSIrRJaAP01edLb0/Wiz2O9zq0fuuUl3zIn63noeBzHrQio',
  Signature: 'GdeVKRDG+rCN3G0I/lDcsBg1BJds3zLeqW26wJzqWSs=',
}

describe('PayWay return decryption (Node crypto)', () => {
  it('decrypts the openssl-made fixture and parses the parameters', () => {
    const p = decryptPaywayParameters(VECTOR.key, VECTOR.EncryptedParameters, VECTOR.Signature)
    expect(p).toMatchObject({ PaymentID: '11111111-2222-4333-8444-555555555555', payment_amount: '150.00', response_code: '08', payment_status: 'approved', type: 'general', provider: '2', StudentName: 'Test Student' })
  })

  it('accepts a "+" turned into a space by the browser query string', () => {
    const p = decryptPaywayParameters(VECTOR.key, VECTOR.EncryptedParameters.replace(/\+/g, ' '), VECTOR.Signature.replace(/\+/g, ' '))
    expect(p.payment_amount).toBe('150.00')
  })

  it('a tampered signature throws (the old code only called trigger_error and carried on)', () => {
    const other = encryptPaywayParameters(VECTOR.key, { PaymentID: 'x', payment_amount: '1.00' })
    expect(() => decryptPaywayParameters(VECTOR.key, VECTOR.EncryptedParameters, other.Signature)).toThrow(SignatureError)
  })

  it('altered ciphertext, a wrong key and a missing key all throw', () => {
    const ct = Buffer.from(VECTOR.EncryptedParameters, 'base64')
    ct[20] ^= 0x01
    expect(() => decryptPaywayParameters(VECTOR.key, ct.toString('base64'), VECTOR.Signature)).toThrow(SignatureError)
    expect(() => decryptPaywayParameters(Buffer.from('fedcba9876543210').toString('base64'), VECTOR.EncryptedParameters, VECTOR.Signature)).toThrow(SignatureError)
    expect(() => decryptPaywayParameters('', VECTOR.EncryptedParameters, VECTOR.Signature)).toThrow(SignatureError)
  })

  it('our encrypt helper round-trips and matches the openssl output for the same input', () => {
    const params = { PaymentID: '11111111-2222-4333-8444-555555555555', payment_amount: '150.00', response_code: '08', payment_number: '1234567', payment_status: 'approved', type: 'general', provider: '2', StudentName: 'Test Student' }
    const enc = encryptPaywayParameters(VECTOR.key, params)
    expect(enc).toEqual({ EncryptedParameters: VECTOR.EncryptedParameters, Signature: VECTOR.Signature })
  })

  it('pkcs5Unpad rejects bad padding', () => {
    expect(pkcs5Unpad(Buffer.from([1, 2, 3, 4]))).toBeNull()
    expect(pkcs5Unpad(Buffer.concat([Buffer.from('abc'), Buffer.alloc(13, 13)]))?.toString()).toBe('abc')
    expect(pkcs5Unpad(Buffer.alloc(0))).toBeNull()
  })

  it('verifyPaywayReturn maps 00/08 to paid and anything else to failed, and reads the amount in cents', () => {
    const paid = verifyPaywayReturn(encryptPaywayParameters(PAYWAY_TEST_KEY, { PaymentID: 'a', payment_amount: '12.50', response_code: '00' }), { PAYWAY_ENCRYPTION_KEY: PAYWAY_TEST_KEY })
    expect(paid).toMatchObject({ outcome: 'paid', amountCents: 1250 })
    const declined = verifyPaywayReturn(encryptPaywayParameters(PAYWAY_TEST_KEY, { PaymentID: 'a', payment_amount: '12.50', response_code: '51' }), { PAYWAY_ENCRYPTION_KEY: PAYWAY_TEST_KEY })
    expect(declined.outcome).toBe('failed')
    expect(() => verifyPaywayReturn({}, { PAYWAY_ENCRYPTION_KEY: PAYWAY_TEST_KEY })).toThrow(SignatureError)
  })
})
