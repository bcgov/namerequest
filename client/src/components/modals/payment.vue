<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card class="pa-9">
      <v-card-text class="h3">Make a Payment</v-card-text>
      <v-card-text class="normal-copy">
        <div>
          <sbc-fee-summary v-bind:filingData="[...feeDataOrDefault]"></sbc-fee-summary>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="createPayment" id="payment-pay-btn" text>Accept</v-btn>
        <v-btn @click="showModal = false" id="payment-close-btn" text>Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'

import * as paymentService from '@/modules/payment/services'
import * as paymentTypes from '@/modules/payment/store/types'

import paymentModule from '@/modules/payment'

// import PaymentCalculator from './payment-calculator.vue'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  components: {
    // PaymentCalculator,
    SbcFeeSummary
  },
  data: () => ({
    filingData: {
      filingTypeCode: '', // mandatory
      entityType: '', // mandatory
      filingDescription: '',
      waiveFees: false,
      priority: false,
      futureEffective: false
    },
    feeData: {
      filingTypeCode: 'OTANN',
      entityType: 'CP',
      filingDescription: '',
      waiveFees: false,
      priority: false,
      futureEffective: false
    }
  }),
  computed: {
    isVisible: () => {
      return paymentModule[paymentTypes.PAYMENT_MODAL_IS_VISIBLE]
    }
  }
})
export default class PaymentModal extends Vue {
  mounted () {
    this.fetchFees()
  }

  get showModal () {
    return null
  }

  set showModal (value: boolean) {
  }

  async fetchFees () {
    const response = await paymentService.getPaymentFees({})
    await this.$store.dispatch(paymentTypes.GET_PAYMENT_FEES, response)
  }

  async createPayment () {
    const response = await paymentService.createPaymentRequest({})
    await this.$store.dispatch(paymentTypes.GET_PAYMENT_REQUEST, response)
  }

  async fetchInvoice () {
    const paymentId = null
    const response = await paymentService.getInvoiceRequest(paymentId, {})
    await this.$store.dispatch(paymentTypes.GET_PAYMENT_INVOICE, response)
  }

  async fetchReceipt () {
    const paymentId = null
    const response = await paymentService.getReceiptRequest(paymentId, {})
    await this.$store.dispatch(paymentTypes.GET_PAYMENT_RECEIPT, response)
  }

  fileAR () {
    /* do your filing logic here */

    this.$data.feeData = {
      filingTypeCode: 'OTANN',
      entityType: 'CP',
      filingDescription: '',
      waiveFees: false,
      priority: false,
      futureEffective: false
    }
  }

  clearAllFiling () {
    /* do your filing logic here */
    this.$data.feeData = []
    // console.log("Change Prop1:" + JSON.stringify(this.$data.feeData))
  }
  fileARandDirectorChangeAndAddress () {
    /* do your filing logic here */
    this.$data.feeData = [{
      filingTypeCode: 'OTANN',
      entityType: 'CP',
      filingDescription: 'COPS Annual Fee',
      waiveFees: false,
      priority: false,
      futureEffective: false
    },
    {
      filingTypeCode: 'OTADD',
      entityType: 'CP',
      filingDescription: 'Director Change Fee',
      waiveFees: false,
      priority: true,
      futureEffective: false
    },
    {
      filingTypeCode: 'OTAOAD',
      entityType: 'CP',
      filingDescription: 'Address',
      waiveFees: false,
      priority: false,
      futureEffective: true
    }]
  }

  get feeDataOrDefault () {
    return this.$data.feeData || this.$data.filingData
  }
}
</script>
