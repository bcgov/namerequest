<template>
  <v-dialog v-model="showModal" max-width="60%">
    <v-card class="pa-6">
      <v-card-title class="h3">Account Authorization</v-card-title>
      <v-card-text class="normal-copy">
        This account appears to be unable to access this name request, incorporation application, or business.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="showModal = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class AffiliationErrorModal extends Vue {
  get showModal () {
    return newReqModule.affiliationErrorModalVisible
  }
  set showModal (value: boolean) {
    newReqModule.mutateAffiliationErrorModalVisible(value)
  }
}
</script>

<style lang="sass" scoped>
</style>
