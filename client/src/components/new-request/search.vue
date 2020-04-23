<template>
  <v-container fluid id="new-request-container" class="normal-copy">
    <v-row justify="end">
      <v-col cols="6" class="normal-copy">I need a name to:</v-col>
      <v-col cols="6" style="display: flex; justify-content: flex-end">
        <button class="normal-link"
              id="help-me-choose-activator"
              @change="activateHMCModal()">Help Me Choose</button>
      </v-col>
      <v-col cols="5">
        <v-select :error-messages="errors.includes('requestAction') ? 'Please select a type' : ''"
                  :hide-details="!errors.includes('requestAction')"
                  :items="requestTypeOptions"
                  @change="clearErrors()"
                  filled
                  id="search-type-options-select"
                  v-model="requestAction" />
      </v-col>
      <v-col cols="2">
        <v-select :error-messages="errors.includes('location') ? 'Please select a location' : ''"
                  :hide-details="!errors.includes('location')"
                  :items="locationOptions"
                  filled
                  id="location-options-select"
                  v-model="location" />
      </v-col>
      <v-col cols="5">
        <v-select :error-messages="errors.includes('entityType') ? 'Please select a type' : ''"
                  :hide-details="!errors.includes('entityType')"
                  :items="entityTypeOptions"
                  @change="clearErrors()"
                  filled
                  id="entity-type-options-select"
                  v-model="entityType" />
      </v-col>
      <NameInput :class="inputCompClass"
                 id="name-input-component"
                 class="mb-n7"/>
      <v-row no-gutters class="mt-n3 px-3" align="center">
        <v-col @mouseenter="handleMouseEnter"
               @mouseleave="handleMouseLeave"
               cols="*"
               id="name-checkbox-col">
          <v-checkbox v-model="isPersonsName"
                      id="name-checkbox"
                      class="small-copy px-0 mx-0"
                      label="The name is a person's name" />
        </v-col>
        <v-col cols="3">
          <transition :name="displayedComponent === 'Tabs' ? 'fadeslower' : ''">
            <v-checkbox v-model="nameIsEnglish"
                        v-if="isPersonsName"
                        id="name-checkbox"
                        class="small-copy ml-n6"
                        label="The name is English" />
          </transition>
        </v-col>
        <v-col cols="5">
        <span id="nr-required-activator"
              class="normal-link"
              style="margin-left: auto"
              @click="activateNRRModal()">Check to see if you need to file a a name request</span>
        </v-col>
      </v-row>
    </v-row>
    <v-tooltip v-model="showToolTip"
               fixed
               bottom
               :position-x="toolTipX"
               :position-y="toolTipY">
      <p class="py-0 my-0">Check this box if you are...</p>
      <ul>
        <li>Incorporating under your own name (eg. DR. JOE SMITH INC.)</li>
        <li>The name contains one or more names. (eg. BLAKE, CHAN & DOUGLAS INC.)</li>
        <li>The name contains one or more names. (eg. FRANKLIN INC.)</li>
      </ul>
    </v-tooltip>
  </v-container>
</template>

<script lang="ts">
import NameInput from './name-input'
import newReqModule from '../../store/new-request-module'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { LocationT } from '@/models'

let timer: any

@Component({
  components: { NameInput }
})
export default class Search extends Vue {
  hoveringNow = false
  showToolTip = false
  toolTipX = 0
  toolTipY = 0

  @Watch('location')
  handleLocation (newVal, oldVal) {
    if (newVal === 'INFO') {
      let type = this.entityType
      newReqModule.mutateLocationInfoModalVisible(true)
      this.$nextTick(function () {
        this.location = oldVal
        this.entityType = type
      })
    }
  }

  @Watch('entityType')
  uncheckBox (newVal) {
    if (newVal !== 'CR') {
      this.isPersonsName = false
    }
  }

  get displayedComponent () {
    return newReqModule.displayedComponent
  }
  get entityType () {
    return newReqModule.entityType
  }
  set entityType (type: string) {
    newReqModule.mutateEntityType(type)
    if (type === 'INFO') {
      newReqModule.mutatePickEntityModalVisible(true)
    }
  }
  get entityTypeOptions () {
    return newReqModule.entityTypeOptions
  }
  get errors () {
    return newReqModule.errors
  }
  get inputCompClass () {
    let errorTypes = ['entityType', 'requestAction', 'location']
    if (errorTypes.some(type => this.errors.includes(type))) {
      return 'mt-n5'
    }
    return 'mt-n2'
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
  get isPersonsName () {
    return newReqModule.isPersonsName
  }
  set isPersonsName (value) {
    newReqModule.mutateisPersonsName(value)
  }
  get nameIsEnglish () {
    return newReqModule.nameIsEnglish
  }
  set nameIsEnglish (value) {
    newReqModule.mutateNameIsEnglish(value)
  }
  get requestAction () {
    return newReqModule.requestAction
  }
  set requestAction (value: string) {
    newReqModule.mutateRequestAction(value)
    if (value === 'INFO') {
      newReqModule.mutatePickRequestTypeModalVisible(true)
    }
  }
  get requestTypeOptions () {
    return newReqModule.requestTypeOptions
  }
  get showNameCheckBox () {
    if (this.location === 'BC' && this.entityType === 'CR') {
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
  handleMouseLeave () {
    this.hoveringNow = false
    this.showToolTip = false
    if (timer && timer.clearTimeout) {
      timer.clearTimeout()
      timer = null
    }
  }
  handleMouseEnter ({ pageX, pageY }) {
    if (timer && timer.clearTimeout) {
      timer.clearTimeout()
      timer = null
    }
    this.hoveringNow = true
    let showToolTip = () => {
      if (this.hoveringNow) {
        this.toolTipX = pageX
        this.toolTipY = pageY + 25
        this.$nextTick(function () {
          this.showToolTip = true
        })
      }
    }
    timer = setTimeout(showToolTip, 250)
  }
}

</script>
