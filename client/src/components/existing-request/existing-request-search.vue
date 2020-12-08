<template>
  <v-form v-model="isValid" lazy-validation @submit="handleSubmit" class="pa-10">
    <v-row class="ml-5 copy-normal">
      <!-- FIRST LINE -->
      <v-col cols="12" class="mt-0">
        Enter the NR Number or Business Name and either the Applicant's Phone or Email:
      </v-col>

      <!-- SECOND LINE -->
      <v-col cols="12" class="red--text" v-if="errorMessage">{{ errorMessage }}</v-col>

      <!-- THIRD LINE -->
    </v-row>
    <v-row align="center" class="mr-4" dense>
      <v-col cols="1" class="mr-n3">
        <v-img src="../../assets/images/one-icon.png" contain height="34" />
      </v-col>
      <v-col cols="11" class="max-height">
        <v-text-field :value="existingRequestSearch.nrNum"
                      @input="setExistingRequestSearch('nrNum', $event)"
                      class="copy-normal"
                      filled
                      validate-on-blur
                      :rules="nrRules"
                      label="NR Number"
                      id="nr-num-text-field" />
      </v-col>
    </v-row>
    <v-row align="center" dense class="mr-7">
      <!-- FOURTH LINE -->
      <v-col cols="1" class="mr-n3">
        <v-img src="../../assets/images/two-icon.png" contain height="34" />
      </v-col>
      <v-col class="max-height">
        <v-text-field :rules="phoneRules"
                      :validate-on-blur="validatePhoneOnBlur"
                      :value="existingRequestSearch.phoneNumber"
                      @input="setExistingRequestSearch('phoneNumber', $event)"
                      class="copy-normal"
                      filled
                      id="phone-number-text-field"
                      label="Applicant's Phone Number" />
      </v-col>
      <v-col class="copy-normal text-center px-6 shrink">or</v-col>
      <v-col class="max-height">
        <v-text-field :rules="emailRules"
                      :value="existingRequestSearch.emailAddress"
                      @input="setExistingRequestSearch('emailAddress', $event)"
                      class="copy-normal"
                      filled
                      id="email-address-text-field"
                      label="Applicant's Notification Email"
                      validate-on-blur />
      </v-col>
    </v-row>
    <v-row class="text-center">
      <!-- FIFTH LINE -->
      <v-col>
        <v-btn @click="handleSubmit" :disabled="!allowSubmit || !isValid">Retrieve Name Request</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import ForgotNrModal from '@/components/modals/forgot-nr.vue'
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { NameRequestI, SearchDataI, NrDataResponseT, NrDataT } from '@/models'

const NR_REGEX = /^(NR\ ?L?|L?)?([\d]{6,8})$/
@Component({
  components: { ForgotNrModal }
})
export default class ExistingRequestSearch extends Vue {
  emailRules = [ v => v === '' || /.+@.+\..+/.test(v) || 'Please be sure to enter a valid email' ]
  nrRules = [ v => NR_REGEX.test(v) || 'Please enter a valid NR number' ]
  errorMessage: string = ''
  phoneRules = [ v => v === '' || /^[\d ()\+-]+$/.test(v) || 'Please enter a numeric value' ]
  isValid: boolean = false

  mounted () {
    if (this.nr && this.nr.failed) {
      this.errorMessage = this.nr.text
      newReqModule.mutateNameRequest({})
      return
    }
    for (let key of ['emailAddress', 'phoneNumber']) {
      let value = ''
      newReqModule.mutateExistingRequestSearch({ key, value })
    }
  }
  get validatePhoneOnBlur () {
    return /^[\d ()-]+$/.test(this.nr.phoneNumber)
  }
  get nr () {
    return newReqModule.nr
  }
  get existingRequestSearch () {
    return newReqModule.existingRequestSearch
  }
  get allowSubmit () {
    let data = this.existingRequestSearch
    return (data.nrNum && (data.emailAddress || data.phoneNumber))
  }
  handleSubmit () {
    newReqModule.findNameRequest()
  }
  setExistingRequestSearch (key, value) {
    newReqModule.mutateExistingRequestSearch({ key, value })
    if (this.errorMessage) {
      this.errorMessage = ''
    }
  }
}
</script>

<style lang="sass" scoped>
.col
  padding: 0
  margin-top: 1.5rem

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
