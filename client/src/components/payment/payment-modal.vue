<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card class="pa-9">
      <v-card-text class="h3">Confirm Name Request</v-card-text>
      <v-card-text class="copy-normal">
        <request-details
          v-bind:applicant="applicant"
          v-bind:name="name"
          v-bind:nameChoices="nameChoices"
        />
        <fee-summary
          v-bind:filingData="[...paymentDetails]"
          v-bind:fees="[...paymentFees]"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="confirmPayment" id="payment-pay-btn" class="primary" text>Accept</v-btn>
        <v-btn @click="hideModal" id="payment-close-btn" class="normal" text>Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'

import FeeSummary from '@/components/payment/fee-summary.vue'
import RequestDetails from '@/components/common/request-details.vue'

import paymentModule from '@/modules/payment'
import { CreatePaymentParams } from '@/modules/payment/models'

import * as paymentTypes from '@/modules/payment/store/types'
import * as filingTypes from '@/modules/payment/filing-types'
import * as jurisdictions from '@/modules/payment/jurisdictions'
import * as paymentActions from './payment-actions'

import PaymentMixin from '@/components/payment/payment-mixin'
import PaymentSessionMixin from '@/components/payment/payment-session-mixin'
import NameRequestMixin from '@/components/mixins/name-request-mixin'

import { getBaseUrl } from './payment-utils'

@Component({
  components: {
    RequestDetails,
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
export default class PaymentModal extends Mixins(NameRequestMixin, PaymentMixin, PaymentSessionMixin) {
  @Watch('isVisible')
  onModalShow (val: boolean, oldVal: string): void {
    if (val) {
      const paymentConfig = {
        filingType: filingTypes.NM620,
        jurisdiction: jurisdictions.BC,
        priorityRequest: this.priorityRequest || false
      }

      this.fetchFees(paymentConfig)
    }
  }

  async showModal () {
    await paymentModule.togglePaymentModal(true)
  }

  async hideModal () {
    await paymentModule.togglePaymentModal(false)
  }

  async confirmPayment () {
    const { nrId, priorityRequest, paymentId } = this
    const onSuccess = (paymentResponse) => {
      const { token } = paymentResponse
      // Save to session
      this.savePaymentResponseToSession(paymentActions.COMPLETE, paymentResponse)

      const baseUrl = getBaseUrl()
      const redirectUrl = encodeURIComponent(`${baseUrl}/?paymentId=${paymentId}`)
      this.redirectToPaymentPortal(paymentId, token, redirectUrl)
    }

    this.createPayment({
      nrId: nrId,
      filingType: filingTypes.NM620,
      priorityRequest: priorityRequest
    } as CreatePaymentParams, onSuccess)
  }
}
</script>

<style lang="scss">
  .choice-indicator {
    background-color: #002e5e;
    color: white;
    border-radius: 100%;
    width: 1.75rem;
    height: 1.75rem;
    margin-right: 0.5rem;
    margin-bottom: 5px;
    box-sizing: border-box;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 0.8rem;
    font-weight: bold;
  }
</style>
