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
  }
})
export default class PaymentModal extends Mixins(
  NameRequestMixin,
  PaymentMixin,
  PaymentSessionMixin,
  DisplayedComponentMixin
) {
  private isLoadingPayment: boolean = false

  /** The model value for the dialog component. */
  private isVisible = false

  private get timerName () {
    return this.$PAYMENT_COMPLETION_TIMER_NAME
  }

  private get allowCancel (): boolean {
    return (typeof this.$props.onCancel === 'function')
  }

  /** Whether this modal should be shown (per store property). */
  private get showModal (): boolean {
    return PaymentModule[PaymentTypes.PAYMENT_MODAL_IS_VISIBLE]
  }

  /** Clears store property to hide this modal. */
  async hideModal () {
    this.isLoadingPayment = false
    await PaymentModule.togglePaymentModal(false)
  }

  /** Depending on value, fetches fees and makes this modal visible or hides it. */
  @Watch('showModal')
  async onShowModal (val: boolean): Promise<void> {
    if (val) {
      const paymentConfig = {
        filingType: FilingTypes.NM620,
        jurisdiction: Jurisdictions.BC,
        priorityRequest: this.priorityRequest || false
      }

      const { onActivate } = this.$props
      if (typeof onActivate === 'function') {
        onActivate(paymentConfig)
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

  /** Called when user clicks "Continue to Payment" button. */
  private async confirmPayment () {
    this.isLoadingPayment = true
    const { nrId, priorityRequest } = this
    const onSuccess = (paymentResponse) => {
      const { paymentId, paymentToken } = this
      // Save response to session
      this.savePaymentResponseToSession(PaymentAction.COMPLETE, paymentResponse)

      const baseUrl = getBaseUrl()
      const redirectUrl = encodeURIComponent(`${baseUrl}/nr/${nrId}/?paymentId=${paymentId}`)
      this.redirectToPaymentPortal(paymentId, paymentToken, redirectUrl)
    }

    const success = await this.createPayment({
      action: PaymentAction.COMPLETE,
      nrId: nrId,
      filingType: FilingTypes.NM620,
      priorityRequest: priorityRequest
    } as CreatePaymentParams, onSuccess)

    // on error, close this modal so error modal is visible
    if (!success) {
      this.hideModal()
    }
  }

  /** Called when user clicks "Cancel Name Request" button. */
  async cancelPayment () {
    // rollback the NR
    this.$props.onCancel()
    // close this modal
    this.hideModal()
  }
}
</script>
