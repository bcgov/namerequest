<template>
  <v-container fluid id="search-container" class="copy-normal pa-10">
    <v-row no-gutters>
      <v-col cols="12" class="pt-0 font-weight-bold h6">
        I need a name to: {{ getRequestActionCd }} / {{ getLocation }} / {{ entity_type_cd }}
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
              <v-select
                id="search-type-options-select"
                class="request-action-select"
                filled
                label="Select an Action"
                :error-messages="getErrors.includes('request_action_cd') ? 'Please select an action' : ''"
                :items="requestActions"
                item-value="[group,value]"
                :menu-props="{ bottom: true, offsetY: true, maxHeight: 423 }"
                @change="setClearErrors(null); onRequestActionChange($event)"
                return-object
              >
                <!-- FUTURE: use "selection" slot to format the selected business -->
                <!-- <template #selection="{ item }">
                  <div class="font-weight-bold text-truncate">{{ item.text }}</div>
                  <div class="text-subtitle-1">{{ item.subtext }}</div>
                </template> -->

                <template #item="{ item }">
                  <v-list-item-content
                    v-if="item.isHeader"
                    class="group-header px-4 py-5"
                    @click.stop="toggleActionGroup(item.group)"
                  >
                    <div class="d-flex justify-space-between align-center">
                      <p class="mb-0 mr-4" :class="{'app-blue': item.group === activeActionGroup}">{{ item.text }}</p>
                      <v-icon color="primary">
                        {{ item.group === activeActionGroup ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                      </v-icon>
                    </div>
                  </v-list-item-content>

                  <!-- render but conditionally hide disabled list items, so that the v-select
                  continues to display the current selection even when a different group is active -->
                  <v-list-item-content
                    v-else
                    class="group-item pl-8 pr-4 py-4"
                    :class="{ 'hide-me': item.disabled }"
                  >
                    <div class="font-weight-bold">{{ item.text }}</div>
                    <div>{{ item.subtext }}</div>
                  </v-list-item-content>
                </template>
              </v-select>
            </div>
          </template>
          <span>{{ request && request.text }}</span>
        </v-tooltip>
      </v-col>

      <!-- display a dummy input box here when Jurisdiction and Entity Type are not shown -->
      <v-col v-if="!showJurisdiction && !showEntityType" cols="12" md="6" class="py-0">
        <v-text-field filled disabled />
      </v-col>

      <!-- Jurisdiction -->
      <v-col v-if="showJurisdiction" cols="12" md="6" class="py-0">
        <v-tooltip
          top
          content-class="top-tooltip"
          transition="fade-transition"
          :disabled="!getLocation || getLocation === 'BC' || isMobile"
        >
          <template v-slot:activator="scope">
            <div v-on="scope.on">
              <v-select
                id="location-options-select"
                label="Select your jurisdiction"
                :error-messages="getErrors.includes('location') ? 'Please select a jurisdiction' : ''"
                :items="getLocationOptions"
                :readonly="!getRequestActionCd"
                :class="!getRequestActionCd ? 'disabled-custom' : ''"
                :menu-props="{ bottom: true, offsetY: true}"
                @change="setClearErrors(null)"
                filled
                :value="getLocation"
                @input="setLocation($event)"
              >
                <template v-slot:item="{ item }">
                  <v-tooltip
                    right
                    transition="fade-transition"
                    :disabled="!getRequestActionCd || !item.blurbs || isMobile"
                  >
                    <template v-slot:activator="scope">
                      <span v-on="scope.on" class="list-item">{{ item.text }}</span>
                    </template>

                    <div v-for="(blurb, index) in item.blurbs " :key="`location-blurb-${index}`">
                      <span v-if="getRequestActionCd === request_action_enum[index]">
                        {{ blurb }}
                      </span>
                    </div>
                  </v-tooltip>
                </template>
              </v-select>
            </div>
          </template>
          <span>{{ getLocationText }}</span>
        </v-tooltip>
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
                :class="!getLocation ? 'disabled-custom' : ''"
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

      <!-- Jurisdiction for xpro/mras -->
      <v-col v-if="getIsXproMras" cols="12" md="6" class="py-0">
        <v-select
          label="Select business' home jurisdiction"
          :error-messages="getErrors.includes('jurisdiction') ? 'Please select a jurisdiction' : ''"
          :items="jurisdictionOptions"
          :menu-props="{ bottom: true, offsetY: true}"
          @change="setClearErrors(null)"
          filled
          :value="getJurisdictionCd"
          @input="setJurisdiction($event)"
        >
          <template v-slot:item="{ item }">
            <span class="list-item" :class="{ 'last-select-item': item.value === Location.FD }">
              {{ item.text }}
            </span>
          </template>
        </v-select>
      </v-col>
    </v-row>

    <!-- business lookup -->
    <v-row no-gutters>
      <v-col cols="12">
        <template>
          <!-- Search for business identifier or name if NR request action is one of [CHG, AML, CNV, REH] -->
          <BusinessLookup v-if="isBusinessLookup" />
        </template>
      </v-col>
    </v-row>

    <!-- Corporate Number checkbox, only for XPro Canadian locations -->
    <!-- *** TODO: change this to "isCanadian" -->
    <v-row v-if="getIsXproMras && !isFederal && !isInternational" no-gutters>
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
        <p v-else class="pl-3 text-body-2">Federally incorporated businesses do not need a Name Request. You may
          register your extraprovincial business immediately using its existing name at Corporate Online.</p>
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

// Interfaces / Enums / List Data
import { ConversionTypesI, EntityI, FormType, RequestActionsI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { AccountType, CompanyType, EntityType, Location, NrRequestActionCodes, NrRequestTypeCodes } from '@/enums'
import { CommonMixin } from '@/mixins'
import { CanJurisdictions, ConversionTypes, Designations, IntlJurisdictions, RequestActions } from '@/list-data'
import { GetFeatureFlag } from '@/plugins'
import BusinessLookupServices from '@/services/business-lookup-services'

/**
 * This is the component that displays the new NR menus and flows.
 */
@Component({
  components: { BulletsColinLink, BusinessLookup, NameInput }
})
export default class Search extends Mixins(CommonMixin) {
  // Refs
  $refs!: {
    selectBusinessTypeRef: FormType
  }

  // enums for template
  readonly Location = Location
  readonly NrRequestActionCodes = NrRequestActionCodes
  readonly BusinessLookupServices = BusinessLookupServices

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
  @Getter getLocationText!: string
  @Getter getRequestActionCd!: NrRequestActionCodes
  @Getter isMobile!: boolean
  @Getter isBcCcCrUl!: boolean

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
  selectedCompanyType = null as CompanyType
  readonly corpOnlineLink = 'https://www.corporateonline.gov.bc.ca/'
  readonly EntityType = EntityType
  request_action_enum = [
    NrRequestActionCodes.NEW_BUSINESS,
    NrRequestActionCodes.MOVE,
    NrRequestActionCodes.RESTORE,
    NrRequestActionCodes.AMALGAMATE,
    NrRequestActionCodes.CHANGE_NAME,
    NrRequestActionCodes.CONVERSION
  ]
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
    return (this.request?.value === NrRequestActionCodes.NEW_BUSINESS && this.request?.group === 0)
  }

  get isContinuationIn (): boolean {
    return (this.request?.value === NrRequestActionCodes.MOVE)
  }

  get isAlterType (): boolean {
    return (this.request?.value === NrRequestActionCodes.CONVERSION)
  }

  get showJurisdiction (): boolean {
    if (!this.request) return false
    if (this.isNewBcBusiness) return false
    if (this.isContinuationIn) return false
    if (this.isAlterType) return false
    return true
  }

  get showEntityType (): boolean {
    if (this.getRequestActionCd) return true
    if (this.getLocation) return true
    return false
  }

  /** Whether current account type is Premium, SBC Staff or Staff. */
  get isPremiumOrStaff (): boolean {
    return [AccountType.PREMIUM, AccountType.SBC_STAFF, AccountType.STAFF]
      .includes(JSON.parse(sessionStorage.getItem(SessionStorageKeys.CurrentAccount))?.accountType)
  }

  /** The request action items to display. */
  get requestActions (): RequestActionsI[] {
    return RequestActions.filter(item => {
      // always include header items
      if (item.isHeader) return true

      // include but disable items not in active group
      // (they will be hidden via CSS)
      item['disabled'] = (item.group !== this.activeActionGroup)
      return true
    })
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

  get isInternational () {
    return (this.getLocation === Location.IN)
  }

  /** Whether selected radio button is Named Company. */
  get isNamedCompany (): boolean {
    return (this.selectedCompanyType === CompanyType.NAMED_COMPANY)
  }

  /** Whether to show "Colin" or "Incorporate Now" button based on FF for Incorporation or Registration. */
  get showColinButton (): boolean {
    // Contuniation In - returning true because Continuation In application are not yet implemented
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
    } else {
      return 'Incorporate Now'
    }
  }

  get showDesignationSelect (): boolean {
    if (this.getEntityTypeCd) {
      return Designations[this.getEntityTypeCd]?.end && !this.getIsXproMras
    }
    // hide until entity type is selected and needs it
    return false
  }

  get showCompanyRadioBtn (): boolean {
    const isSociety = this.isSocietyEnabled() && this.getEntityTypeCd === EntityType.SO
    // society NR name is required and no numbered name allowed
    const showButton = this.isBcCcCrUl && !isSociety
    if (!showButton) {
      this.selectedCompanyType = CompanyType.NAMED_COMPANY
    }
    return showButton
  }

  get jurisdictionOptions () {
    return (this.getLocation === Location.CA)
      ? CanJurisdictions.filter(jur => jur.value !== Location.BC)
      : IntlJurisdictions.filter(jur => jur.value !== Location.CA)
  }

  get entityTextFromValue (): string {
    return this.getEntityTextFromValue || 'specified business type'
  }

  get isBusinessLookup () {
    // show BusinessLookup when NR request actions are following these
    return [
      NrRequestActionCodes.AMALGAMATE,
      NrRequestActionCodes.CHANGE_NAME,
      NrRequestActionCodes.CONVERSION,
      NrRequestActionCodes.RESTORE
    ].includes(this.getRequestActionCd)
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

    // clear Jurisdiction and Entity Type
    this.setLocation(null)
    if (this.entity_type_cd) {
      this.entity_type_cd = null
    }
    if (this.request?.value !== NrRequestActionCodes.NEW_BUSINESS) {
      this.setExtendedRequestType(this.request)
    }

    this.setRequestAction(this.request?.value || null)

    // set default location to BC for requests where BC is the only location option
    if (this.isNewBcBusiness || this.isContinuationIn || this.isAlterType) {
      this.setLocation(Location.BC)
      return
    }

    if (this.request?.value === NrRequestActionCodes.ASSUMED) {
      if (this.getLocation === Location.BC) {
        this.setLocation(Location.CA)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

// remove v-list-item clickable padding
::v-deep .v-list-item:has(.group-header),
::v-deep .v-list-item:has(.group-item) {
  padding: 0;
}

// set border at top of group headers
::v-deep .v-list-item:has(.group-header) {
  border-top: 1px solid $gray3;
}

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

.disabled-custom {
  opacity: 0.4;
  pointer-events: none;
}
#name-check-skip-btn {
  font-size: 0.875rem !important;
  box-shadow: none !important;
  height: 1.5rem !important;
  min-height: 0;
}
#name-check-skip-btn:before {
  box-shadow: none !important;
  background-color: transparent !important;
}
#search-name-btn {
  font-size: 0.875rem !important;
  font-weight: bold;
  min-height: 45px;
}
#goto-corporate-btn {
  min-height: 45px !important;
}
.mobile-btn {
  width: 17rem !important;
}

/* Deep Vuetify overrides */
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
  /* reduce checkbox height when there are no error messages */
  .v-messages:not(.error--text) {
    margin-bottom: -22px;
  }
  .theme--light.v-list-item:not(.v-list-item--active):not(.v-list-item--disabled) {
    color: $gray7 !important;
  }
}
</style>
