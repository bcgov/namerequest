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
                        :value="contact.email"
                        @blur="messages = {}"
                        @focus="messages['email'] = 'Notification Email'"
                        @input="updateContact('email', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Email Address (for notifications)" />
        </v-col>
        <v-col cols="5" />
      </v-row>
      <v-row class="mt-n3">
        <v-col cols="2" />
        <v-col cols="5">
          <v-text-field :messages="messages['phone']"
                        :value="contact.phone"
                        @blur="messages = {}"
                        @focus="messages['phone'] = 'Phone Number (Optional)'"
                        @input="updateContact('phone', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Phone Number (Optional)" />
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['fax']"
                        :value="contact.fax"
                        @blur="messages = {}"
                        @focus="messages['fax'] = 'Fax Number (Optional)'"
                        @input="updateContact('fax', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Fax Number (Optional)" />
        </v-col>
      </v-row>
      <v-row class="mt-3">
        <v-col cols="2" class="h5" align-self="start">
          About Your Business
        </v-col>
        <v-col cols="5" align-self="start">
          <v-textarea :messages="messages['nature']"
                      :rules="requiredRule"
                      :value="businessInfo.natureOfBusiness"
                      @blur="messages = {}"
                      @focus="messages['nature'] = 'Nature of Business'"
                      @input="updateBusinessInfo('natureOfBusiness', $event)"
                      filled
                      hide-details="auto"
                      placeholder="Nature of Business"
                      rows="3" />
        </v-col>
        <v-col cols="5" align-self="start">
          <v-textarea :messages="messages['additional']"
                      :value="businessInfo.additionalInfo"
                      @blur="messages = {}"
                      @focus="messages['additional'] = 'Additional Info'"
                      @input="updateBusinessInfo('additionalInfo', $event)"
                      filled
                      hide-details="auto"
                      placeholder="Additional Business Info (Optional)"
                      rows="3" />
        </v-col>
      </v-row>
      <v-row v-if="submissionType === 'examination'">
        <v-col cols="2" class="h5" >
          Additional Services
        </v-col>
        <v-col cols="5" align-self="start">
          <v-checkbox class="pa-0 ma-0 mt-2" v-model="priorityRequest">
            <template v-slot:label>
              Priority Request - <b>$100 Fee</b>
            </template>
          </v-checkbox>
        </v-col>
        <v-col cols="5" class="py-0" />
      </v-row>
      <v-row :class="submissionType === 'examination' ? 'mt-n7 mb-3' : '' ">
        <v-col cols="12" class="text-right">
          <v-btn x-large
                 id="submit-back-btn"
                 class="mr-3"
                 @click="showPreviousTab()">Back</v-btn>
          <v-btn x-large
                 v-if="!isValid"
                 id="submit-continue-btn-disabled"
                 @click="validate()">Continue to Payment</v-btn>
          <v-btn x-large
                 v-else
                 id="submit-continue-btn">Continue to Payment</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class ApplicantInfo2 extends Vue {
  messages = {}
  requiredRule = [
    v => !!v || 'Required field'
  ]
  emailRules = [
    v => !!v || 'Required field',
    v => /.+@.+/.test(v) || 'Not a valid email'
  ]
  isValid: boolean = false

  get businessInfo () {
    return newReqModule.businessInfo
  }
  get contact () {
    return newReqModule.contact
  }
  get priorityRequest () {
    return newReqModule.priorityRequest
  }
  set priorityRequest (value) {
    newReqModule.mutatePriorityRequest(value)
  }
  get submissionTabNumber () {
    return newReqModule.submissionTabNumber
  }
  set submissionTabNumber (value) {
    newReqModule.mutateSubmissionTabNumber(value)
  }
  get submissionType () {
    return newReqModule.submissionType
  }

  clearValidation () {
    if (this.$refs.step2 as Vue) {
      (this.$refs.step2 as any).resetValidation()
    }
  }
  showPreviousTab () {
    newReqModule.mutateSubmissionTabComponent('ApplicantInfo1')
  }
  updateBusinessInfo (key, value) {
    this.clearValidation()
    newReqModule.mutateBusinessInfo({ key, value })
  }
  updateContact (key, value) {
    this.clearValidation()
    newReqModule.mutateContact({ key, value })
  }
  validate () {
    if (this.$refs.step2 as Vue) {
      (this.$refs.step2 as any).validate()
    }
  }
}
</script>
