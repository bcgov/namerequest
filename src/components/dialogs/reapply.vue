<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card>

      <v-card-title class="d-flex justify-space-between">
        <div>Re-apply for Name</div>
      </v-card-title>

      <v-card-text class="copy-normal">
        <fee-summary
          :filingData="[...paymentDetails]"
          :fees="[...paymentFees]"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="confirmPayment()" id="payment-pay-btn" class="primary" text :loading="isLoadingPayment">
          Accept
        </v-btn>
        <v-btn @click="hideModal()" id="payment-close-btn" class="normal" text>Cancel</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script lang='ts'>
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import FeeSummary from '@/components/payment/fee-summary.vue'
import RequestDetails from '@/components/common/request-details.vue'
import PaymentModule from '@/modules/payment'
import { CreatePaymentParams } from '@/modules/payment/models'
import * as PaymentTypes from '@/modules/payment/store/types'
import * as FilingTypes from '@/modules/payment/filing-types'
import * as Jurisdictions from '@/modules/payment/jurisdictions'
import { PaymentAction } from '@/enums'
import { NameRequestMixin, PaymentMixin, PaymentSessionMixin, DisplayedComponentMixin } from '@/mixins'
import { getBaseUrl } from '@/components/payment/payment-utils'
import { ApplicantI, NameChoicesIF } from '@/interfaces'

@Component({
  components: {
    RequestDetails,
    FeeSummary
  }
})
export default class ReapplyDialog extends Mixins(
  PaymentMixin,
  PaymentSessionMixin,
  DisplayedComponentMixin
) {
  // Global getters
  @Getter getName!: string
  @Getter getNrId!: number
  @Getter getPriorityRequest!: boolean

  private isLoadingPayment: boolean = false
  /** The model value for the dialog component. */
  private isVisible = false

  /** Whether this modal should be shown (per store property). */
  private get showModal (): boolean {
    return PaymentModule[PaymentTypes.REAPPLY_MODAL_IS_VISIBLE]
  }

  /** Clears store property to hide this modal. */
  async hideModal () {
    this.isLoadingPayment = false
    await PaymentModule.toggleReapplyModal(false)
  }

  /** Depending on value, fetches fees and makes this modal visible or hides it. */
  @Watch('showModal')
  async onShowModal (val: boolean): Promise<void> {
    if (val) {
      const paymentConfig = {
        filingType: FilingTypes.NM620,
        jurisdiction: Jurisdictions.BC,
        priorityRequest: this.getPriorityRequest
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
    this.isLoadingPayment = true
    const { getNrId, getPriorityRequest } = this
    const onSuccess = (paymentResponse) => {
      const { paymentId, paymentToken } = this
      // Save response to session
      this.savePaymentResponseToSession(PaymentAction.REAPPLY, paymentResponse)
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
      action: PaymentAction.REAPPLY,
      nrId: getNrId,
      filingType: FilingTypes.NM620,
      priorityRequest: getPriorityRequest
    } as CreatePaymentParams, onSuccess)

    // on error, close this modal so error modal is visible
    if (!success) {
      await this.hideModal()
    }
  }

  @Watch('isVisible')
  onVisibleChanged (val: boolean) {
    if (val) {
      this.$nextTick(() => {
        if (this.$el?.querySelector instanceof Function) {
          // add classname to button text (for more detail in Sentry breadcrumbs)
          const reapplyAcceptBtn = this.$el.querySelector('#payment-pay-btn > span')
          if (reapplyAcceptBtn) reapplyAcceptBtn.classList.add('reapply-accept-btn')
          const reapplyCancelBtn = this.$el.querySelector('#payment-close-btn > span')
          if (reapplyCancelBtn) reapplyCancelBtn.classList.add('reapply-cancel-btn')
        }
      })
    }
  }
}
</script>
