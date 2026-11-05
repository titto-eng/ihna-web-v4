import { stubResponse } from '@/components/templates/landing/stub'

// Live stub (urls.csv): the old page answers "Not Active" (die()).
export function GET() {
  return stubResponse("Not Active")
}
