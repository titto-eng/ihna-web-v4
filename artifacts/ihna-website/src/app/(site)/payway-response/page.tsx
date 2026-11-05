import { PaymentInfoPage, paymentInfoMetadata } from '@/components/templates/payPages'

// PayWay's configured return URL (template-payway-response.php). A return with `EncryptedParameters` is rewritten to the return
// handler /pay/return/payway/ (next.config.ts rewrites, 45-payments §5); this page answers the bare GET with 200.
export const metadata = paymentInfoMetadata('Payment response', '/payway-response/')

export default function PaywayResponse() {
  return (
    <PaymentInfoPage title="Payment response">
      <p>This page receives payment results from our bank. There is no payment to show here.</p>
    </PaymentInfoPage>
  )
}
