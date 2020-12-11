<template>
  <!-- NB: dummy modal attach point so unit tests can see it -->
  <v-dialog v-model="showModal" width="50rem" attach="">
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <div>You don't need a Name Request if...</div>
      </v-card-title>
      <v-card-text class="copy-normal">
        <ol>
          <li>
            <b>You are already Federally Incorporated.</b><br>
            You do not require a name request. Please go to <a :href="corpOnlineLink" target="_blank">
            Corporate Online</a> to extra-provincially register your business.
          </li>
          <li class="my-3">
            <b>You want a numbered company. The business does not need a name.</b><br>
            You do not require a name request. If you are incorporating a Benefit company go to
            <a :href="businessRegistryLink" target="_blank">BC Business Registry</a>, otherwise go to
            <a :href="corpOnlineLink" target="_blank">Corporate Online</a>. A number will be assigned
            upon registering your business.
          </li>
          <li>
            <b>You are using your own name as the business name.</b><br>
            If you wish to use your own legal name for a sole proprietorship or general partnership, you do
            not need to submit a name request or register your business with us. However, you should inquire
            with the municipality to ensure you have the appropriate business licence(s), if required.
          </li>
        </ol>
      </v-card-text>
      <v-card-actions class="justify-center">
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
  private corpOnlineLink = 'https://www.corporateonline.gov.bc.ca/'
  private businessRegistryLink = "https://www.bcregistry.ca/business"

  get showModal () {
    return newReqModule.nrRequiredModalVisible
  }
  set showModal (value: boolean) {
    newReqModule.mutateNrRequiredModalVisible(value)
  }
}

</script>

<style lang="scss" scoped>
  #nr-required-close-btn {
    width: 6.375rem;
  }
  a {
    text-decoration: underline;
  }
</style>
