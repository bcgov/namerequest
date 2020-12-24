<template>
  <v-container fluid id="new-request-container" class="copy-normal pa-10">
    <v-row no-gutters>
      <v-col cols="6" class="pt-0 font-weight-bold h6"><span>I need a name to:</span></v-col>
      <v-col cols="6" class="pt-0">
        <span id="nr-required-activator"
              class="link-std d-flex justify-end"
              @click="activateNRRModal()">Check to see if you need to file a Name Request</span>
      </v-col>
    </v-row>

    <v-row class="mt-4" no-gutters>
      <v-col cols="5">
        <!--request_action_cd-->
        <v-tooltip top
                   id="search-type-options-select"
                   content-class="top-tooltip"
                   transition="fade-transition"
                   :disabled="request_action_cd !== 'CNV'">
          <template v-slot:activator="scope">
            <div v-on="scope.on">
              <v-select :error-messages="errors.includes('request_action_cd') ? 'Please select a type' : ''"
                        :hide-details="!errors.includes('request_action_cd')"
                        :items="requestActions"
                        @change="clearErrors()"
                        filled
                        v-model="request_action_cd">
                <template slot="item" slot-scope="data">
                  <v-tooltip :disabled="!data.item.blurbs" right transition="fade-transition">
                    <template v-slot:activator="scope">
                      <span v-on="scope.on" class="list-item">{{ data.item.text }}</span>
                    </template>
                    <span>{{ data.item.blurbs }}</span>
                  </v-tooltip>
                </template>
              </v-select>
            </div>
          </template>
          <span>{{requestText}}</span>
        </v-tooltip>
      </v-col>
      <v-col cols="2" class="px-3">
        <!--location-->
        <v-tooltip id="location-options-select"
                   top
                   content-class="top-tooltip"
                   transition="fade-transition"
                   :disabled="location === 'BC'">
          <template v-slot:activator="scope">
            <div v-on="scope.on">
              <v-select :error-messages="errors.includes('location') ? 'Please select a location' : ''"
                        :hide-details="!errors.includes('location')"
                        :items="locationOptions"
                        @change="clearErrors()"
                        filled
                        v-model="location">
                <template slot="item" slot-scope="data">
                  <v-tooltip :disabled="!data.item.blurbs" right transition="fade-transition">
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
          <span>{{ locationText }}</span>
        </v-tooltip>
      </v-col>
      <v-col cols="5">
        <!--entityConversionType-->
        <v-tooltip id="entity-type-options-select"
                   top
                   content-class="top-tooltip"
                   :disabled="request_action_cd !== 'CNV' || !entityConversionText"
                   transition="fade-transition">
          <template v-slot:activator="scope">
            <div v-on="scope.on">
              <v-select :error-messages="errors.includes('entity_type_cd') ? 'Please select a type' : ''"
                        :hide-details="!errors.includes('entity_type_cd')"
                        :items="entityConversionTypeOptions"
                        :label="isConversion ? 'Please choose a conversion type' : ''"
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
      </v-col><span>{{entity_type_cd}}</span>
    </v-row>

    <v-row class="mt-4" no-gutters>
      <v-col cols="5" v-if="isXproMras">
        <v-select :error-messages="errors.includes('jurisdiction') ? 'Please select a jurisdiction' : ''"
                  :hide-details="!errors.includes('jurisdiction')"
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
      <v-col :cols="isXproMras ? 7 : 12" class="mt-2" :class="{ 'pl-3': (isXproMras && !isFederal) }">
        <NameInput v-if="!isFederal"
                   :class="inputCompClass"
                   :is-mras-search="(isXproMras && !noCorpNum)"
                   id="name-input-component"
                   class="pa-0"
                   @emit-corp-num-validity="corpNumValid = $event"/>
        <p v-else class="pl-3 mt-n2 text-body-2">Federally incorporated businesses do not need a Name Request. You may
          register  your extraprovincial business immediately using its existing name at Corporate Online.</p>
      </v-col>
    </v-row>

    <!-- Person name and english checkboxes, render when location is NOT XPro Canada -->
    <v-row v-if="!isXproMras" no-gutters>
      <v-tooltip top content-class="top-tooltip" transition="fade-transition" open-delay="200">
        <template v-slot:activator="{ on }">
          <v-checkbox
                  v-model="isPersonsName"
                  id="person-checkbox"
                  class="copy-small mt-0 pt-0"
                  hide-details
                  v-slot:label v-on="on">
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
                  v-slot:label v-on="on">
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
                    v-slot:label v-on="on">
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

    <div v-if="!isFederal" class="mt-6 text-center">
      <v-btn id="search-name-btn" :disabled="!corpNumValid" @click="handleSubmit()">
        {{ isXproMras ? 'Search' : 'Search Name'}}
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
import NameInput from './name-input.vue'
import newReqModule from '../../store/new-request-module'
import { bcMapping, xproMapping } from '@/store/list-data/request-action-mapping'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { LocationT } from '@/models'

@Component({
  components: { NameInput }
})
export default class NewSearch extends Vue {
  // Local Properties
  private corpNumValid: boolean = true
  private corpOnlineLink = 'https://www.corporateonline.gov.bc.ca/'

  private mounted () {
    // add classname to button text (for more detail in Sentry breadcrumbs)
    this.$el.querySelector("#search-name-btn > span")?.classList.add("search-name-btn")
  }

  /** Reset search values when location changes */
  @Watch('location')
  watchLocation () {
    newReqModule.mutateName('')
    newReqModule.mutateCorpSearch('')
  }
  @Watch('request_action_cd')
  watchRequestActionCd (newVal) {
    if (Object.keys(bcMapping).includes(newVal) && ['BC'].includes(this.location)) {
      let { value } = newReqModule.entityTypesBCData.find(ent => ent.rank === 1)
      newReqModule.mutateEntityType(value)
    }
    if (Object.keys(xproMapping).includes(newVal) && ['CA', 'IN'].includes(this.location)) {
      let { value } = newReqModule.entityTypesXPROData.find(ent => ent.rank === 1)
      newReqModule.mutateEntityType(value)
    }
    if (['CNV', 'MVE'].includes(newVal)) {
      this.location = 'BC'
      return
    }
    if (['ASSUMED'].includes(newVal)) {
      if (this.location === 'BC') {
        this.location = 'CA'
      }
    }
  }
  private request_action_enum = [
    'NEW',
    'MVE',
    'REH',
    'AML',
    'CHG'
  ]
  entityBlurbs (entity_type_cd: string) {
    return newReqModule.entityBlurbs?.find(type => type.value === entity_type_cd)?.blurbs || ''
  }
  get isScreenLg () {
    return this.$vuetify.breakpoint.lgAndUp
  }
  get displayedComponent () {
    return newReqModule.displayedComponent
  }
  get entity_type_cd () {
    if (this.isConversion) {
      return newReqModule.conversionType
    }
    return newReqModule.entity_type_cd
  }
  set entity_type_cd (type: string) {
    if (type === 'INFO') {
      newReqModule.mutatePickEntityModalVisible(true)
    }
    if (this.isConversion) {
      if (type !== 'INFO') {
        let { entity_type_cd } = newReqModule.conversionTypes.find(conv => conv.value === type)
        newReqModule.mutateEntityType(entity_type_cd)
      }
      newReqModule.mutateConversionType(type)
      return
    }
    newReqModule.mutateEntityType(type)
  }
  get entityConversionTypeOptions () {
    if (this.isConversion) {
      return newReqModule.conversionTypeOptions
    }
    console.log(newReqModule.entityTypeOptions)
    return newReqModule.entityTypeOptions
  }
  get entityTypeOptions () {
    return newReqModule.entityTypeOptions
  }
  get entityConversionText () {
    return newReqModule.conversionTypes.find(conversion => conversion.value === newReqModule.conversionType)?.text
  }
  get errors () {
    return newReqModule.errors
  }
  get inputCompClass () {
    let errorTypes = ['entity_type_cd', 'request_action_cd', 'location']
    if (errorTypes.some(type => this.errors.includes(type))) {
      return 'mt-n5'
    }
    return 'mt-n2'
  }
  get isConversion () {
    return newReqModule.request_action_cd === 'CNV'
  }
  get isFederal () {
    return this.jurisdiction === 'FD'
  }
  get isPersonsName () {
    return newReqModule.isPersonsName
  }
  set isPersonsName (value) {
    newReqModule.mutateIsPersonsName(value)
  }
  get location () {
    return newReqModule.location
  }
  set location (location: LocationT) {
    newReqModule.mutateLocation(location)
  }
  get locationOptions () {
    return newReqModule.locationOptions
  }
  get jurisdiction () {
    return newReqModule.request_jurisdiction_cd
  }
  set jurisdiction (jurisdiction: string) {
    newReqModule.mutateJurisdiction(jurisdiction)
  }
  get locationText () {
    return newReqModule.locationText
  }
  get nameIsEnglish () {
    return newReqModule.nameIsEnglish
  }
  set nameIsEnglish (value) {
    newReqModule.mutateNameIsEnglish(value)
  }
  get noCorpNum () {
    return newReqModule.noCorpNum
  }
  set noCorpNum (value) {
    newReqModule.mutateNoCorpNum(value)
  }
  get request_action_cd () {
    return newReqModule.request_action_cd
  }
  set request_action_cd (value: string) {
    const request = this.requestActions.find(request => request.value === value)
    if (request.value !== 'NEW') {
      newReqModule.mutateExtendedRequestType(request)
    }
    newReqModule.mutateRequestAction(value)
  }
  get requestActions () {
    return newReqModule.requestActions
  }
  get requestText () {
    return newReqModule.requestText
  }
  get isXproMras () {
    return newReqModule.isXproMras
  }
  get jurisdictionOptions () {
    return this.location === 'CA'
      ? this.$canJurisdictions.filter(jur => jur.value !== 'BC')
      : this.$intJurisdictions.filter(jur => jur.value !== 'CA')
  }
  activateNRRModal () {
    newReqModule.mutateNrRequiredModalVisible(true)
  }
  clearErrors () {
    newReqModule.clearErrors()
  }
  async handleSubmit () {
    if (this.isXproMras) this.$root.$emit('showSpinner', true)
    await newReqModule.startAnalyzeName()
    this.$root.$emit('showSpinner', false)
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
#search-name-btn {
  min-height: 45px !important;
  padding: 0 50px !important;
}
#goto-corporate-btn {
  min-height: 45px !important;
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
  /* remove bottom margin from checkboxes */
  .v-input--checkbox > .v-input__slot {
    margin-bottom: 0 !important;
  }
}
</style>
