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
      </v-row>
      <v-row v-if="showAllFields">
        <v-col cols="2" class="h5">
          {{ editMode ? '' : 'Additional Services' }}
        </v-col>
        <v-col cols="5" align-self="center" v-if="submissionType === 'examination' && !editMode">
          <v-checkbox v-model="priorityRequest">
            <template v-slot:label>
              Priority Request - <b>$100 Fee</b>
            </template>
          </v-checkbox>
        </v-col>
        <v-col cols="5" v-else-if="!editMode" />
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
      <v-row>
        <v-col cols="12" class="text-right" :class="showAllFields ? 'mt-3' : ''">
          <v-btn x-large
                 id="submit-back-btn"
                 class="mr-3"
                 @click="showPreviousTab()">{{ editMode ? 'Previous' : 'Back' }}</v-btn>
          <v-btn x-large
                 v-if="!isValid"
                 id="submit-continue-btn-disabled"
                 @click="validate()"> {{ editMode ? 'Submit Changes' : 'Continue to Payment' }}</v-btn>
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
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class ApplicantInfo2 extends Vue {
  emailRules = [
    v => !!v || 'Required field',
    v => /.+@.+/.test(v) || 'Not a valid email'
  ]
  isValid: boolean = false
  messages = {}
  requiredRule = [
    v => !!v || 'Required field'
  ]

  get applicant () {
    return newReqModule.applicant
  }
  get editMode () {
    return newReqModule.editMode
  }
  get isPersonsName () {
    return newReqModule.isPersonsName
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
  get showAllFields () {
    return (!this.editMode || this.nrState === 'DRAFT')
  }
  get submissionTabNumber () {
    return newReqModule.submissionTabNumber
  }
  get submissionType () {
    return newReqModule.submissionType
  }
  set priorityRequest (value) {
    newReqModule.mutatePriorityRequest(value)
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
  }
  mutateApplicant (key, value) {
    newReqModule.mutateApplicant({ key, value })
  }
  mutateNRData (key, value) {
    newReqModule.mutateNRData({ key, value })
  }
  showPreviousTab () {
    newReqModule.mutateSubmissionTabComponent('ApplicantInfo1')
  }
  validate () {
    if (this.$refs.step2 as Vue) {
      (this.$refs.step2 as any).validate()
    }
  }
}
</script>
