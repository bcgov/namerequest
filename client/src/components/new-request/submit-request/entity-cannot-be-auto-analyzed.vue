<template>
    <v-container fluid class="paz-0 ma-0">
      <v-row class="text-center">
        <v-col cols="12" class="h5 text-center mt-n6">
          Further Information
        </v-col>
        <v-col cols="12"
               class="text-center mt-n4"
               v-if="entityTypeNotAnalyzed">
          Name Requests for the <b>{{ entityText }}</b> entity type cannot be reserved immediately.
        </v-col>
        <v-col cols="12"
               class="text-center mt-n4"
               v-else>
          Name Requests that are personal name(s) cannot be reserved immediately.
        </v-col>
          <v-col v-for="(box, i) in boxes" :key="'box-'+i">
            <v-container class="small-copy text-left" :class="box.class">
              <v-row align-content="space-between" style="height: 100%">
                <v-col class="h5 py-0"><v-icon class="pr-2 pale-blue-text">info</v-icon>
                  {{ box.title }}</v-col>
                <v-col cols="12">
                  {{ box.text }}
                </v-col>
                 <v-col class="text-center">
                  <v-btn x-large
                         id="submit-continue-btn"
                         v-if="box.button === 'examine'"
                         @click="showNextTab">Send For Examination</v-btn>
                  <v-btn x-large
                         id="submit-continue-btn"
                         v-if="box.button === 'restart'"
                         @click="startAgain()">Start Search Over</v-btn>
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

@Component({})
export default class EntityCannotBeAutoAnalyzed extends Vue {
  get doNotAnalyzeEntities () {
    return newReqModule.doNotAnalyzeEntities
  }
  get entityText () {
    return newReqModule.entityTextFromValue
  }
  get entityType () {
    return newReqModule.entityType
  }
  get isPersonsName () {
    return newReqModule.isPersonsName
  }
  get entityTypeNotAnalyzed () {
    if (this.doNotAnalyzeEntities.includes(this.entityType)) {
      return true
    }
    return false
  }
  get boxes () {
    let output = []
    let nameExplanation = {
      title: 'Helpful Hint',
      class: 'helpful-hint',
      button: 'examine',
      text: 'Click the button below to submit your request.  Please check the wait times listed at the top of' +
      ' the screen.  Rush services are also available.'
    }
    let entityExplanation = {
      title: 'Option 2',
      class: 'square-card-x2',
      button: 'restart',
      text: 'You can choose a different entity type and search again.  Please consult with a lawyer' +
      '/accounting professional if you are unsure about the most appropriate structure for your situation.'
    }
    if (this.isPersonsName) {
      output.push(nameExplanation)
    }
    if (this.entityTypeNotAnalyzed) {
      let edits = { title: 'Option 1', class: 'square-card-x2' }
      output.push({ ...nameExplanation, ...edits }, entityExplanation)
    }
    return output
  }
  showNextTab () {
    newReqModule.mutateSubmissionTabComponent('SendForExamination')
  }
  startAgain () {
    this.$root.$emit('start-search-again')
    newReqModule.startAgain()
  }
}
</script>

<style lang="sass">

</style>
