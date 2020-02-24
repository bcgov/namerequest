<template>
  <v-dialog v-model="showModal" max-width="20%">
    <v-card class="pa-9">
      <v-card-text class="h3">Choose Locatiom</v-card-text>
      <v-card-text class="normal-copy">
        <ul>
          <li>
            <b>BC</b><br>
            Choose this option if you are in the Province of British Columbia
          </li>
          <li class="my-3">
            <b>Canada</b><br>
            Choose this option if you are in any Provice or Territory other than BC
          </li>
          <li>
            <b>Foreign</b><br>
            Choose this option if you are anywhere else.
          </li>
        </ul>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text id="location-info-close-btn" @click="showModal = false">Close</v-btn>
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
