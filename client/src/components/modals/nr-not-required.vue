<template>
  <v-dialog v-model="showModal" max-width="40%">
    <v-card class="pa-9">
      <v-card-text class="h3">You don't need a Name Request if you...</v-card-text>
      <v-card-text class="copy-normal">
        <ol>
          <li>
            <b>You are already Federally Incorporated</b><br>
            You do not require a name request. Please proceed to COLIN to extra-provincially register your business.
          </li>
          <li class="my-3">
            <b>You want a numbered company. The business does not need a name.</b><br>
            You do not require a name request. Please proceed to COLIN to register your business. A number will be
            assigned upon registering your business.
          </li>
          <li>
            <b>You are using your own name as the business name</b><br>
            If you are using your full name to start a sole proprietorship, you do not need to submit a name request or
            register with us. However, you should check with the municipality you will operate your business in for
            appropriate business licenses.
          </li>
        </ol>
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
export default class NrNotRequired extends Vue {
  get showModal () {
    return newReqModule.nrRequiredModalVisible
  }
  set showModal (value: boolean) {
    newReqModule.mutateNrRequiredModalVisible(value)
  }
}

</script>
