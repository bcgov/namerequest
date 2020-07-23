<template>
  <v-form v-model="isValid" lazy-validation @submit="handleSubmit">
  <v-row align="center" class="pa-6 pl-8 pr-9 normal-copy">
    <v-col cols="12" class="pa-4">
      Enter the NR Number or Business Name and either the Applicant's Phone or Email</v-col>
    <v-col cols="12" class="px-4 mt-n4 red--text" v-if="errorMessage">{{ errorMessage }}</v-col>
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
                       validate-on-blur
                       :rules="nrRules"
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
                      :validate-on-blur="validatePhoneOnBlur"
                      :rules="phoneRules"
                      id="phone-number-text-field"
                      placeholder="Applicant's Phone Number" />
      </v-col>
      <v-col class="max-height shrink mt-auto"> or </v-col>
      <v-col class="max-height mt-4">
        <v-text-field :value="existingRequestSearch.emailAddress"
                      :rules="emailRules"
                      @input="setExistingRequestSearch('emailAddress', $event)"
                      validate-on-blur
                      filled
                      placeholder="Applicant's Notification Email"
                      id="email-address-text-field" />
      </v-col>
      <v-col cols="12" class="mt-4">
        <div style="display: flex; width: 100%;">
          <div style="margin-left: auto" class="link-text">
            <v-btn @click="handleSubmit"
                   :disabled="!allowSubmit || !isValid">Submit</v-btn></div>
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

@Component({
  components: { ForgotNrModal }
})
export default class ExistingRequstSearch extends Vue {
  emailRules = [ v => v === '' || /.+@.+\..+/.test(v) || 'Please be sure to enter a valid email' ]
  nrRules = [ v => v.length === 7 || 'Please enter a valid NR number' ]
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
    newReqModule.getNameRequests()
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
