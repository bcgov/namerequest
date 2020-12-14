<template>
  <v-dialog max-width="50%" :value="isVisible" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <div>Confirm Name Request</div>
        <countdown-timer :timerName="timerName" colorString="#003366" bgColorString="#efefef" style="float: right"/>
      </v-card-title>

      <v-card-text class="copy-normal pt-0">
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
        <v-btn v-if="allowCancel"
               @click="cancelPayment()"
               id="payment-cancel-btn"
               class="error"
               text
               :disabled="isLoadingPayment">Cancel Name Request</v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="confirmPayment()"
               id="payment-pay-btn"
               class="primary"
               text
               :loading="isLoadingPayment">Continue to Payment</v-btn>
        <v-btn @click="hideModal()"
               id="payment-close-btn"
               class="normal"
               text
               :disabled="isLoadingPayment">Close</v-btn>
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
  private isLoadingPayment: boolean = false
  get timerName () {
    return this.$PAYMENT_COMPLETION_TIMER_NAME
  }

  get allowCancel (): boolean {
    return (typeof this.$props.onCancel === 'function')
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
    this.isLoadingPayment = false
    await paymentModule.togglePaymentModal(false)
  }

  async confirmPayment () {
    this.isLoadingPayment = true
    const { nrId, priorityRequest } = this
    const onSuccess = (paymentResponse) => {
      const { paymentId, paymentToken } = this
      // Save to session
      this.savePaymentResponseToSession(PaymentAction.COMPLETE, paymentResponse)

      const baseUrl = getBaseUrl()
      const redirectUrl = encodeURIComponent(`${baseUrl}/nr/${nrId}/?paymentId=${paymentId}`)
      this.redirectToPaymentPortal(paymentId, paymentToken, redirectUrl)
    }

    this.createPayment({
      action: PaymentAction.COMPLETE,
      nrId: nrId,
      filingType: filingTypes.NM620,
      priorityRequest: priorityRequest
    } as CreatePaymentParams, onSuccess)
  }

  async cancelPayment () {
    this.$props.onCancel()
    this.hideModal()
  }
}
</script>
