<template>
  <v-row align="center" class="pa-6 pl-8 pr-9 normal-copy">
    <v-col cols="12" class="pa-4">
      Enter Name Request Number or Business Name and either the Applicant's Phone or Email</v-col>
    <v-col cols="1" class="max-height">
      <v-img src="../../assets/images/one-icon.png"
                  contain
                  height="60" />
    </v-col>
    <!-- NR NUMBER -->
    <v-col cols="11" class="max-height">
      <v-text-field  :value="existingRequestSearch.nrNum"
                     @input="setExistingRequestSearch('nrNum', $event)"
                      filled
                      placeholder="Business Name or NR Number"
                      id="nr-num-text-field" />
    </v-col>
    <v-col cols="12" class="mr-auto mb-n3">

    </v-col>
    <v-col cols="1" class="max-height mt-4">
      <v-img src="../../assets/images/two-icon.png"
             contain
             style="margin-bottom: auto;"
             height="60" />
    </v-col>
    <v-col class="max-height mt-4">
      <v-text-field :value="existingRequestSearch.phoneNumber"
                    @input="setExistingRequestSearch('phoneNumber', $event)"
                    filled
                    id="phone-number-text-field"
                    placeholder="Applicant's Phone Number" />
    </v-col>
    <v-col class="max-height shrink mt-auto"> or </v-col>
    <v-col class="max-height mt-4">
      <v-text-field :value="existingRequestSearch.emailAddress"
                    @input="setExistingRequestSearch('emailAddress', $event)"
                    filled
                    placeholder="Applicant's Notification Email"
                    id="email-address-text-field" />
    </v-col>
    <v-col cols="12" class="mt-4">
      <div style="display: flex; width: 100%;">
        <div style="margin-left: auto" class="link-text">
          <v-btn @click="handleSubmit"
                 :disabled="!allowSubmit">Submit</v-btn></div>
      </div>

    </v-col>
  </v-row>
</template>

<script lang="ts">
import ForgotNrModal from '@/components/modals/forgot-nr.vue'
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'
import { RequestDataI, SearchDataI, NrDataResponseT, NrDataT } from '@/models'

@Component({
  components: { ForgotNrModal }
})
export default class ExistingRequstSearch extends Vue {
  mounted () {
    newReqModule.mutateExistingRequestSearchToInitialState()
  }

  get existingRequestSearch () {
    return newReqModule.existingRequestSearch
  }
  get allowSubmit () {
    let data = this.existingRequestSearch
    return (data.nrNum && (data.emailAddress || data.phoneNumber))
  }
  handleSubmit () {
    newReqModule.getNameRequests()
  }
  setExistingRequestSearch (key, value) {
    newReqModule.mutateExistingRequestSearch({ key, value })
  }
}

</script>

<style lang="sass" scoped>
.forgot-nr-link
  text-decoration: underline
  cursor: pointer !important

.max-height
  max-height: 60px

.no-style-button
  background-color: unset !important
  border: 0 !important
  border-radius: 0 !important
  box-shadow: unset !important

</style>
