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
               v-if="designationIsFixed && designationTypes"
               cols="12">
          No additional issues were identified with your name.  You may proceed.
        </v-col>
        <v-col class="small-copy pale-blue-text pt-0"
               v-else-if="changesInBaseName && i === 0"
               cols="12">
          You have altered the text of your name.  You must either change it back or click the magnifying glass
          to initiate analysis on the new name.
        </v-col>
        <v-col class="small-copy pale-blue-text pt-0"
               v-else
               cols="12">
          <p v-if="option.line1" class="ma-0 pa-0" v-html="option.line1" />
          <p v-if="option.line2" class="ma-0 pa-0 pt-2" v-html="option.line2" />
        </v-col>

        <!-- NAME/DESIGNATION-MANIPULATING OPTION BOXES -->
        <template v-if="designationTypes">
          <transition name="fade"
                      mode="out-in">
            <v-col v-if="!designationIsFixed && !changesInBaseName && i === 0"
                   class="text-center"
                   key="designation-error-col">
              <template v-if="option.type !== 'change designation at the end'">
                <div class="designation-buttons">
                  <button tag="div"
                          :key="'designation-'+d"
                          :id="'designation-'+d"
                          @click="changeDesignation(des)"
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
            <v-col v-if="designationIsFixed && i === 0" key="designation-fixed-col" class="text-center">
              <ReserveSubmit id="reserve-submit-button"
                             style="display: inline"
                             :setup="reserveSubmitConfig" />
            </v-col>
          </transition>
        </template>

        <!-- CHANGE_ENTITY_TYPE OPTION BOX -->
        <template v-if="option.type === 'change_entity_type'">
           <v-col class="text-center mt-4">
            <v-btn @click="startAgain()">Restart and Change Type</v-btn>
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
import allDesignations from '@/store/list-data/designations'
import newReqModule from '@/store/new-request-module'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { IssueI, OptionI } from '@/models'
import ReserveSubmit from '@/components/new-request/submit-request/reserve-submit'

@Component({
  components: { ReserveSubmit }
})
export default class GreyBox extends Vue {
  @Prop(Number) i: number
  @Prop(Number) issueIndex: number
  @Prop(Object) option: OptionI
  @Prop(String) originalName: string

  showError: boolean = false
  clickedDesignation: string = ''
  types = ['send_to_examiner', 'obtain_consent', 'conflict_self_consent']
  showLastStepButtons = {
    conflict_self_consent: false,
    obtain_consent: false,
    send_to_examiner: false
  }

  mounted () {
    this.$root.$on('start-search-again', () => {
      Object.keys(this.showLastStepButtons).forEach(key => {
        this.showLastStepButtons[key] = false
      })
    })
  }

  get boxIsChecked () {
    let { type } = this.option
    return this.requestExaminationOrProvideConsent[this.issueIndex][type]
  }
  get changesInBaseName () {
    if (this.name === this.originalName) {
      return false
    }
    let { end, words } = allDesignations[this.entityType]

    if (!end) {
      let chunkedName: string
      if (this.issueType === 'designation_non_existent') {
        chunkedName = this.name.split(' ')
      } else if (this.issueType === 'designation_mismatch') {
        let original = this.extractInnerDesignation(this.name, this.word)
        chunkedName = original.split(' ')
      } else {
        let original = this.extractInnerDesignation(this.name)
        chunkedName = original.split(' ')
      }
      for (let chunk of chunkedName) {
        if (!this.originalName.includes(chunk)) {
          return true
        }
      }
      return false
    }
    if (this.issueType === 'designation_non_existent') {
      if (!this.name.startsWith(this.originalName)) {
        return true
      }
      return false
    } else if (this.issueType === 'designation_mismatch') {
      let original = this.extractInnerDesignation(this.originalName, this.word)
      if (!this.name.startsWith(original)) {
        return true
      }
      return false
    }
    let original = this.extractInnerDesignation(this.originalName)
    if (!this.name.startsWith(original)) {
      return true
    }
    return false
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
  get designations () {
    if (newReqModule.analysisJSON && Array.isArray(newReqModule.analysisJSON.issues)) {
      let designationIssue = newReqModule.analysisJSON.issues.find(issue => issue.designations)
      if (designationIssue) {
        return designationIssue.designations.map(des => des.toUpperCase())
      }
    }
    return null
  }
  get designationIsFixed () {
    if (!this.changesInBaseName) {
      let designations
      if (this.designations && Array.isArray(this.designations) && this.designations.length > 0) {
        designations = this.designations
      } else {
        designations = allDesignations[this.entityType].words
      }
      designations = designations.map(des => des.toUpperCase())
      if (allDesignations[this.entityType].end) {
        for (let designation of designations) {
          if (this.name.endsWith(designation)) {
            return true
          }
        }
        return false
      }
      for (let designation of designations) {
        if (this.name.includes(designation)) {
          return true
        }
      }
    }
    return false
  }
  get designationTypes () {
    let designationIssueTypes = [
      'designation_non_existent',
      'designation_mismatch',
      'designation_misplaced'
    ]
    if (designationIssueTypes.includes(this.issueType)) {
      return true
    }
    return false
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
  get name () {
    return newReqModule.name
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
  set name (name) {
    newReqModule.mutateName(name)
  }

  changeDesignation (designation) {
    this.clickedDesignation = designation
    newReqModule.mutateShowActualInput(true)
    designation = designation.toUpperCase()
    if (this.issueType === 'designation_non_existent') {
      this.name = this.originalName + ' ' + designation
      return
    }
    this.name = this.originalName.replace(this.word, designation)
    if (allDesignations[this.entityType].end) {
      if (!this.name.endsWith(designation)) {
        let chunked = this.name.split(' ')
        chunked.splice(chunked.indexOf(designation), 1)
        this.name = chunked.join(' ') + ' ' + designation
        let { word } = this.issue.name_actions.find(action => action.word)
        word = word.toUpperCase()
        this.originalName = chunked.join(' ') + ' ' + word
      }
    }
  }

  extractInnerDesignation (name, designation = null) {
    let { words } = allDesignations[this.entityType]
    let index, length
    if (!designation) {
      for (let word of words) {
        let pattern
        if (word.includes('.')) {
          word = word.replace('.', '\\.')
          pattern = '(^|\\s)' + word
        } else {
          pattern = '(^|\\s)' + word + '(\\b)'
        }
        let match = name.match(new RegExp(pattern))
        if (match) {
          index = match.index
          length = match[0].length
          break
        }
      }
    } else if (designation) {
      let pattern
      if (designation.includes('.')) {
        designation = designation.replace('.', '\\.')
        pattern = '(^|\\s)' + designation
      } else {
        pattern = '(^|\\s)' + designation + '(\\b)'
      }
      let match = name.match(new RegExp(pattern))
      if (match) {
        index = match.index
        length = match[0].length
      }
    }
    if (!index) {
      return null
    }
    return name.substring(0, index) + name.substring(index + length, name.length)
  }
  moveDesignation () {
    newReqModule.mutateShowActualInput(true)
    let baseName = this.extractInnerDesignation(this.originalName, this.word)
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
}
</script>

<style scoped lang="sass">

</style>
