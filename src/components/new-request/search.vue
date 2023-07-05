<template>
  <v-container fluid id="new-request-container" class="copy-normal pa-10">
    <v-row no-gutters>
      <v-col cols="12" class="pt-0 font-weight-bold h6">
        I need a name to: {{ request_action_cd }} / {{ location }} / {{ entity_type_cd }}
      </v-col>
    </v-row>

    <v-row class="mt-4" no-gutters>
      <!-- request_action_cd -->
      <v-col cols="12" md="4" lg="4">
        <v-select
          filled
          label="Select an Action"
          :error-messages="getErrors.includes('request_action_cd') ? 'Please select an action' : ''"
          :items="requestActions"
          item-value="[group,value]"
          :menu-props="{ bottom: true, offsetY: true, maxHeight: 423 }"
          @change="clearErrors()"
        >
          <template v-slot:item="{ item }">
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

            <v-list-item-content
              v-else
              class="group-item pl-8 pr-4 py-4"
              @click="request_action_cd = item.value"
            >
              <div class="font-weight-bold">{{ item.text }}</div>
              <div>{{ item.subtext }}</div>
            </v-list-item-content>
          </template>
        </v-select>
      </v-col>

      <!-- location (aka jurisdiction) -->
      <v-col cols="12" md="4" lg="4" :class="{'px-3': !isMobile }">
        <v-tooltip id="location-options-select"
                   top
                   content-class="top-tooltip"
                   transition="fade-transition"
                   :disabled="!location || location === 'BC' || isMobile">
          <template v-slot:activator="scope">
            <div v-on="scope.on">
              <v-select :error-messages="getErrors.includes('location') ? 'Please select a jurisdiction' : ''"
                        :items="getLocationOptions"
                        :disabled="locationDisabled"
                        :readonly="!request_action_cd"
                        :class="!request_action_cd ? 'disabled-custom' : ''"
                        :menu-props="{ bottom: true, offsetY: true}"
                        @change="clearErrors()"
                        filled
                        label="Select a Jurisdiction"
                        v-model="location">
                <template v-slot:item="{ item }">
                  <v-tooltip
                    right
                    transition="fade-transition"
                    :disabled="!request_action_cd || !item.blurbs || isMobile"
                  >
                    <template v-slot:activator="scope">
                      <span v-on="scope.on" class="list-item">{{ item.text }}</span>
                    </template>
                      <div v-for="(blurb, index) in item.blurbs "
                           :key="`Location-Blurb-${index}`">
                        <span v-if="request_action_cd === request_action_enum[index]">
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

      <!-- entity_type_cd -->
      <v-col cols="12" md="4" lg="4">
        <v-tooltip
          id="entity-type-options-select"
          top
          content-class="top-tooltip"
          :disabled="request_action_cd !== NrRequestActionCodes.CONVERSION || !entityConversionText || isMobile"
          transition="fade-transition"
        >
          <template v-slot:activator="scope">
            <div v-on="scope.on">
              <v-select :error-messages="getErrors.includes('entity_type_cd') ? 'Please select a business type' : ''"
                        :items="entityConversionTypeOptions"
                        :label="getIsConversion ? 'Select an Alteration Type' : 'Select a Business Type'"
                        :readonly="!request_action_cd || !location"
                        :class="!location ? 'disabled-custom' : ''"
                        :menu-props="{ bottom: true, offsetY: true}"
                        @change="clearErrors()"
                        filled
                        v-model="entity_type_cd">
                <template v-slot:item="{ item }">
                  <v-tooltip
                          :right="isScreenLg"
                          :left="!isScreenLg"
                          :disabled="!item.blurbs || isMobile"
                          :content-class="!isScreenLg ? 'left-tooltip' : ''"
                          transition="fade-transition">
                    <template v-slot:activator="scope">
                      <span v-on="scope.on"
                            class="list-item"
                            :class="{ 'last-select-item': item.value === 'INFO' }">
                        {{ item.text }}
                      </span>
                    </template>
                    <div v-for="(blurb, index) in entityBlurbs(item.value)"
                         :key="`Blurb-${index}`">
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

    <v-row no-gutters>
      <!-- jurisdiction for xpro/mras -->
      <v-col cols="12" md="4" lg="4" v-if="getIsXproMras">
        <v-select :error-messages="getErrors.includes('jurisdiction') ? 'Please select a jurisdiction' : ''"
                  :items="jurisdictionOptions"
                  :menu-props="{ bottom: true, offsetY: true}"
                  label="Select business' home jurisdiction"
                  @change="clearErrors()"
                  filled
                  v-model="jurisdiction">
          <template v-slot:item="{ item }">
            <span class="list-item" :class="{ 'last-select-item': item.value === Location.FD }">
              {{ item.text }}
            </span>
          </template>
        </v-select>
      </v-col>
    </v-row>

    <!-- Corporate number checkbox, only for XPro Canadian Locations -->
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
                    v-model="noCorpNum"
                    id="corp-num-checkbox"
                    class="copy-small mt-0 pt-0"
                    hide-details
                    v-slot:label
                    v-on="on">
              <template>
                <span v-on="on" class="copy-small">I don't have a corporate number</span>
              </template>
            </v-checkbox>
          </template>
          <p>If you don't have or don't know the corporation number of the business, enter the full legal name of the
            business in its home jurisdiction.</p>
          <p>Note: If the home jurisdiction requires a name reservation, you may want to complete a name search in the
            home jurisdiction first to ensure that the name is available and then return to BC</p>
        </v-tooltip>
      </v-col>
    </v-row>

    <BulletsColinLink
      v-if="entity_type_cd"
      :businessType="entity_type_cd"
      :colinButton="showColinButton"
      :showDesignation="showDesignationSelect"
      @radioButtonChange="selectedCompanyType = $event"
    >
      <template v-slot:name-input-slot>
        <NameInput
          v-if="!isFederal"
          :is-mras-search="(getIsXproMras && !noCorpNum)"
          :menu-props="{ bottom: true, offsetY: true}"
          id="name-input-component"
          class="pt-3"
          @emit-corp-num-validity="corpNumValid = $event"/>
        <p v-else class="pl-3 text-body-2">Federally incorporated businesses do not need a Name Request. You may
          register your extraprovincial business immediately using its existing name at Corporate Online.</p>
      </template>
      <template v-slot:designation>
        <v-col md="4" lg="4">
          <v-select
            :error-messages="getErrors.includes('designation') ? 'Please select a designation' : ''"
            filled
            :items="designationOptions"
            label="Select a Designation"
            :readonly="!entity_type_cd"
            :menu-props="{ bottom: true, offsetY: true}"
            v-model="designation"
            class="mb-n3"
            @change="clearErrors()">
          </v-select>
        </v-col>
      </template>
    </BulletsColinLink>

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
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

// bcregistry common
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

// Components
import { BulletsColinLink } from '../common'
import NameInput from './name-input.vue'

// Interfaces / Enums / List Data
import { ConversionTypesI, EntityI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { AccountType, CompanyType, EntityType, Location, NrRequestActionCodes, NrRequestTypeCodes } from '@/enums'
import { CommonMixin } from '@/mixins'
import { CanJurisdictions, IntlJurisdictions } from '@/list-data'
import { GetFeatureFlag } from '@/plugins'

/** This component is used for CREATING a Name Request. */
@Component({
  components: { BulletsColinLink, NameInput }
})
export default class NewSearch extends Mixins(CommonMixin) {
  // enums for template
  readonly Location = Location
  readonly NrRequestActionCodes = NrRequestActionCodes

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
  @Getter getIsPersonsName!: boolean
  @Getter getIsXproMras!: boolean
  @Getter getJurisdictionCd!: string
  @Getter getLocation!: Location
  @Getter getLocationOptions!: any[]
  @Getter getLocationText!: string
  @Getter getNameIsEnglish!: boolean
  @Getter getRequestActionCd!: NrRequestActionCodes
  @Getter isMobile!: boolean

  // Global actions
  @Action setConversionType!: ActionBindingIF
  @Action setCorpSearch!: ActionBindingIF
  @Action setClearErrors!: ActionBindingIF
  @Action setDesignation!: ActionBindingIF
  @Action setDoNameCheck!: ActionBindingIF
  @Action setEntityTypeCd!: ActionBindingIF
  @Action setExtendedRequestType!: ActionBindingIF
  @Action setIsPersonsName!: ActionBindingIF
  @Action setJurisdiction!: ActionBindingIF
  @Action setLocation!: ActionBindingIF
  @Action setName!: ActionBindingIF
  @Action setNameIsEnglish!: ActionBindingIF
  @Action setNoCorpNum!: ActionBindingIF
  @Action setPickEntityModalVisible!: ActionBindingIF
  @Action setRequestAction!: ActionBindingIF
  @Action startAnalyzeName!: ActionBindingIF

  // Local properties
  corpNumValid = true
  locationDisabled = false
  selectedCompanyType = ''
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

  private mounted () {
    this.$nextTick(() => {
      if (this.$el.querySelector) {
        // add classname to button text (for more detail in Sentry breadcrumbs)
        const searchNameBtn = this.$el.querySelector('#search-name-btn > span')
        if (searchNameBtn) searchNameBtn.classList.add('search-name-btn')
      }
    })
  }

  private activated () {
    this.scrollTo('namerequest-sbc-header')
  }

  // Local Getters
  get isPremiumOrStaff (): boolean {
    return [AccountType.PREMIUM, AccountType.SBC_STAFF, AccountType.STAFF]
      .includes(JSON.parse(sessionStorage.getItem(SessionStorageKeys.CurrentAccount))?.accountType)
  }

  /** The request action items to display. */
  get requestActions () {
    return this.$requestActions.filter(action => {
      // always show header action
      if (action.isHeader) return true
      // show item action if group is open
      if (action.group === this.activeActionGroup) return true
      // don't show this action
      return false
    })
  }

  /** If current group is active, deactivate it, otherwise activate group. */
  toggleActionGroup (group: number) {
    this.activeActionGroup = (this.activeActionGroup === group) ? NaN : group
  }

  get designation (): string {
    return this.getDesignation
  }
  set designation (value: string) {
    this.setDesignation(value)
  }
  get designationOptions (): Array<string> {
    let output: string[] = this.$designations[this.getEntityTypeCd]?.words
    if (this.getEntityTypeCd === EntityType.CC) {
      output = this.$designations[EntityType.CR].words
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
      let { entity_type_cd } = this.$conversionTypes.find(conv => conv.value === value)
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
    return this.$conversionTypes.find(conversion => conversion.value === value)?.text
  }

  get isFederal () {
    return (this.location === Location.CA && this.jurisdiction === Location.FD)
  }

  get isInternational () {
    return (this.location === Location.IN)
  }

  // If selected radio button is Named Company.
  get isNamedCompany (): boolean {
    return (this.selectedCompanyType === CompanyType.NAMED_COMPANY)
  }

  get isPersonsName () {
    return this.getIsPersonsName
  }

  set isPersonsName (value) {
    this.setIsPersonsName(value)
  }

  get location (): Location {
    return this.getLocation
  }

  set location (location: Location) {
    this.setLocation(location)
  }

  get jurisdiction (): string {
    return this.getJurisdictionCd
  }

  set jurisdiction (jurisdiction: string) {
    this.setJurisdiction(jurisdiction)
  }

  get nameIsEnglish () {
    return this.getNameIsEnglish
  }

  set nameIsEnglish (value) {
    this.setNameIsEnglish(value)
  }

  get noCorpNum () {
    return this.getHasNoCorpNum
  }

  set noCorpNum (value) {
    this.setNoCorpNum(value)
  }

  get request_action_cd (): NrRequestActionCodes {
    return this.getRequestActionCd
  }

  set request_action_cd (value: NrRequestActionCodes) {
    const request = this.$requestActions.find(request => request.value === value)
    this.location = null
    if (this.entity_type_cd) {
      this.entity_type_cd = null
    }
    if (request?.value !== NrRequestActionCodes.NEW_BUSINESS) {
      this.setExtendedRequestType(request)
    }
    this.setRequestAction(value)
  }

  // Whether to show "Colin" or "Incorporate Now" button based on FF.
  get showColinButton (): boolean {
    const supportedEntites = GetFeatureFlag('supported-incorporation-registration-entities')
    const isIncorporateEntity = supportedEntites.includes(this.entity_type_cd)
    return !isIncorporateEntity
  }

  get showDesignationSelect (): boolean {
    if (this.getEntityTypeCd) {
      return this.$designations[this.getEntityTypeCd]?.end && !this.getIsXproMras
    }
    // hide until entity type is selected and needs it
    return false
  }

  get jurisdictionOptions () {
    return (this.location === Location.CA)
      ? CanJurisdictions.filter(jur => jur.value !== Location.BC)
      : IntlJurisdictions.filter(jur => jur.value !== Location.CA)
  }

  get entityTextFromValue (): string {
    return this.getEntityTextFromValue || 'specified business type'
  }

  clearErrors () {
    this.setClearErrors(null)
  }

  async handleSubmit (doNameCheck: boolean = true) {
    this.setDoNameCheck(doNameCheck)
    if (this.getIsXproMras) this.$root.$emit('showSpinner', true)
    await this.startAnalyzeName(null)
    if (this.getIsXproMras) this.$root.$emit('showSpinner', false)
  }

  @Watch('entity_type_cd')
  clearDesignation (newVal) {
    this.designation = ''
  }

  /** Reset search values when location changes */
  @Watch('location')
  watchLocation (newVal: Location) {
    // if they need to search by corp num first then reset the name
    if ([Location.CA, Location.FD, Location.IN, Location.US].includes(newVal)) {
      this.setName('')
    }
    this.setCorpSearch('')
    this.setNoCorpNum(false)
  }

  @Watch('request_action_cd')
  watchRequestActionCd (newVal: NrRequestActionCodes) {
    // Set default location to BC for the requests where BC is the only location option
    if ([NrRequestActionCodes.CONVERSION, NrRequestActionCodes.MOVE].includes(newVal)) {
      this.setLocation(Location.BC)
      this.locationDisabled = true
      return
    }
    this.locationDisabled = false
    if ([NrRequestActionCodes.ASSUMED].includes(newVal)) {
      if (this.location === Location.BC) {
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
