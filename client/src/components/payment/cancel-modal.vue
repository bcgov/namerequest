<template>
  <v-dialog width="40rem" :value="isVisible" persistent v-if="payments">
    <v-card>

      <v-card-title class="d-flex justify-space-between">
        <div>Cancel Name Request</div>
        <v-btn icon large class="dialog-close" @click="hideModal()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="text-body-1">
        The requested name choices will not be examined for use and will become
        available to be requested by other businesses.
      </v-card-text>

      <!-- FOR FUTURE USE -->
      <!-- <v-card-text class="text-body-1" v-if="emailAddress">
        An email confirming the cancellation of this Name Request will be sent to
        <strong>{{emailAddress}}</strong>.
      </v-card-text> -->

      <v-card-actions class="justify-center">
        <v-btn
          class="px-6 button-normal"
          id="cancel-nr-btn"
          :loading="loading"
          @click="confirmCancel()">Cancel this Name Request</v-btn>
        <v-btn
          class="px-6 button-blue"
          id="keep-nr-btn"
          @click="hideModal()">Keep this Name Request</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import PaymentModule from '@/modules/payment'
import PaymentMixin from '@/components/payment/payment-mixin'
import * as PaymentTypes from '@/modules/payment/store/types'
import { NrAction } from '@/enums'
import NameRequestMixin from '@/components/mixins/name-request-mixin'
import NewReqModule from '@/store/new-request-module'

@Component({})
export default class CancelModal extends Mixins(NameRequestMixin, PaymentMixin) {
  /** Used to display a fetch error, if any. */
  protected fetchError = ''

  /** Used to show loading state on button. */
  private loading = false

  private get emailAddress (): string {
    return this.applicant?.emailAddress
  }

  private get isVisible (): boolean {
    return PaymentModule[PaymentTypes.CANCEL_MODAL_IS_VISIBLE]
  }

  async showModal (): Promise<void> {
    await PaymentModule.toggleCancelModal(true)
  }

  /** Called when user clicks "Cancel this NR" button. */
  private async confirmCancel (): Promise<void> {
    this.loading = true
    await NewReqModule.patchNameRequestsByAction(NrAction.CANCEL)
    this.loading = false
    this.hideModal() // FUTURE: not needed? will success component be displayed instead?
  }

  /** Called when user clicks "Keep this NR" button. */
  private async hideModal (): Promise<void> {
    await PaymentModule.toggleCancelModal(false)
  }
}
</script>
