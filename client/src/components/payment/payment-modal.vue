<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card class="pa-9">
      <v-card-text class="h3">
        Confirm Name Request
        <countdown-timer :timerName="timerName" colorString="#003366" bgColorString="#efefef" style="float: right"/>
      </v-card-text>
      <v-card-text class="copy-normal">
        <request-details
          :applicant="applicant"
          :name="name"
          :nameChoices="nameChoices"
        />
        <fee-summary
          :filingData="[...paymentDetails]"
          :fees="[...paymentFees]"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="confirmPayment" id="payment-pay-btn" class="primary" text>Accept</v-btn>
        <v-btn @click="cancelPayment" id="payment-close-btn" class="normal" text>Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang='ts'>
import { Component, Mixins, Watch } from 'vue-property-decorator'

import FeeSummary from '@/components/payment/fee-summary.vue'
import RequestDetails from '@/components/common/request-details.vue'
import CountdownTimer from '@/components/session-timer/countdown-timer.vue'

import paymentModule from '@/modules/payment'
import { CreatePaymentParams } from '@/modules/payment/models'

import * as paymentTypes from '@/modules/payment/store/types'
import * as filingTypes from '@/modules/payment/filing-types'
import * as jurisdictions from '@/modules/payment/jurisdictions'
import * as paymentActions from './payment-actions'

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
  props: {
    onActivate: {
      type: Function,
      default: async () => undefined
    },
    onCancel: {
      type: Function,
      default: async () => {}
    }
  },
  computed: {
    isVisible: () => {
      return paymentModule[paymentTypes.PAYMENT_MODAL_IS_VISIBLE]
    }
  }
})
export default class PaymentModal extends Mixins(
  NameRequestMixin,
  PaymentMixin,
  PaymentSessionMixin,
  DisplayedComponentMixin
) {
  get timerName () {
    return this.$PAYMENT_COMPLETION_TIMER_NAME
  }

  @Watch('isVisible')
  async onModalShow (val: boolean, oldVal: string): Promise<void> {
    if (val) {
      const paymentConfig = {
        filingType: filingTypes.NM620,
        jurisdiction: jurisdictions.BC,
        priorityRequest: this.priorityRequest || false
      }

      const { onActivate } = this.$props
      if (typeof onActivate === 'function') {
        onActivate(paymentConfig)
      }

      await this.fetchFees(paymentConfig)
    }
  }

  async showModal () {
    await paymentModule.togglePaymentModal(true)
  }

  async hideModal () {
    await paymentModule.togglePaymentModal(false)
  }

  async confirmPayment () {
    const { nrId, priorityRequest } = this
    const onSuccess = (paymentResponse) => {
      const { paymentId, paymentToken } = this
      // Save to session
      this.savePaymentResponseToSession(paymentActions.COMPLETE, paymentResponse)

      const baseUrl = getBaseUrl()
      const redirectUrl = encodeURIComponent(`${baseUrl}/nr/${nrId}/?paymentId=${paymentId}`)
      this.redirectToPaymentPortal(paymentId, paymentToken, redirectUrl)
    }

    this.createPayment({
      action: paymentActions.COMPLETE,
      nrId: nrId,
      filingType: filingTypes.NM620,
      priorityRequest: priorityRequest
    } as CreatePaymentParams, onSuccess)
  }

  async cancelPayment () {
    const { onCancel } = this.$props
    if (typeof onCancel === 'function') {
      onCancel()
    }

    this.hideModal()
  }
}
</script>
