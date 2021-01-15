<template>
  <v-form v-model="isValid" ref="step3" id="applicant-info-3-form">
    <v-container fluid class="pa-0 mt-5" id="applicant-info-3">
      <v-row>
        <v-col cols="2" class="h6 align-self-start pt-0">Contact Info</v-col>
        <v-col cols="5" class="py-0">
          <v-text-field :messages="messages['contact']"
                        :value="applicant.contact"
                        @blur="messages = {}"
                        @focus="messages['contact'] = 'Contact Name (Optional)'"
                        @input="mutateApplicant('contact', $event)"
                        filled
                        hide-details="auto"
                        label="Contact Name (Optional)" />
        </v-col>
        <v-col cols="5" class="py-0">
          <v-text-field :messages="messages['email']"
                        :rules="emailRules"
                        :value="applicant.emailAddress"
                        @blur="messages = {}"
                        @focus="messages['email'] = 'Notification Email'"
                        @input="mutateApplicant('emailAddress', $event)"
                        filled
                        hide-details="auto"
                        label="Email Address (for notifications)" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="2" />
        <v-col cols="5">
          <v-text-field :messages="messages['phone']"
                        :value="applicant.phoneNumber"
                        v-mask="['(###) ###-####']"
                        :rules="phoneRules"
                        @blur="messages = {}"
                        @focus="messages['phone'] = 'Phone Number'"
                        @input="mutateApplicant('phoneNumber', $event)"
                        filled
                        hide-details="auto"
                        label="Phone Number" />
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['fax']"
                        :value="applicant.faxNumber"
                        :rules="faxRules"
                        @blur="messages = {}"
                        @focus="messages['fax'] = 'Fax Number (Optional)'"
                        @input="mutateApplicant('faxNumber', $event)"
                        filled
                        hide-details="auto"
                        label="Fax Number (Optional)" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="2" class="h6">Client</v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['clientFirst']"
                        :value="applicant.clientFirstName"
                        @blur="messages = {}"
                        @focus="messages['clientFirst'] = 'First Name'"
                        @input="mutateApplicant('clientFirstName', $event)"
                        filled
                        hide-details="auto"
                        label="First Name" />
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['clientLast']"
                        :value="applicant.clientLastName"
                        @blur="messages = {}"
                        @focus="messages['clientLast'] = 'Last Name'"
                        @input="mutateApplicant('clientLastName', $event)"
                        filled
                        hide-details="auto"
                        label="Last Name" />
        </v-col>
      </v-row>

      <v-row v-if="showAllFields">
        <v-col cols="2" class="h6">About The Business</v-col>
        <v-col cols="5" align-self="start">
          <v-tooltip top
            content-class="top-tooltip contact-tooltip"
            transition="fade-transition"
          >
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-textarea :messages="messages['nature']"
                            :rules="businessNatureRules"
                            :value="nrData.natureBusinessInfo"
                            @blur="messages = {}"
                            @focus="messages['nature'] = 'Nature of Business'"
                            @input="mutateNRData('natureBusinessInfo', $event)"
                            filled
                            hide-details="auto"
                            label="Nature of Business"
                            no-resize
                            rows="3" />
              </div>
            </template>
            <p>
              Nature of business information collected is for name review purposes only.
              What is entered here does not limit the business activities of your company.
            </p>
          </v-tooltip>
        </v-col>
        <v-col cols="5" align-self="start">
          <v-tooltip top
            content-class="top-tooltip contact-tooltip"
            transition="fade-transition"
          >
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-textarea :messages="messages['additional']"
                            :value="nrData.additionalInfo"
                            :rules="additionalInfoRules"
                            @blur="messages = {}"
                            @focus="messages['additional'] = 'Additional Info'"
                            @input="mutateNRData('additionalInfo', $event)"
                            filled
                            hide-details="auto"
                            label="Additional Information (Optional)"
                            no-resize
                            rows="3" />
              </div>
            </template>
            <p>
              Enter information you think Registries staff should know to help them review your
              name such as details regarding previous name requests, related business, etc.
            </p>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="2" />
        <v-col cols="5" v-if="showCorpNum">
          <v-tooltip top
            content-class="top-tooltip contact-tooltip"
            transition="fade-transition"
          >
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-text-field :messages="messages['corpNum']"
                              :rules="corpNumRules"
                              :error-messages="corpNumError"
                              validate-on-blur
                              @blur="messages = {}"
                              :loading="loading"
                              @focus="messages['corpNum'] = 'Incorporation or Registration Number'"
                              filled
                              v-on:update:error="setError"
                              :hide-details="hideCorpNum"
                              label="Incorporation or Registration Number"
                              v-model="corpNum">
                  <template v-slot:append>
                    <v-icon :class="showCorpNumErrorState ? 'red--text' : 'green--text'"
                            v-if="hideCorpNum === 'auto'">
                      {{ error || loading || corpNumDirty ? 'mdi-close' : 'mdi-check' }}</v-icon>
                  </template>
                </v-text-field>
              </div>
            </template>
            <p>
              Enter the BC incorporation number of your business.
            </p>
          </v-tooltip>
        </v-col>
        <v-col cols="5">
          <v-tooltip top
            content-class="top-tooltip contact-tooltip"
            transition="fade-transition"
          >
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-text-field :messages="messages['tradeMark']"
                              :value="nrData.tradeMark"
                              :rules="trademarkRules"
                              @blur="messages = {}"
                              @focus="messages['tradeMark'] = 'Registered Canadian Trademark (Optional)'"
                              @input="mutateNRData('tradeMark', $event)"
                              filled
                              hide-details="auto"
                              label="Registered Canadian Trademark (Optional)" />
              </div>
            </template>
            <p>
              If your name is a registered trademark in Canada, enter your trademark name and registration number.
            </p>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col cols="2" />
        <v-col cols="5" align-self="center" class="py-0" v-if="showPriorityRequest">
          <v-tooltip top
            content-class="top-tooltip contact-tooltip"
            transition="fade-transition"
          >
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-checkbox
                  hide-details
                  v-model="priorityRequest"
                  class="mt-0 pt-0"
                >
                  <template v-slot:label>
                    <span>Make this a Priority Request <b>($100)</b></span>
                  </template>
                </v-checkbox>
              </div>
            </template>
            <p>
              Priority name requests are typically reviewed within 1-2 business days.
            </p>
          </v-tooltip>
        </v-col>
        <v-col v-else cols="5" class="py-0" />
        <ApplicantInfoNav @nextAction="nextAction()" />
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { mask } from 'vue-the-mask'
import ApplicantInfoNav from '@/components/common/applicant-info-nav.vue'
import newReqModule, { NewRequestModule } from '@/store/new-request-module'
import paymentModule from '@/modules/payment'
import NameRequestMixin from '@/components/mixins/name-request-mixin'

@Component({
  components: {
    ApplicantInfoNav
  },
  directives: { mask }
})
export default class ApplicantInfo3 extends NameRequestMixin {
  corpNumDirty: boolean = false
  corpNumError: string = ''
  additionalInfoRules = [
    v => (!v || v.length <= 120) || 'Cannot exceed 120 characters'
  ]
  businessNatureRules = [
    v => !!v || 'Required field',
    v => (!v || v.length <= 1000) || 'Cannot exceed 1000 characters'
  ]
  corpNumRules = [
    v => !!v || 'Required field',
    v => !!this.getCorpNum(v) || 'Cannot validate number.  Please try again'
  ]
  emailRules = [
    v => !!v || 'Required field',
    v => /.+@.+\..+/.test(v) || 'Not a valid email',
    v => (!v || v.length <= 75) || 'Cannot exceed 75 characters'
  ]
  phoneRules = [
    v => !!v || 'Required field',
    v => (v.length === 0 || v.length === 14) || 'Not a valid Phone number'
  ]
  faxRules = [
    v => (!v || v.length <= 30) || 'Cannot exceed 30 characters'
  ]
  trademarkRules = [
    v => (!v || v.length <= 100) || 'Cannot exceed 100 characters'
  ]
  error: boolean = false
  isValid: boolean = false
  hideCorpNum: boolean | 'auto' = true
  loading: boolean = false
  messages = {}

  @Watch('xproJurisdiction')
  async hanldeJurisdiction (newVal, oldVal) {
    if (newVal !== oldVal) {
      await this.$nextTick()
      this.validate()
    }
  }

  get applicant () {
    return newReqModule.applicant
  }
  get corpNum () {
    return newReqModule.corpNum
  }
  get isPersonsName () {
    return newReqModule.isPersonsName
  }
  get location () {
    return newReqModule.location
  }
  get priorityRequest () {
    return newReqModule.priorityRequest
  }
  get request_action_cd () {
    return newReqModule.request_action_cd
  }
  get showAllFields () {
    return (!this.editMode || this.nrState === 'DRAFT')
  }
  get showCorpNum () {
    return newReqModule.showCorpNum
  }
  get showPriorityRequest () {
    return newReqModule.showPriorityRequest
  }
  get submissionType () {
    return newReqModule.submissionType
  }
  get xproJurisdiction () {
    return (newReqModule.nrData || {}).xproJurisdiction
  }
  set corpNum (num) {
    if (!this.corpNumDirty) {
      this.corpNumDirty = true
    }
    if (this.isValid) {
      this.isValid = false
    }
    if (this.hideCorpNum !== 'auto') {
      this.hideCorpNum = 'auto'
    }
    newReqModule.mutateCorpNum(num)
  }
  set priorityRequest (value) {
    newReqModule.mutatePriorityRequest(value)
  }

  clearValidation () {
    if (this.$refs.step3 as Vue) {
      (this.$refs.step3 as any).resetValidation()
    }
    this.corpNumError = ''
  }
  async getCorpNum (num) {
    if (!num) {
      return
    }
    if (num.length < 4) {
      this.corpNumError = 'Too short.  Please confirm number.'
      return
    }
    this.loading = true
    try {
      let resp = await newReqModule.getCorpNum(num)
      this.corpNumError = ''
      this.loading = false
      this.corpNumDirty = false
      return true
    } catch (error) {
      this.corpNumError = 'Error validating number. Please try again'
      this.loading = false
      this.corpNumDirty = false
      return false
    }
  }
  mutateApplicant (key, value) {
    this.clearValidation()
    newReqModule.mutateApplicant({ key, value })
  }
  mutateNRData (key, value) {
    this.clearValidation()
    newReqModule.mutateNRData({ key, value })
  }
  setError (error) {
    this.error = error
  }
  validate () {
    if (this.hideCorpNum !== 'auto') {
      this.hideCorpNum = 'auto'
    }
    if (this.$refs.step3 as any) {
      (this.$refs.step3 as any).validate()
    }
  }

  @Watch('isValid')
  onValidChanged (val: boolean) {
    if (val) {
      this.$nextTick(() => {
        // add classname to button text (for more detail in Sentry breadcrumbs)
        this.$el.querySelector("#submit-back-btn > span")?.classList.add("client-review-back-btn")
        this.$el.querySelector("#submit-continue-btn > span")?.classList.add("client-review-confirm-btn")
      })
    }
  }

  nextAction () {
    this.validate()
    if (this.isValid) {
      this.next()
    }
  }
}
</script>
<style lang="scss" scoped>
.contact-tooltip {
  padding: 15px 0 0 0 !important;
  text-align: center;
  width: 380px !important;
}

::v-deep .v-textarea textarea {
  line-height: 1.375rem !important;
  font-size: 0.875rem !important;
}
</style>
