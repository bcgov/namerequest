<template>
  <!-- NB: dummy modal attach point so unit tests can see it -->
  <v-dialog
    v-model="showModal"
    width="45rem"
    attach=""
  >
    <v-card>
      <v-card-title>Help me Choose</v-card-title>
      <v-card-text class="copy-normal">
        Information to help you choose between Corporate Online and the new BC Business Registry
        will be displayed here.
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn
          id="numbered-company-help-close-btn"
          text
          @click="showModal = false"
        >
          Okay
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'pinia-class'
import { useStore } from '@/store'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({})
export default class NumberedCompanyHelpDialog extends Vue {
  @Getter(useStore) getNumberedCompanyHelpModalVisible!: boolean
  @Action(useStore) setNumberedCompanyHelpModalVisible!: ActionBindingIF

  get showModal () {
    return this.getNumberedCompanyHelpModalVisible
  }
  set showModal (value: boolean) {
    this.setNumberedCompanyHelpModalVisible(value)
  }
}
</script>

<style lang="scss" scoped>
#numbered-company-help-close-btn {
  width: 6.375rem;
}
</style>
