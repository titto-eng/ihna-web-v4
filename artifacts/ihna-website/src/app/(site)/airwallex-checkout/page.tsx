import { PaymentInfoPage, paymentInfoMetadata } from '@/components/templates/payPages'

// The old Airwallex drop-in page (template-airwallex-dropin-checkout.php, `?id=&data=`). The checkout is now /pay/airwallex/<uuid>/
// after the pay form; old links carry no usable payment, so their parameters are ignored (45-payments §5).
export const metadata = paymentInfoMetadata('Airwallex checkout', '/airwallex-checkout/')

export default function AirwallexCheckout() {
  return (
    <PaymentInfoPage title="Airwallex checkout">
      <p>Airwallex payments now start from the payment form, which opens a secure Airwallex checkout for your payment.</p>
    </PaymentInfoPage>
  )
}
