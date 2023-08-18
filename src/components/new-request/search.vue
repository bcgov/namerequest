<template>
  <v-container fluid id="search-container" class="copy-normal pa-10">
    <v-row no-gutters>
      <v-col cols="12" class="pt-0 font-weight-bold h6">
        Get started by selecting an action: [{{ getRequestActionCd }} / {{ getLocation }} / {{ entity_type_cd }}]
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <!-- Request Action -->
      <v-col cols="12" md="6" class="py-0">
        <v-tooltip
          top
          content-class="top-tooltip"
          transition="fade-transition"
          :disabled="!showRequestActionTooltip || isMobile"
        >
          <template v-slot:activator="scope">
            <div v-on="scope.on">
              <NestedSelect
                label="Action"
                :menuItems="RequestActions"
                :errorMessages="getErrors.includes('request_action_cd') ? 'Please select an action' : ''"
                :value="request"
                @change="setClearErrors(null); onRequestActionChange($event)"
              />
            </div>
          </template>
          <span>{{ request && request.text }}</span>
        </v-tooltip>
      </v-col>

      <!-- display a dummy input box when Request Action is not yet selected -->
      <v-col v-if="!request" cols="12" md="6" class="py-0">
        <v-text-field filled disabled label="Select an action first" />
      </v-col>

      <!-- Jurisdiction -->
      <v-col v-if="showJurisdiction" cols="12" md="6" class="py-0">
        <NestedSelect
          label="Select your home jurisdiction"
          :menuItems="jurisdictionOptions"
          :error-messages="getErrors.includes('jurisdiction') ? 'Please select a jurisdiction' : ''"
          :value="jurisdiction"
          @change="setClearErrors(null); onJurisdictionChange($event)"
        />
      </v-col>

      <!-- Entity Type -->
      <v-col v-if="showEntityType" cols="12" md="6" class="py-0">
        <v-tooltip
          top
          content-class="top-tooltip"
          :disabled="getRequestActionCd !== NrRequestActionCodes.CONVERSION || !entityConversionText || isMobile"
          transition="fade-transition"
        >
          <template v-slot:activator="scope">
            <div v-on="scope.on">
              <v-select
                id="entity-type-options-select"
                :label="getIsConversion ? 'Select type of business to alter into' : 'Select type of business in B.C.'"
                :error-messages="getErrors.includes('entity_type_cd') ? 'Please select a business type' : ''"
                :items="entityConversionTypeOptions"
                :menu-props="{ bottom: true, offsetY: true}"
                ref="selectBusinessTypeRef"
                @change="setClearErrors(null)"
                filled
                v-model="entity_type_cd"
              >
                <template v-slot:item="{ item }">
                  <v-tooltip
                    :right="isScreenLg"
                    :left="!isScreenLg"
                    :disabled="!item.blurbs || isMobile"
                    :content-class="!isScreenLg ? 'left-tooltip' : ''"
                    transition="fade-transition"
                  >
                    <template v-slot:activator="scope">
                      <span
                        v-on="scope.on"
                        class="list-item"
                        :class="{ 'last-select-item': item.value === 'INFO' }"
                      >{{ item.text }}</span>
                    </template>

                    <div v-for="(blurb, index) in entityBlurbs(item.value)" :key="`blurb-${index}`">
                      <span :class="{ 'tooltip-bullet': index !== 0}">
                        {{ blurb }}
                      </span>
                    </div>
                  </v-tooltip>
                </template>
              </v-select>
            </div>
          </template>
          <span>{{ entityConversionText }}</span>
        </v-tooltip>
      </v-col>
    </v-row>

    <!-- Business Lookup -->
    <v-row v-if="showBusinessLookup" no-gutters>
      <v-col cols="12">
        <BusinessLookup />
      </v-col>
    </v-row>

    <!-- Corporate Number checkbox, only for XPro Canadian locations -->
    <v-row v-if="isCanadian" no-gutters>
      <v-col class="d-flex justify-end">
        <v-tooltip
          top min-width="390"
          content-class="top-tooltip"
          transition="fade-transition"
          :disabled="isMobile"
        >
          <template v-slot:activator="{ on }">
            <v-checkbox
              :value="getHasNoCorpNum"
              @input="setNoCorpNum($event)"
              id="corp-num-checkbox"
              class="copy-small mt-0 pt-0"
              hide-details
              v-slot:label
              v-on="on"
            >
              <template>
                <span v-on="on" class="copy-small">I don't have a corporate number</span>
              </template>
            </v-checkbox>
          </template>

          <p>If you don't have or don't know the corporation number of the business, enter the full legal name of the
            business in its home jurisdiction.</p>

          <p>Note: If the home jurisdiction requires a name reservation, you may want to complete a name search in the
            home jurisdiction first to ensure that the name is available and then return to BC.</p>
        </v-tooltip>
      </v-col>
    </v-row>

    <!-- Bullets Colin Link component, only when an entity type is selected -->
    <BulletsColinLink
      v-if="entity_type_cd"
      :businessType="entity_type_cd"
      :colinButton="showColinButton"
      :showDesignation="showDesignationSelect"
      :showCompanyRadioBtn="showCompanyRadioBtn"
      :incorporateNowButtonText="incorporateNowButtonText"
      @radioButtonChange="selectedCompanyType = $event"
    >
      <template v-slot:name-input-slot>
        <NameInput
          v-if="!isFederal"
          :is-mras-search="(getIsXproMras && !getHasNoCorpNum)"
          :menu-props="{ bottom: true, offsetY: true}"
          id="name-input-component"
          class="pt-3"
          @emit-corp-num-validity="corpNumValid = $event"
        />
        <p v-else class="pl-3 text-body-2">{{ nameInputFederalText }}</p>
      </template>

      <template v-slot:designation>
        <v-col cols="12" sm="4">
          <v-select
            :error-messages="getErrors.includes('designation') ? 'Please enter a designation' : ''"
            filled
            :items="designationOptions"
            label="Enter designation"
            :readonly="!entity_type_cd"
            :menu-props="{ bottom: true, offsetY: true}"
            :value="getDesignation"
            @input="setDesignation($event)"
            class="mb-n3"
            @change="setClearErrors(null)"
          />
        </v-col>
      </template>
    </BulletsColinLink>

    <!-- Actions -->
    <div v-if="!isFederal && isNamedCompany" class="mt-3 text-center">
      <v-row justify="center" no-gutters>
        <v-col cols="auto">
          <v-btn
            id="search-name-btn"
            class="px-9"
            :class="{ 'mobile-btn' : isMobile }"
            :disabled="!corpNumValid"
            @click="handleSubmit(true)"
          >
            <v-icon left color="white" size="1.5rem">mdi-magnify</v-icon>
            Check this Name
          </v-btn>
        </v-col>
      </v-row>

      <v-row v-if="isPremiumOrStaff" class="pt-7" justify="center" no-gutters>
        <v-col cols="auto">
          <v-btn id="name-check-skip-btn" class="outlined pa-0" :ripple="false" text @click="handleSubmit(false)">
            <span>Submit this Name without checking</span>
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Vue, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

// bcregistry common
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

import BusinessLookup from '@/components/new-request/business-lookup.vue'

// Components
import { BulletsColinLink } from '../common'
import NameInput from './name-input.vue'
import NestedSelect from '../common/nested-select.vue'

// Interfaces / Enums / List Data
import { ConversionTypesI, EntityI, FormType, RequestActionsI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { AccountType, CompanyType, EntityType, Location, NrRequestActionCodes, NrRequestTypeCodes } from '@/enums'
import { CommonMixin } from '@/mixins'
import { CanJurisdictions, ConversionTypes, Designations, IntlJurisdictions, RequestActions }
  from '@/list-data'
import { GetFeatureFlag } from '@/plugins'

/**
 * This is the component that displays the new NR menus and flows.
 */
@Component({
  components: { BulletsColinLink, BusinessLookup, NameInput, NestedSelect }
})
export default class Search extends Mixins(CommonMixin) {
  // Refs
  $refs!: {
    selectBusinessTypeRef: FormType
  }

  // enums for template
  readonly NrRequestActionCodes = NrRequestActionCodes
  readonly RequestActions = RequestActions

  // Global getters
  @Getter getConversionType!: EntityType
  @Getter getConversionTypeOptions!: ConversionTypesI[]
  @Getter getDesignation!: string
  @Getter getEntityBlurbs!: Array<EntityI>
  @Getter getEntityTypeCd!: EntityType
  @Getter getEntityTypeOptions!: Array<EntityI>
  @Getter getEntityTextFromValue!: string
  @Getter getErrors!: string[]
  @Getter getHasNoCorpNum!: boolean
  @Getter getIsConversion!: boolean
  @Getter getIsXproMras!: boolean
  @Getter getJurisdictionCd!: string
  @Getter getLocation!: Location
  @Getter getLocationOptions!: any[]
  @Getter getRequestActionCd!: NrRequestActionCodes
  @Getter isMobile!: boolean
  @Getter isColinRequestType!: boolean

  // Global actions
  @Action setConversionType!: ActionBindingIF
  @Action setCorpSearch!: ActionBindingIF
  @Action setClearErrors!: ActionBindingIF
  @Action setDesignation!: ActionBindingIF
  @Action setDoNameCheck!: ActionBindingIF
  @Action setEntityTypeCd!: ActionBindingIF
  @Action setExtendedRequestType!: ActionBindingIF
  @Action setJurisdiction!: ActionBindingIF
  @Action setLocation!: ActionBindingIF
  @Action setName!: ActionBindingIF
  @Action setNoCorpNum!: ActionBindingIF
  @Action setPickEntityModalVisible!: ActionBindingIF
  @Action setRequestAction!: ActionBindingIF
  @Action startAnalyzeName!: ActionBindingIF

  // Local properties
  corpNumValid = true
  request = null as RequestActionsI
  jurisdiction = null
  selectedCompanyType = null as CompanyType
  readonly corpOnlineLink = 'https://www.corporateonline.gov.bc.ca/'
  readonly EntityType = EntityType
  activeActionGroup = NaN
  showRequestActionTooltip = false

  private mounted () {
    this.$nextTick(() => {
      if (this.$el.querySelector) {
        // add classname to button text (for more detail in Sentry breadcrumbs)
        const searchNameBtn = this.$el.querySelector('#search-name-btn > span')
        if (searchNameBtn) searchNameBtn.classList.add('search-name-btn')
      }
    })
  }

  /** Called when switching between request and manage tabs (which are cached). */
  private activated () {
    this.scrollTo('namerequest-sbc-header')
  }

  get isNewBcBusiness (): boolean {
    return (this.getRequestActionCd === NrRequestActionCodes.NEW_BUSINESS && this.request?.group === 0)
  }

  get isNewXproBusiness (): boolean {
    return (this.getRequestActionCd === NrRequestActionCodes.NEW_BUSINESS && this.request?.group === 1)
  }

  get isContinuationIn (): boolean {
    return (this.getRequestActionCd === NrRequestActionCodes.MOVE)
  }

  get isAlteration (): boolean {
    return (this.getRequestActionCd === NrRequestActionCodes.CONVERSION)
  }

  get isAmalgamation (): boolean {
    return (this.getRequestActionCd === NrRequestActionCodes.AMALGAMATE)
  }

  get isChangeName (): boolean {
    return (this.getRequestActionCd === NrRequestActionCodes.CHANGE_NAME)
  }

  get isRestoration (): boolean {
    return (this.getRequestActionCd === NrRequestActionCodes.RESTORE)
  }

  get showJurisdiction (): boolean {
    // if (this.isAmalgamation) return true // *** FUTURE
    if (this.isNewXproBusiness) return true
    return false
  }

  get showEntityType (): boolean {
    if (this.getLocation) return true
    return false
  }

  get showBusinessLookup () {
    if (this.isChangeName) return true
    if (this.isAlteration) return true
    if (this.isRestoration) return true
    return false
  }

  /** Whether current account type is Premium, SBC Staff or Staff. */
  get isPremiumOrStaff (): boolean {
    return [AccountType.PREMIUM, AccountType.SBC_STAFF, AccountType.STAFF]
      .includes(JSON.parse(sessionStorage.getItem(SessionStorageKeys.CurrentAccount))?.accountType)
  }

  /** If current group is active, deactivates it, otherwise activates group. */
  toggleActionGroup (group: number): void {
    this.activeActionGroup = (this.activeActionGroup === group) ? NaN : group
  }

  get designationOptions (): Array<string> {
    let output: string[] = Designations[this.getEntityTypeCd]?.words
    if (this.getEntityTypeCd === EntityType.CC) {
      output = Designations[EntityType.CR].words
    }
    return output
  }

  get isScreenLg () {
    return this.$vuetify.breakpoint.lgAndUp
  }

  // FUTURE: clean up return type
  entityBlurbs (entity_type_cd: string): string | string[] | string[][] {
    return this.getEntityBlurbs?.find(type => type.value === entity_type_cd)?.blurbs
  }

  get entity_type_cd (): EntityType {
    if (this.getIsConversion) {
      return this.getConversionType
    }
    return this.getEntityTypeCd
  }

  set entity_type_cd (type: EntityType) {
    // special case for sub-menu
    if (type === EntityType.INFO) {
      // clear current value until user chooses a new one
      this.setEntityTypeCd(null)
      // show the "View all business types" modal
      this.setPickEntityModalVisible(true)
      return
    }
    // special case for conversion
    if (type && this.getIsConversion) {
      // convert NrRequestTypeCodes -> EntityType
      const value = type as unknown as NrRequestTypeCodes
      let { entity_type_cd } = ConversionTypes.find(conv => conv.value === value)
      this.setEntityTypeCd(entity_type_cd)
      this.setConversionType(type)
      return
    }
    this.setEntityTypeCd(type)
  }

  get entityConversionTypeOptions () {
    if (this.getIsConversion) {
      return this.getConversionTypeOptions
    }
    return this.getEntityTypeOptions
  }

  get entityConversionText () {
    // convert NrRequestTypeCodes -> EntityType
    const value = this.getConversionType as unknown as NrRequestTypeCodes
    return ConversionTypes.find(conversion => conversion.value === value)?.text
  }

  get isFederal () {
    return (this.getLocation === Location.CA && this.getJurisdictionCd === Location.FD)
  }

  get isCanadian (): boolean {
    return (this.getLocation === Location.CA && this.getJurisdictionCd !== Location.FD)
  }

  get isInternational () {
    return (this.getLocation === Location.IN)
  }

  /** Whether selected radio button is Named Company. */
  get isNamedCompany (): boolean {
    return (this.selectedCompanyType === CompanyType.NAMED_COMPANY)
  }

  /** Whether to show "Colin" or "Incorporate Now" button based on FF for Incorporation or Registration. */
  get showColinButton (): boolean {
    // Continuation In - returning true because Continuation In application are not yet implemented
    // FUTURE: FF created already for Continuation In, use showContinueInButton
    if (this.isContinuationIn) {
      return true
    } else {
      const supportedEntites = GetFeatureFlag('supported-incorporation-registration-entities')
      const isIncorporateEntity = supportedEntites.includes(this.entity_type_cd)
      return !isIncorporateEntity
    }
  }

  get showContinueInButton (): boolean {
    const supportedContInEntites = GetFeatureFlag('supported-continuation-in-entities')
    const isContInEntity = supportedContInEntites.includes(this.entity_type_cd)
    return !isContInEntity
  }

  /** Retrieve text based on selected action/flow */
  get incorporateNowButtonText (): string {
    if (this.isContinuationIn) {
      return 'Continue In Now'
    } else if (this.isAmalgamation) {
      return 'Amalgamate Now'
    }
    return 'Incorporate Now'
  }

  get showDesignationSelect (): boolean {
    if (this.isAmalgamation) return false
    if (this.getEntityTypeCd) {
      return Designations[this.getEntityTypeCd]?.end && !this.getIsXproMras
    }
    // hide until entity type is selected and needs it
    return false
  }

  get showCompanyRadioBtn (): boolean {
    const isSociety = this.isSocietyEnabled() && this.getEntityTypeCd === EntityType.SO
    // society NR name is required and no numbered name allowed
    const showButton = this.isColinRequestType && !isSociety
    if (!showButton) {
      this.selectedCompanyType = CompanyType.NAMED_COMPANY
    }
    return showButton
  }

  get jurisdictionOptions (): Array<any> {
    const array = []

    // add in Canadian jurisdictions (not including BC)
    array.push({ isHeader: true, group: 0, text: 'Canadian' })
    CanJurisdictions
      .filter(jur => jur.value !== Location.BC)
      .forEach(jur => array.push({
        group: 0,
        text: jur.text,
        value: jur.value,
        separator: (jur.value === Location.FD)
      }))

    // add in International jurisdictions (not including CA)
    array.push({ isHeader: true, group: 1, text: 'International' })
    IntlJurisdictions
      .filter(jur => jur.value !== Location.CA)
      .forEach(jur => array.push({
        group: 1,
        text: jur.text,
        value: jur.value,
        separator: false
      }))

    return array
  }

  get entityTextFromValue (): string {
    return this.getEntityTextFromValue || 'specified business type'
  }

  get nameInputFederalText (): string {
    return `Federally incorporated businesses do not need a Name Request. You may \
      register your extraprovincial business immediately using its existing name at Corporate Online.`
  }

  async handleSubmit (doNameCheck = true) {
    this.setDoNameCheck(doNameCheck)
    if (this.getIsXproMras) this.$root.$emit('showSpinner', true)
    await this.startAnalyzeName(null)
    if (this.getIsXproMras) this.$root.$emit('showSpinner', false)
  }

  @Watch('entity_type_cd')
  clearDesignation () {
    this.setDesignation('')
    // clear "Select a Business Type" field when "View all business types" or Society is selected
    if (!this.entity_type_cd || this.entity_type_cd === EntityType.INFO) {
      this.$refs.selectBusinessTypeRef.reset()
    }
  }

  /** Resets search values when location changes. */
  @Watch('getLocation')
  watchLocation (newVal: Location) {
    // if they need to search by corp num first then reset the name
    if ([Location.CA, Location.FD, Location.IN, Location.US].includes(newVal)) {
      this.setName('')
    }
    this.setCorpSearch('')
    this.setNoCorpNum(false)
  }

  /** Called when Request Action menu item is changed. */
  onRequestActionChange (request: RequestActionsI): void {
    this.request = request

    // calculate whether to show tooltip
    // (in next tick after DOM update)
    Vue.nextTick(() => {
      const el = document.querySelector('.request-action-select .v-select__selection') as any
      const offsetWidth = el?.offsetWidth as number
      const scrollWidth = el?.scrollWidth as number
      this.showRequestActionTooltip = (offsetWidth < scrollWidth)
    })

    this.setRequestAction(this.request?.value || null)

    // clear previous state
    this.setLocation(null)
    this.setJurisdiction(null)
    if (this.entity_type_cd) this.entity_type_cd = null

    if (this.getRequestActionCd !== NrRequestActionCodes.NEW_BUSINESS) {
      this.setExtendedRequestType(this.request)
    }

    // set default location to BC for requests where BC is the only location option
    if (this.isNewBcBusiness || this.isContinuationIn || this.isAlteration || this.isAmalgamation) {
      this.setLocation(Location.BC)
      return
    }

    if (this.getRequestActionCd === NrRequestActionCodes.ASSUMED) {
      if (this.getLocation === Location.BC) {
        this.setLocation(Location.CA)
      }
    }
  }

  /** Called when Jurisdiction menu item is changed. */
  onJurisdictionChange (jurisdiction: any): void {
    this.jurisdiction = jurisdiction

    this.setLocation(jurisdiction.group === 0 ? Location.CA : Location.IN)
    this.setJurisdiction(jurisdiction.value)
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.v-list {
  padding: 0;
}

.list-item {
  width: 100%;
  padding: 8px;
}

.last-select-item {
  border-top: 1px solid $gray3;
  padding: 20px 8px !important;
}

// hide disabled list items
::v-deep .v-list-item:has(.v-list-item__content.hide-me) {
  display: none;
}

// set content colour when hovering over list items
.v-list-item:hover .v-list-item__content,
.list-item:hover {
  color: $app-blue !important;
}

#name-check-skip-btn {
  font-size: $px-14 !important;
  box-shadow: none !important;
  height: 1.5rem !important;
  min-height: 0;
}

#name-check-skip-btn:before {
  box-shadow: none !important;
  background-color: transparent !important;
}

#search-name-btn {
  font-size: $px-14 !important;
  font-weight: bold;
  min-height: 45px;
}

#goto-corporate-btn {
  min-height: 45px !important;
}

.mobile-btn {
  width: 17rem !important;
}

// Vuetify overrides
::v-deep {
  .theme--light.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
    background-color: RGBA(22,105,187,.6) !important;
    color: white !important;
  }

  .v-select:not(.v-select--is-multi).v-text-field--single-line .v-select__selections{
    line-height: 2;
  }

  .v-select__selections {
    line-height: 20px !important;
  }

  .v-input--is-disabled .v-input__icon {
    display: none !important;
  }

  .v-select__selection--disabled {
    color: $gray9 !important;
  }

  // reduce checkbox height when there are no error messages
  .v-messages:not(.error--text) {
    margin-bottom: -22px;
  }

  .theme--light.v-list-item:not(.v-list-item--active):not(.v-list-item--disabled) {
    color: $gray7 !important;
  }
}
</style>
