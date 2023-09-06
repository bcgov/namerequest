<template>
  <v-container fluid id="search-container" class="copy-normal pt-10 px-10 pb-12">
    <v-row>
      <v-col cols="12" class="font-weight-bold h6">
        Get started by selecting an action:
      </v-col>

      <!-- Request Action -->
      <v-col cols="12" md="6">
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
                maxHeight="333"
                @change="setClearErrors(); onRequestActionChange($event)"
              />
            </div>
          </template>
          <span>{{ request && request.text }}</span>
        </v-tooltip>
      </v-col>

      <!-- display a dummy input box when Request Action is not yet selected -->
      <v-col v-if="!request" cols="12" md="6">
        <v-text-field filled disabled hide-details label="Select an action first" />
      </v-col>

      <!-- Business Lookup/Fetch -->
      <v-col v-if="showBusinessLookup" cols="12" md="6" class="business-lookup">
        <template v-if="!business">
          <BusinessLookup
            v-if="getIsAuthenticated"
            :searchStatus="lookupActiveOrHistorical"
            @business="onBusiness($event)"
          />
          <BusinessFetch v-else @business="onBusiness($event)"/>
        </template>
        <v-text-field
          v-else
          append-icon="mdi-close"
          readonly
          filled
          :label="businessLookupLabel"
          :value="business.legalName"
          :rules="rules"
          :hint="businessLookupHint"
          persistent-hint
          autofocus
          @click:append="onBusiness(null)"
          @keyup.delete="onBusiness(null)"
        />
      </v-col>

      <!-- Jurisdiction -->
      <v-col v-if="showJurisdiction" cols="12" :md="isSelectedXproAndRestorable ? 4 : 6">
        <NestedSelect
          label="Select your home jurisdiction"
          :menuItems="jurisdictionOptions"
          :error-messages="getErrors.includes('jurisdiction') ? 'Please select a jurisdiction' : ''"
          :value="jurisdiction"
          @change="setClearErrors(); onJurisdictionChange($event)"
        />
      </v-col>

      <!-- Entity Type -->
      <v-col
        v-if="showEntityType" cols="12"
        :md="getIsXproFlow ? 4 : ( isConversion ? 12 : 6)">
        <v-text-field
          v-if="isConversion && isBenBusiness"
          filled
          disabled
          hide-details
          label="Benefit Company to Limited Company" />
        <v-tooltip
          v-else
          top
          content-class="top-tooltip"
          :disabled="getRequestActionCd !== NrRequestActionCodes.CONVERSION || !entityConversionText || isMobile"
          transition="fade-transition"
        >
          <template v-slot:activator="scope">
            <div v-on="scope.on">
              <v-select
                id="entity-type-options-select"
                :label="isConversion ? 'Select type of business to alter into' : 'Select type of business in B.C.'"
                :error-messages="getErrors.includes('entity_type_cd') ? 'Please select a business type' : ''"
                :items="entityTypeOptions"
                :menu-props="{ bottom: true, offsetY: true}"
                ref="selectBusinessTypeRef"
                @change="setClearErrors()"
                hide-details="auto"
                filled
                v-model="entity_type_options_select_bind"
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

      <!-- once an entity type is selected, is Federal, or is Restorable -->
      <template v-if="entity_type_cd || isFederal || isRestorable">
        <!-- Company Type -->
        <v-col v-if="companyRadioBtnApplicable" cols="12">
          <p class="font-weight-bold h6">Select a company type:</p>
          <v-radio-group
            v-model="selectedCompanyType"
            class="mt-3"
            hide-details
            mandatory
            row
            @change="selectedCompanyType = $event"
          >
            <v-radio
              id="named-company-radio"
              label="Named Company"
              :value="CompanyType.NAMED_COMPANY"
            />
            <v-radio
              id="numbered-company-radio"
              label="Numbered Company"
              :value="CompanyType.NUMBERED_COMPANY"
            />
          </v-radio-group>
        </v-col>

        <!-- Named company bullets -->
        <template v-if="selectedCompanyType === CompanyType.NAMED_COMPANY">
          <!-- Xpro/Federal bullets -->
          <v-col v-if="getIsXproFlow && isFederal" cols="12" :md="isSelectedXproAndRestorable ? 10 : 8">
            <ul class="bullet-points">
              <li>Federally incorporated businesses do not need a Name Request.</li>
              <li v-if="!isSelectedXproAndRestorable">
                You may register your extraprovincial business immediately using its existing name
                at Corporate Online.
              </li>
              <li v-else>
                To reinstate your business, complete
                <a :href="fullReinstatementFormLink">
                  this form <v-icon small class="ml-1" color="primary">mdi-open-in-new</v-icon>
                </a> for a full reinstatement or
                <a :href="limitedReinstatementFormLink">
                  this form  <v-icon small class="ml-1" color="primary">mdi-open-in-new</v-icon>
                </a> for a limited reinstatement.
              </li>
            </ul>
          </v-col>

          <!-- XPRO/MRAS number/name search/input -->
          <v-col v-if="!isFederal" cols="12" :md="(getIsXproFlow || showDesignation) ? 8 : 12">
            <NameInput
              id="name-input-component"
              :is-mras-search="(getIsXproFlow && isMrasJurisdiction && !noCorpNum)"
              @emit-corp-num-validity="corpNumValid = $event"
            />
          </v-col>

          <!-- Designation -->
          <v-col v-if="showDesignation" cols="12" md="4">
            <v-select
              :error-messages="getErrors.includes('designation') ? 'Please enter a designation' : ''"
              filled
              :items="designationOptions"
              label="Select a Designation"
              :readonly="!entity_type_cd"
              :menu-props="{ bottom: true, offsetY: true}"
              :value="getDesignation"
              @input="setDesignation($event)"
              class="mb-n3"
              @change="setClearErrors()"
            />
          </v-col>

          <!-- Corporate Number checkbox, only for Canadian MRAS jurisdictions -->
          <v-col v-if="isCanadian && isMrasJurisdiction" class="d-flex justify-end">
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
                  v-on="on"
                >
                  <template>
                    <span v-on="on" class="copy-small">I don't have a corporate number</span>
                  </template>
                </v-checkbox>
              </template>

              <p>If you don't have or don't know the corporation number of the business, enter the full legal name
                of the business in its home jurisdiction.</p>

              <p>Note: If the home jurisdiction requires a name reservation, you may want to complete a name search
                in the home jurisdiction first to ensure that the name is available and then return to BC.</p>
            </v-tooltip>
          </v-col>
        </template>

        <!-- Numbered company bullets -->
        <template v-if="selectedCompanyType === CompanyType.NUMBERED_COMPANY || isFederal" cols="12">
          <v-col v-if="isConversion && !isAlterOnline(getConversionType)">
            <div class="contact-registries">
              <p>To complete this alteration, please contact us at:</p>
              <p>
                  <v-icon small>mdi-phone</v-icon>&nbsp;Canada and U.S. Toll Free:
                  <a href="tel:+1877-370-1033">1-877-370-1033</a>
              </p>
              <p><v-icon small>mdi-phone</v-icon>&nbsp;Victoria Office:
                <a href="tel:250-370-1033">250-370-1033</a>
              </p>
              <p><v-icon small>mdi-email</v-icon>&nbsp;Email:
                <a href="mailto:BCRegistries@gov.bc.ca">BCRegistries@gov.bc.ca</a>
              </p>
            </div>
          </v-col>
          <v-col v-else cols="12">
            <ul class="bullet-points">
              <li>Your business name will be the Incorporation Number assigned by the Registry.</li>
              <li>You can change your business name at a later date.</li>
              <li>It is not possible to request a specific Incorporation Number.</li>
            </ul>
          </v-col>

          <!-- Go to COLIN / Incorporate Now buttons -->
          <v-col v-if = "!isConversion || isAlterOnline(getConversionType)" cols="12"
            class="d-flex justify-center"
          >
            <v-btn
              v-if="showColinButton"
              class="px-9"
              id="go-to-colin-button"
              :href="colinLink"
              target="_blank"
            >
              Go to Corporate Online to {{ goToColinText }} <v-icon small class="ml-1">mdi-open-in-new</v-icon>
            </v-btn>
            <v-btn
              v-else-if="showActionButton"
              class="px-9"
              id="incorporate-now-button"
              @click="actionNowClicked()"
            >
              {{ actionNowButtonText }}
            </v-btn>
          </v-col>
        </template>
      </template>
    </v-row>

    <!-- Check This Name button -->
    <template v-if="isShowCheckNameButton">
      <v-row justify="center" class="mt-6">
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

      <v-row v-if="isPremiumOrStaff" justify="center">
        <v-col cols="auto">
          <v-btn id="name-check-skip-btn" class="outlined pa-0" :ripple="false" text @click="handleSubmit(false)">
            <span>Submit this Name without checking</span>
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Vue, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

// Components
import NameInput from './name-input.vue'
import NestedSelect from '../common/nested-select.vue'
import BusinessLookup from '@/components/new-request/business-lookup.vue'
import BusinessFetch from '@/components/new-request/business-fetch.vue'

// Interfaces / Enums / List Data
import { BusinessSearchIF, ConversionTypesI, EntityI, FormType, RequestActionsI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { AccountType, CompanyType, CorpTypeCd, EntityStates, EntityType,
  Location, NrRequestActionCodes, NrRequestTypeCodes } from '@/enums'
import { CommonMixin, NrAffiliationMixin } from '@/mixins'
import { BcMapping, CanJurisdictions, ConversionTypes, Designations,
  IntlJurisdictions, RequestActions, XproMapping } from '@/list-data'
import { GetFeatureFlag, Navigate } from '@/plugins'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

/**
 * This is the component that displays the new NR menus and flows.
 */
@Component({
  components: { BusinessLookup, BusinessFetch, NameInput, NestedSelect }
})
export default class Search extends Mixins(CommonMixin, NrAffiliationMixin) {
  // Refs
  $refs!: {
    selectBusinessTypeRef: FormType
  }

  // Enums for template
  readonly CompanyType = CompanyType
  readonly NrRequestActionCodes = NrRequestActionCodes
  readonly RequestActions = RequestActions

  // Store getters
  @Getter getConversionType!: NrRequestTypeCodes
  @Getter getConversionTypeOptions!: ConversionTypesI[]
  @Getter getDesignation!: string
  @Getter getEntityBlurbs!: Array<EntityI>
  @Getter getEntityTypeCd!: EntityType
  @Getter getEntityTypeOptions!: Array<EntityI>
  @Getter getEntityTextFromValue!: string
  @Getter getErrors!: string[]
  @Getter getHasNoCorpNum!: boolean
  @Getter getIsAuthenticated!: boolean
  @Getter getIsXproFlow!: boolean
  @Getter getJurisdictionCd!: string
  @Getter getLocation!: Location
  @Getter getLocationOptions!: any[]
  @Getter getOriginEntityTypeCd!: EntityType
  @Getter getRequestActionCd!: NrRequestActionCodes
  @Getter isAmalgamation!: boolean
  @Getter isAssumed!: boolean
  @Getter isCanadian!: boolean
  @Getter isChangeName!: boolean
  @Getter isConversion!: boolean
  @Getter isContinuationIn!: boolean
  @Getter isFederal!: boolean
  @Getter isInternational!: boolean
  @Getter isMobile!: boolean
  @Getter isMrasJurisdiction!: boolean
  @Getter isNumberedEntityType!: boolean
  @Getter isRestoration!: boolean

  // Store actions
  @Action setConversionType!: ActionBindingIF
  @Action setCorpNum!: ActionBindingIF
  @Action setCorpSearch!: ActionBindingIF
  @Action setClearErrors!: () => void
  @Action setDesignation!: ActionBindingIF
  @Action setDoNameCheck!: ActionBindingIF
  @Action setEntityTypeCd!: ActionBindingIF
  @Action setExtendedRequestType!: ActionBindingIF
  @Action setJurisdictionCd!: ActionBindingIF
  @Action setLocation!: ActionBindingIF
  @Action setName!: ActionBindingIF
  @Action setNoCorpNum!: ActionBindingIF
  @Action setOriginEntityTypeCd!: ActionBindingIF
  @Action setPickEntityModalVisible!: ActionBindingIF
  @Action setRequestAction!: ActionBindingIF
  @Action startAnalyzeName!: ActionBindingIF

  // Local properties
  corpNumValid = true
  request = null as RequestActionsI
  jurisdiction = null
  selectedCompanyType = null as CompanyType
  readonly colinLink = sessionStorage.getItem('CORPORATE_ONLINE_URL')
  readonly corpOnlineLink = 'https://www.corporateonline.gov.bc.ca/'
  readonly EntityType = EntityType
  activeActionGroup = NaN
  showRequestActionTooltip = false
  business = null as BusinessSearchIF
  fullReinstatementFormLink = 'https://www2.gov.bc.ca/assets/gov/employment-business-and-economic-development/' +
    'business-management/permits-licences-and-registration/registries-forms/' +
    'form_31_xco_-_full_reinstatement_application.pdf'
  limitedReinstatementFormLink = 'https://www2.gov.bc.ca/assets/gov/employment-business-and-economic-development/' +
    'business-management/permits-licences-and-registration/registries-forms/' +
    'form_29_xco_-_limited_reinstatement_application.pdf'

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

  // Text field rules for the business lookup
  get rules (): any {
    return [
      value => {
        if (this.isConversion) {
          return this.isPassAlterValidation || 'This business cannot alter their business type'
        } else if (this.isRestoration) {
          return this.isRestorable || 'This business cannot be restored.'
        }
        return true
      }]
  }

  get businessLookupLabel (): string {
    if (this.getIsAuthenticated) {
      if (this.lookupActiveOrHistorical === EntityStates.HISTORICAL) {
        return 'Find a historical business'
      } else {
        return 'Find an existing business'
      }
    } else {
      if (this.lookupActiveOrHistorical === EntityStates.HISTORICAL) {
        return 'Fetch a historical business'
      } else {
        return 'Fetch an existing business'
      }
    }
  }

  get businessLookupHint (): string {
    if (this.getIsAuthenticated) {
      return 'Search by name, incorporation or registration number of existing business'
    } else {
      return 'Enter registration number of existing business'
    }
  }

  get isBenBusiness (): boolean {
    return this.business?.legalType as string === CorpTypeCd.BENEFIT_COMPANY
  }

  /** Search businesses with business lookup depending on the Action selected */
  get lookupActiveOrHistorical (): String {
    return this.isRestoration ? EntityStates.HISTORICAL : EntityStates.ACTIVE
  }

  get isNewBcBusiness (): boolean {
    return (this.getRequestActionCd === NrRequestActionCodes.NEW_BUSINESS && this.request?.group === 0)
  }

  get isNewXproBusiness (): boolean {
    return (this.getRequestActionCd === NrRequestActionCodes.NEW_BUSINESS && this.request?.group === 1)
  }

  get isPassAlterValidation (): boolean {
    const legalType = this.business.legalType as unknown as CorpTypeCd
    return legalType === CorpTypeCd.BC_COMPANY ||
      legalType === CorpTypeCd.BENEFIT_COMPANY ||
      legalType === CorpTypeCd.BC_ULC_COMPANY
  }

  get showJurisdiction (): boolean {
    // if (this.isAmalgamation) return true // *** FUTURE
    if (this.isNewXproBusiness) return true
    if (this.isSelectedXproAndRestorable) return true
    return false
  }

  get showEntityType (): boolean {
    if (this.isConversion) {
      return this.business && this.isPassAlterValidation
    }
    if (this.getLocation && !this.isFederal && !this.isRestoration) return true
    return false
  }

  get showBusinessLookup () {
    if (this.isChangeName || this.isConversion || this.isRestoration) return true
    return false
  }

  /** Whether current account type is Premium, SBC Staff or Staff. */
  get isPremiumOrStaff (): boolean {
    return [AccountType.PREMIUM, AccountType.SBC_STAFF, AccountType.STAFF]
      .includes(JSON.parse(sessionStorage.getItem(SessionStorageKeys.CurrentAccount))?.accountType)
  }

  get showDesignation (): boolean {
    if (this.getEntityTypeCd) return (Designations[this.getEntityTypeCd]?.end && !this.getIsXproFlow)
    // hide until entity type is selected and needs it
    return false
  }

  get designationOptions (): Array<string> {
    let output: string[] = Designations[this.getEntityTypeCd]?.words
    if (this.getEntityTypeCd === EntityType.CC) {
      output = Designations[EntityType.CR].words
    }
    return output
  }

  get companyRadioBtnApplicable (): boolean {
    if (!this.entity_type_cd && !this.getConversionType && !this.isFederal) return false
    if (this.isConversion) {
      return this.business !== null && this.getConversionType !== null
    }
    const isSociety = (this.isSocietyEnabled() && this.getEntityTypeCd === EntityType.SO)
    // check if numbered is not allowed or society NR name is required
    if (!this.isNumberedEntityType || isSociety) {
      this.selectedCompanyType = CompanyType.NAMED_COMPANY
      return false
    }
    return true
  }

  get isScreenLg () {
    return this.$vuetify.breakpoint.lgAndUp
  }

  // FUTURE: clean up return type
  entityBlurbs (entity_type_cd: string): string | string[] | string[][] {
    return this.getEntityBlurbs?.find(type => type.value === entity_type_cd)?.blurbs
  }

  get entity_type_options_select_bind (): EntityType | NrRequestTypeCodes {
    if (this.isConversion) return this.getOriginEntityTypeCd
    return this.entity_type_cd
  }

  set entity_type_options_select_bind (type: EntityType) {
    this.entity_type_cd = type
  }

  get entity_type_cd (): EntityType {
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
    if (this.getEntityTypeCd && this.isConversion && type) {
      const value = type as unknown as NrRequestTypeCodes
      let { entity_type_cd } = ConversionTypes.find(conv => conv.value === value) || { entity_type_cd: null }
      this.setEntityTypeCd(entity_type_cd)
      this.setConversionType(type)
      this.setConversionType(type)
      return
    }
    this.setEntityTypeCd(type)
  }

  get noCorpNum (): boolean {
    return this.getHasNoCorpNum
  }

  set noCorpNum (value: boolean) {
    this.setNoCorpNum(value)
  }

  get entityTypeOptions () {
    return (this.isConversion ? this.getConversionTypeOptions : this.getEntityTypeOptions)
  }

  get entityConversionText () {
    // convert NrRequestTypeCodes -> EntityType
    return ConversionTypes.find(conversion => conversion.value === this.getConversionType)?.text
  }

  /** Whether selected radio button is Named Company. */
  get isNamedCompany (): boolean {
    return (this.selectedCompanyType === CompanyType.NAMED_COMPANY)
  }

  get showActionButton (): boolean {
    if (this.isConversion && !this.isAlterOnline(this.getConversionType)) return false
    return true
  }

  /** Whether to show "Go to COLIN" button (otherwise will show "Incorporate Now" button). */
  get showColinButton (): boolean {
    if (this.showContinueInButton) return true
    if (this.isFederal) return true

    if (this.isConversion) {
      return !this.isSupportedAlteration(this.getConversionType)
    }

    if (this.isRestoration) {
      const supportedRestorationEntites = GetFeatureFlag('supported-restoration-entities')
      const isRestorationEntity = supportedRestorationEntites.includes(this.entity_type_cd)
      return !isRestorationEntity
    }

    // don't show COLIN button for supported entities
    const supportedEntites = GetFeatureFlag('supported-incorporation-registration-entities')
    const isIncorporateEntity = supportedEntites.includes(this.entity_type_cd)
    return !isIncorporateEntity
  }

  get showContinueInButton (): boolean {
    // for now, return True because Continuation In filings are not yet implemented
    return this.isContinuationIn

    // *** FUTURE: use code below
    // if (!this.isContinuationIn) return false
    // const supportedContInEntites = GetFeatureFlag('supported-continuation-in-entities')
    // const isContInEntity = supportedContInEntites.includes(this.entity_type_cd)
    // return !isContInEntity
  }

  get goToColinText (): string {
    if (this.isConversion) return 'Alter'
    return 'Register'
  }

  /** Retrieve text based on selected action/flow */
  get actionNowButtonText (): string {
    if (this.isContinuationIn) {
      return 'Continue In Now'
    } else if (this.isAmalgamation) {
      return 'Amalgamate Now'
    } else if (this.isConversion) {
      return 'Alter Now'
    } else if (this.isRestoration) {
      return 'Restore Now'
    }
    return 'Incorporate Now'
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

  /** Event handled for business lookup/fetch. */
  onBusiness (business: BusinessSearchIF): void {
    this.business = business
    this.entity_type_cd = this.business?.legalType || null
    this.setCorpNum(business?.identifier || null)
    this.setEntityTypeCd(this.business?.legalType)

    if (this.isConversion) {
      if (this.business) {
        // set the from business for alteration (conversion)
        this.setOriginEntityTypeCd(this.business.legalType)
        // special case if the from business is BEN
        if (this.isBenBusiness) {
          this.setConversionType(NrRequestTypeCodes.CONVERT_CORP)
        }
      } else {
        // clear all related fields when clearing business search/fetch for alter
        this.setConversionType(null)
        this.setOriginEntityTypeCd(null)
        this.selectedCompanyType = null
      }
    }

    if (this.isRestoration) {
      // Check if not XPRO and BC restorable
      if (!this.isSelectedXproAndRestorable && this.isBcRestorable) {
        this.setLocation(Location.BC)
        this.setEntityTypeCd(this.corpTypeToEntityType(this.business.legalType as unknown as CorpTypeCd))
      } else if (this.isSelectedXproAndRestorable) { // Check if XPRO and restorable
        this.setLocation(Location.CA)
        this.setEntityTypeCd(this.business.legalType)
      } else {
        this.setEntityTypeCd(null)
      }
    }
  }

  /** Returns whether the selected XPRO is restorable. */
  get isSelectedXproAndRestorable (): boolean {
    return XproMapping.REH.includes(this.business?.legalType)
  }

  /** Returns whether the selected business' legal type is BC and restorable. */
  get isBcRestorable (): boolean {
    return BcMapping.REH.includes(this.corpTypeToEntityType(this.business?.legalType as unknown as CorpTypeCd))
  }

  /** Returns whether company is restorable. */
  get isRestorable (): boolean {
    return this.isSelectedXproAndRestorable || this.isBcRestorable
  }

  /**
   * If user is authenticated, create draft business and redirect to Dashboard.
   * If restoration/reinstatement selected, go to business dashboard.
   * If user is not authenticated, redirect to login screen then redirect back.
   */
  async actionNowClicked () {
    const legalType = this.entityTypeToCorpType(this.entity_type_cd)
    if (this.getIsAuthenticated) {
      if (this.isConversion) {
        this.goToEntityDashboard(this.business.identifier)
      } else if (this.isRestoration) {
        const dashboardUrl = sessionStorage.getItem('DASHBOARD_URL')
        Navigate(`${dashboardUrl}${this.business.identifier}`)
      } else {
        await this.incorporateNow(legalType)
      }
    } else {
      // persist legal type of incorporate now in session upon authentication via Signin component
      sessionStorage.setItem('LEGAL_TYPE', legalType)
      // navigate to BC Registry login page with return parameter
      const registryHomeUrl = sessionStorage.getItem('REGISTRY_HOME_URL')
      const nameRequestUrl = `${window.location.origin}`
      Navigate(`${registryHomeUrl}login?return=${nameRequestUrl}`)
    }
  }

  async handleSubmit (doNameCheck = true) {
    this.setDoNameCheck(doNameCheck)
    if (this.getIsXproFlow) this.$root.$emit('showSpinner', true)
    await this.startAnalyzeName(null)
    if (this.getIsXproFlow) this.$root.$emit('showSpinner', false)
  }

  get isShowCheckNameButton (): boolean {
    if (!this.isFederal && this.isNamedCompany && this.entity_type_cd) {
      return true
    }
    return false
  }

  @Watch('entity_type_cd')
  clearDesignation () {
    this.setDesignation('')
    // clear "Select a Business Type" field when "View all business types" or Society is selected
    if (!this.entity_type_cd || this.entity_type_cd === EntityType.INFO) {
      this.$refs.selectBusinessTypeRef && this.$refs.selectBusinessTypeRef.reset()
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
  async onRequestActionChange (request: RequestActionsI): Promise<void> {
    this.request = request

    this.setRequestAction(this.request?.value || null)

    // clear previous state
    this.business = null
    this.jurisdiction = null
    this.setLocation(null)
    this.setJurisdictionCd(null)
    if (this.entity_type_cd) this.entity_type_cd = null
    this.selectedCompanyType = null
    this.setCorpNum(null)

    // wait for updates
    await Vue.nextTick()

    if (this.getRequestActionCd !== NrRequestActionCodes.NEW_BUSINESS) {
      this.setExtendedRequestType(this.request)
    }

    // set default location for requests where there is only one location option
    if (this.isNewBcBusiness || this.isContinuationIn || this.isConversion || this.isAmalgamation) {
      this.setLocation(Location.BC)
    } else if (this.isAssumed && this.getLocation === Location.BC) {
      this.setLocation(Location.CA)
    }

    // calculate whether to show tooltip
    // (after waiting for DOM update)
    await Vue.nextTick()
    const el = document.querySelector('.request-action-select .v-select__selection') as any
    const offsetWidth = el?.offsetWidth as number
    const scrollWidth = el?.scrollWidth as number
    this.showRequestActionTooltip = (offsetWidth < scrollWidth)
  }

  /** Called when Jurisdiction menu item is changed. */
  onJurisdictionChange (jurisdiction: any): void {
    this.jurisdiction = jurisdiction

    this.setLocation(jurisdiction.group === 0 ? Location.CA : Location.IN)
    this.setJurisdictionCd(jurisdiction.value)
    // Resetting the entity type when a business is selected (after jurisdiction change)
    if (this.business) {
      this.setEntityTypeCd(this.business.legalType)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.v-icon.mdi-phone,
.v-icon.mdi-email {
  color: $app-dk-blue;
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

// make the business lookup close button always blue
::v-deep .business-lookup button.mdi-close {
  color: $app-blue;
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

#go-to-colin-button,
#incorporate-now-button,
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

// Line spacing between bullet points and sizing
.bullet-points {
  line-height: 1.5rem;
  font-size: $px-15;
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

  // Override radio group background color.
  .v-input--radio-group .v-input__control .v-input__slot {
    background-color: white !important;
  }
}
</style>
