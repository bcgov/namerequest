<template>
  <v-form v-model="isValid" lazy-validation @submit="handleSubmit" class="pa-10">
    <v-row class="mx-0 copy-normal">
      <!-- FIRST LINE -->
      <v-col cols="12" class="mt-0">
        Enter the NR Number or Business Name and either the Applicant's Phone or Email:
      </v-col>

      <!-- SECOND LINE -->
      <v-col cols="12" class="red--text" v-if="errorMessage">{{ errorMessage }}</v-col>

      <!-- THIRD LINE -->
      <v-col cols="1" class="ml-n4 mr-4 max-height">
        <v-img src="../../assets/images/one-icon.png" contain height="60" />
      </v-col>
      <v-col cols="11" class="max-height">
        <v-text-field :value="existingRequestSearch.nrNum"
                       @input="setExistingRequestSearch('nrNum', $event)"
                       filled
                       validate-on-blur
                       :rules="nrRules"
                       placeholder="Business Name or NR Number"
                       id="nr-num-text-field" />
      </v-col>

      <!-- FOURTH LINE -->
      <v-col cols="1" class="ml-n4 mr-4 max-height">
        <v-img src="../../assets/images/two-icon.png" contain height="60" />
      </v-col>
      <v-col class="max-height">
        <v-text-field :value="existingRequestSearch.phoneNumber"
                      @input="setExistingRequestSearch('phoneNumber', $event)"
                      filled
                      :validate-on-blur="validatePhoneOnBlur"
                      :rules="phoneRules"
                      id="phone-number-text-field"
                      placeholder="Applicant's Phone Number" />
      </v-col>
      <v-col class="pt-4 px-6 max-height shrink">or</v-col>
      <v-col class="max-height">
        <v-text-field :value="existingRequestSearch.emailAddress"
                      :rules="emailRules"
                      @input="setExistingRequestSearch('emailAddress', $event)"
                      validate-on-blur
                      filled
                      placeholder="Applicant's Notification Email"
                      id="email-address-text-field" />
      </v-col>

      <!-- FIFTH LINE -->
      <v-col cols="12">
        <div style="display: flex; width: 100%;">
          <div style="margin-left: auto" class="colour-link">
            <v-btn @click="handleSubmit" :disabled="!allowSubmit || !isValid">Submit</v-btn>
          </div>
        </div>
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
