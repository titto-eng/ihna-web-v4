import { stubResponse } from '@/components/templates/landing/stub'

// Live stub (urls.csv): the old test page answers "test".
export function GET() {
  return stubResponse("test")
}
