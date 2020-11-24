<template>
  <v-dialog width="40rem" :value="isVisible" persistent v-if="payments">
    <v-card>

      <v-card-title class="d-flex justify-space-between">
        <div>Cancel and Refund</div>
        <v-btn icon large color="primary" class="dialog-close" @click="hideModal()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="text-body-1">
        This will cancel your Name Request and refund the Name Request fee, Priority Request
        fee (if any), and Service fees.
      </v-card-text>

      <v-card-text>
        <v-alert v-if="fetchError" color="error" icon="mdi-alert" outlined>{{fetchError}}</v-alert>
        <refund-summary v-else :payments="payments" />
      </v-card-text>

      <v-card-text class="text-body-2">
        The refund will be applied to your original payment method and the requested name will not be
        examined for use. <template v-if="emailAddress">An email confirming the cancellation and
        refund of this Name Request will be sent to <strong>{{emailAddress}}</strong>.</template>
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn text
          id="refund-confirm-btn"
          class="primary"
          :loading="loading"
          @click="confirmRefund()">Cancel this Name Request</v-btn>
        <v-btn outlined
          id="refund-cancel-btn"
          class="outlined"
          @click="hideModal()">Keep this Name Request</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import PaymentModule from '@/modules/payment'
import PaymentMixin from '@/components/payment/payment-mixin'
import PaymentSessionMixin from '@/components/payment/payment-session-mixin'
import RefundSummary from '@/components/payment/refund-summary.vue'
import * as PaymentTypes from '@/modules/payment/store/types'
import NameRequestMixin from '@/components/mixins/name-request-mixin'
import NewReqModule from '@/store/new-request-module'

@Component({
  components: {
    RefundSummary
  }
})
export default class RefundModal extends Mixins(NameRequestMixin, PaymentMixin, PaymentSessionMixin) {
  /** Used to display a fetch error, if any. */
  protected fetchError = ''

  /** Used to show loading state on button. */
  private loading = false

  private get emailAddress (): string {
    return this.applicant?.emailAddress
  }

  private get isVisible (): boolean {
    return PaymentModule[PaymentTypes.REFUND_MODAL_IS_VISIBLE]
  }

  @Watch('isVisible')
  async onModalShow (val: boolean, oldVal: string): Promise<void> {
    await this.fetchData()
  }

  async showModal (): Promise<void> {
    await PaymentModule.toggleRefundModal(true)
  }

  /** Called when user clicks "Cancel this NR" button. */
  private async confirmRefund (): Promise<void> {
    this.loading = true
    await NewReqModule.patchNameRequestsByAction('REFUND')
    this.loading = false
    this.hideModal() // TODO: not needed? will success component be displayed instead?
  }

  /** Called when user clicks "Keep this NR" button. */
  private async hideModal (): Promise<void> {
    await PaymentModule.toggleRefundModal(false)
  }

  /** NOTE: This method makes use of the PaymentSectionMixin class! */
  private async fetchData (): Promise<void> {
    const { nrId } = this
    if (nrId) {
      // Get the payments if an NR ID has been set.
      await this.fetchNrPayments(nrId)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/theme.scss";

#refund-confirm-btn,
#refund-cancel-btn {
  text-transform: none;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
</style>
