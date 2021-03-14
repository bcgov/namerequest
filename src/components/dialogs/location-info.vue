<template>
  <v-dialog v-model="showModal" width="550" hide-overlay>
    <v-card class="pa-0">
      <v-card-text class="h4 px-3 pt-2">Choose Location</v-card-text>
      <v-card-text class="copy-small">
        <ul>
          <li>
            <b>BC</b><br>
            Choose this option if you are in the Province of British Columbia
          </li>
          <li class="my-4">
            <b>Canada</b><br>
            Choose this option if you are in any Provice or Territory other than BC
          </li>
          <li>
            <b>Foreign</b><br>
            Choose this option if you are anywhere else.
          </li>
        </ul>
      </v-card-text>
      <v-card-actions class="bg-grey-1 text-center">
        <div style="display: block; width: 100%;">
          <button @click="showModal = false"><v-icon>mdi-close</v-icon> Close</button>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({})
export default class LocationInfoDialog extends Vue {
  @Getter getLocationInfoModalVisible!: boolean
  @Action setLocationInfoModalVisible!: ActionBindingIF

  get showModal () {
    return this.getLocationInfoModalVisible
  }
  set showModal (value: boolean) {
    this.setLocationInfoModalVisible(value)
  }
}

</script>
