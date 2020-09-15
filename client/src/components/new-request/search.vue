<template>
  <v-container fluid id="new-request-container" class="copy-normal">
    <v-row justify="end">
      <v-col cols="6" class="copy-normal">I need a name to:</v-col>
      <v-col cols="6" style="display: flex; justify-content: flex-end">
        <business-structures-tool>
          <template #start="{ homeModal }">
             <div id="#help-me-choose-activator"
                  class="link-std"
                  style="background-color: white"
                  @click="homeModal()">Help Me Choose</div>
          </template>
        </business-structures-tool>
      </v-col>
      <v-col cols="5">
        <!--request_action_cd-->
        <v-select :error-messages="errors.includes('request_action_cd') ? 'Please select a type' : ''"
                  :hide-details="!errors.includes('request_action_cd')"
                  :items="requestTypeOptions"
                  @change="clearErrors()"
                  filled
                  id="search-type-options-select"
                  v-model="request_action_cd" />
      </v-col>
      <v-col cols="2">
        <!--location-->
        <v-select :error-messages="errors.includes('location') ? 'Please select a location' : ''"
                  :hide-details="!errors.includes('location')"
                  :items="locationOptions"
                  filled
                  id="location-options-select"
                  v-model="location" />
      </v-col>
      <v-col cols="5">
        <!--entityConversionType-->
        <v-select :error-messages="errors.includes('entity_type_cd') ? 'Please select a type' : ''"
                  :hide-details="!errors.includes('entity_type_cd')"
                  :items="entityConversionTypeOptions"
                  :placeholder="isConversion ? 'Please choose a conversion type' : ''"
                  @change="clearErrors()"
                  filled
                  id="entity-type-options-select"
                  v-model="entity_type_cd" />
      </v-col>
      <NameInput :class="inputCompClass"
                 id="name-input-component"
                 class="mb-n7"/>
    </v-row>
    <v-row no-gutters class="ma-0 pa-0 mt-n3" align="center">
      <v-col cols="4">
      <v-tooltip bottom open-delay="300">
        <template v-slot:activator="{on}">
            <v-checkbox v-model="isPersonsName"
                        v-on="on"
                        id="name-checkbox"
                        class="copy-small px-0 mx-0"
                        label="The name is a person's name" />
        </template>
        <p class="py-0 my-0">Check this box if you are...</p>
          <ul>
            <li>Incorporating under your own name (eg. DR. JOE SMITH INC.)</li>
            <li>The name contains one or more names. (eg. BLAKE, CHAN & DOUGLAS INC.)</li>
            <li>The name contains one or more names. (eg. FRANKLIN INC.)</li>
          </ul>
      </v-tooltip>
      </v-col>
      <v-col cols="3">
      <v-tooltip bottom open-delay="300">
        <template v-slot:activator="{on}">

            <v-checkbox v-model="nameIsEnglish"
                        v-on="on"
                        id="name-checkbox"
                        class="copy-small ml-n6"
                        label="The name is English" />

        </template>
        <p class="py-0 my-0">This refers to the language of the words in your name.</p>
        <ul>
          <li>Leave this box checked if your name contains <b>only</b> English <b>or a mix</b> of English and
            another Language
          </li>
          <li>Uncheck this box if your name is written <b>entirely</b> in another language and does <b>not</b> contain
            any English
          </li>
        </ul>
      </v-tooltip>
      </v-col>
      <v-col cols="5">
        <span id="nr-required-activator"
              class="link-std"
              style="margin-left: auto"
              @click="activateNRRModal()">Check to see if you need to file a a name request</span>
      </v-col>
    </v-row>

  </v-container>
</template>

<script lang="ts">
import NameInput from './name-input.vue'
import newReqModule from '../../store/new-request-module'
import { bcMapping, xproMapping } from '@/store/list-data/request-action-mapping'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { LocationT } from '@/models'
import '@bizpal/open-services-bst/'

@Component({
  components: { NameInput }
})
export default class Search extends Vue {
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
    if (['CNV', 'MVE'].includes(newVal)) {
      this.location = 'BC'
      return
    }
    if (['ASSUMED', 'MVE'].includes(newVal)) {
      if (this.location === 'BC') {
        this.location = 'CA'
      }
    }
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
    newReqModule.mutateRequestAction(value)
    if (value === 'INFO') {
      newReqModule.mutatePickRequestTypeModalVisible(true)
    }
  }
  get requestTypeOptions () {
    return newReqModule.requestTypeOptions
  }
  get showNameCheckBox () {
    if (this.location === 'BC' && this.entity_type_cd === 'CR') {
      return true
    }
    return false
  }

  activateHMCModal () {
    newReqModule.mutateHelpMeChooseModalVisible(true)
  }
  activateNRRModal () {
    newReqModule.mutateNrRequiredModalVisible(true)
  }
  clearErrors () {
    newReqModule.clearErrors()
  }
  handleSubmit (event: Event) {
    event.preventDefault()
    newReqModule.startAnalyzeName()
  }
}

</script>
