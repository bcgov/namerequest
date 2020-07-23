<template>
  <v-form v-model="isValid" ref="step2" id="applicant-info-3-form">
    <v-container fluid class="pa-0">
      <v-row>
        <v-col cols="2" class="h5" align-self="start">
          Contact Person
        </v-col>
        <v-col cols="10">
          <v-text-field :messages="messages['contact']"
                        :value="applicant.contact"
                        @blur="messages = {}"
                        @focus="messages['contact'] = 'Contact Person (if other than applicant. optional)'"
                        @input="mutateApplicant('contact', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Contact Person (if other than applicant. optional)" />
        </v-col>
      </v-row>
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
      <v-row>
        <v-col cols="2" class="h5" align-self="start">
          Client
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['clientLast']"
                        :value="applicant.clientLastName"
                        @blur="messages = {}"
                        @focus="messages['clientLast'] = 'Last Name'"
                        @input="mutateApplicant('clientLastName', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Last Name" />
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['clientFirst']"
                        :value="applicant.clientFirstName"
                        @blur="messages = {}"
                        @focus="messages['clientFirst'] = 'First Name'"
                        @input="mutateApplicant('clientFirstName', $event)"
                        filled
                        hide-details="auto"
                        placeholder="First Name" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="2" class="h5" align-self="start">
          About The Business
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
      <v-row>
        <v-col cols="2" />
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
        <v-col cols="5" align-self="end" v-if="submissionType === 'examination' && !editMode">
          <v-checkbox v-model="priorityRequest" class="ma-0 pa-0">
            <template v-slot:label>
              Priority Request - <b>$100 Fee</b>
            </template>
          </v-checkbox>
        </v-col>
        <v-col cols="5" v-else />
      </v-row>
      <v-row>
        <v-col cols="12"
               class="text-right"
               :class="submissionType === 'examination' || isPersonsName ? 'mt-n4' : 'mt-4'">
          <v-btn x-large
                 id="submit-back-btn"
                 class="mr-3"
                 @click="showPreviousTab()">{{ editMode ? 'Previous' : 'Back' }}</v-btn>
          <v-btn x-large
                 v-if="!isValid"
                 id="submit-continue-btn-disabled"
                 @click="validate()">
            {{ editMode ? 'Submit Changes' : 'Continue to Payment' }}
          </v-btn>
          <v-btn x-large
                 v-else
                 @click="submit"
                 id="submit-continue-btn">
            {{ editMode ? 'Submit Changes' : 'Continue to Payment' }}
          </v-btn>
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
export default class ApplicantInfo3 extends Vue {
  emailRules = [
    v => !!v || 'Required field',
    v => /.+@.+/.test(v) || 'Not a valid email'
  ]
  isValid: boolean = false
  messages = {}
  notRequired = [
    v => !!v || ''
  ]
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
  get nrData () {
    return newReqModule.nrData
  }
  get nrNum () {
    const { nrResponseObject } = this
    const { nrNum } = nrResponseObject
    return nrNum || undefined
  }
  get nrResponseObject () {
    const nameRequest: NewRequestModule = newReqModule
    const nrResponseObject: Partial<any> = nameRequest.nrResponseObject || {}
    return nrResponseObject
  }
  get priorityRequest () {
    return newReqModule.priorityRequest
  }
  set priorityRequest (value) {
    newReqModule.mutatePriorityRequest(value)
  }
  get submissionType () {
    return newReqModule.submissionType
  }

  async submit () {
    if (this.editMode) {
      newReqModule.patchNameRequests()
      return
    } else {
      const { nrNum } = this
      if (!nrNum) {
        await newReqModule.postNameReservation('draft')
      } else {
        await newReqModule.putNameReservation(nrNum)
      }

      await paymentModule.togglePaymentModal(true)
    }
  }
  clearValidation () {
    if (this.$refs.step2 as any) {
      (this.$refs.step2 as any).resetValidation()
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
  showPreviousTab () {
    newReqModule.mutateSubmissionTabComponent('ApplicantInfo1')
  }
  validate () {
    if (this.$refs.step2 as any) {
      (this.$refs.step2 as any).validate()
    }
  }
}
</script>

<style lang="sass">

</style>
