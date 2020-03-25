<template>
  <v-form v-model="step1Valid" ref="step1" id="applicant-info-1-form">
    <v-container fluid class="mt-n3" id="applicant-info-1">
      <v-row>
        <v-col cols="2" align-self="start" class="h5 ml-n3 mr-3">
          Applicant
        </v-col>
        <v-col cols="10" class="pa-0">
          <!--FIRST NAME, LAST NAME, MIDDLE NAME-->
          <v-row>
            <v-col cols="4">
              <v-text-field :messages="messages['last']"
                            :rules="requiredRules"
                            :value="applicant.lastName"
                            @blur="messages = {}"
                            @focus="messages['last'] = 'Last Name'"
                            @input="updateApplicant('lastName', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            placeholder="Last Name"
                            ref="last" />
            </v-col>
            <v-col cols="4" >
              <v-text-field :messages="messages['first']"
                            :rules="requiredRules"
                            :value="applicant.firstName"
                            @blur="messages = {}"
                            @focus="messages['first'] = 'First Name'"
                            @input="updateApplicant('firstName', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            placeholder="First Name"
                            ref="first" />
            </v-col>
            <v-col cols="4" >
              <v-text-field :messages="messages['middle']"
                            @blur="messages = {}"
                            @focus="messages['middle'] = 'Middle Name'"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            placeholder="Middle Name (Optional)"
                            ref="middle"
                            @input="updateApplicant('middleName', $event)"
                            :value="applicant.middleName" />
            </v-col>
          </v-row>
          <!--ADDDRESS !-->
          <v-row class="mt-n1">
            <v-col cols="12" class="py-0 my-0">
              <v-text-field :messages="messages['address1']"
                            :rules="requiredRules"
                            @blur="messages = {}"
                            @focus="messages['address1'] = 'Street Address'"
                            class="pa-0"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            placeholder="Street Address"
                            ref="address1"
                            @input="updateApplicant('address1', $event)"
                            :value="applicant.address1" />
            </v-col>
          </v-row>
          <v-row class="mt-2">
            <v-col cols="12" class="py-0 my-0">
              <v-text-field :messages="messages['address2']"
                            @blur="messages = {}"
                            @focus="messages['address2'] = 'Street Address 2 (Optional)'"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            placeholder="Additional Street Address (Optional)"
                            ref="address2"
                            @input="updateApplicant('address2', $event)"
                            :value="applicant.address2" />
            </v-col>
          </v-row>
          <v-row class="mt-2">
            <v-col cols="6" class="py-0 my-0">
              <v-text-field :messages="messages['city']"
                            :rules="requiredRules"
                            @blur="messages = {}"
                            @focus="messages['city'] = 'City'"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            placeholder="City"
                            ref="city"
                            @input="updateApplicant('city', $event)"
                            :value="applicant.city" />
            </v-col>
            <v-col cols="6" class="py-0 my-0">
              <v-select :items="jurisdictionOptions"
                        :rules="requiredRules"
                        dense
                        filled
                        height="50"
                        hide-details="auto"
                        placeholder="Province"
                        ref="provinceState"
                        v-if="location === 'CA' || location === 'BC'"
                        @input="updateApplicant('provinceState', $event)"
                        :value="applicant.provinceState" />
              <v-text-field :rules="requiredRules"
                            @blur="messages = {}"
                            @focus="messages['provState'] = 'Province/State'"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            placeholder="Province/State"
                            ref="provinceState"
                            v-else
                            @input="updateApplicant('provinceState', $event)"
                            :value="applicant.provinceState" />
            </v-col>
          </v-row>
          <v-row class="mt-2">
            <v-col cols="6" class="py-0 my-0">
              <v-select :items="countryOptions"
                        :rules="requiredRules"
                        dense
                        filled
                        height="50"
                        hide-details="auto"
                        placeholder="Country"
                        ref="country"
                        @input="updateApplicant('country', $event)"
                        :value="applicant.country" />
            </v-col>
            <v-col cols="6" class="py-0 my-0">
              <v-text-field :messages="messages['post']"
                            :rules="requiredRules"
                            @blur="messages = {}"
                            @focus="messages['post'] = 'Postal / Zip Code'"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            placeholder="Postal/Zip Code"
                            @input="updateApplicant('postalCode', $event)"
                            :value="applicant.postalCode" />
            </v-col>
          </v-row>
          <v-row class="mt-2" v-if="location !== 'BC'">
            <v-col cols="6" class="py-0 my-0">
              <v-select :messages="messages['juris']"
                            :rules="requiredRules"
                            @blur="messages = {}"
                            @focus="messages['juris'] = 'Business Jurisdiction'"
                            dense
                            filled
                            :items="jurisdictionOptions"
                            height="50"
                            hide-details="auto"
                            placeholder="Business Jurisdiction"
                            @input="updateApplicant('jurisdiction', $event)"
                            :value="applicant.jurisdiction" />
            </v-col>
            <v-col cols="6" class="py-0 my-0" />
          </v-row>
          <v-row :class="location === 'BC' ? 'mt-n2 mb-n4' : 'mt-n5 mb-n4'">
            <v-col cols="7" align-self="start">
              <v-checkbox label="I am completing this reservation on my own behalf" v-model="actingOnOwnBehalf" />
            </v-col>
            <v-col cols="5" class="text-right" align-self="center">
              <v-btn @click="showPreviousTab()"
                     class="mr-3"
                     id="submit-back-btn"
                     v-if="submissionType === 'examination'"
                     x-large>Back</v-btn>
              <v-btn @click="showNextTab()"
                     id="submit-continue-btn"
                     v-if="step1Valid"
                     x-large>Continue</v-btn>
              <v-btn @click="validate()"
                     id="submit-continue-btn-disabled"
                     v-else
                     x-large>Continue</v-btn>
              </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import designations from '@/assets/d'
import jurisdictionsCA from '@/store/list-data/canada-jurisdictions'
import jurisdictionsIN from '@/store/list-data/intl-jurisdictions'
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class ApplicantInfo1 extends Vue {
  messages = {}
  requiredRules = [
    v => !!v || 'Required field'
  ]
  step1Valid: boolean = false

  mounted () {
    if (this.location === 'BC') {
      this.updateApplicant('provinceState', 'BC')
      this.updateApplicant('country', 'CA')
    }
    if (this.location === 'CA') {
      this.updateApplicant('country', 'CA')
    }
  }

  get actingOnOwnBehalf () {
    return newReqModule.actingOnOwnBehalf
  }
  set actingOnOwnBehalf (value) {
    newReqModule.mutateActingOnOwnBehalf(value)
  }
  get applicant () {
    return newReqModule.applicant
  }
  get countryOptions () {
    return jurisdictionsIN
  }
  get provinceStateOptions () {
    if (this.location === 'IN') {
      return null
    }
    return jurisdictionsCA
  }
  get jurisdictionOptions () {
    if (this.location === 'IN') {
      return jurisdictionsIN
    }
    return jurisdictionsCA
  }
  get location () {
    return newReqModule.location
  }
  get submissionType () {
    return newReqModule.submissionType
  }

  clearValidation () {
    if (this.$refs.step1 as Vue) {
      (this.$refs.step1 as any).resetValidation()
    }
  }
  showNextTab () {
    newReqModule.mutateSubmissionTabComponent('ApplicantInfo2')
  }
  showPreviousTab () {
    newReqModule.mutateSubmissionTabComponent('SendForExamination')
  }
  updateApplicant (key, value) {
    this.clearValidation()
    newReqModule.mutateApplicant({ key, value })
  }
  validate () {
    if (this.$refs.step1 as Vue) {
      (this.$refs.step1 as any).validate()
    }
  }
}
</script>

<style scoped lang="sass">

</style>
