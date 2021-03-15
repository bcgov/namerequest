<template>
  <v-dialog v-model="showModal" max-width="60%">
    <v-card class="notify-dialog">
      <v-card-title>
        <slot name="icon">
          <v-icon large color="error">mdi-alert</v-icon>
        </slot>
        <span>
          <slot name="title">Error Adding Name Request</slot>
        </span>
      </v-card-title>
      <v-card-text>
        <slot name="text">The specified name request has already been affiliated.</slot>
      </v-card-text>
      <v-card-actions>
        <v-btn large color="error" @click="showModal = false" data-test="dialog-ok-button">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({})
export default class AffiliationErrorDialog extends Vue {
  @Getter getAffiliationErrorModalVisible!: boolean
  @Action setAffiliationErrorModalVisible!: ActionBindingIF

  get showModal () {
    return this.getAffiliationErrorModalVisible
  }
  set showModal (value: boolean) {
    this.setAffiliationErrorModalVisible(value)
  }
}
</script>

<style lang="scss" scoped>
  .notify-dialog .v-card__title {
    flex-direction: column;

    ::v-deep i {
      margin-top: 1rem;
      margin-bottom: 1rem;
    }
  }

  .notify-dialog .v-card__text {
    text-align: center;
  }

  .notify-dialog .v-card__actions {
    justify-content: center;
    padding: 1.5rem;
  }
</style>
