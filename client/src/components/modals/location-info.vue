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
          <button @click="showModal = false"><v-icon>close</v-icon> Close</button>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class LocationInfoModal extends Vue {
  get showModal () {
    return newReqModule.locationInfoModalVisible
  }
  set showModal (value: boolean) {
    newReqModule.mutateLocationInfoModalVisible(value)
  }
}

</script>
