<template>
  <v-form v-model="isValid" ref="step3" id="applicant-info-3-form">
    <v-container fluid class="pa-0 mt-5" id="applicant-info-3">
      <v-row>
        <v-col cols="12" md="2" lg="2" class="h6 align-self-start pt-0">Contact Info</v-col>
        <v-col cols="12" md="5" lg="5" class="py-0">
          <v-text-field :messages="messages['contact']"
                        :value="applicant.contact"
                        @blur="messages = {}"
                        @input="updateApplicant('contact', $event)"
                        filled
                        hide-details="auto"
                        label="Contact Name (Optional)" />
        </v-col>
        <v-col cols="12" md="5" lg="5" class="py-0" :class="{ 'pt-6': isMobile }">
          <v-text-field :messages="messages['email']"
                        :rules="emailRules"
                        :value="applicant.emailAddress"
                        @blur="messages = {}"
                        @input="updateApplicant('emailAddress', $event)"
                        filled
                        hide-details="auto"
                        label="Email Address (for notifications)" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="2" lg="2" />
        <v-col cols="12" md="5" lg="5">
          <v-text-field :messages="messages['phone']"
                        :value="applicant.phoneNumber"
                        :rules="phoneRules"
                        @blur="messages = {}"
                        @input="updateApplicant('phoneNumber', $event.trim())"
                        filled
                        hide-details="auto"
                        label="Phone Number" />
        </v-col>
        <v-col cols="12" md="5" lg="5">
          <v-text-field :messages="messages['fax']"
                        :value="applicant.faxNumber"
                        :rules="faxRules"
                        @blur="messages = {}"
                        @input="updateApplicant('faxNumber', $event)"
                        filled
                        hide-details="auto"
                        label="Fax Number (Optional)" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="2" lg="2" class="h6">Client</v-col>
        <v-col cols="12" md="5" lg="5">
          <v-text-field :messages="messages['clientFirst']"
                        :value="applicant.clientFirstName"
                        @blur="messages = {}"
                        @input="updateApplicant('clientFirstName', $event)"
                        filled
                        hide-details="auto"
                        label="First Name (Optional)" />
        </v-col>
        <v-col cols="12" md="5" lg="5">
          <v-text-field :messages="messages['clientLast']"
                        :value="applicant.clientLastName"
                        @blur="messages = {}"
                        @input="updateApplicant('clientLastName', $event)"
                        filled
                        hide-details="auto"
                        label="Last Name (Optional)" />
        </v-col>
      </v-row>
      <v-row v-if="!getEditMode && !isRoleStaff">
        <v-col cols="12" md="2" lg="2"></v-col>
        <v-col cols="12" md="5" lg="5">
          <FolioNumberInput
              ref="folioNumberInputRef"
              :folioNumber="getFolioNumber"
              @emitFolioNumber="setFolioNumber($event)"
              validate="true"
          />
        </v-col>
      </v-row>

      <v-row v-if="showAllFields">
        <v-col cols="12" md="2" lg="2" class="h6">About The Business</v-col>
        <v-col cols="12" md="5" lg="5" align-self="start">
          <v-tooltip top
            content-class="top-tooltip"
            transition="fade-transition"
            :disabled="isMobile"
          >
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-textarea :messages="messages['nature']"
                            :rules="businessNatureRules"
                            :value="getNrData.natureBusinessInfo"
                            @blur="messages = {}"
                            @input="updateNrData('natureBusinessInfo', $event)"
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
        <v-col cols="12" md="5" lg="5" align-self="start">
          <v-tooltip top
            content-class="top-tooltip"
            transition="fade-transition"
            :disabled="isMobile"
          >
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-textarea :messages="messages['additional']"
                            :value="getNrData.additionalInfo"
                            :rules="additionalInfoRules"
                            @blur="messages = {}"
                            @input="updateNrData('additionalInfo', $event)"
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
        <v-col cols="12" md="2" lg="2" />
        <v-col cols="12" md="5" lg="5" v-if="getShowCorpNum === CorpNumRequests.COLIN">
          <v-tooltip top
            content-class="top-tooltip"
            transition="fade-transition"
            :disabled="isMobile"
          >
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-text-field :messages="messages['corpNum']"
                              :rules="corpNumRules"
                              :error-messages="corpNumError"
                              @focus="corpNumError = ''"
                              :loading="loading"
                              filled
                              :label="corpNumFieldLabel"
                              v-model="corpNum">
                </v-text-field>
              </div>
            </template>
            <span>
              Enter the BC incorporation number of your business.
            </span>
          </v-tooltip>
        </v-col>
        <v-col cols="12" md="5" lg="5">
          <v-tooltip top
            content-class="top-tooltip"
            transition="fade-transition"
            :disabled="isMobile"
          >
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-text-field :messages="messages['tradeMark']"
                              :value="getNrData.tradeMark"
                              :rules="trademarkRules"
                              @blur="messages = {}"
                              @input="updateNrData('tradeMark', $event)"
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

      <v-row class="align-center mt-2">
        <v-col cols="12" md="2" lg="2" />
        <v-col cols="12" md="5" lg="5">
          <v-tooltip top
            content-class="top-tooltip"
            transition="fade-transition"
            :disabled="isMobile"
          >
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-checkbox
                  v-if="showPriorityRequest"
                  hide-details
                  v-model="priorityRequest"
                  class="mt-0 pt-0"
                  :disabled="!enablePriorityCheckbox"
                >
                  <template v-slot:label>Make this a Priority Request <b>($100)</b></template>
                </v-checkbox>
              </div>
            </template>
            <span v-if="enablePriorityCheckbox">
              Priority name requests are typically reviewed within 1-2 business days.
            </span>
            <span v-else>
              Due to the on-going labour dispute between the government and its employees,
              priority filings are temporarily disabled.
            </span>
          </v-tooltip>
        </v-col>
        <ApplicantInfoNav @nextAction="nextAction()" />
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import ApplicantInfoNav from '@/components/common/applicant-info-nav.vue'
import { FolioNumberInput } from '@bcrs-shared-components/folio-number-input'
import { ApplicantI, SubmissionTypeT } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { CorpNumRequests, Location, NrState, RequestCode } from '@/enums'
import { getFeatureFlag } from '@/plugins'

@Component({
  components: {
    ApplicantInfoNav, FolioNumberInput
  }
})
export default class ApplicantInfo3 extends Vue {
  // Global getters
  @Getter getCorpNum!: string
  @Getter getIsPersonsName!: boolean
  @Getter getApplicant!: ApplicantI
  @Getter getPriorityRequest!: boolean
  @Getter getEditMode!: boolean
  @Getter getLocation!: Location
  @Getter getNrData!: any
  @Getter getNrState!: string
  @Getter getRequestActionCd!: RequestCode
  @Getter getShowPriorityRequest!: boolean
  @Getter getShowCorpNum!: string
  @Getter getSubmissionType!: SubmissionTypeT
  @Getter getFolioNumber!: string
  @Getter isRoleStaff!: boolean
  @Getter isMobile!: boolean

  // Global actions
  @Action setApplicantDetails!: ActionBindingIF
  @Action setCorpNum!: ActionBindingIF
  @Action setIsLoadingSubmission!: ActionBindingIF
  @Action setNRData!: ActionBindingIF
  @Action setPriorityRequest!: ActionBindingIF
  @Action fetchCorpNum!: ActionBindingIF
  @Action submit!: ActionBindingIF
  @Action setFolioNumber!: ActionBindingIF
  @Action setHotjarUserId!: ActionBindingIF

  // Enum declaration
  readonly CorpNumRequests = CorpNumRequests

  corpNumError: string = ''
  corpNumFieldLabel = 'Incorporation or Registration Number'
  additionalInfoRules = [
    v => (!v || v.length <= 120) || 'Cannot exceed 120 characters'
  ]
  businessNatureRules = [
    v => !!v || 'Required field',
    v => (!v || v.length <= 1000) || 'Cannot exceed 1000 characters'
  ]
  corpNumRules = [
    v => !!v || 'Required field',
    v => (!v || v.length > 3) || 'Must be at least 4 characters'
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
  loading: boolean = false
  messages = {}
  $hj: any

  /** Whether priority checkbox should be enabled. */
  get enablePriorityCheckbox (): boolean {
    return getFeatureFlag('enable-priority-checkbox')
  }

  mounted () {
    // Apply optional corpNum validations for Amalgamations as they are NOT a required field but require COLIN lookup.
    if (this.getRequestActionCd === RequestCode.AML) {
      this.corpNumFieldLabel += ' (Optional)'
      this.corpNumRules = [
        v => (!v || v.length > 3) || 'Must be at least 4 characters'
      ]
    }
  }

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
  get location (): Location {
    return this.getLocation
  }
  get priorityRequest (): boolean {
    return this.getPriorityRequest
  }
  get showAllFields (): boolean {
    return (!this.getEditMode || this.getNrState === NrState.DRAFT)
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
    this.setCorpNum(num)
  }
  set priorityRequest (value: boolean) {
    this.setPriorityRequest(value)
  }

  async validateCorpNum (num): Promise<boolean> {
    if (!num || num.length < 4) {
      return false
    }

    this.loading = true
    try {
      await this.fetchCorpNum(num)
      this.corpNumError = ''
      this.loading = false
      return true
    } catch (error) {
      this.corpNumError = 'Error validating number. Please try again.'
      this.loading = false
      return false
    }
  }

  updateApplicant (key, value) {
    this.setApplicantDetails({ key, value })
  }

  updateNrData (key, value) {
    this.setNRData({ key, value })
  }

  setError (error) {
    this.error = error
  }

  validate () {
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
          const clientReviewBackBtn = this.$el.querySelector('.submit-back-btn > span')
          if (clientReviewBackBtn) clientReviewBackBtn.classList.add('client-review-back-btn')
          const clientReviewConfirmBtn = this.$el.querySelector('.submit-continue-btn > span')
          if (clientReviewConfirmBtn) clientReviewConfirmBtn.classList.add('client-review-confirm-btn')
        }
      })
    }
  }

  async nextAction () {
    if (this.$hj) {
      // Listen for changes to the hotjar user id and store it
      try {
        this.setHotjarUserId(this.$hj.globals.get('userId').split('-').shift())
      } catch (error) {
        // ignore the error
      }
    }
    this.setIsLoadingSubmission(true)
    this.validate()
    if (this.getShowCorpNum === CorpNumRequests.COLIN) {
      this.$root.$emit('showSpinner', true)
      await this.validateCorpNum(this.getCorpNum)
      this.$root.$emit('showSpinner', false)
    }
    if (this.isValid && !this.corpNumError) {
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

// disabled checkbox label
::v-deep .v-input--is-disabled label {
  opacity: 0.4;
}
</style>
