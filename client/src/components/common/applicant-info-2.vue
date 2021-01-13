<template>
  <v-form v-model="isValid" ref="step2" id="applicant-info-2-form">
    <v-container fluid class="pa-0 mt-5" id="applicant-info-2">
      <v-row>
        <v-col cols="2" class="h6 align-self-start pt-0">Contact Info</v-col>
        <v-col cols="5" class="py-0">
          <label for="emailAddress" class="hidden">Email Address (for notifications)</label>
          <v-text-field :messages="messages['email']"
                        :rules="emailRules"
                        :value="applicant.emailAddress"
                        @blur="messages = {}"
                        @input="mutateApplicant('emailAddress', $event)"
                        id="emailAddress"
                        filled
                        hide-details="auto"
                        :name="Math.random()"
                        autocomplete="chrome-off"
                        label="Email Address (for notifications)" />
        </v-col>
        <v-col cols="5" class="py-0" />
      </v-row>

      <v-row>
        <v-col cols="2" />
        <v-col cols="5">
          <label for="phoneNumber" class="hidden">Phone Number (Optional)</label>
          <v-text-field :messages="messages['phone']"
                        :value="applicant.phoneNumber"
                        :rules="phoneFaxRules"
                        @blur="messages = {}"
                        @input="mutateApplicant('phoneNumber', $event)"
                        id="phoneNumber"
                        :name="Math.random()"
                        autocomplete="chrome-off"
                        filled
                        hide-details="auto"
                        label="Phone Number (Optional)" />
        </v-col>
        <v-col cols="5">
          <label for="faxNumber" class="hidden">Fax Number (Optional)</label>
          <v-text-field :messages="messages['fax']"
                        :value="applicant.faxNumber"
                        :rules="phoneFaxRules"
                        @blur="messages = {}"
                        @input="mutateApplicant('faxNumber', $event)"
                        id="faxNumber"
                        :name="Math.random()"
                        autocomplete="chrome-off"
                        filled
                        hide-details="auto"
                        label="Fax Number (Optional)" />
        </v-col>
      </v-row>

      <v-row v-if="showAllFields">
        <v-col cols="2" class="h6">About Your Business</v-col>
        <v-col cols="5" align-self="start">
          <label for="natureBusinessInfo" class="hidden">Nature of Business</label>
          <v-textarea :messages="messages['nature']"
                      :rules="businessNatureRules"
                      :value="nrData.natureBusinessInfo"
                      @blur="messages = {}"
                      @input="mutateNRData('natureBusinessInfo', $event)"
                      id="natureBusinessInfo"
                      name="natureBusinessInfo"
                      filled
                      hide-details="auto"
                      label="Nature of Business"
                      rows="3" />
        </v-col>
        <v-col cols="5" align-self="start">
          <label for="additionalInfo" class="hidden">Additional Business Info (Optional)</label>
          <v-textarea :messages="messages['additional']"
                      :value="nrData.additionalInfo"
                      :rules="additionalInfoRules"
                      @blur="messages = {}"
                      @input="mutateNRData('additionalInfo', $event)"
                      id="additionalInfo"
                      name="additionalInfo"
                      filled
                      hide-details="auto"
                      label="Additional Business Info (Optional)"
                      rows="3" />
        </v-col>
        <v-col cols="2" />
        <v-col cols="5" v-if="showCorpNum === 'colin'">
          <label for="corpNum" class="hidden">Incorporation Number (required)</label>
          <v-text-field :error-messages="corpNumError"
                        :hide-details="hideCorpNum"
                        :loading="loading"
                        :messages="messages['corpNum']"
                        :rules="corpNumRules"
                        @blur="messages = {}; isEditingCorpNum = false"
                        @focus="messages['corpNum'] = 'Incorporation Number (required)'; isEditingCorpNum = true"
                        id="corpNum"
                        :name="Math.random()"
                        autocomplete="chrome-off"
                        filled
                        label="Incorporation Number (required)"
                        v-model="corpNum"
                        v-on:update:error="setError">
            <template v-slot:append>
              <v-icon :class="error || corpNumError || corpNumDirty ? 'red--text' : 'green--text'"
                      v-if="hideCorpNum === 'auto' && !isEditingCorpNum && !loading">
                {{ error || corpNumError || corpNumDirty ? 'mdi-close' : 'mdi-check' }}</v-icon>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="5">
          <label for="tradeMark" class="hidden">Registered Trademark (Optional)</label>
          <v-text-field :messages="messages['tradeMark']"
                        :value="nrData.tradeMark"
                        :rules="trademarkRules"
                        @blur="messages = {}"
                        @input="mutateNRData('tradeMark', $event)"
                        id="tradeMark"
                        :name="Math.random()"
                        autocomplete="chrome-off"
                        filled
                        hide-details="auto"
                        label="Registered Trademark (Optional)" />
        </v-col>
      </v-row>

      <v-row v-if="showPriorityRequest">
        <v-col cols="2" class="h6">Additional Services</v-col>
        <v-col cols="10" align-self="center">
          <v-checkbox
            hide-details
            v-model="priorityRequest"
            class="mt-0 pt-0"
          >
            <template v-slot:label>
              <span>Priority Request - <b>$100 Fee</b></span>
            </template>
          </v-checkbox>
        </v-col>
      </v-row>

      <v-row class="mt-5">
        <v-col cols="7" class="py-0" />
        <ApplicantInfoNav @nextAction="nextAction()" />
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import newReqModule, { NewRequestModule } from '@/store/new-request-module'
import paymentModule from '@/modules/payment'
import ApplicantInfoNav from '@/components/common/applicant-info-nav.vue'
import NameRequestMixin from '@/components/mixins/name-request-mixin'

@Component({
  components: {
    ApplicantInfoNav
  }
})
export default class ApplicantInfo2 extends NameRequestMixin {
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
  phoneFaxRules = [
    v => (!v || v.length <= 30) || 'Cannot exceed 30 characters'
  ]
  trademarkRules = [
    v => (!v || v.length <= 100) || 'Cannot exceed 100 characters'
  ]
  error: boolean = false
  isEditingCorpNum: boolean = false
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

  async getCorpNum (num) {
    this.isEditingCorpNum = false
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
    newReqModule.mutateApplicant({ key, value })
  }
  mutateNRData (key, value) {
    newReqModule.mutateNRData({ key, value })
  }
  setError (error) {
    this.error = error
  }
  validate () {
    if (this.hideCorpNum !== 'auto') {
      this.hideCorpNum = 'auto'
    }
    if (this.$refs.step2 as Vue) {
      (this.$refs.step2 as any).validate()
    }
  }

  @Watch('isValid')
  onValidChanged (val: boolean) {
    if (val) {
      this.$nextTick(() => {
        // add classname to button text (for more detail in Sentry breadcrumbs)
        this.$el.querySelector("#submit-back-btn > span")?.classList.add("self-review-back-btn")
        this.$el.querySelector("#submit-continue-btn > span")?.classList.add("self-review-confirm-btn")
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
