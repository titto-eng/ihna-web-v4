/**
 * Constant-time string comparison for secrets (90-security §4). Pure JS so it runs in the proxy and in route handlers alike:
 * both inputs are encoded as UTF-8 and every byte is XOR-accumulated. Unequal lengths compare `a` against itself so the loop
 * always runs, then answer false. Never use `===` on a secret or a password hash.
 */
export function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const x = enc.encode(a)
  const y = enc.encode(b)
  const same = x.length === y.length
  const z = same ? y : x
  let diff = same ? 0 : 1
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ z[i]
  return diff === 0
}
