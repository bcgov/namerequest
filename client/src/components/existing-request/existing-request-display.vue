<template>
  <v-row align="center" class="pa-6 pl-8 pr-9" v-if="nrData.nrNumber">
    <v-col cols="12" class="pa-4">
       Thee following Name Request has been found:</v-col>
    <v-col cols="11" class="fs-24">
      <span class="h3 mr-2">{{ getPrefix }}{{ nrData.nrNumber }}</span> – {{ nrData.name }}
    </v-col>
    <v-col cols="1"><v-icon class="sz-20-text" @click="clearDisplay">close</v-icon></v-col>
    <v-col cols="12">
      <v-row>
        <v-col cols="9">
          <v-row dense>
            <v-col cols="12">
              <span class="bold-text">Status: </span> {{ nrData.status }}
            </v-col>
            <v-col cols="12">
              <span class="bold-text">Expiry Date: </span> {{ nrData.expiryDate }}
            </v-col>
            <v-col cols="12" v-if="nrData.conditions">
              <span class="bold-text">Condition/Consent: </span> {{ nrData.conditions }}
            </v-col>
            <v-col cols="12">
              <span class="bold-text">Submitting Party: </span> {{ nrData.applicantName }}
            </v-col>
            <v-col cols="12">
              <span class="bold-text">Address: </span> {{ nrData.address }}
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="3">
          <v-row dense>
            <v-col cols="12"><v-btn block>Reapply</v-btn></v-col>
            <v-col cols="12"><v-btn block>Extend Expiry</v-btn></v-col>
            <v-col cols="12"><v-btn block>Upload Consent</v-btn></v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import ForgotNrModal from '@/components/modals/forgot-nr.vue'
import newReqModule from '@/store/existing-request-module'
import { Component, Vue } from 'vue-property-decorator'
import { RequestDataI } from '@/models'

@Component({
  components: { ForgotNrModal }
})
export default class ExistingRequstDisplay extends Vue {
  get getPrefix (): string | null {
    if (this.nrData && this.nrData.nrNumber) {
      return 'NR ' + this.nrData.nrNumber
    }
    return null
  }
  get nrData (): RequestDataI | null {
    return newReqModule.requestData
  }

  clearDisplay (): void {
    newReqModule.setRequestData(null)
  }
}

</script>

<style lang="sass" scoped>
.max-height
  max-height: 60px

.no-style-button
  background-color: unset !important
  border: 0 !important
  border-radius: 0 !important
  box-shadow: unset !important

.forgot-nr-link
  text-decoration: underline
  cursor: pointer !important

</style>
