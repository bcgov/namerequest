<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card class="pa-9">
      <v-card-text class="h3">Make a Payment</v-card-text>
      <v-card-text class="normal-copy">
        <div>
          <fee-summary
            v-bind:filingData="[...paymentDetails]"
            v-bind:fees="[...paymentFees]"
          />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="createPayment" id="payment-pay-btn" class="primary" text>Accept</v-btn>
        <v-btn @click="hideModal" id="payment-close-btn" class="normal" text>Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import FeeSummary from '@/components/fee-summary.vue'

import paymentModule from '@/modules/payment'

import * as paymentService from '@/modules/payment/services'
import * as paymentTypes from '@/modules/payment/store/types'
import * as filingTypes from '@/modules/payment/filing-types'
import * as corpTypes from '@/modules/payment/corp-types'
import * as jurisdictions from '@/modules/payment/jurisdictions'

import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component({
  components: {
    FeeSummary
  },
  data: () => ({
  }),
  computed: {
    isVisible: () => {
      return paymentModule[paymentTypes.PAYMENT_MODAL_IS_VISIBLE]
    }
  }
})
export default class PaymentModal extends Vue {
  @Watch('isVisible')
  onModalShow (val: boolean, oldVal: string): void {
    if (val) {
      this.fetchFees()
    }
  }

  async showModal () {
    await paymentModule.togglePaymentModal(true)
  }

  async hideModal () {
    await paymentModule.togglePaymentModal(false)
  }

  async fetchFees () {
    const response = await paymentService.getPaymentFees({
      'corp_type': corpTypes.CR,
      'filing_type_code': filingTypes.NM606,
      'jurisdiction': jurisdictions.BC,
      'date': new Date().toISOString(),
      'priority': 'true'
    })
    await paymentModule.setPaymentFees(response.data)
  }

  async createPayment () {
    const response = await paymentService.createPaymentRequest({
      'payment_info': {
        'method_of_payment': 'CC'
      },
      // Use previously posted data, don't require this...
      'business_info': {
        'business_identifier': 'string',
        'business_name': 'string',
        'contact_info': {
          'first_name': 'string',
          'last_name': 'string',
          'address': 'string',
          'city': 'string',
          'province': 'string',
          'postal_code': 'string'
        }
      },
      // Use frontend data
      'filing_info': {
        'corp_type': 'string',
        'date': 'string',
        'filing_types': [
          {
            'filing_type_code': 'string',
            'priority': true,
            'filing_description': 'string'
          }
        ]
      }
    })

    const { invoices = [] } = response.data

    await paymentModule.setPayment(response.data)
    await paymentModule.setPaymentInvoice(invoices[0])

    this.hideModal()

    paymentModule.toggleReceiptModal(true)
  }

  async fetchInvoice () {
    const paymentId = null
    const response = await paymentService.getInvoiceRequest(paymentId, {})
    await paymentModule.setPaymentInvoice(response.data)
  }

  async fetchReceipt () {
    const paymentId = null
    const response = await paymentService.getReceiptRequest(paymentId, {})
    await paymentModule.setPaymentReceipt(response.data)
  }

  get paymentDetails () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_DETAILS]
  }

  get paymentFees () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_FEES]
  }
}
</script>
