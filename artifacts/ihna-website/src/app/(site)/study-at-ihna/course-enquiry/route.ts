import { stubResponse } from '@/components/templates/landing/stub'

// Live stub (urls.csv): the old page answers this one line, with no content.
export function GET() {
  return stubResponse("URL trying to access is invalid")
}
