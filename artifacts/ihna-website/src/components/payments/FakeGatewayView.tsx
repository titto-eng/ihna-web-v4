import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/button'
import { formatAud } from '@/lib/payments/money'

// The fake gateway page (dev, test and DRY_RUN only; the route 404s in production). Approve, Decline or Abandon.
export function FakeGatewayView({ paymentId, amountCents, status }: { paymentId: string; amountCents: number; status: string }) {
  return (
    <Section spacing="default">
      <div className="mx-auto max-w-xl rounded-card border border-dashed border-border bg-muted p-8" data-testid="fake-gateway">
        <p className="label-mono mb-3 text-accent">Fake gateway (not a real payment)</p>
        <h1 className="display text-3xl">Pay {formatAud(amountCents)}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Status: {status}. Nothing here contacts a bank.</p>
        <form method="post" action={`/api/payments/fake/${paymentId}/`} className="mt-8 flex flex-wrap gap-3">
          <Button type="submit" name="decision" value="approve">Approve</Button>
          <Button type="submit" name="decision" value="decline" variant="outline">Decline</Button>
          <Button type="submit" name="decision" value="abandon" variant="ghost">Abandon</Button>
        </form>
      </div>
    </Section>
  )
}
