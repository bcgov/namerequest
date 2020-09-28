import Vue from 'vue'
import { Component } from 'vue-property-decorator'

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
}
