<template>
  <v-form v-model="isValid" ref="step2" @input="clearValidation" id="applicant-info-2-form">
    <v-container fluid class="pa-0 pt-9">
      <v-row>
        <v-col cols="2" class="h5" align-self="start">
          Contact Info
        </v-col>
        <v-col cols="5">
          <v-text-field hide-details="auto"
                        :messages="messages['email']"
                        @focus="messages['email'] = 'Email'"
                        @blur="messages = {}"
                        placeholder="Email"
                        filled
                        :rules="emailRules"
                        v-model="email" />
        </v-col>
        <v-col cols="5" />
      </v-row>
      <v-row>
        <v-col cols="2" />
        <v-col cols="5">
          <v-text-field hide-details="auto"
                        :messages="messages['phone']"
                        @focus="messages['phone'] = 'Phone Number'"
                        @blur="messages = {}"
                        placeholder="Phone Number (Optional)"
                        filled
                        v-model="phoneNumber" />
        </v-col>
        <v-col cols="5">
          <v-text-field hide-details="auto"
                        :messages="messages['fax']"
                        @focus="messages['fax'] = 'Fax Number'"
                        @blur="messages = {}"
                        placeholder="Fax Number (Optional)"
                        filled
                        v-model="faxNumber" />
        </v-col>
      </v-row>
      <v-row class="mt-6">
        <v-col cols="2" class="h5" align-self="start">
          About Your Business
        </v-col>
        <v-col cols="5" align-self="start">
          <v-textarea placeholder="Nature of Business"
                      hide-details="auto"
                      :messages="messages['nature']"
                      @focus="messages['nature'] = 'Nature of Business'"
                      @blur="messages = {}"
                      rows="3"
                      :rules="requiredRule"
                      filled
                      v-model="natureOfBusiness" />
        </v-col>
        <v-col cols="5" align-self="start">
          <v-textarea placeholder="Additional Business Info (Optional)"
                      :messages="messages['additional']"
                      @focus="messages['additional'] = 'Additional Info'"
                      @blur="messages = {}"
                      rows="3"
                      hide-details="auto"
                      filled
                      v-model="additionalInfo" />
        </v-col>
      </v-row>
      <v-row no gutters>
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
      <v-row class="mt-n4">
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

  get additionalInfo () {
    return newReqModule.additionalInfo
  }
  set additionalInfo (value) {
    newReqModule.mutateAdditionalInfo(value)
  }
  get email () {
    return newReqModule.email
  }
  set email (value) {
    newReqModule.mutateEmail(value)
  }
  get faxNumber () {
    return newReqModule.faxNumber
  }
  set faxNumber (value) {
    newReqModule.mutateFaxNumber(value)
  }
  get natureOfBusiness () {
    return newReqModule.natureOfBusiness
  }
  set natureOfBusiness (value) {
    newReqModule.mutateNatureOfBusiness(value)
  }
  get phoneNumber () {
    return newReqModule.phoneNumber
  }
  set phoneNumber (value) {
    newReqModule.mutatePhoneNumber(value)
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

  clearValidation (e) {
    if (this.$refs.step2 as Vue) {
      (this.$refs.step2 as any).resetValidation()
    }
    return e
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

<style scoped lang="sass">

</style>
