<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card class="pa-9">
      <v-card-text class='h3'>
        Upgrade to Priority
        <countdown-timer
          v-if="displayTimer"
          :timerName="timerName"
          colorString="#003366"
          bgColorString="#efefef"
          style="float: right"
        />
      </v-card-text>
      <v-card-text class="copy-normal">
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
import CountdownTimer from '@/components/session-timer/countdown-timer.vue'

import paymentModule from '@/modules/payment'
import { CreatePaymentParams } from '@/modules/payment/models'

import * as paymentTypes from '@/modules/payment/store/types'
import * as filingTypes from '@/modules/payment/filing-types'
import * as jurisdictions from '@/modules/payment/jurisdictions'
import { PaymentAction } from '@/enums'

import PaymentMixin from '@/components/payment/payment-mixin'
import PaymentSessionMixin from '@/components/payment/payment-session-mixin'
import NameRequestMixin from '@/components/mixins/name-request-mixin'
import DisplayedComponentMixin from '@/components/mixins/displayed-component-mixin'

import { getBaseUrl } from './payment-utils'

@Component({
  components: {
    RequestDetails,
    FeeSummary,
    CountdownTimer
  },
  data: () => ({
  }),
  computed: {
    isVisible: () => {
      return paymentModule[paymentTypes.UPGRADE_MODAL_IS_VISIBLE]
    }
  }
})
export default class UpgradeModal extends Mixins(
  NameRequestMixin,
  PaymentMixin,
  PaymentSessionMixin,
  DisplayedComponentMixin
) {
  /**
   * Optionally display the countdown timer.
   * This could be turned into a prop for easier configuration.
   */
  get displayTimer () {
    return false
  }

  get timerName () {
    return this.$PAYMENT_COMPLETION_TIMER_NAME
  }

  @Watch('isVisible')
  onModalShow (val: boolean, oldVal: string): void {
    if (val) {
      const paymentConfig = {
        filingType: filingTypes.NM606,
        jurisdiction: jurisdictions.BC,
        priorityRequest: this.priorityRequest || false
      }

      this.fetchFees(paymentConfig)
    }
  }

  async showModal () {
    await paymentModule.toggleUpgradeModal(true)
  }

  async hideModal () {
    await paymentModule.toggleUpgradeModal(false)
  }

  async confirmPayment () {
    const { nrId, priorityRequest } = this
    const onSuccess = (paymentResponse) => {
      const { paymentId, paymentToken } = this
      // Save to session
      this.savePaymentResponseToSession(PaymentAction.UPGRADE, paymentResponse)

      const baseUrl = getBaseUrl()
      const redirectUrl = encodeURIComponent(`${baseUrl}/nr/${nrId}/?paymentId=${paymentId}`)
      this.redirectToPaymentPortal(paymentId, paymentToken, redirectUrl)
    }

    this.createPayment({
      action: PaymentAction.UPGRADE,
      nrId: nrId,
      filingType: filingTypes.NM606,
      priorityRequest: priorityRequest
    } as CreatePaymentParams, onSuccess)
  }
}
</script>
