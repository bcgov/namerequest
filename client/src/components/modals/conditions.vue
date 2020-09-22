<template>
  <v-dialog v-model="showModal" max-width="40%">
    <v-card class="pa-9">
      <v-card-text class="h4">{{ nameObject.name }}</v-card-text>
      <v-card-text class="h5 my-n2">Has been approved, subject to the following conditions:</v-card-text>
      <v-card-text class="copy-normal">
        <div class="pre-line px-2 pt-2 mb-n6">
          {{ nameObject.decision_text }}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text id="nr-required-close-btn" @click="showModal = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class ConditionsModal extends Vue {
  get nameObject () {
    if (this.nrNames.some(name => name.state === 'CONDITION' && name.decision_text)) {
      return this.nrNames.find(name => name.state === 'CONDITION' && name.decision_text)
    }
    return {}
  }
  get showModal () {
    return newReqModule.conditionsModalVisible
  }
  set showModal (value: boolean) {
    newReqModule.mutateConditionsModalVisible(value)
  }
  get nrNames () {
    return newReqModule.nrNames
  }
}

</script>

<style lang="sass" scoped>
.pre-line
  white-space: pre-line
</style>
