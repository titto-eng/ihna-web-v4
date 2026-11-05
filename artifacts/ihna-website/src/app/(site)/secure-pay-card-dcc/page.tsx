import { PaymentInfoPage, paymentInfoMetadata } from '@/components/templates/payPages'

// The old SecurePay card page (template-secure-pay-card-dcc.php, `?id=&data=`). Card details are now taken on /pay/securepay/<uuid>/
// after the pay form; old links carry no usable payment, so their parameters are ignored (45-payments §5).
export const metadata = paymentInfoMetadata('SecurePay card payment', '/secure-pay-card-dcc/')

export default function SecurePayCardDcc() {
  return (
    <PaymentInfoPage title="SecurePay card payment">
      <p>Card payments with SecurePay now start from the payment form, which takes you to a secure card page for your payment.</p>
    </PaymentInfoPage>
  )
}
