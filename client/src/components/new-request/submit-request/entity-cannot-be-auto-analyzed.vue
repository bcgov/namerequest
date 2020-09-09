<template>
    <v-container fluid class="pa-0 ma-0">
      <v-row v-if="nameIsSlashed">
        <NameInput class="mt-n4" />
      </v-row>
      <v-row class="text-center">
        <v-col cols="12" class="h5 text-center mt-n6">
          Further Information
        </v-col>
        <v-col cols="12"
               class="text-center mt-n4"
               v-html="title" />
        <v-col v-for="(box, i) in boxes" :key="'box-'+i">
          <v-container class="copy-small text-left" :class="box.class">
            <v-row align-content="space-between" style="height: 100%">
              <v-col class="h5 py-0"><v-icon class="pr-2 colour-p-blue-text">info</v-icon>
                {{ box.title }}</v-col>
              <v-col cols="12" v-html="box.text" />
               <v-col class="text-center">
                <v-btn x-large
                       id="submit-continue-btn"
                       v-if="box.button === 'examine'"
                       @click="showNextTab">Send For Examination</v-btn>
                <v-btn x-large
                       id="submit-continue-btn"
                       v-if="box.button === 'restart'"
                       @click="cancelAnalyzeName()">Start Search Over</v-btn>
                 <v-btn x-large
                        id="submit-continue-btn"
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
import designations from '@/store/list-data/designations'
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Watch } from 'vue-property-decorator'
import NameInput from '@/components/new-request/name-input.vue'

@Component({
  components: { NameInput }
})
export default class EntityCannotBeAutoAnalyzed extends Vue {
  englishOnlyName: string = ''

  mounted () {
    if (this.nameIsSlashed) {
      this.englishOnlyName = this.name.split('/')[0]
    }
  }
  get boxes () {
    let entityExplanation = {
      title: 'Option 2',
      class: 'square-card-x2',
      button: 'restart',
      text: 'You can choose a different entity type and search again.  Please consult with a lawyer' +
      '/accounting professional if you are unsure about the most appropriate structure for your situation.'
    }
    let nameExplanation = {
      title: 'Helpful Hint',
      class: 'helpful-hint',
      button: 'examine',
      text: 'Click the button below to submit your request.  Please check the wait times listed at the top of' +
      ' the screen.  Rush services are also available.'
    }
    let requestActionExplanation = {
      title: 'Option 1',
      class: 'helpful-hint',
      button: 'examine',
      text: `Currently only requests for New Names, New Tradenames and Name Changes are handled automatically.
        Click the button below to submit your request to examination.  Please check the wait times listed at the top of
        the screen.  Rush services are also available.`
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
    if (this.requestActionNotSupported) {
      return [requestActionExplanation]
    }
    if (this.entityTypeNotAnalyzed) {
      let edits = { title: 'Option 1', class: 'square-card-x2' }
      return [ { ...nameExplanation, ...edits }, entityExplanation ]
    }
    if (this.nameIsSlashed) {
      return [ slashEditExplanation, slashExamineExplanation ]
    }
    if (this.isPersonsName || !this.nameIsEnglish) {
      return [ nameExplanation ]
    }
    return []
  }
  get doNotAnalyzeEntities () {
    return newReqModule.doNotAnalyzeEntities
  }
  get entityText () {
    return newReqModule.entityTextFromValue
  }
  get entity_type_cd () {
    return newReqModule.entity_type_cd
  }
  get entityTypeNotAnalyzed () {
    if (this.doNotAnalyzeEntities.includes(this.entity_type_cd)) {
      return true
    }
    return false
  }
  get isPersonsName () {
    return newReqModule.isPersonsName
  }
  get name () {
    return newReqModule.name
  }
  set name (value) {
    newReqModule.mutateName(value)
  }
  get nameIsEnglish () {
    return newReqModule.nameIsEnglish
  }
  get nameIsSlashed () {
    return newReqModule.nameIsSlashed
  }
  get requestActionNotSupported () {
    return !(['NEW', 'DBA', 'CHG'].includes(newReqModule.request_action_cd))
  }
  get requestActionText () {
    return newReqModule.requestTextFromValue
  }
  get title () {
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
  newSearch () {
    this.name = this.englishOnlyName
    newReqModule.startAnalyzeName()
  }
  showNextTab () {
    newReqModule.mutateSubmissionTabComponent('NamesCapture')
  }
  cancelAnalyzeName () {
    this.$root.$emit('start-search-again')
    newReqModule.cancelAnalyzeName()
  }
}
</script>

<style lang="sass">

</style>
