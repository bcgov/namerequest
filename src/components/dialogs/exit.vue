<template>
  <v-dialog v-model="showModal" max-width="45rem">
    <v-card>
      <v-card-title class="d-flex justify-space-between mt-n3">
        <div>Exit</div>
        <v-btn icon large class="dialog-close" @click="hideModal()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="copy-normal pt-8">
        This will clear all of the information entered including your name choices,
        and return you to the search screen.
      </v-card-text>
      <v-card-actions class="justify-center pt-6">
        <v-btn class="px-6" @click="exit()">Exit</v-btn>
        <v-btn class="button-blue px-4" @click="hideModal()">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import { DisplayedComponentMixin } from '@/mixins'
import newReqModule from '@/store/new-request-module'

@Component({})
export default class ExitDialog extends DisplayedComponentMixin {
  get showModal () {
    return newReqModule.exitModalVisible
  }
  set showModal (value: boolean) {
  }
  hideModal () {
    newReqModule.mutateExitModalVisible(false)
  }

  exit () {
    this.hideModal()
    this.cancelAndResetState()
  }
}
</script>
