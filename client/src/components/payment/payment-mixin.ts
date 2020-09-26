import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import * as paymentTypes from '@/modules/payment/store/types'

@Component
export default class PaymentMixin extends Vue {
  get payment () {
    return this.$store.getters[paymentTypes.GET_PAYMENT]
  }

  get paymentId () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_ID]
  }

  get paymentToken () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_TOKEN]
  }

  get paymentRequest () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_REQUEST]
  }

  get paymentDetails () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_DETAILS]
  }

  get paymentInvoice () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_INVOICE]
  }

  get paymentReceipt () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_RECEIPT]
  }

  get paymentFees () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_FEES]
  }
}
