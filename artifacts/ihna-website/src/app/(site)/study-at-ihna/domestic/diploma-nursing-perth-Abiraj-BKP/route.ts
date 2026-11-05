import { stubResponse } from '@/components/templates/landing/stub'

// Live stub (urls.csv): a backup of the Perth page that answers "Not Active".
export function GET() {
  return stubResponse("Not Active")
}
