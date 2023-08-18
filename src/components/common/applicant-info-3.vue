<template>
  <v-form v-model="isValid" ref="step3" id="applicant-info-3-form">
    <v-container fluid class="pa-0 mt-6" id="applicant-info-3">
      <v-row>
        <v-col cols="12" md="2" lg="2" class="h6 align-self-start">Contact Info</v-col>

        <!--CONTACT NAME-->
        <v-col cols="12" md="5" lg="5" class="mt-0">
          <v-text-field :messages="messages['contact']"
                        :value="applicant.contact"
                        @blur="messages = {}"
                        @input="updateApplicant('contact', $event)"
                        filled
                        hide-details="auto"
                        label="Contact Name (Optional)" />
        </v-col>

        <!--EMAIL ADDRESS-->
        <v-col cols="12" md="5" lg="5" class="mt-0" :class="{ 'pt-6': isMobile }">
          <v-text-field :messages="messages['email']"
                        :rules="emailRules"
                        :validate-on-blur="true"
                        :value="applicant.emailAddress"
                        @blur="messages = {}"
                        @input="updateApplicant('emailAddress', $event)"
                        filled
                        hide-details="auto"
                        label="Email Address (for notifications)" />
        </v-col>
      </v-row>

      <v-row class="mt-0">
        <v-col cols="12" md="2" lg="2" />

        <!--PHONE NUMBER-->
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

        <!--FAX NUMBER-->
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

        <!--FIRST NAME-->
        <v-col cols="12" md="5" lg="5">
          <v-text-field :messages="messages['clientFirst']"
                        :value="applicant.clientFirstName"
                        @blur="messages = {}"
                        @input="updateApplicant('clientFirstName', $event)"
                        filled
                        hide-details="auto"
                        label="First Name (Optional)" />
        </v-col>

        <!--LAST NAME-->
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

      <v-row v-if="!getEditMode && !isRoleStaff" class="mt-0">
        <v-col cols="12" md="2" lg="2"></v-col>

        <!--FOLIO NUMBER-->
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

        <!--NATURE OF BUSINESS-->
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

        <!--ADDITIONAL INFORMATION-->
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

      <v-row class="mt-0">
        <v-col cols="12" md="2" lg="2" />

        <!--CORP NUMBER-->
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

        <!--TRADEMARK-->
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

      <v-row class="align-center mt-2 mb-0">
        <v-col cols="12" md="2" lg="2" />

        <!--PRIORITY REQUEST-->
        <v-col cols="12" md="5" lg="5">
          <v-tooltip top
            content-class="top-tooltip"
            transition="fade-transition"
            :disabled="isMobile"
          >
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-checkbox
                  v-if="getShowPriorityRequest"
                  hide-details
                  v-model="priorityRequest"
                  class="pre-wrap mt-0 pt-0"
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
import { ApplicantI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { CorpNumRequests, NrRequestActionCodes, NrState } from '@/enums'
import { GetFeatureFlag } from '@/plugins'

@Component({
  components: {
    ApplicantInfoNav, FolioNumberInput
  }
})
export default class ApplicantInfo3 extends Vue {
  // Global getters
  @Getter getCorpNum!: string
  @Getter getApplicant!: ApplicantI
  @Getter getPriorityRequest!: boolean
  @Getter getEditMode!: boolean
  @Getter getNrData!: any
  @Getter getNrState!: string
  @Getter getRequestActionCd!: NrRequestActionCodes
  @Getter getShowPriorityRequest!: boolean
  @Getter getShowCorpNum!: string
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

  corpNumError = ''
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
  error = false
  isValid = false
  loading = false
  messages = {}
  $hj: any

  /** Whether priority checkbox should be enabled. */
  get enablePriorityCheckbox (): boolean {
    return !!GetFeatureFlag('enable-priority-checkbox')
  }

  mounted () {
    // Apply optional corpNum validations for Amalgamations as they are NOT a required field but require COLIN lookup.
    if (this.getRequestActionCd === NrRequestActionCodes.AMALGAMATE) {
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
  set corpNum (num) {
    this.setCorpNum(num)
  }

  get priorityRequest (): boolean {
    return this.getPriorityRequest
  }
  set priorityRequest (value: boolean) {
    this.setPriorityRequest(value)
  }

  get showAllFields (): boolean {
    return (!this.getEditMode || this.getNrState === NrState.DRAFT)
  }

  get xproJurisdiction () {
    return (this.getNrData || {}).xproJurisdiction
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
    // validate corp num in COLIN
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
@import "@/assets/styles/theme";

::v-deep .v-textarea textarea {
  line-height: 1.375rem !important;
  font-size: $px-14 !important;
}

// disabled checkbox label
::v-deep .v-input--is-disabled label {
  color: $disabled-action !important;
}
</style>
