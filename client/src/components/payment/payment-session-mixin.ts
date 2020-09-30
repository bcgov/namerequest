import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import { NameRequestPaymentResponse } from '@/modules/payment/models'

@Component
export default class PaymentMixin extends Vue {
  get paymentInProgress (): boolean {
    return (sessionStorage.getItem('paymentInProgress') === 'true')
  }

  get sessionPaymentId () {
    return (this.paymentInProgress && sessionStorage.getItem('paymentId'))
      ? parseInt(sessionStorage.getItem('paymentId'))
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

  savePaymentResponseToSession (paymentResponse: NameRequestPaymentResponse) {
    const { id, nrId, payment, sbcPayment = { invoices: [] }, token, statusCode, completionDate } = paymentResponse

    // TODO: Remove this one, we don't want to set the payment to session once we're done!
    // TODO: Or... we could add a debug payments mode?
    sessionStorage.setItem('payment', `${JSON.stringify(payment)}`)
    // Store the payment ID to sessionStorage, that way we can start the user back where we left off
    sessionStorage.setItem('paymentInProgress', 'true')
    sessionStorage.setItem('paymentId', `${id}`)
    sessionStorage.setItem('paymentToken', `${token}`)
    sessionStorage.setItem('nrId', `${nrId}`)
  }
}
