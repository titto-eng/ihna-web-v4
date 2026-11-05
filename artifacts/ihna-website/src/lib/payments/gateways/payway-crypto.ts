// PayWay return decryption with Node `crypto` (45 §6). Ported from the old theme's mcrypt code, ../ihmv3/wp-content/themes/mwt-ihm/Payway/decrypt.php:
//   :4-10   pkcs5_unpad (PKCS5 padding check)
//   :12-34  decrypt_parameters: key = base64_decode(<key>), IV = 16 zero bytes, rijndael-128 CBC; the parameter text and the signature
//           are decrypted separately (:23-24, :29-30)
//   :36-41  signature = MD5 of the decrypted parameter text, compared with the decrypted signature. The old code only called
//           trigger_error() on a mismatch and still returned the parameters; this port THROWS, so an unsigned return is never trusted.
//   :44-56  "a=b&c=d" parsing with urldecode.
// The key (PAYWAY_ENCRYPTION_KEY, base64) comes from the environment only. No key, biller or merchant id is copied from the old repo.
//
// Checked against PayWay's own spec, https://www.payway.com.au/docs/hosted-payment-page-handoff-developers-guide/ "Decrypting Parameters":
//   "encrypted using AES 128 with Cipher Block Chaining, using PKCS-7 Padding ... initialised with a 16 byte, zero-filled initialization vector";
//   signature = "Convert the query parameters string to UTF-8 bytes / Perform an MD5 hash on the bytes / Encrypt the hash using AES-128 in CBC
//   mode / Encode the encryption output to Base-64". PKCS-7 on 16-byte blocks is byte-for-byte what PHP's pkcs5_unpad checks. The guide's
//   example EncryptedParameters/Signature are published WITHOUT their key, so they cannot serve as a test vector; ours is made with openssl.
import crypto from 'node:crypto'
import { SignatureError } from '../types'

const IV = Buffer.alloc(16, 0)

/** AES-128 only, as documented: the key must decode to exactly 16 bytes. */
function algorithmFor(key: Buffer): string {
  if (key.length !== 16) throw new SignatureError('PayWay encryption key must be 16 bytes (AES-128), base64-encoded')
  return 'aes-128-cbc'
}

/** PKCS-7 (decrypt.php:4-10 called it pkcs5). Returns null for bad padding (PHP returned false). */
export function pkcs5Unpad(buf: Buffer): Buffer | null {
  if (buf.length === 0) return null
  const pad = buf[buf.length - 1]
  if (pad === 0 || pad > 16 || pad > buf.length) return null
  for (let i = buf.length - pad; i < buf.length; i++) if (buf[i] !== pad) return null
  return buf.subarray(0, buf.length - pad)
}

function aesDecrypt(key: Buffer, data: Buffer): Buffer {
  if (data.length === 0 || data.length % 16 !== 0) throw new SignatureError('malformed ciphertext')
  const d = crypto.createDecipheriv(algorithmFor(key), key, IV)
  d.setAutoPadding(false)
  const plain = Buffer.concat([d.update(data), d.final()])
  const un = pkcs5Unpad(plain)
  if (!un) throw new SignatureError('bad padding')
  return un
}

/** Test and tooling helper: what PayWay does when it redirects the customer back. */
export function encryptPaywayParameters(base64Key: string, params: Record<string, string>): { EncryptedParameters: string; Signature: string } {
  const key = Buffer.from(base64Key, 'base64')
  const phpEncode = (x: string) => encodeURIComponent(x).replace(/%20/g, '+') // PHP urlencode style, as PayWay sends
  const text = Buffer.from(Object.entries(params).map(([k, v]) => `${phpEncode(k)}=${phpEncode(v)}`).join('&'), 'utf8')
  const enc = (b: Buffer) => {
    const pad = 16 - (b.length % 16)
    const c = crypto.createCipheriv(algorithmFor(key), key, IV)
    c.setAutoPadding(false) // PKCS5 padding is added by hand above
    return Buffer.concat([c.update(Buffer.concat([b, Buffer.alloc(pad, pad)])), c.final()]).toString('base64')
  }
  return { EncryptedParameters: enc(text), Signature: enc(crypto.createHash('md5').update(text).digest()) }
}

const phpUrlDecode = (s: string): string => {
  try { return decodeURIComponent(s.replace(/\+/g, ' ')) } catch { return s }
}

/** Decrypts and verifies. Throws SignatureError on any tampering; never returns unverified parameters. */
export function decryptPaywayParameters(base64Key: string, encryptedParameters: string, signature: string): Record<string, string> {
  if (!base64Key) throw new SignatureError('PayWay encryption key is not configured')
  const key = Buffer.from(base64Key, 'base64')
  const ct = Buffer.from(encryptedParameters.replace(/ /g, '+'), 'base64') // a browser turns "+" into " " in query strings
  const sig = Buffer.from(signature.replace(/ /g, '+'), 'base64')
  const text = aesDecrypt(key, ct)
  const provided = aesDecrypt(key, sig) // the MD5 of the text, as raw bytes
  const computed = crypto.createHash('md5').update(text).digest()
  if (provided.length !== computed.length || !crypto.timingSafeEqual(provided, computed)) throw new SignatureError('invalid parameters signature')
  const out: Record<string, string> = {}
  for (const part of text.toString('utf8').split('&')) {
    if (!part) continue
    const i = part.indexOf('=')
    out[phpUrlDecode(i < 0 ? part : part.slice(0, i))] = phpUrlDecode(i < 0 ? '' : part.slice(i + 1))
  }
  return out
}
