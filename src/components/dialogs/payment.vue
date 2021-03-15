<template>
  <v-dialog max-width="45rem" :value="isVisible" persistent>
    <v-card>

      <v-card-title class="d-flex justify-space-between">
        <div>Confirm Name Request</div>
        <v-btn icon large class="dialog-close float-right" @click="hideModal()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="copy-normal pt-0">
        <request-details
          :applicant="getApplicant"
          :name="getName"
          :nameChoices="getNameChoices"
        />
        <fee-summary
          :filingData="[...paymentDetails]"
          :fees="[...paymentFees]"
        />
      </v-card-text>

      <v-card-actions class="pt-4">
        <v-btn v-if="allowCancel"
               @click="cancelPayment()"
               id="payment-cancel-btn"
               class="button-red px-4"
               text
               :disabled="isLoadingPayment">Cancel Name Request</v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="confirmPayment()"
               id="payment-pay-btn"
               class="primary px-4"
               text
               :loading="isLoadingPayment">Continue to Payment</v-btn>
        <v-btn @click="hideModal()"
               id="payment-close-btn"
               class="button-blue"
               :disabled="isLoadingPayment">Close</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script lang='ts'>
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import FeeSummary from '@/components/payment/fee-summary.vue'
import RequestDetails from '@/components/common/request-details.vue'
import PaymentModule from '@/modules/payment'
import { CreatePaymentParams } from '@/modules/payment/models'
import * as PaymentTypes from '@/modules/payment/store/types'
import * as FilingTypes from '@/modules/payment/filing-types'
import * as Jurisdictions from '@/modules/payment/jurisdictions'
import { PaymentAction } from '@/enums'
import { PaymentMixin, PaymentSessionMixin, DisplayedComponentMixin } from '@/mixins'
import { getBaseUrl } from '@/components/payment/payment-utils'
import { ApplicantI, NameChoicesIF } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({
  components: {
    RequestDetails,
    FeeSummary
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
export default class PaymentDialog extends Mixins(
  PaymentMixin,
  PaymentSessionMixin,
  DisplayedComponentMixin
) {
  // Global getters
  @Getter getName!: string
  @Getter getNrId!: number
  @Getter getApplicant!: ApplicantI
  @Getter getNameChoices!: NameChoicesIF
  @Getter getPriorityRequest!: boolean

  private isLoadingPayment: boolean = false

  /** The model value for the dialog component. */
  private isVisible = false

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
        priorityRequest: this.getPriorityRequest || false
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
    const { getNrId, getPriorityRequest } = this

    const onSuccess = (paymentResponse) => {
      const { paymentId, paymentToken } = this
      // Save response to session
      this.savePaymentResponseToSession(PaymentAction.CREATE, paymentResponse)
      // see if redirect is needed else go to existing NR screen
      const baseUrl = getBaseUrl()
      const redirectUrl = encodeURIComponent(`${baseUrl}/nr/${getNrId}/?paymentId=${paymentId}`)
      if (paymentResponse.sbcPayment.isPaymentActionRequired) {
        this.redirectToPaymentPortal(paymentId, paymentToken, redirectUrl)
      } else {
        window.location.href = redirectUrl
      }
    }

    const success = await this.createPayment({
      action: PaymentAction.CREATE,
      nrId: getNrId,
      filingType: FilingTypes.NM620,
      priorityRequest: getPriorityRequest
    } as CreatePaymentParams, onSuccess)

    // on error, close this modal so error modal is visible
    if (!success) {
      await this.hideModal()
    }
  }

  /** Called when user clicks "Cancel Name Request" button. */
  async cancelPayment () {
    // rollback the NR
    this.$props.onCancel()
    // close this modal
    await this.hideModal()
  }

  @Watch('isVisible')
  onVisibleChanged (val: boolean) {
    if (val) {
      this.$nextTick(() => {
        if (this.$el?.querySelector instanceof Function) {
          // add classname to button text (for more detail in Sentry breadcrumbs)
          const confirmNrCancelBtn = this.$el.querySelector('#payment-cancel-btn > span')
          if (confirmNrCancelBtn) confirmNrCancelBtn.classList.add('confirm-nr-cancel-btn')
          const confirmNrContinueBtn = this.$el.querySelector('#payment-pay-btn > span')
          if (confirmNrContinueBtn) confirmNrContinueBtn.classList.add('confirm-nr-continue-btn')
          const confirmNrCloseBtn = this.$el.querySelector('#payment-close-btn > span')
          if (confirmNrCloseBtn) confirmNrCloseBtn.classList.add('confirm-nr-close-btn')
        }
      })
    }
  }
}
</script>
