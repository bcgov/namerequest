<template>
  <v-container fluid id="new-request-container" class="copy-normal">
    <v-row cols="12">
      <v-col cols="6" class="font-weight-bold h6"><span>I need a name to:</span></v-col>
      <v-col cols="6">
        <span id="nr-required-activator"
              class="link-std d-flex justify-end"
              @click="activateNRRModal()">Check to see if you need to file a a Name Request</span>
      </v-col>
      <v-col cols="5 mt-n1">
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
      <v-col cols="2 px-0 mt-n1">
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
      <v-col cols="5 mt-n1">
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
                            :class="{ 'entity-type-info': data.item.value === 'INFO' }">
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
      <NameInput :class="inputCompClass"
                 id="name-input-component"
                 class="mb-n7"/>
    </v-row>
    <v-row class="mt-n3" no-gutters>
      <v-col>
        <v-tooltip top content-class="top-tooltip" transition="fade-transition" open-delay="200">
          <template v-slot:activator="{ on }">
            <v-checkbox
                    v-model="isPersonsName"
                    id="name-checkbox"
                    class="copy-small mr-5"
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
      </v-col>
      <v-col cols="4" class="ml-n8">
        <v-tooltip top content-class="top-tooltip" transition="fade-transition" open-delay="200">
          <template v-slot:activator="{ on }">
            <v-checkbox
                    v-model="nameIsEnglish"
                    id="name-checkbox"
                    :false-value="true"
                    :true-value="false"
                    class="copy-small"
                    v-slot:label v-on="on">
              <template>
                <span v-on="on" class="copy-small">Name contains no English words</span>
              </template>
            </v-checkbox>
          </template>
          <p>This refers to the language of the words in your name.</p>
          <ul>
            <li>Check this box if your name is written <b>entirely</b> in another language and does <b>not</b> contain
            any English
            </li>
            <li>Leave this box unchecked if your name contains <b>only</b> English or a mix of English and another
              language.
            </li>
          </ul>
        </v-tooltip>
      </v-col>
      <v-col cols="5"></v-col>
    </v-row>
    <div class="mt-1 mb-4 text-center">
      <v-btn
              class="search-name-btn"
              @click="handleSubmit()">Search Name</v-btn>
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
  @Watch('location')
  watchLocation (newVal, oldVal) {
    if (newVal === 'INFO') {
      let type = this.entity_type_cd
      newReqModule.mutateLocationInfoModalVisible(true)
      this.$nextTick(function () {
        this.location = oldVal
        this.entity_type_cd = type
      })
    }
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
    if (['CNV'].includes(newVal)) {
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
    return newReqModule.entityBlurbs.find(type => type.value === entity_type_cd)?.blurbs
  }
  private get isScreenLg () {
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
  get locationText () {
    return newReqModule.locationText
  }
  get nameIsEnglish () {
    return newReqModule.nameIsEnglish
  }
  set nameIsEnglish (value) {
    newReqModule.mutateNameIsEnglish(value)
  }
  get request_action_cd () {
    return newReqModule.request_action_cd
  }
  set request_action_cd (value: string) {
    const request = this.requestActions.find(request => request.value === value)
    if (request.value !== 'NEW') {
      newReqModule.mutateExtendedRequestType(request)
    }
    if (request.value === 'MVE') {
      newReqModule.mutateLocation('CA')
    }
    newReqModule.mutateRequestAction(value)
  }
  get requestActions () {
    return newReqModule.requestActions
  }
  get requestText () {
    return newReqModule.requestText
  }
  activateNRRModal () {
    newReqModule.mutateNrRequiredModalVisible(true)
  }
  clearErrors () {
    newReqModule.clearErrors()
  }
  handleSubmit () {
    newReqModule.startAnalyzeName()
  }
}

</script>

<style lang="sass" scoped>
.v-list
  padding: 0

.list-item
  width: 100%
  padding: 8px

.v-select
  &::placeholder
    color: green !important

.entity-type-info
  border-top: 1px solid #DEE2E6
  padding: 20px 8px !important

.list-item:hover
  color: #1669BB

.search-name-btn
  min-height: 45px
  padding: 0 50px 0 50px !important

</style>
