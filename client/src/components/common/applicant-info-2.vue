<template>
  <v-form v-model="isValid" ref="step2" id="applicant-info-2-form">
    <v-container fluid class="pa-0 pt-2">
      <v-row>
        <v-col cols="2" class="h5" align-self="start">
          Contact Info
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['email']"
                        :rules="emailRules"
                        :value="applicant.emailAddress"
                        @blur="messages = {}"
                        @focus="messages['email'] = 'Notification Email'"
                        @input="mutateApplicant('emailAddress', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Email Address (for notifications)" />
        </v-col>
        <v-col cols="5" />
      </v-row>
      <v-row>
        <v-col cols="2" />
        <v-col cols="5">
          <v-text-field :messages="messages['phone']"
                        :value="applicant.phoneNumber"
                        @blur="messages = {}"
                        @focus="messages['phone'] = 'Phone Number (Optional)'"
                        @input="mutateApplicant('phoneNumber', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Phone Number (Optional)" />
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['fax']"
                        :value="applicant.faxNumber"
                        @blur="messages = {}"
                        @focus="messages['fax'] = 'Fax Number (Optional)'"
                        @input="mutateApplicant('faxNumber', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Fax Number (Optional)" />
        </v-col>
      </v-row>
      <v-row v-if="showAllFields">
        <v-col cols="2" class="h5" align-self="start">
          About Your Business
        </v-col>
        <v-col cols="5" align-self="start">
          <v-textarea :messages="messages['nature']"
                      :rules="requiredRule"
                      :value="nrData.natureBusinessInfo"
                      @blur="messages = {}"
                      @focus="messages['nature'] = 'Nature of Business'"
                      @input="mutateNRData('natureBusinessInfo', $event)"
                      filled
                      hide-details="auto"
                      placeholder="Nature of Business"
                      rows="3" />
        </v-col>
        <v-col cols="5" align-self="start">
          <v-textarea :messages="messages['additional']"
                      :value="nrData.additionalInfo"
                      @blur="messages = {}"
                      @focus="messages['additional'] = 'Additional Info'"
                      @input="mutateNRData('additionalInfo', $event)"
                      filled
                      hide-details="auto"
                      placeholder="Additional Business Info (Optional)"
                      rows="3" />
        </v-col>
        <v-col cols="2" />
        <v-col cols="5" v-if="showCorpNum">
          <v-text-field :messages="messages['corpNum']"
                        :rules="corpNumRules"
                        :error-messages="corpNumError"
                        validate-on-blur
                        @blur="messages = {}"
                        :loading="loading"
                        @focus="messages['corpNum'] = 'Incorporation Number (required)'"
                        filled
                        v-on:update:error="setError"
                        :hide-details="hideCorpNum"
                        placeholder="Incorporation Number (required)"
                        v-model="corpNum">
            <template v-slot:append>
              <v-icon :class="showCorpNumErrorState ? 'red--text' : 'green--text'"
                      v-if="hideCorpNum === 'auto'">
                {{ error || loading || corpNumDirty ? 'close' : 'check' }}</v-icon>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['tradeMark']"
                        :value="nrData.tradeMark"
                        @blur="messages = {}"
                        @focus="messages['tradeMark'] = 'Registered Trademark (Optional)'"
                        @input="mutateNRData('tradeMark', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Registered Trademark (Optional)" />
        </v-col>
      </v-row>
      <v-row v-if="showPriorityRequest">
        <v-col cols="2" class="h5">
         Additional Services
        </v-col>
        <v-col cols="5" align-self="center">
          <v-checkbox v-model="priorityRequest">
            <template v-slot:label>
              Priority Request - <b>$100 Fee</b>
            </template>
          </v-checkbox>
        </v-col>
        <v-col cols="5" />
      </v-row>
      <v-row>
        <v-col cols="12" class="text-right" :class="showPriorityRequest ? 'mt-n4' : ''">
          <v-btn x-large
                 id="submit-back-btn"
                 class="mr-3"
                 @click="showPreviousTab">{{ editMode ? 'Previous' : 'Back' }}</v-btn>
          <v-btn x-large
                 v-if="!isValid"
                 id="submit-continue-btn-disabled"
                 @click="validate"> {{ editMode ? 'Submit Changes' : 'Continue to Payment' }}</v-btn>
          <v-btn x-large
                 v-else
                 @click="submit"
                 id="submit-continue-btn"> {{ editMode ? 'Submit Changes' : 'Continue to Payment' }}</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import newReqModule, { NewRequestModule } from '@/store/new-request-module'
import paymentModule from '@/modules/payment'
import { Component, Vue, Watch } from 'vue-property-decorator'

@Component({})
export default class ApplicantInfo2 extends Vue {
  corpNumDirty: boolean = false
  corpNumError: string = ''
  corpNumRules = [
    v => !!v || 'Required field',
    v => !!this.getCorpNum(v) || 'Cannot validate number.  Please try again'
  ]
  emailRules = [
    v => !!v || 'Required field',
    v => /.+@.+/.test(v) || 'Not a valid email'
  ]
  error: boolean = false
  isValid: boolean = false
  hideCorpNum: boolean | 'auto' = true
  loading: boolean = false
  messages = {}
  requiredRule = [
    v => !!v || 'Required field'
  ]

  get applicant () {
    return newReqModule.applicant
  }
  get corpNum () {
    return newReqModule.corpNum
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
  get editMode () {
    return newReqModule.editMode
  }
  get isPersonsName () {
    return newReqModule.isPersonsName
  }
  get location () {
    return newReqModule.location
  }
  get nr () {
    const nameRequest: NewRequestModule = newReqModule
    const nr: Partial<any> = nameRequest.nr || {}
    return nr
  }
  get nrData () {
    return newReqModule.nrData
  }
  get nrNum () {
    const { nr } = this
    const { nrNum } = nr
    return nrNum || undefined
  }
  get nrState () {
    return newReqModule.nrState
  }
  get priorityRequest () {
    return newReqModule.priorityRequest
  }
  set priorityRequest (value) {
    newReqModule.mutatePriorityRequest(value)
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
  get showCorpNumErrorState () {
    if (this.loading || this.corpNumDirty) {
      return true
    }
    return !!this.corpNumError
  }
  get showPriorityRequest () {
    return newReqModule.showPriorityRequest
  }
  get submissionTabNumber () {
    return newReqModule.submissionTabNumber
  }
  get submissionType () {
    return newReqModule.submissionType
  }
  set submissionTabNumber (value) {
    newReqModule.mutateSubmissionTabNumber(value)
  }

  async submit () {
    if (this.editMode) {
      newReqModule.patchNameRequests()
      return
    } else {
      const { nrNum } = this
      if (!nrNum) {
        await newReqModule.postNameRequests('draft')
      } else {
        await newReqModule.putNameReservation(nrNum)
      }
      await paymentModule.togglePaymentModal(true)
    }
  }
  clearValidation () {
    if (this.$refs.step2 as Vue) {
      (this.$refs.step2 as any).resetValidation()
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
    newReqModule.mutateApplicant({ key, value })
  }
  mutateNRData (key, value) {
    newReqModule.mutateNRData({ key, value })
  }
  setError (error) {
    this.error = error
  }
  showPreviousTab () {
    newReqModule.mutateSubmissionTabComponent('ApplicantInfo1')
  }
  validate () {
    if (this.hideCorpNum !== 'auto') {
      this.hideCorpNum = 'auto'
    }
    if (this.$refs.step2 as Vue) {
      (this.$refs.step2 as any).validate()
    }
  }
}
</script>
