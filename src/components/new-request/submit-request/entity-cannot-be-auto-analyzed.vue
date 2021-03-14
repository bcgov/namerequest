<template>
  <v-container fluid class="pa-0">
    <v-row v-if="nameIsSlashed">
      <NameInput />
    </v-row>
    <v-row class="text-center">
      <v-col cols="12" class="h5 text-center py-0 mt-3">Further Information</v-col>
    </v-row>
    <v-row class="text-center">
      <v-col cols="12"
             class="text-center pb-0"
             v-html="title" />
      <v-col v-for="(box, i) in boxes" :key="'box-'+i" class="pb-0">
        <v-container class="copy-small text-left" :class="box.class">
          <v-row align-content="space-between" style="height: 100%">
            <v-col class="h5 py-0">{{ box.title }}</v-col>
            <v-col cols="12" v-html="box.text" />
             <v-col class="text-center">
              <v-btn x-large
                     id="examine-btn"
                     v-if="box.button === 'examine'"
                     @click="showNextTab">Send For Examination</v-btn>
              <v-btn x-large
                     id="restart-btn"
                     v-if="box.button === 'restart'"
                     @click="localCancelAnalyzeName()">Start Search Over</v-btn>
               <v-btn x-large
                      id="english-btn"
                      v-if="box.button === 'english'"
                      @click="newSearch()">Search Again</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
 </v-container>
</template>

<script lang="ts">
// import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { RequestActionsI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import NameInput from '@/components/new-request/name-input.vue'

@Component({
  components: { NameInput }
})
export default class EntityCannotBeAutoAnalyzed extends Vue {
  englishOnlyName = ''

  // Global getters
  @Getter getNameAnalysisTimeout!: boolean
  @Getter getDoNotAnalyzeEntities!: string[]
  @Getter getEntityTextFromValue!: string
  @Getter getEntityTypeCd!: string
  @Getter getIsPersonsName!: boolean
  @Getter getName!: string
  @Getter getNameIsEnglish!: boolean
  @Getter getNameIsSlashed!: boolean
  @Getter getRequestActionCd!: string
  @Getter getRequestTypeOptions!: RequestActionsI[]

  // Global actions
  @Action cancelAnalyzeName!: ActionBindingIF
  @Action startAnalyzeName!: ActionBindingIF
  @Action setName!: ActionBindingIF
  @Action setSubmissionTabComponent!: ActionBindingIF

  mounted () {
    if (this.nameIsSlashed) {
      this.englishOnlyName = this.name.split('/')[0]
    }
  }

  get nameAnalysisTimedOut () {
    return this.getNameAnalysisTimeout
  }

  get boxes () {
    let timeoutExplanation1 = {
      title: 'Option 1',
      class: 'square-card-x2',
      button: 'examine',
      text:
        'This name cannot be auto-analyzed and will need to be reviewed by a name examiner.' +
        ' Please check the wait times listed at the top of' +
        ' the screen.  Rush services are also available.'
    }
    let timeoutExplanation2 = {
      title: 'Option 2',
      class: 'square-card-x2',
      button: 'restart',
      text: 'You can enter a different name and try your search again.  Click the button below to cancel this request' +
        'and start again.'
    }
    let slashEditExplanation = {
      title: 'Option 1',
      class: 'square-card-x2',
      button: 'english',
      text: 'You can remove the slash "/" and all words that come after it and try your search again. To' +
        ` automatically initiate a search for <b>${this.englishOnlyName}</b>, click the button below.`
    }
    let slashExamineExplanation = {
      title: 'Option 2',
      class: 'square-card-x2',
      button: 'examine',
      text: 'You can choose to submit this name to examination. Please check wait times at the top of the screen.'
    }
    if (this.nameAnalysisTimedOut) {
      return [timeoutExplanation1, timeoutExplanation2]
    }
    if (this.requestActionNotSupported) {
      return false
    }
    if (this.entityTypeNotAnalyzed) {
      let edits = { title: 'Option 1', class: 'square-card-x2' }
      return false
    }
    if (this.nameIsSlashed) {
      return [ slashEditExplanation, slashExamineExplanation ]
    }
    if (this.isPersonsName || !this.nameIsEnglish) {
      return []
    }
    return []
  }
  get doNotAnalyzeEntities () {
    return this.getDoNotAnalyzeEntities
  }
  get entityText () {
    return this.getEntityTextFromValue
  }
  get entity_type_cd () {
    return this.getEntityTypeCd
  }
  get entityTypeNotAnalyzed () {
    if (this.doNotAnalyzeEntities.includes(this.entity_type_cd)) {
      return true
    }
    return false
  }
  get isPersonsName () {
    return this.getIsPersonsName
  }
  get name () {
    return this.getName
  }
  set name (value) {
    this.setName(value)
  }
  get nameIsEnglish () {
    return this.getNameIsEnglish
  }
  get nameIsSlashed () {
    return this.getNameIsSlashed
  }
  get requestActionNotSupported () {
    return !(['NEW', 'DBA', 'CHG'].includes(this.getRequestActionCd))
  }
  get requestActionText (): string {
    if (this.getRequestActionCd && this.getRequestTypeOptions.find(req => req.value === this.getRequestActionCd)) {
      return this.getRequestTypeOptions.find(req => req.value === this.getRequestActionCd)?.text
    }
    return null
  }

  get title () {
    if (this.nameAnalysisTimedOut) {
      return 'Your name took too long to analyze'
    }
    if (this.requestActionNotSupported) {
      return `Name requests to <b>${this.requestActionText}</b> cannot be auto-analyzed and must be sent<br> to
      examination for review`
    }
    if (this.entityTypeNotAnalyzed) {
      return `Name Requests for the <b>${this.entityText}</b> entity type cannot be reserved immediately.`
    }
    if (this.nameIsSlashed) {
      return 'The slash "/" followed by a number of words implies the name is an English name followed by a French' +
        ' (or other language) name.  Names of this type must be sent to examination.'
    }
    let output = ''
    if (this.isPersonsName) {
      output = '<p class="ma-0 pa-0">Name Requests that are personal name(s) cannot be reserved immediately.</p>'
    }
    if (!this.nameIsEnglish) {
      output = output +
        '<p>Name Requests that contain words that are not English cannot be reserved immediately.<p>'
    }
    return output
  }
  async newSearch () {
    this.name = this.englishOnlyName
    await this.startAnalyzeName(null)
  }
  showNextTab () {
    this.setSubmissionTabComponent('NamesCapture')
  }
  localCancelAnalyzeName () {
    this.$root.$emit('start-search-again')
    this.cancelAnalyzeName('Tabs')
  }
}
</script>
