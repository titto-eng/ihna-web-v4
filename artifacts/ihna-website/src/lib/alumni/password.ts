// Password policy for alumni (90-security §4): 12-128 characters, not a common password, not containing the email local part.
// Enforced where Payload lets us: the reset-password operation and an alumnus's own update (hooks in `./hooks.ts`), plus the forms.
export const MIN_PASSWORD = 12
export const MAX_PASSWORD = 128

// A short bundled list of the passwords people actually pick at 12+ characters. Compared after lower-casing and stripping non-alphanumerics.
const COMMON = new Set([
  'password1234', 'password12345', 'password123456', 'passw0rd1234', 'qwertyuiop12', 'qwertyuiop123', 'qwerty123456', 'qwertyuiopas',
  '123456789012', '1234567890123', '12345678901234', '111111111111', '000000000000', 'abcdefghijkl', 'abcd12345678', 'abc123456789',
  'iloveyou1234', 'iloveyou12345', 'welcome12345', 'welcome123456', 'letmein12345', 'letmein123456', 'administrator', 'changeme1234',
  'changemenow1', 'trustno1trustno1', 'monkey123456', 'dragon123456', 'football1234', 'baseball1234', 'superman1234', 'princess1234',
  'sunshine1234', 'whatever1234', 'ihmalumni1234', 'ihmalumni12345', 'alumni123456', 'institute1234', 'australia1234', 'sydney123456',
  'melbourne1234', 'brisbane1234', 'nursing12345', 'healthcare123',
])

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/** Returns a user-facing message when the password breaks the policy, else null. `email` is optional (the reset form does not know it). */
export function passwordProblem(password: unknown, email?: string | null): string | null {
  if (typeof password !== 'string') return 'Enter a password.'
  if (password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters.`
  if (password.length > MAX_PASSWORD) return `Use at most ${MAX_PASSWORD} characters.`
  if (COMMON.has(squash(password))) return 'That password is too common. Choose something less guessable.'
  const local = squash((email ?? '').split('@')[0] ?? '')
  if (local.length >= 3 && squash(password).includes(local)) return 'Your password must not contain the first part of your email address.'
  return null
}
