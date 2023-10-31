<template>
  <v-container
    id="search-container"
    fluid
    class="copy-normal pt-10 px-10 pb-10"
  >
    <header class="h6">
      Get started by selecting an action:
    </header>

    <v-row class="pt-6">
      <!-- Request Action -->
      <RequestAction />

      <!-- display a dummy input box when Request Action is not yet selected -->
      <DummyInputBox v-if="!getSearchRequest" />

      <!-- New BC Business flow -->
      <template v-if="isNewBcBusiness">
        <EntityType v-if="getLocation" />
        <CompanyType v-if="getEntityTypeCd && isNumberedEntityType" />
        <NumberedCompanyBullets v-if="isNumberedCompany && isNumberedEntityType" />
        <template v-if="(isNamedCompany || !isNumberedEntityType) && entity_type_cd">
          <v-col
            cols="12"
            :md="showDesignation ? '8' : '12'"
          >
            <NameInput
              :is-mras-search="(isXproFlow && isMrasJurisdiction && !getHasNoCorpNum)"
              @emit-corp-num-validity="corpNumValid = $event"
            />
          </v-col>
          <Designation
            v-if="showDesignation"
            cols="12"
            md="4"
          />
        </template>
      </template>

      <!-- New Xpro Business flow -->
      <template v-else-if="isNewXproBusiness">
        <Jurisdiction />
        <EntityType
          v-if="getLocation && !isFederal"
          md="4"
        />

        <XproFederalBullets v-if="isFederal" />

        <!-- not Federal -->
        <template v-else-if="isXproEntityType(getEntityTypeCd)">
          <v-col
            cols="12"
            md="8"
          >
            <NameInput
              :is-mras-search="(isXproFlow && isMrasJurisdiction && !getHasNoCorpNum)"
              @emit-corp-num-validity="corpNumValid = $event"
            />
          </v-col>

          <v-col
            v-if="isMrasJurisdiction"
            cols="12"
            class="d-flex justify-end"
          >
            <CorpNumberCheckbox />
          </v-col>
        </template>
      </template>

      <!-- Continuation In flow -->
      <template v-else-if="isContinuationIn">
        <EntityType />
        <CompanyType v-if="getEntityTypeCd && isNumberedEntityType" />

        <template v-if="getEntityTypeCd">
          <!-- named company -->
          <template v-if="isNamedCompany || !isNumberedEntityType">
            <v-col
              cols="12"
              :md="showDesignation ? '8' : '12'"
            >
              <NameInput
                :is-mras-search="(isXproFlow && isMrasJurisdiction && !getHasNoCorpNum)"
                @emit-corp-num-validity="corpNumValid = $event"
              />
            </v-col>
            <Designation
              v-if="showDesignation"
              cols="12"
              md="4"
            />
          </template>

          <!-- numbered company -->
          <NumberedCompanyBullets v-else />
        </template>
      </template>

      <!-- Change Name flow -->
      <template v-else-if="isChangeName">
        <BusinessLookupFetch />
        <SocietiesInfo
          v-if="isSocietyDisabled && showSocietiesInfo"
          :type="'request a name for'"
          :showDialog="showSocietiesInfo"
        />
        <template v-else-if="isNameChangeable">
          <!-- XPRO jurisdiction -->
          <Jurisdiction
            v-if="isChangeNameXpro"
            md="4"
          />
          <CompanyType v-if="getEntityTypeCd && isNumberedEntityType" />

          <!-- named company -->
          <template v-if="isNamedCompany && !isFederal">
            <v-col
              cols="12"
              :md="showDesignation || isChangeNameXpro ? '8' : '12'"
            >
              <NameInput
                :is-mras-search="(isXproFlow && isMrasJurisdiction && !getHasNoCorpNum)"
                @emit-corp-num-validity="corpNumValid = $event"
              />
            </v-col>
            <Designation
              v-if="showDesignation"
              cols="12"
              md="4"
            />
          </template>

          <!-- numbered company -->
          <NumberedCompanyBullets v-if="isNumberedCompany" />

          <!-- XPRO federal bullet text -->
          <XproFederalBullets
            v-if="isXproFlow && isFederal"
            cols="12"
          />

          <!-- checkbox for MRAS jurisdiction -->
          <v-col
            v-if="isMrasJurisdiction"
            cols="12"
            class="d-flex justify-end"
          >
            <CorpNumberCheckbox />
          </v-col>
        </template>
      </template>

      <!-- Amalgamation flow -->
      <template v-else-if="isAmalgamation">
        <EntityType />

        <template v-if="isXproEntityType(getEntityTypeCd)">
          <Jurisdiction md="4" />

          <!-- federal sub-flow -->
          <XproFederalBullets v-if="isFederal" />

          <!-- xpro sub-flow -->
          <template v-else-if="isXproFlow">
            <v-col
              cols="12"
              md="8"
            >
              <NameInput
                :is-mras-search="(isMrasJurisdiction && !getHasNoCorpNum)"
                @emit-corp-num-validity="corpNumValid = $event"
              />
            </v-col>

            <v-col
              v-if="isMrasJurisdiction"
              cols="12"
              class="d-flex justify-end"
            >
              <CorpNumberCheckbox />
            </v-col>
          </template>
        </template>

        <!-- regular sub-flow -->
        <template v-else-if="getEntityTypeCd">
          <CompanyType v-if="isNumberedEntityType" />

          <!-- named company -->
          <template v-if="isNamedCompany || !isNumberedEntityType">
            <v-col
              cols="12"
              :md="showDesignation ? '8' : '12'"
            >
              <NameInput @emit-corp-num-validity="corpNumValid = $event" />
            </v-col>

            <Designation
              v-if="showDesignation"
              cols="12"
              md="4"
            />
          </template>

          <!-- numbered company -->
          <NumberedCompanyBullets v-if="isNumberedCompany" />
        </template>
      </template>

      <!-- Conversion (aka Alteration) flow -->
      <template v-else-if="isConversion">
        <BusinessLookupFetch />
        <EntityType
          v-if="getSearchBusiness && isAlterable"
          cols="12"
          md="12"
        />
        <CompanyType v-if="!!getSearchBusiness && !!getConversionType" />

        <template v-if="isNamedCompany">
          <v-col
            cols="12"
            :md="showDesignation ? '8' : '12'"
          >
            <NameInput
              :is-mras-search="(isXproFlow && isMrasJurisdiction && !getHasNoCorpNum)"
              @emit-corp-num-validity="corpNumValid = $event"
            />
          </v-col>
          <Designation
            v-if="showDesignation"
            cols="12"
            md="4"
          />
        </template>

        <NumberedCompanyBullets v-if="isNumberedCompany" />
      </template>

      <!-- Restoration / Reinstatement flow -->
      <template v-else-if="isRestoration">
        <BusinessLookupFetch ref="MyBusinessLookup" />
        <SocietiesInfo
          v-if="isSocietyDisabled && showSocietiesInfo"
          :type="'restore'"
          :showDialog="showSocietiesInfo"
        />
        <template v-else>
          <CompanyType v-if="getSearchBusiness && isBcRestorable && isSupportedRestoration(getEntityTypeCd)" />
          <Jurisdiction
            v-if="isSelectedXproAndRestorable && !isSocietyDisabled"
            cols="12"
            md="4"
          />

          <!-- federal sub-flow -->
          <XproFederalBullets v-if="isFederal && getSearchBusiness" />

          <template v-if="showRestoreNameInput && !isSocietyDisabled">
            <v-col
              cols="12"
              :md="(showDesignation || isSelectedXproAndRestorable) ? '8' : '12'"
            >
              <NameInput
                :is-mras-search="(isXproFlow && isMrasJurisdiction && !getHasNoCorpNum)"
                @emit-corp-num-validity="corpNumValid = $event"
              />
            </v-col>
            <Designation
              v-if="showDesignation"
              cols="12"
              md="4"
            />
            <v-col
              v-if="isMrasJurisdiction"
              cols="12"
              class="d-flex justify-end"
            >
              <CorpNumberCheckbox />
            </v-col>
          </template>

          <NumberedCompanyBullets v-if="isNumberedCompany" />
        </template>
      </template>
    </v-row>

    <!-- "Go to COLIN" button -->
    <template v-if="showColinButton">
      <v-row
        justify="center"
        class="mt-6"
      >
        <v-col cols="auto">
          <v-btn
            id="colin-button"
            class="px-9"
            :href="colinLink"
            target="_blank"
          >
            {{ colinButtonText }}
            <v-icon
              right
              small
            >
              mdi-open-in-new
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <!-- "Action Now" button -->
    <template v-if="showActionNowButton">
      <v-row
        justify="center"
        class="mt-6"
      >
        <v-col cols="auto">
          <v-btn
            id="action-now-button"
            class="px-9"
            @click="actionNowClicked()"
          >
            {{ actionNowButtonText }}
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <!-- "Check this Name" button -->
    <template v-if="showCheckNameButton">
      <v-row
        justify="center"
        class="mt-7"
      >
        <v-col cols="auto">
          <v-btn
            id="search-name-btn"
            class="px-9"
            :class="{ 'mobile-btn' : isMobile }"
            :disabled="!corpNumValid"
            @click="handleSubmit(true)"
          >
            <v-icon
              left
              size="24px"
            >
              mdi-magnify
            </v-icon>
            Check this Name
          </v-btn>
        </v-col>
      </v-row>

      <v-row
        v-if="isPremiumOrStaff"
        justify="center"
      >
        <v-col cols="auto">
          <v-btn
            id="name-check-skip-btn"
            class="outlined pa-0"
            :ripple="false"
            text
            @click="handleSubmit(false)"
          >
            <span>Submit this Name without checking</span>
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'

import NameInput from './name-input.vue'

import BusinessLookupFetch from '@/components/new-request/search-components/business-lookup-fetch.vue'
import CompanyType from '@/components/new-request/search-components/company-type.vue'
import CorpNumberCheckbox from '@/components/new-request/search-components/corp-number-checkbox.vue'
import Designation from '@/components/new-request/search-components/designation.vue'
import DummyInputBox from '@/components/new-request/search-components/dummy-input-box.vue'
import EntityType from '@/components/new-request/search-components/entity-type.vue'
import Jurisdiction from '@/components/new-request/search-components/jurisdiction.vue'
import NumberedCompanyBullets from '@/components/new-request/search-components/numbered-company-bullets.vue'
import RequestAction from '@/components/new-request/search-components/request-action.vue'
import XproFederalBullets from '@/components/new-request/search-components/xpro-federal-bullets.vue'
import SocietiesInfo from '@/components/dialogs/societies-info-dialog.vue'

import { EntityTypes } from '@/enums'
import { CommonMixin, NrAffiliationMixin, SearchMixin } from '@/mixins'
import { Designations, XproMapping } from '@/list-data'
import { Navigate } from '@/plugins'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { Action } from 'vuex-class'

/**
 * This is the component that displays the new NR menus and flows.
 */
@Component({
  components: {
    BusinessLookupFetch,
    CompanyType,
    CorpNumberCheckbox,
    Designation,
    DummyInputBox,
    EntityType,
    Jurisdiction,
    NameInput,
    NumberedCompanyBullets,
    RequestAction,
    SocietiesInfo,
    XproFederalBullets
  }
})
export default class Search extends Mixins(CommonMixin, NrAffiliationMixin, SearchMixin) {
  @Action setSocietiesModalVisible!: ActionBindingIF

  // Constant
  readonly colinLink = sessionStorage.getItem('CORPORATE_ONLINE_URL')

  // Local variable
  corpNumValid = true
  showSocietiesInfo = false

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

  @Watch('isSocietyDisabled')
  onIsSocietyDisabledChanged (disabled: boolean) {
    this.setSocietiesModalVisible(disabled)
    this.showSocietiesInfo = disabled
    if (disabled) {
      this.setSearchBusiness(null)
    }
  }

  get isSocietyDisabled (): boolean {
    return (
      !this.isSocietyEnabled() &&
      (this.getEntityTypeCd === EntityTypes.SO || this.getEntityTypeCd === EntityTypes.XSO)
    )
  }

  get showJurisdiction (): boolean {
    if (this.isAmalgamation && this.isXproEntityType(this.getEntityTypeCd)) return true
    if (this.isNewXproBusiness) return true
    if (this.isSelectedXproAndRestorable) return true
    if (this.isChangeNameXpro) return true
    return false
  }

  get showEntityType (): boolean {
    if (this.isConversion) {
      return (!!this.getSearchBusiness && this.isAlterable)
    }
    if (this.getLocation && !this.isFederal && !this.isRestoration && !this.isChangeName) return true
    return false
  }

  get showBusinessLookup () {
    if (this.isChangeName || this.isConversion || this.isRestoration) return true
    return false
  }

  get showDesignation (): boolean {
    if (this.isRestoration && this.isSelectedXproAndRestorable) return false
    if (this.isChangeName && this.isChangeNameXpro) return false
    return (Designations[this.getEntityTypeCd]?.end || false)
  }

  get isCooperative (): boolean {
    return (this.getEntityTypeCd === EntityTypes.CP)
  }

  get isCreditUnion (): boolean {
    return (this.getEntityTypeCd === EntityTypes.FI)
  }

  get isSociety (): boolean {
    return (this.isSocietyEnabled() && this.getEntityTypeCd === EntityTypes.SO)
  }

  /** Whether to show the name input field when trying to restore a historical company. */
  get showRestoreNameInput (): boolean {
    // We should show the name input field if the named radio button was used,
    // or with some special cases that if it is a coop(CP), or a credit union(FI).
    // Also, if it is a extrapros company, we should also have name input field when it is not a Canada Federal.
    const isPromptNameInput = (this.isNamedCompany || this.isCooperative || this.isCreditUnion || this.isSelectedXproAndRestorable)
    return (
      this.isRestorable && isPromptNameInput && !this.isFederal
    )
  }

  get showActionNowButton (): boolean {
    // Conditional for Continuation In Flow.
    if (
      this.isContinuationIn &&
      this.isNumberedCompany &&
      this.isSupportedContinuationIn(this.getEntityTypeCd)
    ) return true

    // Conditional for Amalgamation Flow.
    if (
      this.isAmalgamation &&
      this.isNumberedCompany &&
      this.isSupportedAmalgamation(this.getEntityTypeCd)
    ) return true

    // Conditional for Alteration Flow.
    if (
      this.isConversion &&
      this.isNumberedCompany &&
      this.isAlterOnline(this.getConversionType) &&
      this.isSupportedAlteration(this.getConversionType)
    ) return true

    // Conditional for "New BC-based business" Flow.
    // If we're in Start a new BC based and the entity is supported, show incorporate now button.
    if (this.isNewBcBusiness && this.isNumberedCompany && this.isNumberedEntityType) {
      const isIncorporateEntity = this.isSupportedIncorporationRegistration(this.getEntityTypeCd)
      return isIncorporateEntity
    }

    // Conditional for Change Name Flow.
    if (this.isChangeName && this.isNumberedCompany) return true

    // Conditional for Restoration/Reinstatement Flow.
    if (
      this.isRestoration &&
      this.isNumberedCompany &&
      this.isSupportedRestoration(this.getEntityTypeCd)
    ) return true

    return false
  }

  /** Whether to show "Go to COLIN" button (otherwise will show `actionNowButtonText` button). */
  get showColinButton (): boolean {
    // Conditional for Amalgamation Flow.
    if (
      this.isAmalgamation &&
      this.isNumberedCompany &&
      !this.isSupportedAmalgamation(this.getEntityTypeCd) &&
      !this.isXproFlow
    ) return true

    // Conditional for Alteration Flow.
    if (
      this.isConversion &&
      this.isNumberedCompany &&
      !this.isSupportedAlteration(this.getConversionType) &&
      this.isAlterOnline(this.getConversionType)
    ) return true

    // Conditional for "New BC-based business" Flow.
    // If we're in Start a new BC based and the entity is not supported, show go to Colin button.
    if (this.isNewBcBusiness && this.isNumberedCompany && this.isNumberedEntityType) {
      return !this.showActionNowButton
    }

    // Conditional for XPro Registration Flow
    if (this.isNewXproBusiness && this.isFederal) return true

    // Conditional for Change Name Flow.
    if (
      this.isChangeName &&
      this.isNumberedCompany &&
      !this.isSupportedChangeName(this.getEntityTypeCd)
    ) return true

    // Conditional for Change Name XPRO Flow.
    if (this.isChangeName &&
      this.isChangeNameXpro &&
      this.isFederal
    ) return true

    // Conditional for Restoration/Reinstatement Flow.
    if (
      this.isRestoration &&
      this.isNumberedCompany &&
      !this.isSupportedRestoration(this.getEntityTypeCd)
    ) return true

    // Conditional for Continuation In Flow.
    if (
      this.isContinuationIn &&
      this.isNumberedCompany &&
      !this.isSupportedContinuationIn(this.getEntityTypeCd)
    ) return true

    return false
  }

  /** Retrieve text for COLIN button based on selected action/flow */
  get colinButtonText (): string {
    var colinText = 'use this NR'
    if (this.isConversion) {
      colinText = 'Alter'
    } else if (this.isRestoration) {
      colinText = 'Restore'
    } else if (this.isChangeName) {
      colinText = 'Change Name'
    } else {
      colinText = 'Register'
    }
    return 'Go to Corporate Online to ' + colinText
  }

  /** Retrieve text based on selected action/flow */
  get actionNowButtonText (): string {
    if (this.isContinuationIn) return 'Continue In Now'
    if (this.isAmalgamation) return null // should never happen
    if (this.isConversion) return 'Alter Now'
    if (this.isRestoration) return 'Restore Now'
    if (this.isChangeName) return 'Change Name Now'
    if (this.isNewBusiness) return 'Incorporate Now'
    return null
  }

  get showCheckNameButton (): boolean {
    // Conditional for "New BC-based business" Flow.
    // Show button if we're in "Start a new BC-based business" and non-numbered entity is selected.
    if (this.isNewBcBusiness) {
      if (this.getEntityTypeCd && !this.isNumberedEntityType && !this.isSociety) return true
      if (this.getEntityTypeCd && this.isNamedCompany) return true
      if (this.getEntityTypeCd && this.isSociety) return true
    }

    // Conditional for XPro Registration Flow.
    if (this.isNewXproBusiness) {
      if (this.getEntityTypeCd && !this.isFederal) return true
    }

    // Conditional for Amalgamation Flow.
    if (this.isAmalgamation) {
      const isXpro = XproMapping.AML.includes(this.getEntityTypeCd)

      // named companies
      if (this.getEntityTypeCd && this.isNamedCompany) return true
      // exclude numbered companies
      if (this.getEntityTypeCd && this.isNumberedCompany) return false
      // "unknown" companies except xpro and societies
      if (this.getEntityTypeCd && !isXpro && !this.isSociety) return true
      // societies (special case due to FF)
      if (this.getEntityTypeCd && this.isSociety) return true
      // exclude federal
      if (this.getEntityTypeCd && this.isFederal) return false
      // xpro, once location is selected
      if (this.getEntityTypeCd && (this.isLocationCA || this.isLocationIN)) return true
    }

    // Conditional for Alteration Flow.
    if (this.isConversion) {
      if (this.getEntityTypeCd && this.isNamedCompany && !this.isFederal) return true
    }

    // Conditional for Change Name Flow.
    if (this.isChangeName) {
      if (!this.isNameChangeable) return false
      if (this.getEntityTypeCd && this.isNamedCompany && !this.isFederal) return true
      if (this.getEntityTypeCd && this.isSociety) return true
    }

    // Conditional for Restoration/Reinstatement.
    if (this.isRestoration) {
      if (this.getEntityTypeCd && this.isNamedCompany && !this.isFederal) return true
      if (this.getEntityTypeCd && this.isSelectedXproAndRestorable && !this.isFederal) return true
      if (this.getSearchBusiness && this.isBcRestorable && (this.isNamedCompany || this.isCooperative || this.isCreditUnion)) return true
    }

    // Conditional for Continuation In Flow.
    if (this.isContinuationIn) {
      if (this.getEntityTypeCd && !this.isNumberedEntityType) return true
      if (this.getEntityTypeCd && !this.isNumberedEntityType && this.isSociety) return true
      if (this.getEntityTypeCd && this.isNamedCompany) return true
    }

    return false
  }

  /**
   * If user is authenticated, create draft business and redirect to Dashboard.
   * If restoration/reinstatement selected, go to business dashboard.
   * If user is not authenticated, redirect to login screen then redirect back.
   */
  async actionNowClicked () {
    const legalType = this.entityTypeToCorpType(this.getEntityTypeCd)
    if (this.isAuthenticated) {
      if (this.isConversion || this.isRestoration || this.isChangeName) {
        this.goToEntityDashboard(this.getSearchBusiness.identifier)
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
    if (this.isXproFlow) this.$root.$emit('showSpinner', true)
    await this.startAnalyzeName(null)
    if (this.isXproFlow) this.$root.$emit('showSpinner', false)
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

#colin-button,
#action-now-button,
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

  .theme--light.v-list-item:not(.v-list-item--active):not(.v-list-item--disabled) {
    color: $gray7 !important;
  }

  // override radio group background color
  .v-input--radio-group .v-input__control .v-input__slot {
    background-color: white !important;
  }
}
</style>
