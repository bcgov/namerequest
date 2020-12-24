<template>
  <v-form v-model="isValid" lazy-validation @submit="handleSubmit()" class="pa-10" ref="existing-nr-form">
    <v-row no-gutters>
      <!-- FIRST LINE -->
      <v-col cols="12" class="h6 font-weight-regular">
        Enter the Name Request (NR) Number and either the Applicant's Phone Number or Email:
      </v-col>
    </v-row>

    <!-- SECOND LINE -->
    <v-row class="mt-5" no-gutters v-if="errorMessage">
      <v-col cols="12" class="red--text" v-html="errorMessage" />
    </v-row>

    <!-- THIRD LINE -->
    <v-row class="mt-5" no-gutters align="center">
      <v-col cols="1" class="max-width">
        <v-img src="../../assets/images/one-icon.png" contain width="34" height="34" />
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

    <!-- FOURTH LINE -->
    <v-row class="mt-5" no-gutters align="center">
      <v-col cols="1" class="max-width">
        <v-img src="../../assets/images/two-icon.png" contain width="34" height="34" />
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

    <!-- FIFTH LINE -->
    <v-row class="mt-8" no-gutters>
      <v-col class="text-center">
        <v-btn id="retrieve-name-btn" @click="handleSubmit()">Retrieve Name Request</v-btn>
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
  private errorMessage = ''
  private isValid = false

  mounted () {
    // add classname to button text (for more detail in Sentry breadcrumbs)
    this.$el.querySelector("#retrieve-name-btn > span")?.classList.add("retrieve-nr-btn")

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

  private emailRules = [
    v => (!!v || !!this.search.phoneNumber) || 'Please enter either the phone or the email',
    v => !!this.search.phoneNumber || (!!v && /.+@.+\..+/.test(v)) || 'Please be sure to enter a valid email'
  ]
  private nrRules = [
    v => NR_REGEX.test(v) || 'Please enter a valid NR number'
  ]
  private phoneRules = [
    v => v === '' || /^[\d ()\+-]+$/.test(v) || 'Please enter a numeric value'
  ]

  private get validatePhoneOnBlur () {
    return /^[\d ()-]+$/.test(this.nr.phoneNumber)
  }

  private get nr () {
    return newReqModule.nr
  }

  private get search () {
    return newReqModule.existingRequestSearch
  }

  private get allowSubmit () {
    return (this.search.nrNum && (this.search.emailAddress || this.search.phoneNumber))
  }

  private async handleSubmit (): Promise<void> {
    this.$refs['existing-nr-form']['validate']()
    await this.$nextTick()
    if (this.isValid) {
      await newReqModule.findNameRequest()
      if (this.nr?.failed) {
        // capture error text and then clear out the NR data
        this.errorMessage = this.nr.text
        newReqModule.mutateNameRequest({})
        return
      }
      // FUTURE: clear out applicant's phone and email ?
      // for (let key of ['emailAddress', 'phoneNumber']) {
      //   let value = ''
      //   newReqModule.mutateExistingRequestSearch({ key, value })
      // }
    }
  }

  private setExistingRequestSearch (key: string, value: string) {
    // auto-capitalize the entered NR number
    if (key === 'nrNum') value = value.toUpperCase()

    this.$refs['existing-nr-form']['resetValidation']()
    newReqModule.mutateExistingRequestSearch({ key, value })
    if (this.errorMessage) {
      this.errorMessage = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.col.max-width {
  max-width: 3rem;
}

.col.max-height {
  max-height: 60px;
}

#retrieve-name-btn {
  min-height: 45px !important;
  padding: 0 50px !important;
}
</style>
