<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card>

      <v-card-title class="d-flex justify-space-between">
        <div>Upgrade to Priority</div>
        <countdown-timer
          v-if="displayTimer"
          :timerName="timerName"
          colorString="#003366"
          bgColorString="#efefef"
          style="float: right"
        />
      </v-card-title>

      <v-card-text class="copy-normal">
        <fee-summary
          :filingData="[...paymentDetails]"
          :fees="[...paymentFees]"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="confirmPayment()" id="payment-pay-btn" class="primary" text>Accept</v-btn>
        <v-btn @click="hideModal()" id="payment-close-btn" class="normal" text>Cancel</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import FeeSummary from '@/components/payment/fee-summary.vue'
import RequestDetails from '@/components/common/request-details.vue'
import CountdownTimer from '@/components/session-timer/countdown-timer.vue'
import PaymentModule from '@/modules/payment'
import { CreatePaymentParams } from '@/modules/payment/models'
import * as PaymentTypes from '@/modules/payment/store/types'
import * as FilingTypes from '@/modules/payment/filing-types'
import * as Jurisdictions from '@/modules/payment/jurisdictions'
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
  }
})
export default class UpgradeModal extends Mixins(
  NameRequestMixin,
  PaymentMixin,
  PaymentSessionMixin,
  DisplayedComponentMixin
) {
  /** The model value for the dialog component. */
  private isVisible = false

  /**
   * Optionally display the countdown timer.
   * This could be turned into a prop for easier configuration.
   */
  private get displayTimer () {
    return false
  }

  private get timerName () {
    return this.$PAYMENT_COMPLETION_TIMER_NAME
  }

  /** Whether this modal should be shown (per store property). */
  private get showModal (): boolean {
    return PaymentModule[PaymentTypes.UPGRADE_MODAL_IS_VISIBLE]
  }

  /** Clears store property to hide this modal. */
  async hideModal () {
    await PaymentModule.toggleUpgradeModal(false)
  }

  /** Depending on value, fetches fees and makes this modal visible or hides it. */
  @Watch('showModal')
  async onShowModal (val: boolean): Promise<void> {
    if (val) {
      const paymentConfig = {
        filingType: FilingTypes.NM606,
        jurisdiction: Jurisdictions.BC,
        priorityRequest: this.priorityRequest || false
      }

      // only make visible on success, otherwise hide it
      if (await this.fetchFees(paymentConfig)) {
        this.isVisible = true
      } else {
        await this.hideModal()
      }
    } else {
      this.isVisible = false
    }
  }

  /** Called when user clicks "Accept" button. */
  private async confirmPayment () {
    const { nrId, priorityRequest } = this
    const onSuccess = (paymentResponse) => {
      const { paymentId, paymentToken } = this
      // Save response to session
      this.savePaymentResponseToSession(PaymentAction.UPGRADE, paymentResponse)

      const baseUrl = getBaseUrl()
      const redirectUrl = encodeURIComponent(`${baseUrl}/nr/${nrId}/?paymentId=${paymentId}`)
      this.redirectToPaymentPortal(paymentId, paymentToken, redirectUrl)
    }

    const success = await this.createPayment({
      action: PaymentAction.UPGRADE,
      nrId: nrId,
      filingType: FilingTypes.NM606,
      priorityRequest: priorityRequest
    } as CreatePaymentParams, onSuccess)

    // on error, close this modal so error modal is visible
    if (!success) {
      this.hideModal()
    }
  }
}
</script>
