<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card>

      <v-card-title class="d-flex justify-space-between">
        <div>Upgrade to Priority</div>
      </v-card-title>

      <v-card-text class="copy-normal">
        <FeeSummary
          :filingData="[...paymentDetails]"
          :fees="[...paymentFees]"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="confirmPayment()" id="payment-pay-btn" class="primary" text :loading="isLoadingPayment">
          Accept
        </v-btn>
        <v-btn @click="hideModal()" id="payment-close-btn" class="button-gray" text>Cancel</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import FeeSummary from '@/components/payment/fee-summary.vue'
import { CreatePaymentParams } from '@/modules/payment/models'
import { UPGRADE_MODAL_IS_VISIBLE } from '@/modules/payment/store/types'
import * as FilingTypes from '@/modules/payment/filing-types'
import * as Jurisdictions from '@/modules/payment/jurisdictions'
import { PaymentAction } from '@/enums'
import { PaymentMixin, PaymentSessionMixin, DisplayedComponentMixin } from '@/mixins'
import { getBaseUrl } from '@/components/payment/payment-utils'
import { ApplicantI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({
  components: {
    FeeSummary
  }
})
export default class UpgradeDialog extends Mixins(
  PaymentMixin,
  PaymentSessionMixin,
  DisplayedComponentMixin
) {
  // Global getters
  @Getter getNrId!: number
  @Getter getApplicant!: ApplicantI
  @Getter getPriorityRequest!: boolean

  @Action toggleUpgradeModal!: ActionBindingIF

  private isLoadingPayment: boolean = false
  /** The model value for the dialog component. */
  private isVisible = false

  /** Whether this modal should be shown (per store property). */
  private get showModal (): boolean {
    return this.$store.getters[UPGRADE_MODAL_IS_VISIBLE]
  }

  /** Clears store property to hide this modal. */
  async hideModal () {
    this.isLoadingPayment = false
    await this.toggleUpgradeModal(false)
  }

  /** Depending on value, fetches fees and makes this modal visible or hides it. */
  @Watch('showModal')
  async onShowModal (val: boolean): Promise<void> {
    if (val) {
      const paymentConfig = {
        filingType: FilingTypes.NM606,
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
      this.savePaymentResponseToSession(PaymentAction.UPGRADE, paymentResponse)
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
      action: PaymentAction.UPGRADE,
      nrId: getNrId,
      filingType: FilingTypes.NM606,
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
          const upgradeAcceptBtn = this.$el.querySelector('#payment-pay-btn > span')
          if (upgradeAcceptBtn) upgradeAcceptBtn.classList.add('upgrade-accept-btn')
          const upgradeCancelBtn = this.$el.querySelector('#payment-close-btn > span')
          if (upgradeCancelBtn) upgradeCancelBtn.classList.add('upgrade-cancel-btn')
        }
      })
    }
  }
}
</script>
