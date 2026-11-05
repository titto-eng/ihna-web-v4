import { PaymentInfoPage, paymentInfoMetadata } from '@/components/templates/payPages'

// The old SecurePay result page (template-secure-pay-response.php, `?id=<sequential id>`). Results are /pay/result/<uuid>/ and receipts
// /pay/receipt/<uuid>/?e=<email>; the old `?id=` is ignored because it exposed any payment to anyone guessing a number (45-payments §5).
export const metadata = paymentInfoMetadata('Payment response', '/secure-pay-response/')

export default function SecurePayResponse() {
  return (
    <PaymentInfoPage title="Payment response">
      <p>Payment results are shown straight after you pay, and the receipt link is in the email we send you.</p>
    </PaymentInfoPage>
  )
}
