<template>
  <v-form v-model="isValid" ref="step3" id="applicant-info-3-form">
    <v-container fluid class="pa-0 mt-5" id="applicant-info-3">
      <v-row>
        <v-col cols="2" class="h6 align-self-start pt-0">Contact Info</v-col>
        <v-col cols="5" class="py-0">
          <v-text-field :messages="messages['contact']"
                        :value="applicant.contact"
                        @blur="messages = {}"
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
                        :rules="phoneRules"
                        @blur="messages = {}"
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
                        @input="mutateApplicant('clientFirstName', $event)"
                        filled
                        hide-details="auto"
                        label="First Name" />
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['clientLast']"
                        :value="applicant.clientLastName"
                        @blur="messages = {}"
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
            content-class="top-tooltip"
            transition="fade-transition"
          >
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-textarea :messages="messages['nature']"
                            :rules="businessNatureRules"
                            :value="getNrData.natureBusinessInfo"
                            @blur="messages = {}"
                            @input="mutateNRData('natureBusinessInfo', $event)"
                            filled
                            hide-details="auto"
                            label="Nature of Business"
                            no-resize
                            rows="3" />
              </div>
            </template>
            <span>
              Nature of business information collected is for name review purposes only.
              What is entered here does not limit the business activities of your company.
            </span>
          </v-tooltip>
        </v-col>
        <v-col cols="5" align-self="start">
          <v-tooltip top
            content-class="top-tooltip"
            transition="fade-transition"
          >
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-textarea :messages="messages['additional']"
                            :value="getNrData.additionalInfo"
                            :rules="additionalInfoRules"
                            @blur="messages = {}"
                            @input="mutateNRData('additionalInfo', $event)"
                            filled
                            hide-details="auto"
                            label="Additional Information (Optional)"
                            no-resize
                            rows="3" />
              </div>
            </template>
            <span>
              Enter information you think Registries staff should know to help them review your
              name such as details regarding previous name requests, related business, etc.
            </span>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="2" />
        <v-col cols="5" v-if="showCorpNum">
          <v-tooltip top
            content-class="top-tooltip"
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
            <span>
              Enter the BC incorporation number of your business.
            </span>
          </v-tooltip>
        </v-col>
        <v-col cols="5">
          <v-tooltip top
            content-class="top-tooltip"
            transition="fade-transition"
          >
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-text-field :messages="messages['tradeMark']"
                              :value="getNrData.tradeMark"
                              :rules="trademarkRules"
                              @blur="messages = {}"
                              @input="mutateNRData('tradeMark', $event)"
                              filled
                              hide-details="auto"
                              label="Registered Canadian Trademark (Optional)" />
              </div>
            </template>
            <span>
              If your name is a registered trademark in Canada, enter your trademark name and registration number.
            </span>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col cols="2" />
        <v-col cols="5" align-self="center" class="py-0" v-if="showPriorityRequest">
          <v-tooltip top
            content-class="top-tooltip"
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
            <span>
              Priority name requests are typically reviewed within 1-2 business days.
            </span>
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
import { Action, Getter } from 'vuex-class'

import ApplicantInfoNav from '@/components/common/applicant-info-nav.vue'
import { ApplicantI, SubmissionTypeT } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({
  components: {
    ApplicantInfoNav
  }
})
export default class ApplicantInfo3 extends Vue {
  // Global getters
  @Getter getCorpNum!: string
  @Getter getIsPersonsName!: boolean
  @Getter getApplicant!: ApplicantI
  @Getter getIsPriorityRequest!: boolean
  @Getter getEditMode!: boolean
  @Getter getLocation!: string
  @Getter getNrData!: any
  @Getter getNrState!: string
  @Getter getRequestActionCd!: string
  @Getter getShowPriorityRequest!: boolean
  @Getter getShowCorpNum!: string
  @Getter getSubmissionType!: SubmissionTypeT

  // Global actions
  @Action setApplicantDetails!: ActionBindingIF
  @Action setCorpNum!: ActionBindingIF
  @Action setIsLoadingSubmission!: ActionBindingIF
  @Action setNRData!: ActionBindingIF
  @Action setPriorityRequest!: ActionBindingIF
  @Action fetchCorpNum!: ActionBindingIF
  @Action submit!: ActionBindingIF

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
    v => !!this.validateCorpNum(v) || 'Cannot validate number. Please try again.'
  ]
  emailRules = [
    (v: string) => !!v || 'Required field',
    (v: string) => {
      // eslint-disable-next-line max-len
      const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return pattern.test(v) || 'Not a valid email'
    },
    (v: string) => (!v || v.length <= 75) || 'Cannot exceed 75 characters'
  ]
  phoneRules = [
    v => !!v || 'Required field',
    v => (!v || v.length <= 30) || 'Cannot exceed 30 characters'
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
    return this.getApplicant
  }
  get corpNum () {
    return this.getCorpNum
  }
  get isPersonsName () {
    return this.getIsPersonsName
  }
  get location () {
    return this.getLocation
  }
  get priorityRequest () {
    return this.getIsPriorityRequest
  }
  get request_action_cd () {
    return this.getRequestActionCd
  }
  get showAllFields () {
    return (!this.getEditMode || this.getNrState === 'DRAFT')
  }
  get showCorpNum () {
    return this.getShowCorpNum
  }
  get showPriorityRequest () {
    return this.getShowPriorityRequest
  }
  get submissionType () {
    return this.getSubmissionType
  }
  get xproJurisdiction () {
    return (this.getNrData || {}).xproJurisdiction
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
    this.setCorpNum(num)
  }
  set priorityRequest (value) {
    this.setPriorityRequest(value)
  }

  async validateCorpNum (num): Promise<boolean> {
    if (!num) {
      return
    }
    if (num.length < 4) {
      this.corpNumError = 'Too short. Please confirm number.'
      return
    }
    this.loading = true
    try {
      await this.fetchCorpNum(num)
      this.corpNumError = ''
      this.loading = false
      this.corpNumDirty = false
      return true
    } catch (error) {
      this.corpNumError = 'Error validating number. Please try again.'
      this.loading = false
      this.corpNumDirty = false
      return false
    }
  }
  mutateApplicant (key, value) {
    this.setApplicantDetails({ key, value })
  }
  mutateNRData (key, value) {
    this.setNRData({ key, value })
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
        if (this.$el?.querySelector instanceof Function) {
          // add classname to button text (for more detail in Sentry breadcrumbs)
          const clientReviewBackBtn = this.$el.querySelector('#submit-back-btn > span')
          if (clientReviewBackBtn) clientReviewBackBtn.classList.add('client-review-back-btn')
          const clientReviewConfirmBtn = this.$el.querySelector('#submit-continue-btn > span')
          if (clientReviewConfirmBtn) clientReviewConfirmBtn.classList.add('client-review-confirm-btn')
        }
      })
    }
  }

  async nextAction () {
    this.setIsLoadingSubmission(true)
    this.validate()
    if (this.isValid) {
      await this.submit(null)
    }
    // hang on to the loading state for a bit
    // to prevent users clicking button again while next component displays
    setTimeout(() => this.setIsLoadingSubmission(false), 1000)
  }
}
</script>
<style lang="scss" scoped>
::v-deep .v-textarea textarea {
  line-height: 1.375rem !important;
  font-size: 0.875rem !important;
}
</style>
