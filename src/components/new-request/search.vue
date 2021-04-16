<template>
  <v-container fluid id="new-request-container" class="copy-normal pa-10">
    <v-row no-gutters>
      <v-col cols="6" class="pt-0 font-weight-bold h6"><span>I need a name to:</span></v-col>
    </v-row>

    <v-row class="mt-4" no-gutters>
      <v-col cols="4">
        <!--request_action_cd-->
        <v-tooltip top
                   id="search-type-options-select"
                   content-class="top-tooltip"
                   transition="fade-transition"
                   :disabled="request_action_cd !== 'CNV'">
          <template v-slot:activator="scope">
            <div v-on="scope.on">
              <v-select :error-messages="getErrors.includes('request_action_cd') ? 'Please select an action' : ''"
                        :items="$requestActions"
                        @change="clearErrors()"
                        label="Select an Action"
                        filled
                        v-model="request_action_cd">
                <template slot="item" slot-scope="data">
                  <v-tooltip :disabled="!data.item.blurbs" right transition="fade-transition">
                    <template v-slot:activator="scope">
                      <span v-on="scope.on" class="list-item">
                        {{ data.item.text }}
                      </span>
                    </template>
                    <span>{{ data.item.blurbs }}</span>
                  </v-tooltip>
                </template>
              </v-select>
            </div>
          </template>
          <span>{{ getRequestText }}</span>
        </v-tooltip>
      </v-col>
      <v-col cols="4" class="px-3">
        <!--location-->
        <v-tooltip id="location-options-select"
                   top
                   content-class="top-tooltip"
                   transition="fade-transition"
                   :disabled="!location || location === 'BC'">
          <template v-slot:activator="scope">
            <div v-on="scope.on">
              <v-select :error-messages="getErrors.includes('location') ? 'Please select a jurisdiction' : ''"
                        :items="getLocationOptions"
                        :disabled="locationDisabled"
                        :readonly="!request_action_cd"
                        :class="!request_action_cd ? 'disabled-custom' : ''"
                        @change="clearErrors()"
                        filled
                        label="Select a Jurisdiction"
                        v-model="location">
                <template slot="item" slot-scope="data">
                  <v-tooltip :disabled="!request_action_cd || !data.item.blurbs" right transition="fade-transition">
                    <template v-slot:activator="scope">
                      <span v-on="scope.on" class="list-item">{{ data.item.text }}</span>
                    </template>
                      <div v-for="(item, index) in data.item.blurbs "
                           :key="`Location-Blurb-${index}`">
                        <span v-if="request_action_cd === request_action_enum[index]">
                          {{ item }}
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
      <v-col cols="4">
        <!--entityConversionType-->
        <v-tooltip id="entity-type-options-select"
                   top
                   content-class="top-tooltip"
                   :disabled="request_action_cd !== 'CNV' || !entityConversionText"
                   transition="fade-transition">
          <template v-slot:activator="scope">
            <div v-on="scope.on">
              <v-select :error-messages="getErrors.includes('entity_type_cd') ? 'Please select a business type' : ''"
                        :items="entityConversionTypeOptions"
                        :label="getIsConversion ? 'Select an Alteration Type' : 'Select a Business Type'"
                        :readonly="!request_action_cd || !location"
                        :class="!location ? 'disabled-custom' : ''"
                        @change="clearErrors()"
                        filled
                        v-model="entity_type_cd">
                <template slot="item" slot-scope="data">
                  <v-tooltip
                          :right="isScreenLg"
                          :left="!isScreenLg"
                          :disabled="!data.item.blurbs"
                          :content-class="!isScreenLg ? 'left-tooltip' : ''"
                          transition="fade-transition">
                    <template v-slot:activator="scope">
                      <span v-on="scope.on"
                            class="list-item"
                            :class="{ 'last-select-item': data.item.value === 'INFO' }">
                        {{ data.item.text }}
                      </span>
                    </template>
                    <div v-for="(item, index) in entityBlurbs(data.item.value)"
                         :key="`Blurb-${index}`">
                      <span :class="{ 'tooltip-bullet': index !== 0}">
                        {{ item }}
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
      <v-col cols="4" v-if="getIsXproMras">
        <v-select :error-messages="getErrors.includes('jurisdiction') ? 'Please select a jurisdiction' : ''"
                  :items="jurisdictionOptions"
                  label="Select business's home jurisdiction"
                  @change="clearErrors()"
                  filled
                  v-model="jurisdiction">
          <template slot="item" slot-scope="data">
            <span class="list-item" :class="{ 'last-select-item': data.item.value === 'FD' }">
              {{ data.item.text }}
            </span>
          </template>
        </v-select>
      </v-col>
      <v-col :cols="getIsXproMras ? 8 : 12" :class="{ 'pl-3': (getIsXproMras && !isFederal) }">
        <NameInput v-if="!isFederal"
                   :class="inputCompClass"
                   :is-mras-search="(getIsXproMras && !noCorpNum)"
                   id="name-input-component"
                   class="pa-0"
                   @emit-corp-num-validity="corpNumValid = $event"/>
        <p v-else class="pl-3 mt-n2 text-body-2">Federally incorporated businesses do not need a Name Request. You may
          register  your extraprovincial business immediately using its existing name at Corporate Online.</p>
      </v-col>
    </v-row>

    <!-- Person name and english checkboxes, render when location is NOT XPro Canada -->
    <v-row v-if="!getIsXproMras" no-gutters>
      <v-tooltip top content-class="top-tooltip" transition="fade-transition" open-delay="200">
        <template v-slot:activator="{ on }">
          <v-checkbox
                  v-model="isPersonsName"
                  id="person-checkbox"
                  class="copy-small mt-0 pt-0"
                  hide-details
                  v-slot:label
                  v-on="on">
            <template>
              <span v-on="on" class="copy-small">Name is a person's name</span>
            </template>
          </v-checkbox>
        </template>
        <p>Check this box if you are...</p>
        <ul>
          <li>Incorporating under your own name (eg. DR. JOE SMITH INC.)</li>
          <li>The name contains one or more names. (eg. BLAKE, CHAN &amp; DOUGLAS INC.)</li>
        </ul>
      </v-tooltip>

      <v-tooltip top content-class="top-tooltip" transition="fade-transition" open-delay="200">
        <template v-slot:activator="{ on }">
          <v-checkbox
                  v-model="nameIsEnglish"
                  id="name-checkbox"
                  :false-value="true"
                  :true-value="false"
                  class="copy-small mt-0 pt-0 ml-4"
                  hide-details
                  v-slot:label
                  v-on="on">
            <template>
              <span v-on="on" class="copy-small">Name contains no English words</span>
            </template>
          </v-checkbox>
        </template>
        <p>This refers to the language of the words in your name.</p>
        <ul>
          <li>Check this box if your name is written <b>entirely</b> in another language and does <b>not</b> contain
            any English</li>
          <li>Leave this box unchecked if your name contains <b>only</b> English or a mix of English and another
            language.</li>
        </ul>
      </v-tooltip>
    </v-row>

    <!-- Corporate number checkbox, only for XPro Canadian Locations -->
    <v-row v-else-if="!isFederal" no-gutters>
      <v-col class="d-flex justify-end">
        <v-tooltip top min-width="390" content-class="top-tooltip" transition="fade-transition">
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

    <!-- No Corp Designation blurb and checkbox -->
    <v-expand-transition>
      <v-row v-if="getShowNoCorpDesignation" no-gutters class="bg-light-blue mt-6">
        <v-col class="text-body-4 pa-7">
          <strong>Important:</strong> A {{entityTextFromValue}} <strong>cannot use a Corporate designation</strong>
          (Inc., Incorporated, LTD, Limited, etc.) in its name. Although not required, you can use Company or Co. for
          a {{entityTextFromValue}}.

          <v-checkbox
            v-model="noCorpDesignation"
            id="no-corp-designation-checkbox"
            class="pt-0"
            :error-messages="getErrors.includes('no_corp_designation') ? 'Confirm designation usage' : ''"
            @change="clearErrors()"
          >
            <template slot="label">
              <span class="text-body-4">I confirm that I have <strong>not</strong> used a corporate designation.</span>
            </template>
          </v-checkbox>
        </v-col>
      </v-row>
    </v-expand-transition>

    <div v-if="!isFederal" class="mt-6 text-center">
      <v-btn id="search-name-btn" :disabled="!corpNumValid" @click="handleSubmit()">
        {{ getIsXproMras ? 'Search' : 'Search Name'}}
      </v-btn>
    </div>
    <div v-else class="mt-6 text-center">
      <v-btn id="goto-corporate-btn" :href="corpOnlineLink" target="_blank">
        Go to Corporate Online to Register <v-icon small class="ml-1">mdi-open-in-new</v-icon>
      </v-btn>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

// Components
import NameInput from './name-input.vue'

// Interfaces / Enums / List Data
import { ConversionTypesI, EntityI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({
  components: { NameInput }
})
export default class NewSearch extends Vue {
  // Global getters
  @Getter getConversionType!: string
  @Getter getConversionTypeOptions!: ConversionTypesI[]
  @Getter getEntityBlurbs!: Array<EntityI>
  @Getter getEntityTypeCd!: string
  @Getter getEntityTypeOptions!: Array<EntityI>
  @Getter getEntityTextFromValue!: string
  @Getter getErrors!: string[]
  @Getter getHasNoCorpNum!: boolean
  @Getter getIsConversion!: boolean
  @Getter getIsPersonsName!: boolean
  @Getter getIsXproMras!: boolean
  @Getter getJurisdictionCd!: string
  @Getter getLocation!: string
  @Getter getLocationOptions!: object[]
  @Getter getLocationText!: string
  @Getter getNameIsEnglish!: boolean
  @Getter getNoCorpDesignation!: boolean
  @Getter getRequestActionCd!: string
  @Getter getRequestText!: string
  @Getter getShowNoCorpDesignation!: boolean

  // Global actions
  @Action setConversionType!: ActionBindingIF
  @Action setCorpSearch!: ActionBindingIF
  @Action setClearErrors!: ActionBindingIF
  @Action setEntityTypeCd!: ActionBindingIF
  @Action setExtendedRequestType!: ActionBindingIF
  @Action setIsPersonsName!: ActionBindingIF
  @Action setJurisdiction!: ActionBindingIF
  @Action setLocation!: ActionBindingIF
  @Action setName!: ActionBindingIF
  @Action setNameIsEnglish!: ActionBindingIF
  @Action setNoCorpNum!: ActionBindingIF
  @Action setNoCorpDesignation!: ActionBindingIF
  @Action setPickEntityModalVisible!: ActionBindingIF
  @Action setRequestAction!: ActionBindingIF
  @Action startAnalyzeName!: ActionBindingIF

  // Local properties
  private corpNumValid = true
  private corpOnlineLink = 'https://www.corporateonline.gov.bc.ca/'
  private locationDisabled = false

  // Local enum
  private request_action_enum = [
    'NEW',
    'MVE',
    'REH',
    'AML',
    'CHG'
  ]

  private mounted () {
    this.$nextTick(() => {
      if (this.$el.querySelector) {
        // add classname to button text (for more detail in Sentry breadcrumbs)
        const searchNameBtn = this.$el.querySelector('#search-name-btn > span')
        if (searchNameBtn) searchNameBtn.classList.add('search-name-btn')
      }
    })
  }

  // Local Getters
  get isScreenLg () {
    return this.$vuetify.breakpoint.lgAndUp
  }

  entityBlurbs (entity_type_cd: string): string | string[] | string[][] {
    return this.getEntityBlurbs?.find(type => type.value === entity_type_cd)?.blurbs
  }

  get entity_type_cd () {
    if (this.getIsConversion) {
      return this.getConversionType
    }
    return this.getEntityTypeCd
  }

  set entity_type_cd (type: string) {
    if (type === 'INFO') {
      this.setPickEntityModalVisible(true)
    }
    if (type && this.getIsConversion) {
      if (type !== 'INFO') {
        let { entity_type_cd } = this.$conversionTypes.find(conv => conv.value === type)
        this.setEntityTypeCd(entity_type_cd)
      }
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
    return this.$conversionTypes.find(conversion => conversion.value === this.getConversionType)?.text
  }

  get inputCompClass () {
    let errorTypes = ['entity_type_cd', 'request_action_cd', 'location']
    if (errorTypes.some(type => this.getErrors.includes(type))) {
      return 'mt-n5'
    }
    return 'mt-n2'
  }

  get isFederal () {
    return this.location === 'CA' && this.jurisdiction === 'FD'
  }

  get isPersonsName () {
    return this.getIsPersonsName
  }

  set isPersonsName (value) {
    this.setIsPersonsName(value)
  }

  get location () {
    return this.getLocation
  }

  set location (location: string) {
    this.setLocation(location)
  }

  get jurisdiction () {
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

  get noCorpDesignation () {
    return this.getNoCorpDesignation
  }

  set noCorpDesignation (value) {
    this.setNoCorpDesignation(value)
  }

  get request_action_cd () {
    return this.getRequestActionCd
  }

  set request_action_cd (value: string) {
    const request = this.$requestActions.find(request => request.value === value)
    this.location = null
    if (this.entity_type_cd) {
      this.entity_type_cd = ''
    }
    if (request?.value !== 'NEW') {
      this.setExtendedRequestType(request)
    }
    this.setRequestAction(value)
  }

  get jurisdictionOptions () {
    return this.location === 'CA'
      ? this.$canJurisdictions.filter(jur => jur.value !== 'BC')
      : this.$intlJurisdictions.filter(jur => jur.value !== 'CA')
  }

  get entityTextFromValue (): string {
    return this.getEntityTextFromValue || 'specified business type'
  }

  clearErrors () {
    this.setClearErrors(null)
  }

  async handleSubmit () {
    if (this.getIsXproMras) this.$root.$emit('showSpinner', true)
    await this.startAnalyzeName(null)
    if (this.getIsXproMras) this.$root.$emit('showSpinner', false)
  }

  /** Reset search values when location changes */
  @Watch('location')
  watchLocation () {
    this.setName('')
    this.setCorpSearch('')
  }

  @Watch('request_action_cd')
  watchRequestActionCd (newVal) {
    // Set default location to BC for the requests where BC is the only location option
    if (['CNV', 'MVE'].includes(newVal)) {
      this.setLocation('BC')
      this.locationDisabled = true
      return
    }
    this.locationDisabled = false
    if (['ASSUMED'].includes(newVal)) {
      if (this.location === 'BC') {
        this.setLocation('CA')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';
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
.list-item:hover {
  color: $app-blue;
}
.disabled-custom {
  opacity: 0.4;
  pointer-events: none;
}
#search-name-btn {
  min-height: 45px !important;
  padding: 0 50px !important;
}
#goto-corporate-btn {
  min-height: 45px !important;
}
#name-input-component {
  margin-top: 0 !important;
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
    line-height: 1.5rem !important;
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
}
</style>
