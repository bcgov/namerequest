<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card class="pa-9">
      <v-card-text class="h3">Payment Successful</v-card-text>
      <v-card-text class="copy-normal">
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

import { PaymentApiError } from '@/modules/payment/services/payment'
import paymentModule from '@/modules/payment'
import { NameRequestPayment, NameRequestPaymentResponse } from '@/modules/payment/models'
import newRequestModule, { NewRequestModule, ROLLBACK_ACTIONS as rollbackActions } from '@/store/new-request-module'
import errorModule from '@/modules/error'
import { ErrorI } from '@/modules/error/store/actions'

import * as paymentService from '@/modules/payment/services'
import * as paymentTypes from '@/modules/payment/store/types'

import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
// TODO: Finish the message component
// import message from "@/components/common/error/message.vue"

/**
 * Makes debugging the receipt easier.
 * Usage:
 * Set to true and complete a name reservation.
 * The session information for the payment won't be cleared
 * which activates the receipt modal.
 *
 * Make sure this is set to false when you're done!
 */
const DEBUG_RECEIPT = false

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
    const { sessionPaymentId } = this
    // Check for a payment ID in sessionStorage, if it has been set, we've been redirected away from the application,
    // and need to rehydrate the application using the payment ID (for now, it could be some other token too)!
    // TODO: Set the timer here!
    if (sessionPaymentId) {
      // TODO: Remember to clear the session when we're done building this out
      this.fetchData(!DEBUG_RECEIPT)
        .then(() => {
          const { nr } = this
          const { payment, sbcPayment } = paymentModule

          // Then complete the payment
          this.completePayment(sessionPaymentId)
        })
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
    window.location.href = document.baseURI
  }

  /**
   * TODO: We still need to switch the NR number for this to work with Oracle enabled
   */
  async downloadReceipt () {
    const { paymentToken, paymentInvoiceId, paymentRequest } = this
    const {
      businessInfo = { businessName: null, businessIdentifier: null }, filingInfo = { date: null }
    } = paymentRequest
    await this.fetchData(!DEBUG_RECEIPT)

    const data = {
      // 'corpType': businessInfo.corpType,
      'corpName': businessInfo.businessName,
      // 'businessNumber': businessInfo.businessIdentifier, // TODO: Is this the same as business identifier?
      // 'filingIdentifier': businessInfo.businessIdentifier, // TODO: Is this the same as business identifier?
      'filingDateTime': filingInfo.date // TODO: Is this a date or a datetime?
    }

    await this.fetchReceiptPdf(paymentToken, paymentInvoiceId, data)
  }

  get nr () {
    const nameRequest: NewRequestModule = newRequestModule
    const nr: Partial<any> = nameRequest.nr || {}
    return nr
  }

  get nrId () {
    return newRequestModule.nrId
  }

  get paymentToken () {
    return paymentModule[paymentTypes.GET_PAYMENT_TOKEN]
  }

  get paymentRequest () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_REQUEST]
  }

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
    const { sessionPaymentId, sessionNrId } = this

    // TODO: We need to make sure we get the correct NR number here? Or somewhere soon...
    if (clearSession) {
      // TODO: Remove this one, we don't want to set the payment to session once we're done!
      // TODO: Or... we could add a debug payments mode?
      sessionStorage.removeItem('payment')
      // Clear the sessionStorage variables
      sessionStorage.removeItem('paymentInProgress')
      sessionStorage.removeItem('paymentId')
      sessionStorage.removeItem('paymentToken')
      sessionStorage.removeItem('nrId')
    }

    if (sessionNrId && sessionPaymentId) {
      // Get the payment
      await this.fetchNr(sessionNrId)
      // Get the payment
      await this.fetchNrPayment(sessionNrId, sessionPaymentId)
    }
  }

  async fetchNrPayment (nrId, paymentId) {
    try {
      const paymentResponse: NameRequestPaymentResponse = await paymentService.getNameRequestPayment(nrId, paymentId, {})
      const { payment, sbcPayment = { invoices: [] }, token, statusCode, completionDate } = paymentResponse

      await paymentModule.setPayment(payment)
      await paymentModule.setPaymentInvoice(sbcPayment.invoices[0])
    } catch (error) {
      if (error instanceof PaymentApiError) {
        await errorModule.setAppError({ id: 'payment-api-error', error: error.message } as ErrorI)
      } else {
        await errorModule.setAppError({ id: 'fetch-nr-payment-error', error: error.message } as ErrorI)
      }
    }
  }

  async fetchNr (nrId) {
    await newRequestModule.getNameReservation(nrId)
    // TODO: Display an error modal HERE if no NR response!
  }

  async completePayment (paymentId) {
    const { nrId } = this

    const result: NameRequestPayment = await newRequestModule.completePayment(nrId, paymentId, {})
    const paymentSuccess = result.paymentSuccess

    // TODO: Remove this when done implementing tests
    /* const paymentSuccess = false
    result.paymentErrors = [
      { id: 'payment-error', error: 'Something went wrong with the payment, cancelling the Name Request!' }
    ] */

    if (paymentSuccess) {
      paymentModule.toggleReceiptModal(true)
    } else if (!paymentSuccess && result.paymentErrors) {
      // Setting the errors to state will update any subscribing components, like the main ErrorModal
      await errorModule.setAppErrors(result.paymentErrors)
      // Cancel the NR using the rollback endpoint
      await newRequestModule.rollbackNameRequest({ nrId, action: rollbackActions.CANCEL })
    }
  }

  /**
   * Not currently in use... but might be useful later
   * @param paymentIdentifier
   * @param invoiceId
   */
  async fetchInvoice (paymentIdentifier, invoiceId) {
    const response = await paymentService.getInvoiceRequest(paymentIdentifier, {
      'invoice_id': invoiceId
    })
    await paymentModule.setPaymentInvoice(response)
  }

  /**
   * Not currently in use... right now receipt data isn't exposed anywhere,
   * there's just the PDF option in the Service BC Pay API
   * @param paymentIdentifier
   * @param invoiceId
   */
  async fetchReceipt (paymentIdentifier, invoiceId) {
    const response = await paymentService.getReceiptRequest(paymentIdentifier, invoiceId, {})
    await paymentModule.setPaymentReceipt(response)
  }

  /**
   * Grab the receipt PDF and download / display it for the user...
   * @param paymentIdentifier
   * @param invoiceId
   * @param data
   */
  async fetchReceiptPdf (paymentIdentifier, invoiceId, data) {
    try {
      const response = await paymentService.getReceiptRequest(paymentIdentifier, invoiceId, data)
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `payment-invoice-${invoiceId}.pdf`)
      document.body.appendChild(link)
      link.click()
    } catch (error) {
      if (error instanceof PaymentApiError) {
        await errorModule.setAppError({ id: 'fetch-receipt-pdf-api-error', error: error.message } as ErrorI)
      } else {
        await errorModule.setAppError({ id: 'fetch-receipt-pdf-error', error: error.message } as ErrorI)
      }
    }
  }
}
</script>
