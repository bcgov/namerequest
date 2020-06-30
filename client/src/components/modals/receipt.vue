<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card class="pa-9">
      <v-card-text class="h3">Payment Successful</v-card-text>
      <v-card-text class="normal-copy">
        <div>
          <invoice
            :key="paymentInvoice.id"
            v-bind:invoice="paymentInvoice"
          />
        </div>
      </v-card-text>
      <v-card-actions>
        <!--<span>Time Remaining - 10:00</span>-->
        <v-spacer></v-spacer>
        <v-btn @click="redirectToStart" id="receipt-close-btn" class="normal" text>OK</v-btn>
        <v-btn @click="downloadReceipt" id="download-receipt-btn" class="primary" text>Download Receipt</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Invoice from '@/components/invoice.vue'

import paymentModule from '@/modules/payment'

import * as paymentService from '@/modules/payment/services'
import * as paymentTypes from '@/modules/payment/store/types'

import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component({
  components: {
    Invoice
  },
  data: () => ({
  }),
  computed: {
    isVisible: () => paymentModule[paymentTypes.RECEIPT_MODAL_IS_VISIBLE]
  }
})
export default class ReceiptModal extends Vue {
  mounted () {
    // Check for a payment ID in sessionStorage, if it has been set, we've been redirected away from the application,
    // and need to rehydrate the application using the payment ID (for now, it could be some other token too)!
    // TODO: Set the timer here!
    if (this.paymentId) {
      // TODO: Remember to clear the session when we're done building this out
      this.fetchData(false)
        .then(() => paymentModule.toggleReceiptModal(true))
    }
  }

  @Watch('isVisible')
  onModalShow (val: boolean, oldVal: string): void {
  }

  async showModal () {
    await paymentModule.toggleReceiptModal(true)
  }

  async hideModal () {
    await paymentModule.toggleReceiptModal(false)
  }

  async redirectToStart () {
    window.location.href = 'http://localhost:8080/namerequest/'
  }

  async downloadReceipt () {
    const { paymentId, paymentInvoiceId, paymentInvoice, paymentRequest } = this
    const { businessInfo = { businessName: null, businessIdentifier: null }, filingInfo = { date: null } } = paymentRequest
    await this.fetchData(false)

    const data = {
      // 'corpType': businessInfo.corpType,
      'corpName': businessInfo.businessName,
      // 'businessNumber': businessInfo.businessIdentifier, // TODO: Is this the same as business identifier?
      // 'filingIdentifier': businessInfo.businessIdentifier, // TODO: Is this the same as business identifier?
      'filingDateTime': filingInfo.date // TODO: Is this a date or a datetime?
    }

    // window.location.href = 'http://localhost:8080/namerequest/'
    await this.fetchReceiptPdf(paymentId, paymentInvoiceId, data)
  }

  get paymentRequest () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_REQUEST]
  }

  get paymentInProgress (): boolean {
    return (sessionStorage.getItem('paymentInProgress') === 'true')
  }

  get paymentId () {
    return (this.paymentInProgress && sessionStorage.getItem('paymentId'))
      ? parseInt(sessionStorage.getItem('paymentId'))
      : undefined
  }

  get paymentInvoice () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_INVOICE]
  }

  get paymentInvoiceId () {
    return this.paymentInvoice ? this.paymentInvoice.id : undefined
  }

  get paymentReceipt () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_RECEIPT]
  }

  async fetchData (clearSession: boolean = true) {
    const { paymentId } = this
    if (clearSession) {
      // Clear the sessionStorage variables
      sessionStorage.removeItem('paymentInProgress')
      sessionStorage.removeItem('paymentId')
    }

    if (paymentId) {
      paymentModule.toggleReceiptModal(true)
      await this.fetchPayment(paymentId)
      // this.fetchInvoice(paymentId, null)
      // this.fetchReceipt(paymentId)
    }
  }

  async fetchPayment (paymentId) {
    const response = await paymentService.getPayment(paymentId, {})

    const payment = response.data
    const { invoices = [] } = response.data
    await paymentModule.setPayment(payment)
    await paymentModule.setPaymentInvoice(invoices[0])
  }

  /* async fetchInvoices (paymentId) {
    const response = await paymentService.getInvoicesRequest(paymentId, {})
    await paymentModule.setPaymentInvoice(response.data[0])
  } */

  async fetchInvoice (paymentId, invoiceId) {
    const response = await paymentService.getInvoiceRequest(paymentId, {
      'invoice_id': invoiceId
    })
    await paymentModule.setPaymentInvoice(response.data)
  }

  /**
   * Not currently in use... right now receipt data isn't exposed anywhere,
   * there's just the PDF option in the Service BC Pay API
   * @param paymentId
   * @param invoiceId
   */
  async fetchReceipt (paymentId, invoiceId) {
    const response = await paymentService.getReceiptRequest(paymentId, invoiceId, {})
    await paymentModule.setPaymentReceipt(response.data)
  }

  /**
   * Grab the receipt PDF and download / display it for the user...
   * @param paymentId
   * @param invoiceId
   * @param params
   */
  async fetchReceiptPdf (paymentId, invoiceId, data) {
    const response = await paymentService.getReceiptRequest(paymentId, invoiceId, data)
    // eslint-disable-next-line no-console
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `payment-invoice-${invoiceId}.pdf`)
    document.body.appendChild(link)
    link.click()
  }
}
</script>
