<template>
  <v-dialog v-model="showModal" max-width="45rem">
    <v-card>
      <v-card-title class="d-flex justify-space-between mt-n3">
        <div>Payment Not Received</div>
        <v-btn icon large class="dialog-close" @click="hideModal()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="copy-normal pt-8">
        <p>The payment for this Name Request was not received; leaving this page will result in
          this Name Request being deleted from BC Registries. Stay on this page to retry payment.
        </p>
        <br>
        <p>If your Name Request is deleted you will need to resubmit your name(s) with a new Name Request.
        </p>
      </v-card-text>
      <v-card-actions class="justify-center pt-6">
        <v-btn class="px-12" @click="exit()">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { DisplayedComponentMixin } from '@/mixins'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({})
export default class ExitIncompletePaymentDialog extends DisplayedComponentMixin {
  @Getter getExitIncompletePaymentVisible!: boolean
  @Action setExitIncompletePaymentVisible!: ActionBindingIF

  get showModal () {
    return this.getExitIncompletePaymentVisible
  }
  set showModal (value: boolean) {
  }
  hideModal () {
    this.setExitIncompletePaymentVisible(false)
  }

  exit () {
    this.hideModal()
    this.cancelAndResetState()
  }
}
</script>
