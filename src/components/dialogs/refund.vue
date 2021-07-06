<template>
  <v-dialog width="40rem" :value="isVisible" persistent v-if="payments">
    <v-card>

      <v-card-title class="d-flex justify-space-between">
        <div>Cancel and Refund</div>
        <v-btn icon large class="dialog-close" @click="hideModal()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="text-body-1">
        This will cancel your Name Request and refund the Name Request fee, Priority Request
        fee (if any), and Service fees.
      </v-card-text>

      <v-card-text>
        <v-alert v-if="fetchError" color="error" icon="mdi-alert" outlined class="my-0" v-html="fetchError" />
        <refund-summary v-else :payments="payments" />
      </v-card-text>

      <v-card-text class="text-body-2">
        The refund will be applied to your original payment method and the requested name will not be
        examined for use. <template v-if="emailAddress">An email confirming the cancellation and
        refund of this Name Request will be sent to <strong>{{emailAddress}}</strong>.</template>
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn
          class="px-6 button-normal"
          id="cancel-nr-btn"
          :loading="loading"
          @click="confirmRefund()">Cancel this Name Request</v-btn>
        <v-btn
          class="px-6 button-blue"
          id="keep-nr-btn"
          @click="hideModal()">Keep this Name Request</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import RefundSummary from '@/components/payment/refund-summary.vue'
import { REFUND_MODAL_IS_VISIBLE } from '@/modules/payment/store/types'
import { NrAction } from '@/enums'
import { PaymentMixin, PaymentSessionMixin } from '@/mixins'
import { sleep } from '@/plugins'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import NamexServices from '@/services/namex.services'

@Component({
  components: {
    RefundSummary
  }
})
export default class RefundDialog extends Mixins(PaymentMixin, PaymentSessionMixin) {
  // Global getters
  @Getter getNrId!: number

  // Global actions
  @Action loadExistingNameRequest!: ActionBindingIF
  @Action setDisplayedComponent!: ActionBindingIF
  @Action toggleRefundModal!: ActionBindingIF

  /** Used to display a fetch error, if any. */
  protected fetchError = ''

  /** Used to show loading state on button. */
  private loading = false

  /** The model value for the dialog component. */
  private isVisible = false

  private get emailAddress (): string {
    return this.getApplicant?.emailAddress
  }

  /** Whether this modal should be shown (per store property). */
  private get showModal (): boolean {
    return this.$store.getters[REFUND_MODAL_IS_VISIBLE]
  }

  /** Clears store property to hide this modal. */
  private async hideModal (): Promise<void> {
    await this.toggleRefundModal(false)
  }

  /** Depending on value, fetches data and makes this modal visible or hides it. */
  @Watch('showModal')
  private async onShowModal (val: boolean) {
    if (val) {
      // only make visible on success, otherwise hide it
      if (await this.fetchData()) {
        this.isVisible = true
      } else {
        await this.hideModal()
      }
    } else {
      this.isVisible = false
    }
  }

  /** Called when user clicks "Cancel this NR" button. */
  private async confirmRefund (): Promise<void> {
    this.loading = true
    const data = await NamexServices.patchNameRequestsByAction(this.getNrId, NrAction.REQUEST_REFUND)
    if (data) {
      this.loading = false
      await this.hideModal()
      this.setDisplayedComponent('Success')
      await this.loadExistingNameRequest(data)
      await sleep(1000)
      this.setDisplayedComponent('ExistingRequestDisplay')
    } else {
      this.loading = false
      await this.hideModal()
    }
  }

  /**
   * Fetches the NR's payments.
   * @returns True if successful, otherwise False
   */
  private async fetchData (): Promise<boolean> {
    if (!this.getNrId) return false
    // NB: errors are handled by PaymentMixin
    return this.fetchNrPayments(this.getNrId)
  }

  @Watch('isVisible')
  onVisibleChanged (val: boolean) {
    if (val) {
      this.$nextTick(() => {
        if (this.$el?.querySelector instanceof Function) {
          // add classname to button text (for more detail in Sentry breadcrumbs)
          const refundCancelBtn = this.$el.querySelector('#cancel-nr-btn > span')
          if (refundCancelBtn) refundCancelBtn.classList.add('refund-cancel-btn')
          const refundKeepBtn = this.$el.querySelector('#keep-nr-btn > span')
          if (refundKeepBtn) refundKeepBtn.classList.add('refund-keep-btn')
        }
      })
    }
  }
}
</script>
