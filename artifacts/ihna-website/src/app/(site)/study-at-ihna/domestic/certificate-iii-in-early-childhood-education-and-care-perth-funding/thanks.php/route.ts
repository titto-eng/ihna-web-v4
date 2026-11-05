import { stubResponse } from '@/components/templates/landing/stub'

// The handler of a "Not Active" page: no thank-you view, the same one line.
export function GET() {
  return stubResponse("Not Active")
}
