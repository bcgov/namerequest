<template>
  <v-form v-model="isValid" ref="step2" @input="clearValidation" id="applicant-info-3-form">
    <v-container fluid class="pa-0 b-n3 pt-3">
      <v-row>
        <v-col cols="2" class="h5" align-self="start">
          Contact Person
        </v-col>
        <v-col cols="10">
          <v-text-field hide-details="auto"
                        :messages="messages['contact']"
                        @focus="messages['contact'] = 'Contact Person (if other than applicant. optional)'"
                        @blur="messages = {}"
                        placeholder="Contact Person (if other than applicant. optional)"
                        filled
                        :rules="requiredRule" />
        </v-col>
      </v-row>
      <v-row class="mt-n2">
        <v-col cols="2" class="h5" align-self="start">
        Contact Info
        </v-col>
        <v-col cols="5">
          <v-text-field hide-details="auto"
                        :messages="messages['email']"
                        @focus="messages['email'] = 'Notification Email'"
                        @blur="messages = {}"
                        placeholder="Email Address (for notifications)"
                        filled />
        </v-col>
        <v-col cols="5" />
      </v-row>
      <v-row class="mt-n2">
        <v-col cols="2" />
        <v-col cols="5">
          <v-text-field hide-details="auto"
                        :messages="messages['fax']"
                        @focus="messages['fax'] = 'Fax Number'"
                        @blur="messages = {}"
                        placeholder="Fax Number (Optional)"
                        filled />
        </v-col>
        <v-col cols="5">
          <v-text-field hide-details="auto"
                        :messages="messages['fax']"
                        @focus="messages['fax'] = 'Fax Number'"
                        @blur="messages = {}"
                        placeholder="Fax Number (Optional)"
                        filled />
        </v-col>
      </v-row>
      <v-row class="mt-n2">
        <v-col cols="2" class="h5" align-self="start">
          Client
        </v-col>
        <v-col cols="5">
          <v-text-field hide-details="auto"
                        :messages="messages['fax']"
                        @focus="messages['fax'] = 'Fax Number'"
                        @blur="messages = {}"
                        placeholder="Fax Number (Optional)"
                        filled />
        </v-col>
        <v-col cols="5">
          <v-text-field hide-details="auto"
                        :messages="messages['fax']"
                        @focus="messages['fax'] = 'Fax Number'"
                        @blur="messages = {}"
                        placeholder="Fax Number (Optional)"
                        filled />
        </v-col>
      </v-row>
      <v-row class="mt-n2">
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
                      filled />
        </v-col>
        <v-col cols="5" align-self="start">
          <v-textarea placeholder="Additional Business Info (Optional)"
                      :messages="messages['additional']"
                      @focus="messages['additional'] = 'Additional Info'"
                      @blur="messages = {}"
                      rows="3"
                      hide-details="auto"
                      filled />
        </v-col>
      </v-row>
      <v-row class="mt-n2">
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

  get actingOnOwnBehalf () {
    return newReqModule.actingOnOwnBehalf
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
