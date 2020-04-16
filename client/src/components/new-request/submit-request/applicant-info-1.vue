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
              <v-text-field :messages="messages['lastName']"
                            :rules="requiredRules"
                            :value="applicant.lastName"
                            @blur="messages = {}"
                            @focus="handleFocus('lastName', 'Last Name')"
                            @input="updateApplicant('lastName', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            id="lastname"
                            placeholder="Last Name" />
            </v-col>
            <v-col cols="4" >
              <v-text-field :messages="messages['firstName']"
                            :rules="requiredRules"
                            :value="applicant.firstName"
                            @blur="messages = {}"
                            @focus="handleFocus('firstName', 'First Name')"
                            @input="updateApplicant('firstName', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            id="firstName"
                            placeholder="First Name" />
            </v-col>
            <v-col cols="4">
              <v-text-field :messages="messages['middleName']"
                            :value="applicant.middleName"
                            @blur="messages = {}"
                            @focus="handleFocus('middleName', 'Middle Name')"
                            @input="updateApplicant('middleName', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            placeholder="Middle Name (Optional)" />
            </v-col>
          </v-row>
          <!--ADDDRESS !-->
          <v-row class="mt-n1">
            <v-col cols="12" class="py-0 my-0">
              <v-menu bottom
                      class="pa-2"
                      dense
                      max-width="600"
                      offset-y
                      v-model="showAddressMenu">
                <!-- Using activator slot to avoid having to absoluetly position v-menu. Visibility is controlled by
                "showAddressMenu" field, "on" function provided by slot is used only to supress error message-->
                <template v-slot:activator="{ on }">
                  <v-text-field :messages="messages['Line1']"
                                :rules="requiredRules"
                                :value="applicant.Line1"
                                @blur="messages = {}"
                                @input="updateApplicant('Line1', $event)"
                                class="pa-0"
                                dense
                                filled
                                height="50"
                                hide-details="auto"
                                id="Line1"
                                placeholder="Start typing address here..."
                                ref="Line1"
                                single-line />
                </template>
                <v-list class="ma-0 pa-0" style="border-radius: 0">
                  <v-list-item dense v-if="!addressSuggestions && applicant.Line1" class="pa-2">
                    <v-progress-circular color="orange"
                                         id="address-suggest-spinner"
                                         indeterminate
                                         size="25" />
                    Searching...</v-list-item>
                  <v-list-item class="pa-2"
                               dense
                               v-if="!addressSuggestions && !applicant.Line1">
                    Start typing an address to get suggestions
                  </v-list-item>
                  <v-list-item :class="getClass(address.Id)"
                               :id="address.Id"
                               :key="address.Text + '-' + i"
                               @click.once="queryAddress(address.Id)"
                               dense
                               style="cursor: pointer"
                               v-for="(address, i) of addressSuggestions">
                    <a :ref="address.Id"
                       @focus="highlightedSuggestion = address.Id"
                       class="link-small-copy"
                       href="#">{{ address.Text + ', ' + address.Description }}</a>
                  </v-list-item>
                  <v-divider class="mb-2"/>
                  <v-list-item>
                    <v-container class="ma-0 pa-0 small-copy">
                      <v-row>
                        <v-col class="ma-0 px-6 pb-4 text-right"
                               align-self="center"><h5>Country</h5></v-col>
                        <v-col cols="5" class="ma-0 pa-0"><v-select :items="countryOptions"
                                                                    :menu-props="{ auto: true, eager: true }"
                                                                    :value="applicant.Country"
                                                                    @click.capture.stop
                                                                    @input="updateApplicant('Country', $event)"
                                                                    class="mb-1 small-copy mr-2"
                                                                    dense
                                                                    eager
                                                                    filled
                                                                    hide-details
                                                                    id="Country2"
                                                                    ref="Country2" />
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
          </v-row>
          <v-row class="mt-2">
            <v-col cols="12" class="py-0 my-0">
              <v-text-field :messages="messages['Line2']"
                            :value="applicant.Line2"
                            @blur="messages = {}"
                            @focus="handleFocus('Line2', 'Street Address 2 (Optional)')"
                            @input="updateApplicant('Line2', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            id="Line2"
                            placeholder="Additional Street Address (Optional)"
                            ref="Line2" />
            </v-col>
          </v-row>
          <v-row class="mt-2">
            <v-col cols="6" class="py-0 my-0">
              <v-text-field
                            :messages="messages['City']"
                            :rules="requiredRules"
                            :value="applicant.City"
                            @blur="messages = {}"
                            @focus="handleFocus('City', 'City')"
                            @input="updateApplicant('City', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            id="City"
                            placeholder="City"
                            ref="City"
              />
            </v-col>
            <v-col cols="6" class="py-0 my-0">
              <v-select :items="jurisdictionOptions"
                        :rules="requiredRules"
                        :value="applicant.Province"
                        @input="updateApplicant('Province', $event)"
                        dense
                        filled
                        height="50"
                        hide-details="auto"
                        id="Province"
                        placeholder="Province"
                        ref="Province"
                        v-if="applicant.Country === 'CA'" />
              <v-text-field :rules="requiredRules"
                            :value="applicant.Province"
                            @blur="messages = {}"
                            @focus="handleFocus('Province', 'Province/State')"
                            @input="updateApplicant('Province', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            id="Province"
                            placeholder="Province/State"
                            ref="Province"
                            v-else />
            </v-col>
          </v-row>
          <v-row class="mt-2">
            <v-col cols="6" class="py-0 my-0">
              <v-select :items="countryOptions"
                        :rules="requiredRules"
                        dense
                        :menu-props="{eager: true, auto: true}"
                        filled
                        eager
                        cache-items
                        height="50"
                        hide-details="auto"
                        id="Country"
                        placeholder="Country"
                        ref="Country"
                        @input="updateApplicant('Country', $event)"
                        :value="applicant.Country" />
            </v-col>
            <v-col cols="6" class="py-0 my-0">
              <v-text-field :messages="messages['PostalCode']"
                            :rules="requiredRules"
                            @blur="messages = {}"
                            @focus="handleFocus('PostalCode', 'Postal / Zip Code')"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            placeholder="Postal/Zip Code"
                            @input="updateApplicant('PostalCode', $event)"
                            :value="applicant.PostalCode" />
            </v-col>
          </v-row>
          <v-row class="mt-2" v-if="location !== 'BC'">
            <v-col cols="6" class="py-0 my-0">
              <v-select :messages="messages['Jurisdiction']"
                        :rules="requiredRules"
                        @blur="messages = {}"
                        @focus="handleFocus('Jurisdiction', 'Business Jurisdiction')"
                        dense
                        filled
                        eager
                        :items="jurisdictionOptions"
                        height="50"
                        hide-details="auto"
                        placeholder="Business Jurisdiction"
                        @input="updateApplicant('Jurisdiction', $event)"
                        :value="applicant.Jurisdiction" />
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
import jurisdictionsCA from '@/store/list-data/canada-jurisdictions'
import jurisdictionsIN from '@/store/list-data/intl-jurisdictions'
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Watch } from 'vue-property-decorator'

@Component({})
export default class ApplicantInfo1 extends Vue {
  show = true
  messages = {}
  listener: any = null
  requiredRules = [
    v => !!v || 'Required field'
  ]
  step1Valid: boolean = false
  highlightedSuggestion: string | null = null
  showAddressMenu: boolean = false

  mounted () {
    this.updateApplicant('provState', 'BC')
    this.updateApplicant('Country', 'CA')
    document.addEventListener('keydown', this.handleKeydown)
  }
  beforeDestoy () {
    document.removeEventListener('keydown', this.handleKeydown)
  }

  @Watch('showAddressMenu')
  supressMenu (newVal, oldVal) {
    if (newVal) {
      this.clearValidation()
      return
    }
    this.highlightedSuggestion = null
    let ref: any = this.$refs.Line1
    ref.focus()
  }

  get actingOnOwnBehalf () {
    return newReqModule.actingOnOwnBehalf
  }
  set actingOnOwnBehalf (value) {
    newReqModule.mutateActingOnOwnBehalf(value)
  }
  get addressSuggestions () {
    return newReqModule.addressSuggestions
  }
  get applicant () {
    return newReqModule.applicant
  }
  get countryOptions () {
    return jurisdictionsIN
  }
  /* get disableSuggestions () {
    return newReqModule.disableSuggestions
  }
  set disableSuggestions (value) {
    newReqModule.mutateDisableSuggestions(value)
  } */
  get jurisdictionOptions () {
    if (this.location === 'IN') {
      return jurisdictionsIN
    }
    return jurisdictionsCA
  }
  get location () {
    return newReqModule.location
  }
  get provinceStateOptions () {
    if (this.location === 'IN') {
      return null
    }
    return jurisdictionsCA
  }
  get submissionType () {
    return newReqModule.submissionType
  }

  clearValidation () {
    if (this.$refs.step1 as any) {
      (this.$refs.step1 as any).resetValidation()
    }
  }
  getClass (Id) {
    if (this.highlightedSuggestion) {
      if (Id === this.highlightedSuggestion) {
        return 'highlight-list-item'
      }
    }
    return ''
  }
  handleClick (id) {
    newReqModule.getAddressDetails(id)
  }
  handleFocus (id, message) {
    this.messages[id] = message
    if (id !== 'Line1') {
      this.showAddressMenu = false
    }
  }
  handleKeydown (event) {
    if (this.addressSuggestions && this.showAddressMenu) {
      if (event.key === 'Tab') {
        event.preventDefault()
        if (!this.highlightedSuggestion) {
          let { Id } = this.addressSuggestions[0]
          let ref: any = this.$refs[Id][0]
          ref.focus()
          return
        }
        if (this.highlightedSuggestion === 'Country2') {
          let { Id } = this.addressSuggestions[0]
          let ref: any = this.$refs[Id][0]
          ref.focus()
          return
        }
        let index = this.addressSuggestions.findIndex(suggestion => suggestion.Id === this.highlightedSuggestion)
        if (index === 2) {
          this.highlightedSuggestion = 'Country2'
          let ref: any = this.$refs.Country2
          ref.focus()
          return
        }
        let { Id } = this.addressSuggestions[index + 1]
        let ref: any = this.$refs[Id][0]
        ref.focus()
        return
      }
    }
  }
  queryAddress (id) {
    newReqModule.getAddressDetails(id)
  }
  showNextTab () {
    newReqModule.mutateSubmissionTabComponent('ApplicantInfo2')
  }
  showPreviousTab () {
    newReqModule.mutateSubmissionTabComponent('SendForExamination')
  }
  updateApplicant (key, value) {
    this.clearValidation()
    newReqModule.updateApplicantDetails({ key, value })
    if (this.showAddressMenu && key === 'Country') {
      this.$nextTick(function () {
        this.showAddressMenu = true
        let appKV = {
          value: this.applicant.Line1
        }
        newReqModule.getAddressSuggestions(appKV)
      })
      return
    }
    if (key === 'Line1') {
      this.showAddressMenu = true
      return
    }
    this.showAddressMenu = false
  }
  validate () {
    if (this.$refs.step1 as Vue) {
      (this.$refs.step1 as any).validate()
    }
  }
}
</script>

<style scoped lang="sass">
.highlight-list-item
  background-color: $grey-3 !important
</style>
