import { Component, Vue } from 'vue-property-decorator'
import { NameRequestPaymentResponse } from '@/modules/payment/models'
import { PaymentAction } from '@/enums'

@Component({})
export class PaymentSessionMixin extends Vue {
  get paymentInProgress (): boolean {
    return (sessionStorage.getItem('paymentInProgress') === 'true')
  }

  get sessionPaymentId () {
    return (this.paymentInProgress && sessionStorage.getItem('paymentId'))
      ? parseInt(sessionStorage.getItem('paymentId'))
      : undefined
  }

  get sessionPaymentAction () {
    return (this.paymentInProgress && sessionStorage.getItem('paymentAction'))
      ? sessionStorage.getItem('paymentAction')
      : undefined
  }

  get sessionPaymentToken () {
    return (this.paymentInProgress && sessionStorage.getItem('paymentToken'))
      ? sessionStorage.getItem('paymentToken')
      : undefined
  }

  get sessionNrId () {
    return (this.paymentInProgress && sessionStorage.getItem('nrId'))
      ? sessionStorage.getItem('nrId')
      : undefined
  }

  get sessionId () {
    return (this.paymentInProgress && sessionStorage.getItem('nrId'))
      ? sessionStorage.getItem('nrId')
      : undefined
  }

  /**
   * @param paymentAction A PaymentAction - one of [COMPLETE, UPGRADE, REAPPLY, REFUND]
   * @param paymentResponse
   */
  savePaymentResponseToSession (paymentAction: PaymentAction, paymentResponse: NameRequestPaymentResponse) {
    const { id, nrId, payment, sbcPayment = { receipts: [] }, token, statusCode, completionDate } = paymentResponse

    // TODO: Remove this one, we don't want to set the payment to session once we're done!
    // TODO: Or... we could add a debug payments mode?
    sessionStorage.setItem('payment', `${JSON.stringify(payment)}`)
    sessionStorage.setItem('paymentAction', `${paymentAction}`)
    // Store the payment ID to sessionStorage, that way we can start the user back where we left off
    sessionStorage.setItem('paymentInProgress', 'true')
    sessionStorage.setItem('paymentId', `${id}`)
    sessionStorage.setItem('paymentToken', `${token}`)
    sessionStorage.setItem('nrId', `${nrId}`)
  }
}
