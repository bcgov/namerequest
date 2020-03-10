<template>
  <v-form v-model="step1Valid" ref="step1" @input="clearValidation" id="applicant-info-1-form">
    <v-container fluid class="pa-0 mt-2" id="applicant-info-1">
      <v-row  class="mt-2">
        <v-col cols="2" class="py-0 h5" align-self="start">
          Applicant
        </v-col>
        <v-col cols="10" class="pa-0 my-0">
          <!--FIRST NAME, LAST NAME, MIDDLE NAME-->
          <v-row>
            <v-col cols="4" class="py-0 my-0">
              <v-text-field :messages="messages['last']"
                            :rules="requiredRules"
                            @blur="messages = {}"
                            @focus="messages['last'] = 'Last Name'"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            placeholder="Last Name"
                            ref="last"
                            v-model="lastName" />
            </v-col>
            <v-col cols="4" class="py-0 my-0">
              <v-text-field :messages="messages['first']"
                            :rules="requiredRules"
                            @blur="messages = {}"
                            @focus="messages['first'] = 'First Name'"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            placeholder="First Name"
                            ref="first"
                            v-model="firstName" />
            </v-col>
            <v-col cols="4" class="py-0 my-0">
              <v-text-field :messages="messages['middle']"
                            @blur="messages = {}"
                            @focus="messages['middle'] = 'Middle Name'"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            placeholder="Middle Name (Optional)"
                            ref="middle"
                            v-model="middleName" />
            </v-col>
          </v-row>
          <!--ADDDRESS !-->
          <v-row class="mt-2">
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
                            v-model="address1" />
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
                            v-model="address2" />
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
                            v-model="city" />
            </v-col>
            <v-col cols="6" class="py-0 my-0">
              <v-select :items="provinces"
                        :rules="requiredRules"
                        dense
                        filled
                        height="50"
                        hide-details="auto"
                        placeholder="Province"
                        ref="provinceState"
                        v-model="provinceState" />
            </v-col>
          </v-row>
          <v-row class="mt-2">
            <v-col cols="6" class="py-0 my-0">
              <v-select :items="countries"
                        :rules="requiredRules"
                        dense
                        filled
                        height="50"
                        hide-details="auto"
                        placeholder="Canada"
                        ref="country"
                        v-model="country" />
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
                            v-model="postalCode" />
            </v-col>
          </v-row>
          <v-row class="mt-2">
            <v-col cols="6" class="py-0 my-0">
              <v-text-field :messages="messages['juris']"
                            :rules="requiredRules"
                            @blur="messages = {}"
                            @focus="messages['juris'] = 'Business Jurisdiction'"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            placeholder="Business Jurisdiction"
                            v-model="jurisdiction" />
            </v-col>
            <v-col cols="6" class="py-0 my-0">
              <v-checkbox label="I have an NWPTA Reservation Number" v-model="haveNWPTA" />
            </v-col>
          </v-row>
          <v-row class="my-n4">
            <v-col cols="7">
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
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class ApplicantInfo1 extends Vue {
  countries = [
    { text: 'Canada', value: 'CA' },
    { text: 'United States', value: 'US' },
    { text: 'Other', value: 'OT' }
  ]
  messages = {}
  provinces = [
    { text: 'British Columbia', value: 'BC' },
    { text: 'Alberta', value: 'AB' },
    { text: 'Saskatchewan', value: 'SK' },
    { text: 'Yukon', value: 'YK' }
  ]
  requiredRules = [
    v => !!v || 'Required field'
  ]
  step1Valid: boolean = false

  get actingOnOwnBehalf () {
    return newReqModule.actingOnOwnBehalf
  }
  get address1 () {
    return newReqModule.address1
  }
  get address2 () {
    return newReqModule.address2
  }
  get city () {
    return newReqModule.city
  }
  get country () {
    return newReqModule.country
  }
  get firstName () {
    return newReqModule.firstName
  }
  get firstNameRef () {
    return this.$refs.firstName
  }
  get haveNWPTA () {
    return newReqModule.haveNWPTA
  }
  get jurisdiction () {
    return newReqModule.jurisdiction
  }
  get lastName () {
    return newReqModule.lastName
  }
  get middleName () {
    return newReqModule.middleName
  }
  get postalCode () {
    return newReqModule.postalCode
  }
  get provinceState () {
    return newReqModule.provinceState
  }
  get submissionType () {
    return newReqModule.submissionType
  }
  set actingOnOwnBehalf (value) {
    newReqModule.mutateActingOnOwnBehalf(value)
  }
  set address1 (value) {
    newReqModule.mutateAddress1(value)
  }
  set address2 (value) {
    newReqModule.mutateAddress2(value)
  }
  set city (value) {
    newReqModule.mutateCity(value)
  }
  set country (value) {
    newReqModule.mutateCountry(value)
  }
  set firstName (value) {
    newReqModule.mutateFirstName(value)
  }
  set haveNWPTA (value) {
    newReqModule.mutateHaveNWPTA(value)
  }
  set jurisdiction (value) {
    newReqModule.mutateJurisdiction(value)
  }
  set lastName (value) {
    newReqModule.mutateLastName(value)
  }
  set middleName (value) {
    newReqModule.mutateMiddleName(value)
  }
  set postalCode (value) {
    newReqModule.mutatePostalCode(value)
  }
  set provinceState (value) {
    newReqModule.mutateProvinceState(value)
  }

  clearValidation (e) {
    if (this.$refs.step1 as Vue) {
      (this.$refs.step1 as any).resetValidation()
    }
    return e
  }
  showNextTab () {
    newReqModule.mutateSubmissionTabComponent('ApplicantInfo2')
  }
  showPreviousTab () {
    newReqModule.mutateSubmissionTabComponent('SendForExamination')
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
