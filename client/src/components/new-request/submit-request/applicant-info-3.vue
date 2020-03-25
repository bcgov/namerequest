<template>
  <v-form v-model="isValid" ref="step2" id="applicant-info-3-form">
    <v-container fluid class="pa-0 pt-2">
      <v-row class="mt-n2">
        <v-col cols="2" class="h5" align-self="start">
          Contact Person
        </v-col>
        <v-col cols="10">
          <v-text-field :messages="messages['contact']"
                        :value="contact.name"
                        @blur="messages = {}"
                        @focus="messages['contact'] = 'Contact Person (if other than applicant. optional)'"
                        @input="updateContact('name', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Contact Person (if other than applicant. optional)" />
        </v-col>
      </v-row>
      <v-row class="mt-n3">
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
      <v-row class="mt-n3">
        <v-col cols="2" class="h5" align-self="start">
          Client
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['clientLast']"
                        :rules="requiredRule"
                        :value="client.lastName"
                        @blur="messages = {}"
                        @focus="messages['clientLast'] = 'Last Name'"
                        @input="updateClient('lastName', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Last Name" />
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['clientFirst']"
                        :rules="requiredRule"
                        :value="client.firstName"
                        @blur="messages = {}"
                        @focus="messages['clientFirst'] = 'First Name'"
                        @input="updateClient('firstName', $event)"
                        filled
                        hide-details="auto"
                        placeholder="First Name" />
        </v-col>
      </v-row>
      <v-row class="mt-n3">
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
      <v-row class="mt-n4">
        <v-col cols="2" class="h5" >
          Additional Services
        </v-col>
        <v-col cols="5" align-self="start">
          <v-checkbox class="pa-0 ma-0 mt-2">
            <template v-slot:label>
              Priority Request - <b>$100 Fee</b>
            </template>
          </v-checkbox>
        </v-col>
        <v-col cols="5" class="py-0" />
      </v-row>
      <v-row class="mt-n9">
        <v-col cols="12" class="text-right mt-n4">
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
import { Component, Vue, Watch } from 'vue-property-decorator'

@Component({})
export default class ApplicantInfo3 extends Vue {
  emailRules = [
    v => !!v || 'Required field',
    v => /.+@.+/.test(v) || 'Not a valid email'
  ]
  isValid: boolean = false
  messages = {}
  requiredRule = [
    v => !!v || 'Required field'
  ]
  notRequired = [
    v => !!v || ''
  ]

  get businessInfo () {
    return newReqModule.businessInfo
  }
  get client () {
    return newReqModule.client
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
  updateClient (key, value) {
    this.clearValidation()
    newReqModule.mutateClient({ key, value })
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

<style scoped lang="sass">

</style>
