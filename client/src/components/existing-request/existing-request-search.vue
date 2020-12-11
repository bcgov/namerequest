<template>
  <v-form v-model="isValid" lazy-validation @submit="handleSubmit()" class="mx-4 px-10 mb-9" ref="existing-nr-form">
    <v-row class="copy-normal mt-2">
      <!-- FIRST LINE -->
      <v-col cols="12">
        Enter the Name Request (NR) Number and either the Applicant's Phone Number or Email:
      </v-col>

      <!-- SECOND LINE -->
      <v-col cols="12" class="red--text" v-if="errorMessage">{{ errorMessage }}</v-col>

      <!-- THIRD LINE -->
    </v-row>
    <v-row align="center" class="ml-n9" dense>
      <v-col cols="1" class="mr-n4">
        <v-img src="../../assets/images/one-icon.png" contain height="34" />
      </v-col>
      <v-col class="max-height">
        <v-text-field :rules="nrRules"
                      :value="search.nrNum"
                      @input="setExistingRequestSearch('nrNum', $event)"
                      class="copy-normal"
                      filled
                      id="nr-num-text-field"
                      label="NR Number"
                      validate-on-blur />
      </v-col>
    </v-row>
    <v-row align="center" class="ml-n9 mt-2" dense>
      <!-- FOURTH LINE -->
      <v-col cols="1" class="mr-n4">
        <v-img src="../../assets/images/two-icon.png" contain height="34" />
      </v-col>
      <v-col class="max-height">
        <v-text-field :rules="phoneRules"
                      :validate-on-blur="validatePhoneOnBlur"
                      :value="search.phoneNumber"
                      @input="setExistingRequestSearch('phoneNumber', $event)"
                      class="copy-normal"
                      filled
                      id="phone-number-text-field"
                      label="Applicant's Phone Number" />
      </v-col>
      <v-col class="copy-normal text-center shrink mx-4"> or </v-col>
      <v-col class="max-height">
        <v-text-field :rules="emailRules"
                      :value="search.emailAddress"
                      @input="setExistingRequestSearch('emailAddress', $event)"
                      class="copy-normal"
                      filled
                      id="email-address-text-field"
                      label="Applicant's Notification Email"
                      validate-on-blur />
      </v-col>
    </v-row>
    <v-row class="text-center mt-2">
      <!-- FIFTH LINE -->
      <v-col>
        <v-btn @click="handleSubmit()">Retrieve Name Request</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import ForgotNrModal from '@/components/modals/forgot-nr.vue'
import newReqModule from '@/store/new-request-module'
import ErrorModule from '@/modules/error'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { NameRequestI, SearchDataI, NrDataResponseT, NrDataT } from '@/models'

const NR_REGEX = /^(NR\ ?L?|L?)?([\d]{6,8})$/
@Component({
  components: { ForgotNrModal }
})
export default class ExistingRequestSearch extends Vue {
  emailRules = [
    v => (!!v || !!this.search.phoneNumber) || 'Please enter either the phone or the email',
    v => !!this.search.phoneNumber || (!!v && /.+@.+\..+/.test(v)) || 'Please be sure to enter a valid email'
  ]
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
  get search () {
    return newReqModule.existingRequestSearch
  }
  get allowSubmit () {
    return (this.search.nrNum && (this.search.emailAddress || this.search.phoneNumber))
  }
  async handleSubmit (): Promise<boolean> {
    this.$refs['existing-nr-form']['validate']()
    await this.$nextTick()
    if (this.isValid) {
      try {
        await newReqModule.findNameRequest()
        return true
      } catch (e) {
        // FUTURE: handle error?
        return false
      }
    }
  }
  setExistingRequestSearch (key, value) {
    this.$refs['existing-nr-form']['resetValidation']()
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
