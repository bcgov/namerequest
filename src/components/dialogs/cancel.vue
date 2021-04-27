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
        The requested name choices will become available to be requested by other businesses.
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
import { Action, Getter } from 'vuex-class'

import { PaymentMixin } from '@/mixins'
import { sleep } from '@/plugins'

import { NrAction } from '@/enums'
import { ApplicantI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { CANCEL_MODAL_IS_VISIBLE } from '@/modules/payment/store/types'
import NamexServices from '@/services/namex.services'

@Component({})
export default class CancelDialog extends Mixins(PaymentMixin) {
  // Global Getters
  @Getter getApplicant!: ApplicantI
  @Getter getNrId!: number

  @Action setDisplayedComponent!: ActionBindingIF
  @Action setNameRequest!: ActionBindingIF
  @Action toggleCancelModal!: ActionBindingIF

  /** Used to show loading state on button. */
  private loading = false

  private get emailAddress (): string {
    return this.getApplicant?.emailAddress
  }

  private get isVisible (): boolean {
    return this.$store.getters[CANCEL_MODAL_IS_VISIBLE]
  }

  async showModal (): Promise<void> {
    await this.toggleCancelModal(true)
  }

  /** Called when user clicks "Cancel this NR" button. */
  private async confirmCancel (): Promise<void> {
    this.loading = true
    const data = await NamexServices.patchNameRequestsByAction(this.getNrId, NrAction.CANCEL)
    if (data) {
      this.setNameRequest(data)
      this.loading = false
      await this.hideModal()
      this.setDisplayedComponent('Success')
      await sleep(1000)
      this.setDisplayedComponent('ExistingRequestDisplay')
    } else {
      this.loading = false
      await this.hideModal()
    }
  }

  /** Called when user clicks "Keep this NR" button. */
  private async hideModal (): Promise<void> {
    await this.toggleCancelModal(false)
  }
}
</script>
