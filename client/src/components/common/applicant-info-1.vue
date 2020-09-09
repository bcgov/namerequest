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
                            @blur="message21s = {}"
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
                                :value="applicant.addrLine1"
                                @blur="blurAddress1"
                                @input="updateApplicant('addrLine1', $event)"
                                class="pa-0"
                                dense
                                filled
                                height="50"
                                hide-details="auto"
                                id="Line1"
                                placeholder="Start typing an address here..."
                                ref="Line1"
                                single-line />
                </template>
                <v-list class="ma-0 pa-0" style="border-radius: 0">
                  <v-list-item dense v-if="!addressSuggestions && applicant.addrLine1" class="pa-2">
                    <v-progress-circular color="orange"
                                         id="address-suggest-spinner"
                                         indeterminate
                                         size="25" />
                    Searching...</v-list-item>
                  <v-list-item class="pa-2"
                               dense
                               v-if="!addressSuggestions && !applicant.addrLine1">
                    Start typing an address to get suggestions
                  </v-list-item>
                  <v-list-item :class="getClass(address.Id)"
                               :id="address.Id"
                               :key="address.Text + '-' + i"
                               dense
                               style="cursor: pointer"
                               v-for="(address, i) of addressSuggestions">
                    <a :ref="address.Id"
                       href="#"
                       @focus="highlightedSuggestion = address.Id"
                       @click.prevent="queryAddress(address.Id)"
                       class="link-sm-dk-text">{{ address.Text + ', ' + address.Description }}</a>
                  </v-list-item>
                  <v-divider class="mb-2"/>
                  <v-list-item>
                    <v-container class="ma-0 pa-0 copy-small">
                      <v-row>
                        <v-col class="ma-0 px-6 pb-4 text-right"
                               align-self="center"><h5>Country</h5></v-col>
                        <v-col cols="5" class="ma-0 pa-0"><v-select :items="countryOptions"
                                                                    :menu-props="{ auto: true, eager: true }"
                                                                    :value="applicant.countryTypeCd"
                                                                    @click.capture.stop
                                                                    @input="updateApplicant('countryTypeCd', $event)"
                                                                    class="mb-1 copy-small mr-2"
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
          <v-row class="mt-2" v-if="applicant.addrLine1 && !showAddressMenu">
            <v-col cols="12" class="py-0 my-0">
              <v-text-field :messages="messages['Line2']"
                            :value="applicant.addrLine2"
                            @blur="messages = {}"
                            @focus="handleFocus('Line2', 'Street Address 2 (Optional)')"
                            @input="updateApplicant('addrLine2', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            id="Line2"
                            placeholder="Additional Street Address (Optional)"
                            ref="Line2" />
            </v-col>
          </v-row>
          <v-row class="mt-2" v-if="applicant.addrLine2 && !showAddressMenu">
            <v-col cols="12" class="py-0 my-0">
              <v-text-field :messages="messages['Line3']"
                            :value="applicant.addrLine3"
                            @blur="messages = {}"
                            @focus="handleFocus('Line2', 'Street Address 3 (Optional)')"
                            @input="updateApplicant('addrLine3', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            id="Line3"
                            placeholder="Additional Street Address (Optional)"
                            ref="Line3" />
            </v-col>
          </v-row>
          <v-row class="mt-2">
            <v-col cols="6" class="py-0 my-0">
              <v-text-field
                            :messages="messages['City']"
                            :rules="requiredRules"
                            :value="applicant.city"
                            @blur="messages = {}"
                            @focus="handleFocus('City', 'City')"
                            @input="updateApplicant('city', $event)"
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
              <v-select :items="provinceOptions"
                        :rules="requiredRules"
                        :value="applicant.stateProvinceCd"
                        @input="updateApplicant('stateProvinceCd', $event)"
                        dense
                        filled
                        height="50"
                        hide-details="auto"
                        id="Province"
                        placeholder="Province"
                        ref="Province"
                        v-if="applicant.countryTypeCd === 'CA'" />
              <v-text-field :rules="requiredRules"
                            :value="applicant.stateProvinceCd"
                            @blur="messages = {}"
                            @focus="handleFocus('Province', 'Province/State')"
                            @input="updateApplicant('stateProvinceCd', $event)"
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
                        @input="updateApplicant('countryTypeCd', $event)"
                        :value="applicant.countryTypeCd" />
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
                            @input="updateApplicant('postalCd', $event)"
                            :value="applicant.postalCd" />
            </v-col>
          </v-row>
          <v-row class="mt-2" v-if="location !== 'BC' && showAllFields">
            <v-col cols="6" class="py-0 my-0">
              <v-select :messages="messages['xproJurisdiction']"
                        :rules="requiredRules"
                        @blur="messages = {}"
                        @focus="handleFocus('xproJurisdiction', 'Business xproJurisdiction')"
                        dense
                        filled
                        eager
                        :items="jurisdictionOptions"
                        height="50"
                        hide-details="auto"
                        placeholder="Business xproJurisdiction"
                        @input="updateBusinessInfo('xproJurisdiction', $event)"
                        :value="nrData.xproJurisdiction" />
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
                     v-if="submissionType === 'examination' || nrState === 'DRAFT' "
                     x-large>{{ editMode ? 'Previous' : 'Back' }}</v-btn>
              <v-btn @click="showNextTab()"
                     id="submit-continue-btn"
                     v-if="step1Valid"
                     x-large>{{ editMode ? 'Next' : 'Continue' }}</v-btn>
              <v-btn @click="validate()"
                     id="submit-continue-btn-disabled"
                     v-else
                     x-large>{{ editMode ? 'Next' : 'Continue' }}</v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Watch } from 'vue-property-decorator'

const _debounce = require('lodash/debounce')

@Component({})
export default class ApplicantInfo1 extends Vue {
  highlightedSuggestion: string | null = null
  messages = {}
  requiredRules = [
    v => !!v || 'Required field'
  ]
  showAddressMenu: boolean = false
  step1Valid: boolean = false
  debouncedGetAddressSuggestions = _debounce(this.getAddressSuggestions, 400)

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

  beforeDestoy () {
    this.$el.removeEventListener('keydown', this.handleKeydown)
  }
  mounted () {
    this.$el.addEventListener('keydown', this.handleKeydown)
    // CanadaPost Address Complete needs a country to begin working right away, assume Canada
    if (!this.editMode) {
      this.updateApplicant('countryTypeCd', 'CA')
      return
    }
  }

  get actingOnOwnBehalf () {
    return newReqModule.actingOnOwnBehalf
  }
  get addressSuggestions () {
    return newReqModule.addressSuggestions
  }
  get applicant () {
    return newReqModule.applicant
  }
  get countryOptions () {
    return this.$intJurisdictions
  }
  get editMode () {
    return newReqModule.editMode
  }
  get provinceOptions () {
    return this.$canJurisdictions.map(jurisdiction => ({ value: jurisdiction.value, text: jurisdiction.text }))
  }
  get jurisdictionOptions () {
    if (this.location === 'IN') {
      return this.$intJurisdictions.map(jurisdiction => ({ value: jurisdiction.text, text: jurisdiction.text }))
    }
    return this.$canJurisdictions.map(jurisdiction => ({ value: jurisdiction.text, text: jurisdiction.text }))
  }
  get location () {
    return newReqModule.location
  }
  get nrData () {
    return newReqModule.nrData
  }
  get nrState () {
    return newReqModule.nrState
  }
  get provinceStateOptions () {
    if (this.location === 'IN') {
      return null
    }
    return this.$canJurisdictions
  }
  get showAllFields () {
    return (!this.editMode || this.nrState === 'DRAFT')
  }
  get state () {
    if (newReqModule.nr && newReqModule.nr.state) {
      return newReqModule.nr.state
    }
    return null
  }
  get submissionType () {
    return newReqModule.submissionType
  }
  set actingOnOwnBehalf (value) {
    newReqModule.mutateActingOnOwnBehalf(value)
  }
  get xproJurisdiction () {
    return newReqModule.nrData.xproJurisdiction
  }

  blurAddress1 () {
    this.messages = {}
  }
  clearValidation () {
    if (this.$refs.step1 as any) {
      (this.$refs.step1 as any).resetValidation()
    }
  }
  getAddressSuggestions (key, value) {
    newReqModule.getAddressSuggestions({ key, value })
  }
  getClass (Id) {
    if (this.highlightedSuggestion) {
      if (Id === this.highlightedSuggestion) {
        return 'highlight-list-item'
      }
    }
    return ''
  }
  handleFocus (id, message) {
    this.messages[id] = message
    if (id !== 'addrLine1') {
      this.showAddressMenu = false
    }
  }
  handleKeydown (event) {
    if (!this.showAddressMenu) {
      return event
    }
    if (this.addressSuggestions && this.showAddressMenu) {
      if (event.key === 'Tab') {
        event.preventDefault()
        if (!this.highlightedSuggestion) {
          let { Id } = this.addressSuggestions[0]
          this.highlightedSuggestion = Id
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
      if (event.key === 'Enter' && this.highlightedSuggestion && this.highlightedSuggestion !== 'Country2') {
        event.preventDefault()
        this.queryAddress(this.highlightedSuggestion)
        this.showAddressMenu = false
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
    newReqModule.mutateSubmissionTabComponent('NamesCapture')
  }
  updateApplicant (key, value) {
    this.clearValidation()
    newReqModule.updateApplicantDetails({ key, value })
    if (key === 'addrLine1') {
      this.showAddressMenu = true
      this.debouncedGetAddressSuggestions(key, value)
      return
    }
    if (this.showAddressMenu && key === 'countryTypeCd') {
      this.$nextTick(function () {
        this.showAddressMenu = true
        let appKV = {
          key: 'addrLine1',
          value: this.applicant.addrLine1
        }
        newReqModule.getAddressSuggestions(appKV)
      })
      return
    }
    this.showAddressMenu = false
  }
  updateBusinessInfo (key, value) {
    newReqModule.mutateNRData({ key, value })
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
  background-color: $grey-3
</style>
