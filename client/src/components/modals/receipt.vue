<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card class="pa-9">
      <v-card-text class="h3">Payment Successful</v-card-text>
      <v-card-text class="normal-copy">
        <div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="hideModal" id="receipt-close-btn" class="normal" text>OK</v-btn>
        <v-btn @click="downloadReceipt" id="download-receipt-btn" class="primary" text>Download Receipt</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import paymentModule from '@/modules/payment'

import * as paymentService from '@/modules/payment/services'
import * as paymentTypes from '@/modules/payment/store/types'

import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component({
  components: {
  },
  data: () => ({
  }),
  computed: {
    isVisible: () => {
      return paymentModule[paymentTypes.RECEIPT_MODAL_IS_VISIBLE]
    }
  }
})
export default class ReceiptModal extends Vue {
  @Watch('isVisible')
  onModalShow (val: boolean, oldVal: string): void {
    if (val) {
      this.fetchInvoice()
      this.fetchReceipt()
    }
  }

  async showModal () {
    await paymentModule.toggleReceiptModal(true)
  }

  async hideModal () {
    await paymentModule.toggleReceiptModal(false)
  }

  async downloadReceipt () {
    // Reset
    window.location.href = 'http://localhost:8080/namerequest/'
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
