<template>
  <v-form v-model="isValid" ref="step1" id="applicant-info-1-form">
    <v-container fluid class="pa-0 mt-5" id="applicant-info-1">
      <v-row>
        <v-col cols="2" class="h6 align-self-start pt-0">Applicant</v-col>
        <v-col cols="10" class="py-0">
          <!--FIRST NAME, LAST NAME, MIDDLE NAME-->
          <v-row>
            <v-col cols="4" class="pt-0">
              <label for="lastname" class="hidden">Last Name</label>
              <v-text-field :messages="messages['lastName']"
                            :rules="firstLastNameRules"
                            :value="applicant.lastName"
                            @blur="messages = {}"
                            @input="mutateApplicant('lastName', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            id="lastname"
                            :name="Math.random()"
                            autocomplete="chrome-off"
                            label="Last Name" />
            </v-col>
            <v-col cols="4" class="pt-0">
              <label for="firstname" class="hidden">First Name</label>
              <v-text-field :messages="messages['firstName']"
                            :rules="firstLastNameRules"
                            :value="applicant.firstName"
                            @blur="messages = {}"
                            @input="mutateApplicant('firstName', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            id="firstname"
                            :name="Math.random()"
                            autocomplete="chrome-off"
                            label="First Name" />
            </v-col>
            <v-col cols="4" class="pt-0">
              <label for="middlename" class="hidden">Middle Name (Optional)</label>
              <v-text-field :messages="messages['middleName']"
                            :value="applicant.middleName"
                            :rules="middleNameRules"
                            @blur="messages = {}"
                            @input="mutateApplicant('middleName', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            id="middlename"
                            :name="Math.random()"
                            autocomplete="chrome-off"
                            label="Middle Name (Optional)" />
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
                                id="line1"
                                :name="Math.random()"
                                autocomplete="chrome-off"
                                placeholder="Start typing an address here..."
                                ref="Line1"
                                single-line />
                </template>
                <v-list class="ma-0 pa-0" style="border-radius: 0">
                  <v-list-item dense v-if="!addressSuggestions && applicant.addrLine1" class="pa-2">
                    <v-progress-circular color="orange" id="address-suggest-spinner" indeterminate size="25" />
                    <span class="pl-2">Searching...</span>
                  </v-list-item>
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
                       @click.prevent="queryAddress(address.Id)"
                       @focus="highlightedSuggestion = address.Id"
                       class="link-sm-dk-text"
                       href="#">{{ address.Text + ', ' + address.Description }}</a>
                  </v-list-item>
                  <v-divider class="mb-2"/>
                  <v-list-item>
                    <v-container class="ma-0 pa-0 copy-small">
                      <v-row>
                        <v-col class="ma-0 px-6 pb-4 text-right"
                               align-self="center"><label class="h5" for="country2">Country</label></v-col>
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
                                                                    id="country2"
                                                                    name="country2"
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
              <label for="line2" class="hidden">Additional Street Address (Optional)</label>
              <v-text-field :messages="messages['Line2']"
                            :value="applicant.addrLine2"
                            @blur="messages = {}"
                            @focus="handleFocus('Line2', 'Street Address 2 (Optional)')"
                            @input="updateApplicant('addrLine2', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            id="1ine2"
                            :name="Math.random()"
                            autocomplete="chrome-off"
                            label="Additional Street Address (Optional)"
                            ref="Line2" />
            </v-col>
          </v-row>

          <v-row class="mt-2" v-if="(applicant.addrLine2 || applicant.addrLine3) && !showAddressMenu">
            <v-col cols="12" class="py-0 my-0">
              <label for="line3" class="hidden">Additional Street Address (Optional)</label>
              <v-text-field :messages="messages['Line3']"
                            :value="applicant.addrLine3"
                            @blur="messages = {}"
                            @focus="handleFocus('Line2', 'Street Address 3 (Optional)')"
                            @input="updateApplicant('addrLine3', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            id="line3"
                            :name="Math.random()"
                            autocomplete="chrome-off"
                            label="Additional Street Address (Optional)"
                            ref="Line3" />
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="6" class="py-0 my-0">
              <label for="city" class="hidden">City</label>
              <v-text-field :messages="messages['City']"
                            :rules="requiredRules"
                            :value="applicant.city"
                            @blur="messages = {}"
                            @focus="handleFocus('City', 'City')"
                            @input="updateApplicant('city', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            id="city"
                            :name="Math.random()"
                            autocomplete="chrome-off"
                            label="City"
                            ref="City"
              />
            </v-col>
            <v-col cols="6" class="py-0 my-0" v-if="applicant.countryTypeCd === 'CA'">
              <label for="province" class="hidden">Province</label>
              <v-select :items="provinceOptions"
                        :messages="messages['Province']"
                        :rules="requiredRules"
                        :value="applicant.stateProvinceCd"
                        @input="updateApplicant('stateProvinceCd', $event)"
                        @blur="messages = {}"
                        @focus="handleFocus('Province', 'Province')"
                        dense
                        filled
                        height="50"
                        hide-details="auto"
                        id="province"
                        :name="Math.random()"
                        autocomplete="chrome-off"
                        label="Province"
                        ref="Province" />
            </v-col>
            <v-col cols="6" class="py-0 my-0" v-else-if="applicant.countryTypeCd === 'US'">
              <label for="state" class="hidden">State</label>
              <v-select :items="$USAStateCodes"
                        :messages="messages['State']"
                        :rules="requiredRules"
                        :value="applicant.stateProvinceCd"
                        @input="updateApplicant('stateProvinceCd', $event)"
                        @blur="messages = {}"
                        @focus="handleFocus('State', 'State')"
                        dense
                        filled
                        height="50"
                        hide-details="auto"
                        id="state"
                        name="state"
                        placeholder="State"
                        ref="state" />
            </v-col>
            <v-col cols="6" class="py-0 my-0" v-else>
              <label for="state" class="hidden">Province/State (Optional, 2 letters max)</label>
              <v-text-field :messages="messages['Province']"
                            :rules="provStateRules"
                            :value="applicant.stateProvinceCd"
                            @blur="messages = {}"
                            @focus="handleFocus('Province', 'Province/State (Optional, 2 letters max)')"
                            @input="updateApplicant('stateProvinceCd', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            id="state"
                            :name="Math.random()"
                            autocomplete="chrome-off"
                            label="Province/State (Optional, 2 letters max)"
                            ref="state" />
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="6" class="py-0 my-0">
              <label for="country" class="hidden">Country</label>
              <v-select :items="countryOptions"
                        :menu-props="{eager: true, auto: true}"
                        :rules="requiredRules"
                        :value="applicant.countryTypeCd"
                        @input="updateApplicant('countryTypeCd', $event)"
                        cache-items
                        dense
                        eager
                        filled
                        height="50"
                        hide-details="auto"
                        id="country"
                        name="country"
                        placeholder="Country"
                        ref="Country" />
            </v-col>
            <v-col cols="6" class="py-0 my-0">
              <label for="postalcode" class="hidden">Postal/Zip Code</label>
              <v-text-field :messages="messages['PostalCode']"
                            :rules="requiredRules"
                            :value="applicant.postalCd"
                            @blur="messages = {}"
                            @focus="handleFocus('PostalCode', 'Postal / Zip Code')"
                            @input="updateApplicant('postalCd', $event)"
                            dense
                            filled
                            height="50"
                            hide-details="auto"
                            id="postalcode"
                            :name="Math.random()"
                            autocomplete="chrome-off"
                            label="Postal/Zip Code" />
            </v-col>
          </v-row>

          <v-row class="mt-2" v-if="showXproJurisdiction && showAllFields && editMode">
            <v-col cols="6" class="py-0 my-0">
              <label for="xprojurisdiction" class="hidden">Business Jurisdiction</label>
              <v-select :messages="messages['xproJurisdiction']"
                        :items="jurisdictionOptions"
                        :rules="requiredRules"
                        :value="nrData.xproJurisdiction"
                        @blur="messages = {}"
                        @focus="handleFocus('xproJurisdiction', 'Business xproJurisdiction')"
                        @input="updateBusinessInfo('xproJurisdiction', $event)"
                        dense
                        eager
                        filled
                        height="50"
                        hide-details="auto"
                        id="xprojurisdiction"
                        name="xprojurisdiction"
                        placeholder="Business Jurisdiction" />
            </v-col>
            <v-col cols="6" class="py-0 my-0" />
          </v-row>

          <v-row class="mt-5">
            <v-col cols="7" class="py-0">
              <v-checkbox
                hide-details
                label="I am completing this reservation on my own behalf"
                v-model="actingOnOwnBehalf"
                class="mt-2 pt-0"
              />
            </v-col>
            <ApplicantInfoNav @nextAction="nextAction()" />
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import newReqModule from '@/store/new-request-module'
import ApplicantInfoNav from '@/components/common/applicant-info-nav.vue'
import { Location } from '@/enums'
import NameRequestMixin from '@/components/mixins/name-request-mixin'

const _debounce = require('lodash/debounce')

@Component({
  components: {
    ApplicantInfoNav
  }
})
export default class ApplicantInfo1 extends NameRequestMixin {
  debouncedGetAddressSuggestions = _debounce(this.getAddressSuggestions, 400)
  highlightedSuggestion: string | null = null
  isValid: boolean = false
  messages = {}
  provStateRules = [
    v => typeof v === 'string' || 'Must be letters only',
    v => v.length <= 2 || 'Max 2 characters'
  ]
  firstLastNameRules = [
    v => !!v || 'Required field',
    v => (!v || v.length <= 50) || 'Cannot exceed 50 characters'
  ]
  middleNameRules = [
    v => (!v || v.length <= 50) || 'Cannot exceed 50 characters'
  ]
  requiredRules = [
    v => !!v || 'Required field'
  ]
  showAddressMenu: boolean = false

  @Watch('countryTypeCd')
  handleProvince (newVal, oldVal) {
    if (newVal !== oldVal) {
      newReqModule.updateApplicantDetails({ key: 'stateProvinceCd', value: '' })
    }
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

  @Watch('xproJurisdiction')
  watchXproJurisdiction (newVal, oldVal) {
    if (newVal !== oldVal) {
      if (this.editMode && newVal === this.nr.xproJurisdiction) {
        newReqModule.mutateCorpNum(this.nr.corpNum)
        return
      }
      newReqModule.mutateCorpNum('')
    }
  }

  mounted () {
    // add event listener when this component is mounted
    // eg, when user continues to send for review
    this.$el.addEventListener('keydown', this.handleKeydown)
  }

  destroyed () {
    // remove the event listener when this component is destroyed
    // eg, when user clicks Start Search Over
    this.$el.removeEventListener('keydown', this.handleKeydown)
  }

  get isVisible (): boolean {
    const myComponent = (
      newReqModule.displayedComponent === 'SubmissionTabs' ||
      newReqModule.displayedComponent === 'ExistingRequestEdit'
    )
    const myTab = (newReqModule.submissionTabNumber === 2)
    return (myComponent && myTab)
  }

  @Watch('isVisible')
  private onVisibleChanged (val: boolean) {
    if (val) {
      // add event listener when this component is displayed
      // eg, when user comes back from next tab
      this.$el.addEventListener('keydown', this.handleKeydown)
    } else {
      // remove the event listener when this component is hidden
      // eg, when user continues to next tab
      this.$el.removeEventListener('keydown', this.handleKeydown)
    }
  }

  get actingOnOwnBehalf () {
    return newReqModule.actingOnOwnBehalf
  }
  get addressSuggestions () {
    return newReqModule.addressSuggestions
  }
  get applicant () {
    // if applicant is null/undefined then return an object
    // to prevent dereference errors (ie, cannot read property X of undefined)
    return newReqModule.applicant || {}
  }
  get countryOptions () {
    return this.$intJurisdictions
  }
  get countryTypeCd () {
    return newReqModule.applicant?.countryTypeCd || ''
  }
  get jurisdictionOptions () {
    return this.location === Location.Canadian
      ? this.$canJurisdictions.filter(jur => jur.value !== Location.BC)
        .map(jurisdiction => ({ value: jurisdiction.text, text: jurisdiction.text }))
      : this.$intJurisdictions.filter(jur => jur.value !== Location.Canadian)
        .map(jurisdiction => ({ value: jurisdiction.text, text: jurisdiction.text }))
  }
  get location () {
    return newReqModule.location
  }
  get provinceOptions () {
    return this.$canJurisdictions.map(jurisdiction => ({ value: jurisdiction.value, text: jurisdiction.text }))
  }
  get showAllFields () {
    return (!this.editMode || this.nrState === 'DRAFT')
  }
  get showXproJurisdiction () {
    return newReqModule.showXproJurisdiction
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
  get xproJurisdiction () {
    return newReqModule.nrData.xproJurisdiction
  }
  set actingOnOwnBehalf (value) {
    newReqModule.mutateActingOnOwnBehalf(value)
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
  getCorpNum (num) {
    newReqModule.getCorpNum(num)
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
    if (this.showAddressMenu && event.key === 'Escape') {
      this.showAddressMenu = false
    }
    if (this.addressSuggestions?.[0] && this.showAddressMenu) {
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
      return event
    }
  }
  mutateApplicant (key, value) {
    newReqModule.mutateApplicant({ key, value })
  }
  mutateCorpNum (num) {
    newReqModule.mutateCorpNum(num)
  }
  queryAddress (id) {
    newReqModule.getAddressDetails(id)
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

  @Watch('isValid')
  onValidChanged (val: boolean) {
    if (val) {
      this.$nextTick(() => {
        // add classname to button text (for more detail in Sentry breadcrumbs)
        this.$el.querySelector("#submit-back-btn > span")?.classList.add("applicant-back-btn")
        this.$el.querySelector("#submit-continue-btn > span")?.classList.add("applicant-continue-btn")
      })
    }
  }

  nextAction () {
    this.validate()
    if (this.isValid) {
      this.next()
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/theme.scss";

.highlight-list-item {
  background-color: $gray2;
}
</style>
