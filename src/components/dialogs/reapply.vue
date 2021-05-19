<template>
  <v-dialog max-width="35rem" :value="isVisible" persistent>
    <v-card>

      <v-card-title class="d-flex justify-space-between">
        <div>Renew Name Request</div>
        <v-btn icon large class="dialog-close float-right pa-0" @click="hideModal()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <div class="copy-normal pt-8">
        Renew your Name Request for an additional 56 days from the current expiry date.
      </div>

      <v-card-text class="copy-normal">
        <FeeSummary
          :filingData="[...paymentDetails]"
          :fees="[...paymentFees]"
        />
      </v-card-text>

      <v-row no-gutters justify="center" class="pt-8">
        <v-col cols="auto">
          <v-btn @click="confirmPayment()" id="payment-pay-btn" class="primary" text :loading="isLoadingPayment">
            Continue to Payment
          </v-btn>
        </v-col>
        <v-col cols="auto" class="pl-3">
          <v-btn @click="hideModal()" id="payment-close-btn" class="button button-blue" text>Cancel</v-btn>
        </v-col>
      </v-row>

    </v-card>
  </v-dialog>
</template>

<script lang='ts'>
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import FeeSummary from '@/components/payment/fee-summary.vue'
import { CreatePaymentParams } from '@/modules/payment/models'
import { REAPPLY_MODAL_IS_VISIBLE } from '@/modules/payment/store/types'
import * as FilingTypes from '@/modules/payment/filing-types'
import * as Jurisdictions from '@/modules/payment/jurisdictions'
import { PaymentAction } from '@/enums'
import { PaymentMixin, PaymentSessionMixin, DisplayedComponentMixin } from '@/mixins'
import { getBaseUrl } from '@/components/payment/payment-utils'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({
  components: {
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

  @Action toggleReapplyModal!: ActionBindingIF

  private isLoadingPayment: boolean = false
  /** The model value for the dialog component. */
  private isVisible = false

  /** Whether this modal should be shown (per store property). */
  private get showModal (): boolean {
    return this.$store.getters[REAPPLY_MODAL_IS_VISIBLE]
  }

  /** Clears store property to hide this modal. */
  async hideModal () {
    this.isLoadingPayment = false
    await this.toggleReapplyModal(false)
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
