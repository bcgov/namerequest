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
        <span>Time Remaining - 10:00</span>
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
    isVisible: () => {
      // Check for a payment ID in sessionStorage, if it has been set, we've been redirected away from the application,
      // and need to rehydrate the application using the payment ID (for now, it could be some other token too)!
      // TODO: Set the timer here!
      const paymentInProgress: boolean = (sessionStorage.getItem('paymentInProgress') === 'true')
      const paymentId = (paymentInProgress && sessionStorage.getItem('paymentId'))
        ? parseInt(sessionStorage.getItem('paymentId'))
        : undefined

      if (paymentId) {
        // Clear the sessionStorage variables
        sessionStorage.removeItem('paymentInProgress')
        sessionStorage.removeItem('paymentId')

        paymentModule.toggleReceiptModal(true)
      }

      return paymentModule[paymentTypes.RECEIPT_MODAL_IS_VISIBLE]
    }
  }
})
export default class ReceiptModal extends Vue {
  @Watch('isVisible')
  onModalShow (val: boolean, oldVal: string): void {
    if (val) {
      // this.fetchInvoice()
      // this.fetchInvoices()
      this.fetchReceipt()
    }
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
    // Reset
    window.location.href = 'http://localhost:8080/namerequest/'
  }

  async fetchInvoices () {
    const paymentId = 'abcd123'
    const response = await paymentService.getInvoicesRequest(paymentId, {})
    await paymentModule.setPaymentInvoice(response.data[0])
  }

  async fetchInvoice () {
    const paymentId = 'abcd123'
    const response = await paymentService.getInvoiceRequest(paymentId, {
      'invoice_id': '123'
    })
    await paymentModule.setPaymentInvoice(response.data)
  }

  async fetchReceipt () {
    const paymentId = 'abcd123'
    const response = await paymentService.getReceiptRequest(paymentId, {})
    await paymentModule.setPaymentReceipt(response.data)
  }

  get paymentInvoice () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_INVOICE]
  }

  get paymentReceipt () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_RECEIPT]
  }
}
</script>
