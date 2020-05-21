<template>
  <v-container :class="optionClasses(i)"
               class="grey-box-class py-2 px-3"
               :key="option.type + '-' + i  + '-container'">
    <v-col class="bold-text mt-n3" cols="12">
      <div style="display: flex; width: 100%; justify-content: flex-start">
        <div class="h5">
          <v-icon class="pr-2 pale-blue-text">info</v-icon>
          {{ option.header }}
        </div>
      </div>
    </v-col>
    <transition :name="i === 0 ? 'fade' : '' " mode="out-in">
      <v-row class="small-copy pale-blue-text"
             align-content="start"
             :key="changesInBaseName+designationIsFixed+'key'+i">
        <!-- Header, Line 1 and Line 2-->

        <v-col class="small-copy pale-blue-text pt-0"
               v-if="designationIsFixed && isDesignationIssueType && i === 0"
               cols="12">
          No additional issues were identified with your name.  You may proceed.
        </v-col>
        <v-col class="small-copy pale-blue-text pt-0"
               v-else-if="changesInBaseName && isDesignationIssueType && i === 0"
               cols="12">
          You have altered the base text of your name.  You must
          either change it back or click the magnifying glass to run a new search for your edited name.
        </v-col>
        <v-col class="small-copy pale-blue-text pt-0"
               v-else
               cols="12">
          <p v-if="option.line1" class="ma-0 pa-0" v-html="option.line1" />
          <p v-if="option.line2" class="ma-0 pa-0 pt-2" v-html="option.line2" />
        </v-col>

        <!-- NAME/DESIGNATION-MANIPULATING OPTION BOXES -->
        <template v-if="isDesignationIssueType">
          <transition name="fade"
                      mode="out-in">
            <v-col v-if="!designationIsFixed && !changesInBaseName && i === 0"
                   class="text-center"
                   key="designation-error-col">
              <template v-if="Array.isArray(designations) && designations.length > 0">
                <div class="designation-buttons">
                  <button tag="div"
                          :key="'designation-'+d"
                          :id="'designation-'+d"
                          @click.once.prevent="changeDesignation(des)"
                          class="small-link ma-0 pa-0 px-1"
                          v-for="(des, d) in designations">
                    {{ des }}{{ (d !== issue.designations.length - 1) ? ',' : '' }}
                  </button>
                </div>
              </template>
              <template v-if="option.type === 'change designation at the end'">
                <v-btn @click="moveDesignation">Move Designation</v-btn>
              </template>
            </v-col>
            <v-col v-if="designationIsFixed && i === 0 && issueIndex + 1 === issueLength"
                   key="designation-fixed-col" class="text-center">
              <ReserveSubmit id="reserve-submit-button"
                             style="display: inline"
                             :setup="reserveSubmitConfig" />
            </v-col>
          </transition>
        </template>

        <!-- CHANGE_ENTITY_TYPE OPTION BOX -->
        <template v-if="option.type === 'change_entity_type'">
           <v-col class="text-center mt-4">
            <v-btn @click="cancelAnalyzeName()">Restart and Change Type</v-btn>
          </v-col>
        </template>

        <!-- ALL OTHER TYPES OF OPTION BOXES -->
        <template v-else>
          <v-col :id="option.type + '-button-checkbox-col'"
                 v-if="i !== 0"
                 class="pa-0 grey-box-checkbox-button text-center">
            <transition name="fade" mode="out-in" >
              <v-checkbox :error="showError"
                          :key="option.type+'-checkbox'"
                          :label="checkBoxLabel"
                          class="ma-0 pa-0"
                          id="conflict-self-consent-checkbox"
                          v-if="showCheckBoxOrButton === 'checkbox'"
                          v-model="boxIsChecked" />
              <ReserveSubmit :key="option.type+'-reserve-submit'"
                             :setup="reserveSubmitConfig"
                             id="reserve-submit-button"
                             style="display: inline"
                             v-if="showCheckBoxOrButton === 'button'" />
            </transition>
          </v-col>
        </template>
      </v-row>
    </transition>
  </v-container>
</template>

<script lang="ts">
import allDesignations, { allDesignationsList } from '@/store/list-data/designations'
import newReqModule from '@/store/new-request-module'
import ReserveSubmit from '@/components/new-request/submit-request/reserve-submit.vue'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { IssueI, OptionI } from '@/models'
import { matchWord, removeExcessSpaces, replaceWord } from '@/plugins/utilities'

@Component({
  components: { ReserveSubmit }
})
export default class GreyBox extends Vue {
  @Prop(Number) i: number
  @Prop(Number) issueIndex: number
  @Prop(Object) option: OptionI
  @Prop(String) originalName: string
  @Watch('designationIsFixed')
  updateStore (newVal) {
    newReqModule.mutateDesignationIsFixed(newVal)
  }

  mounted () {
    this.$root.$on('start-search-again', () => {
      Object.keys(this.showLastStepButtons).forEach(key => {
        this.showLastStepButtons[key] = false
      })
    })
    let { originalName } = this
    if (this.issueType === 'designation_mismatch' || this.issueType === 'designation_misplaced') {
      this.originalNameBase = this.removeMismatchedDesignations(originalName)
      return
    }
    if (this.issueType === 'end_designation_more_than_once') {
      for (let word of this.nameActionWords) {
        originalName = replaceWord(originalName, word)
      }
      this.originalNameBase = originalName
      return
    }
    for (let word of allDesignationsList) {
      originalName = replaceWord(originalName, word)
    }
    this.originalNameBase = originalName
  }

  clickedDesignation: string = ''
  nameObj = {
    0: '',
    1: '',
    2: ''
  }
  originalNameBase: string = ''
  showError: boolean = false
  showLastStepButtons = {
    conflict_self_consent: false,
    obtain_consent: false,
    send_to_examiner: false
  }
  types = ['send_to_examiner', 'obtain_consent', 'conflict_self_consent']

  get allDesignationsStripped () {
    return this.stripAllDesignations(this.originalName)
  }
  get boxIsChecked () {
    let { type } = this.option
    return this.requestExaminationOrProvideConsent[this.issueIndex][type]
  }
  set boxIsChecked (value) {
    for (let type of this.types) {
      newReqModule.mutateRequestExaminationOrProvideConsent({
        value: false,
        type,
        index: this.issueIndex
      })
    }
    if (this.issueIndex === this.issueLength - 1) {
      for (let type of this.types) {
        this.showLastStepButtons[type] = false
      }
      this.showLastStepButtons[this.option.type] = true
    }
    newReqModule.mutateRequestExaminationOrProvideConsent({
      value,
      type: this.option.type,
      index: this.issueIndex
    })
  }
  get changesInBaseName () {
    if (this.name === this.originalName) {
      return false
    }
    switch (this.issueType) {
      case 'designation_non_existent': {
        if (this.name.length === this.originalName.length) {
          if (this.name.includes(this.originalName)) {
            return false
          }
          return true
        }
        if (this.name.startsWith(this.originalName + ' ')) {
          return false
        }
        return true
      }
      case 'designation_mismatch': {
        let { allDesignationsStripped } = this
        if (this.nameActionWords.length > 0) {
          for (let word of this.nameActionWords) {
            allDesignationsStripped = replaceWord(allDesignationsStripped, word)
          }
        }
        if (this.name.includes(allDesignationsStripped + ' ')) {
          return false
        }
        return true
      }
      case 'end_designation_more_than_once':
      case 'designation_misplaced': {
        let chunkedOriginalNameBase = this.originalNameBase.split(' ')
        let chunkedName = removeExcessSpaces(this.name).split(' ')
        let checkBaseName = () => {
          // check that every word in the original base name is still exactly in the name
          return chunkedOriginalNameBase.every(word => {
            return chunkedName.some(chunk => chunk === word)
          })
        }
        let outcome = !checkBaseName()
        // if all the words are exactly in the nane, we know the words have not been modified and none are missing
        // check length to ensure none are added
        if (this.clickedDesignation) {
          let max: number
          if (Array.isArray(this.designations) && this.designations.length > 0) {
            this.designations.forEach(des => {
              let l = des.split(' ').length
              if (!max || l > max) {
                max = l
              }
            })
          }
          if (chunkedOriginalNameBase && chunkedName) {
            let newMaxLength = chunkedOriginalNameBase.length + max
            if (chunkedName.length < chunkedOriginalNameBase.length || chunkedName.length > newMaxLength) {
              outcome = true
            }
          }
        }
        return outcome
      }
      case '':
      default: {
        if (this.name === this.originalName) {
          return false
        }
        return true
      }
    }
  }
  get checkBoxLabel () {
    switch (this.option.type) {
      case 'send_to_examiner':
        return 'I want to send my name to be examined'
      case 'obtain_consent':
        return 'I will obtain and submit consent'
      case 'conflict_self_consent':
        return 'I have authority over the conflicting name; I will submit written consent'
      default:
        return ''
    }
  }
  get designationIsFixed () {
    if (!this.changesInBaseName) {
      if (this.issueType === 'end_designation_more_than_once') {
        let designations = this.designations.map(des => des.toUpperCase())
        let chosenDesignation = designations.find(des => this.name.includes(' ' + des))
        if (!chosenDesignation) {
          return false
        }
        let otherDesignations = designations.filter(des => des !== chosenDesignation)
        if (otherDesignations.every(des => !this.name.includes(' ' + des))) {
          return true
        }
        return false
      }
      if (this.issueType === 'designation_misplaced') {
        if (this.name.endsWith(' ' + this.word)) {
          return true
        }
        return false
      }
      if (this.issueType === 'designation_mismatch') {
        let end: string
        for (let des of this.designations) {
          if (this.name.endsWith(' ' + des)) {
            end = des
          }
        }
        if (!end) {
          return false
        }
        let { allDesignationsStripped } = this
        if (this.nameActionWords.length > 0) {
          for (let word of this.nameActionWords) {
            allDesignationsStripped = replaceWord(allDesignationsStripped, word)
          }
        }
        if (this.name === allDesignationsStripped + ' ' + end) {
          return true
        }
        return false
      }
      if (this.word && !this.clickedDesignation) {
        if (this.name.includes(' ' + this.word)) {
          return true
        }
        return false
      }
      if (this.issueType === 'designation_non_existent') {
        let designation = this.designations.find(des => this.name.endsWith(des.toUpperCase()))
        if (!designation) {
          return false
        }
        return (this.name === this.originalName + ' ' + designation.toUpperCase())
      }
      let designations
      if (Array.isArray(this.designations) && this.designations.length > 0) {
        designations = this.designations
      } else {
        designations = allDesignations[this.entityType].words
      }
      designations = designations.map(des => des.toUpperCase())
      if (allDesignations[this.entityType].end) {
        for (let designation of designations) {
          if (this.name.endsWith(' ' + designation)) {
            return true
          }
        }
        return false
      }
      for (let designation of designations) {
        if (this.name.includes(' ' + designation)) {
          return true
        }
      }
    }
    return false
  }
  get designations () {
    if (this.issue && this.issue.designations) {
      return this.issue.designations
    }
    return null
  }
  get entityType () {
    return newReqModule.entityType
  }
  get examinationRequested () {
    if (this.issueLength > 1) {
      for (let n of [0, 1, 2]) {
        if (this.requestExaminationOrProvideConsent[n]['send_to_examiner']) {
          return true
        }
      }
    }
    return false
  }
  get isDesignationIssueType () {
    let designationIssueTypes = [
      'designation_non_existent',
      'designation_mismatch',
      'designation_misplaced',
      'end_designation_more_than_once'
    ]
    if (designationIssueTypes.includes(this.issueType)) {
      return true
    }
    return false
  }
  get isMismatchFollowingMisplaced () {
    if (this.issueIndex > 0 &&
        this.issueType === 'designation_mismatch' &&
        newReqModule.analysisJSON.issues[this.issueIndex - 1].issue_type === 'designation_misplaced') {
      return true
    }
    return false
  }
  get issue () {
    return newReqModule.analysisJSON.issues[this.issueIndex]
  }
  get issueLength () {
    if (Array.isArray(newReqModule.analysisJSON.issues)) {
      return newReqModule.analysisJSON.issues.length
    }
    return 1
  }
  get issueType () {
    if (this.issue && this.issue.issue_type) {
      return this.issue.issue_type
    }
    return ''
  }
  get multipleMismatchedDesignations () {
    if (this.issueType === 'designation_mismatch') {
      if (Array.isArray(this.nameActions) && this.nameActions.length > 1) {
        return this.nameActions.map(action => (
          { word: action.word.toUpperCase(), index: action.index }
        ))
      }
    }
    return false
  }
  get name () {
    return newReqModule.name
  }
  set name (name) {
    newReqModule.mutateName(name)
    this.$root.$emit('updatecontents', name)
  }
  get nameActions () {
    if (this.issue && Array.isArray(this.issue.name_actions)) {
      return this.issue.name_actions
    }
    return []
  }
  get nameActionWords () {
    if (Array.isArray(this.nameActions)) {
      return this.nameActions.map(action => action.word.toUpperCase())
    }
    return []
  }
  get requestExaminationOrProvideConsent () {
    return newReqModule.requestExaminationOrProvideConsent
  }
  get reserveSubmitConfig () {
    if (this.issueLength === 1) {
      if (this.option.type === 'send_to_examiner') {
        return 'examine'
      }
      if (['obtain_consent', 'conflict_self_consent'].includes(this.option.type)) {
        return 'consent'
      }
      return ''
    }
    if (this.examinationRequested) {
      return 'examine'
    }
    for (let n of [0, 1, 2]) {
      if (this.requestExaminationOrProvideConsent[n].obtain_consent ||
        this.requestExaminationOrProvideConsent[n].conflict_self_consent) {
        return 'consent'
      }
    }
    return ''
  }
  get showCheckBoxOrButton () {
    let { type } = this.option
    if (this.issueIndex + 1 === this.issueLength) {
      switch (type) {
        case 'send_to_examiner':
          if (this.showLastStepButtons.send_to_examiner) {
            return 'button'
          }
          return 'checkbox'
        case 'obtain_consent':
          if (this.showLastStepButtons.obtain_consent) {
            return 'button'
          }
          return 'checkbox'
        case 'conflict_self_consent':
          if (this.showLastStepButtons.conflict_self_consent) {
            return 'button'
          }
          return 'checkbox'
        default:
          return 'checkbox'
      }
    }
    return 'checkbox'
  }
  get word () {
    if (this.issue && Array.isArray(this.issue.name_actions)) {
      if (this.issue.name_actions[0] && this.issue.name_actions[0].word) {
        return this.issue.name_actions[0].word.toUpperCase()
      }
    }
    if (this.clickedDesignation) {
      return this.clickedDesignation
    }
    return ''
  }

  cancelAnalyzeName () {
    newReqModule.cancelAnalyzeName()
  }
  changeDesignation (designation) {
    newReqModule.mutateShowActualInput(true)
    designation = designation.toUpperCase()
    this.clickedDesignation = designation
    if (this.issueType === 'designation_mismatch') {
      let { allDesignationsStripped } = this
      if (this.nameActionWords.length > 0) {
        for (let word of this.nameActionWords) {
          allDesignationsStripped = replaceWord(allDesignationsStripped, word)
        }
      }
      this.name = allDesignationsStripped + ' ' + designation
      return
    }
    if (this.issueType === 'end_designation_more_than_once') {
      this.name = this.originalNameBase + ' ' + designation
      return
    }
    if (this.issueType === 'designation_non_existent') {
      this.name = this.originalName + ' ' + designation
      return
    }
    if (this.multipleMismatchedDesignations) {
      this.name = this.removeMismatchedDesignations(this.originalName) + ' ' + designation
      return
    }
  }
  extractInnerDesignation (name, designation = null) {
    let { words } = allDesignations[this.entityType]
    let index, length
    if (!designation) {
      for (let word of words) {
        name = replaceWord(name, word)
      }
    } else if (designation) {
      name = replaceWord(name, designation)
    }
    return name
  }
  moveDesignation () {
    newReqModule.mutateShowActualInput(true)
    let baseName: string
    if (this.originalNameBase) {
      baseName = this.originalNameBase
    } else {
      baseName = this.extractInnerDesignation(this.originalName, this.word)
    }
    this.name = baseName + ' ' + this.word
  }
  optionClasses (i) {
    if (this.issue && Array.isArray(this.issue.setup)) {
      switch (this.issue.setup.length) {
        case 1:
          return 'helpful-hint'
        case 2:
          if (i === 1) {
            return 'square-card-x2 ml-3'
          }
          return 'square-card-x2'
        case 3:
          if (i === 1) {
            return 'square-card-x3 mx-3'
          }
          return 'square-card-x3'
        default:
          return ''
      }
    }
    return ''
  }
  removeMismatchedDesignations (name, designation = null) {
    if (designation) {
      return replaceWord(name, designation)
    }
    if (this.nameActionWords.length > 0) {
      for (let word of this.nameActionWords) {
        name = replaceWord(name, word)
      }
      return name
    }
    if (Array.isArray(this.designations)) {
      let index = this.designations.findIndex(des => name.endsWith(' ' + des))
      if (index >= 0) {
        let designation = this.designations[index]
        name = replaceWord(name, designation)
      }
    }
    return name
  }
  stripAllDesignations (name) {
    for (let word of allDesignationsList) {
      name = replaceWord(name, word)
    }
    return name
  }
}
</script>
