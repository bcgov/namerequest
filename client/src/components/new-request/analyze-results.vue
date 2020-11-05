<template>
  <MainContainer id="analyze-results-container">
    <template v-slot:container-header>
      <v-col cols="auto" class="h4">
        You are searching for a name for a
        {{ entityText === ' BC Corporation' && location.text === ' BC' ? '' : ' ' + location.text }} {{ entityText }}
      </v-col>
    </template>
    <template v-slot:content>
      <v-row>
        <v-col cols="12" class="mt-3" @click="clickNameField">
          <quill-editor :contents="contents"
                        :options="config"
                        @change="handleChange($event)"
                        @keydown.native.capture="handleEnterKey"
                        id="name-search-bar"
                        ref="quill" />
          <div style="position: relative; left: 865px; top: -45px; z-index: 1000">
            <v-icon @click.capture.stop="handleSubmit"
                    class="name-search-icon"
                    id="name-input-icon">mdi-magnify</v-icon>
          </div>
        </v-col>
      </v-row>
      <transition name="fade" mode="out-in" >
        <v-row no-gutters :key="issueIndex+'vcol'">
          <v-col>
            <!--"FURTHER ACTION REQUIRED" OR "APPROVABLE" TEXT + ICON-->
            <transition name="fade" mode="out-in" >
              <v-row no-gutters justify="center"
                     class="mt-n4"
                     :key="headerProps.text">
                <v-col cols="auto" :class="headerProps.class" class="h4">
                  <v-icon :class="headerProps.class">
                    {{ headerProps.icon }}
                  </v-icon>
                  {{ headerProps.text }}
                </v-col>
              </v-row>
            </transition>

            <!--ISSUE_TYPE: FURTHER ACTION REQUIRED-->
            <template v-if="issue && issue.issue_type">
              <!--MAIN HEADINGS / INFO: LINE 1 & LINE 2-->
              <transition name="fade" mode="out-in">
                <v-row no-gutters justify="center"
                       v-if="headerProps.showNextLines"
                       :key="headerProps.text">
                  <v-col class="pt-2 pb-4 mt-n1 text-center"
                         cols="12"
                         v-html="issue.line1"
                         v-if="issue.line1" />
                  <v-col class="mt-n3 pb-4 text-center"
                         cols="12"
                         v-html="issue.line2"
                         v-if="issue.line2" />
                </v-row>
                <v-row v-else>
                  <v-col class="pt-2 pb-4 mt-n1 text-center"
                         cols="12">
                    You have fixed all the issues.
                  </v-col>
                </v-row>
              </transition>

              <!--CORP CONFLICT TABLE-->
              <v-row no-gutters justify="center" v-if="conflicts.length > 0" class="mt-n3 pb-5 text-center">
                <v-col cols="auto" >
                  <div v-for="(corp, n) in conflicts" :key="'conflict-' + n">
                    <b>{{ corp.name }}</b><br>
                    <span v-if="conflictDate && conflictId.startsWith('NR ')">
                      <b>Submitted Date:</b> {{ conflictDate + ', ' }}</span>
                    <span v-if="conflictDate && !conflictId.startsWith('NR ')">
                      <b>Incorporation Date:</b> {{ conflictDate + ', ' }}</span>
                    <span v-if="conflictId && !conflictId.startsWith('NR ')">
                      <b>Corporation No.:</b> {{ conflictId }}</span>
                  </div>
                </v-col>
              </v-row>

            <!--GREY BOXES-->
            <v-row class="row colour-p-blue-text no-gutters justify-center">
              <v-col :key="issue.issue_type + '-' + option.header + '-' + optionIndex"
                     cols="auto"
                     v-for="(option, optionIndex) of issue.setup">
                <GreyBox :i="optionIndex"
                         :issueIndex="issueIndex"
                         :option="option"
                         :originalName="originalName" />
              </v-col>
            </v-row>

              <!--SUBMISSION BUTTON-->
              <v-row v-if="issue.show_examination_button || issue.show_reserve_button"
                     justify="center"
                     class="mt-3">
                <v-col cols="auto">
                <ReserveSubmit :id="issue.show_examination_button ? 'reserve-submit-examine' : 'reserve-submit-normal'"
                               :setup="issue.show_examination_button ? 'examine' : ''" />
                </v-col>
              </v-row>

              <!--ERROR MESSAGE / NEXT - PREVIOUS BUTTONS-->
              <v-row v-if="json.issues.length > 1" justify="end" no-gutters>
                <v-col v-if="highlightCheckboxes"
                       class="copy-small text-center">
                  <div class="error-message">
                    You must either tick whichever box applies or take the action prescribed in Option 1.
                  </div>
                </v-col>
                <v-col cols="auto" class="text-right mt-1 mb-7">
                  <v-btn @click="issueIndex--"
                         class="mt-3 mb-n4 rnd-wht-btn"
                         color="#1669bb"
                         id="previous-issue-btn"
                         large
                         outlined
                         v-if="issueIndex > 0">Previous Issue
                  </v-btn>
                  <v-btn :class="nextButtonDisabled ? 'disabled-issue-btn' : 'active-issue-btn'"
                         @click="clickNext"
                         class="mt-3 mb-n4"
                         id="next-issue-btn"
                         large
                         outlined
                         v-if="(json.issues.length - 1) > issueIndex">Next Issue
                  </v-btn>
                </v-col>
              </v-row>
            </template>
            <!--APPROVABLE NAME, NO ISSUES-->
            <template v-else>
              <!--APPROVED TEXT-->
              <v-row no-gutters justify="center">
                <v-col cols="12" class="copy-normal pt-2 pb-4">
                  <v-row justify="center">
                    <v-col cols="auto">
                      Name is available for a
                      {{ entityText === 'BC Corporation' && location.text === 'BC' ? '' : location.text }}
                      {{ ' ' + entityText }}
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" class="text-center">
                      <ReserveSubmit id="reserve-submit-normal" />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </template>
          </v-col>
        </v-row>
      </transition>
      <!--TITLE, START OVER, SEARCH FIELD-->
    </template>
  </MainContainer>
</template>

<script lang="ts">
import GreyBox from '@/components/new-request/grey-box.vue'
import MainContainer from '@/components/new-request/main-container.vue'
import Moment from 'moment'
import newReqModule from '@/store/new-request-module'
import ReserveSubmit from '@/components/new-request/submit-request/reserve-submit.vue'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { IssueI, QuillOpsI, SelectionI } from '@/models'
import { quillEditor } from 'vue-quill-editor'
import { removeExcessSpaces } from '@/plugins/utilities'

@Component({
  components: { GreyBox, MainContainer, quillEditor, ReserveSubmit }
})
export default class AnalyzeResults extends Vue {
  config = {
    modules: {
      toolbar: false
    },
    placeholder: '',
    scrollingContainer: false
  }
  contents: string = ''
  highlightCheckboxes: boolean = false
  issueIndex: number = 0
  originalName: string | null = null
  originalOps = []

  created () {
    this.originalName = newReqModule.name
  }
  mounted () {
    newReqModule.mutateDesignationIsFixed(false)
    this.$root.$on('updatecontents', (name) => { this.updateContents(name) })
    this.$root.$on('show-original-name', () => { this.name = this.originalName })
    document.addEventListener('keydown', this.handleEnterKey)
    this.$nextTick(function () {
      this.quill.setContents([])
      let ops: QuillOpsI[] = this.getBaseNameOps()
      if (!this.hasNameActions) {
        this.quill.setContents(ops)
        this.originalOps = ops
        return
      }
      let { length } = this.chunkedName
      this.nameActions.forEach(action => {
        if (action.index < length) {
          if (action.type === 'brackets') {
            let op: QuillOpsI = { insert: ` [${action.message}]`, attributes: { color: 'red' } }
            if (action.position === 'start') {
              ops.splice(action.index, 0, op)
            } else if (action.position === 'end') {
              ops.splice(action.index + 1, 0, op)
            }
          }
          if (action.type === 'highlight') {
            ops[action.index] = { ...ops[action.index], attributes: { color: 'red' } }
          }
          if (action.type === 'strike') {
            ops[action.index] = { ...ops[action.index], attributes: { color: 'red', strike: true } }
          }
        }
      })
      this.quill.setContents(ops)
      this.originalOps = ops
    })
  }
  beforeDestroy () {
    document.removeEventListener('keydown', this.handleEnterKey)
  }

  @Watch('issueIndex')
  resetShowActualInput (newVal, oldVal) {
    if (newVal !== oldVal) {
      this.showActualInput = false
    }
    if (newVal === this.issueLength - 1) {
      let keys = Object.keys(this.requestExaminationOrProvideConsent[newVal])
      keys.forEach(key => {
        newReqModule.mutateRequestExaminationOrProvideConsent({
          value: false,
          type: key,
          index: newVal
        })
      })
    }
  }

  get changesInBaseName () {
    return newReqModule.changesInBaseName
  }
  get chunkedName () {
    return this.name.split(' ')
  }
  get conflictDate () {
    if (Array.isArray(this.issue.conflicts) && this.issue.conflicts.length >= 1) {
      if (this.issue.conflicts[0].source === 'corp') {
        return Moment(this.issue.conflicts[0].start_date).utc().local().format('MMMM Do YYYY')
      }
    }
    return null
  }
  get conflictId () {
    if (Array.isArray(this.issue.conflicts) && this.issue.conflicts.length >= 1) {
      return this.issue.conflicts[0].id
    }
    return null
  }
  get conflicts () {
    if (Array.isArray((this.issue as IssueI).conflicts)) {
      return (this.issue as IssueI).conflicts
    }
    return []
  }
  get designationIsFixed () {
    if (this.json.issues.every(issue => !newReqModule.designationIssueTypes.includes(issue.issue_type))) {
      if (this.isLastIndex) {
        return true
      }
    }
    return newReqModule.designationIsFixed
  }
  get enableNextForAssumedName () {
    if (this.issue && ['corp_conflict', 'queue_conflict'].includes(this.issue.issue_type)) {
      return (this.issue.setup[0].type === 'assumed_name' && !this.isLastIndex)
    }
    return false
  }
  get entity_type_cd () {
    return newReqModule.entity_type_cd
  }
  get entityText () {
    return newReqModule.entityTextFromValue
  }
  get examinationOrConsentCompleted () {
    let types = ['send_to_examiner', 'obtain_consent', 'conflict_self_consent']

    if (!this.json.issues.some(issue => issue.setup.some(set => types.includes(set.type)))) return true

    let result = true
    let index = 0

    for (let issue of this.json.issues) {
      for (let set of issue.setup) {
        if (types.includes(set.type)) {
          if (types.every(type => !this.requestExaminationOrProvideConsent[index][type])) {
            result = false
          }
        }
      }
      index++
    }
    return result
  }
  get hasNameActions () {
    if (this.issue && this.issue.name_actions && Array.isArray(this.issue.name_actions)) {
      if (this.issue.name_actions.length > 0) {
        return true
      }
    }
    return false
  }
  get headerProps () {
    if (this.json.status === 'Available') {
      return {
        class: 'approved',
        icon: 'mdi-check-circle',
        text: 'Name Available',
        showNextLines: true
      }
    }
    let { length } = this.json.issues
    if (this.isLastIndex && this.issue.issue_type !== 'word_to_avoid') {
      if (!this.changesInBaseName && this.designationIsFixed && this.examinationOrConsentCompleted) {
        return {
          class: 'approved',
          icon: 'mdi-check-circle',
          text: 'You May Proceed',
          showNextLines: false
        }
      }
    }
    return {
      class: 'action',
      icon: 'mdi-star-circle',
      text: 'Further Action Required',
      showNextLines: true
    }
  }
  get isApproved () {
    return (this.json.status === 'Available')
  }
  get isLastIndex () {
    return (this.issueIndex === this.issueLength - 1)
  }
  get issue () {
    if (Array.isArray(this.json.issues)) {
      return this.json.issues[this.issueIndex]
    }
    return {}
  }
  get issueLength () {
    if (Array.isArray(this.json.issues)) {
      return this.json.issues.length
    }
    return 1
  }
  get json () {
    return newReqModule.analysisJSON
  }
  get location () {
    let value = newReqModule.location
    let options = newReqModule.locationOptions
    return options.find((opt: any) => opt.value === value)
  }
  get name () {
    return newReqModule.name
  }
  get nameActions () {
    if ((this.issue as IssueI) && (this.issue as IssueI).name_actions) {
      return (this.issue as IssueI).name_actions
    }
    return null
  }
  get nextButtonDisabled () {
    if (this.enableNextForAssumedName) {
      return false
    }
    if (['designation_misplaced', 'end_designation_more_than_once'].includes(this.issue.issue_type)) {
      if (newReqModule.designationIsFixed && this.issueIndex < this.json.issues.length) {
        return false
      }
    }
    for (let type of ['obtain_consent', 'conflict_self_consent', 'send_to_examiner']) {
      if (this.requestExaminationOrProvideConsent[this.issueIndex][type]) {
        return false
      }
    }
    return true
  }
  get quill (): any {
    return (this.$refs as any).quill.quill
  }
  get requestExaminationOrProvideConsent () {
    return newReqModule.requestExaminationOrProvideConsent
  }
  get showActualInput () {
    return newReqModule.showActualInput
  }
  get word () {
    if (Array.isArray(this.issue.name_actions) && this.issue.name_actions[0]) {
      return this.issue.name_actions[0].word.toUpperCase()
    }
    return ''
  }
  set name (name: string) {
    newReqModule.mutateName(name)
  }
  set showActualInput (value) {
    newReqModule.mutateShowActualInput(value)
  }

  cancelAnalyzeName () {
    newReqModule.cancelAnalyzeName('Tabs')
  }
  clickNameField () {
    if (!this.showActualInput) {
      this.showActualInput = true
      if (this.issue && this.issue.issue_type) {
        let selection: SelectionI = this.quill.getSelection()
        let inserts = this.originalOps.map(op => op.insert)
        let indexMap = {}
        let unmappedIndex = 0
        let mappedIndex = 0
        if (!inserts.some(insert => insert.match(/\[.+\]/))) {
          let ops = this.getBaseNameOps()
          this.quill.setContents(ops)
          this.quill.setSelection(selection)
          return
        }
        inserts.forEach(insert => {
          let { length } = insert
          // checking for brackets-type name_actions in the displayed name.  brackets-type name_actions disappear when
          // the user clicks the text-field so if the text field is clicked somewhere after the message, the carat will
          // be inserted at that index but the length of the text-field contents will change.  if there are such
          // messages, map the clicked carat index to the final carat index and insert the carat at the final index
          if (!insert.match(/\[.+\]/)) {
            for (let n = 0; n < length; n++) {
              indexMap[unmappedIndex + n] = mappedIndex + n
            }
            mappedIndex = mappedIndex + length
            unmappedIndex = unmappedIndex + length
          } else {
            for (let n = 0; n < length; n++) {
              indexMap[unmappedIndex + n] = mappedIndex
            }
            unmappedIndex = unmappedIndex + length
          }
        })
        let lastIndex = Object.keys(indexMap).length
        indexMap[lastIndex] = indexMap[lastIndex - 1] + 1
        let ops = this.getBaseNameOps()
        this.quill.setContents(ops)
        let { index } = selection
        selection.index = indexMap[index]
        this.quill.setSelection(selection)
      }
    }
  }
  clickNext () {
    let reset = () => {
      this.highlightCheckboxes = false
    }
    if (!this.nextButtonDisabled) {
      this.issueIndex++
      return
    }
    if (this.nextButtonDisabled) {
      this.highlightCheckboxes = true
      // reset () => highlightedCheckboxes = true
      setTimeout(() => { reset() }, 4000)
    }
  }
  getBaseNameOps () {
    let nameWords = this.originalName.split(' ')
    return nameWords.map((word, i) => (
      { insert: (i > 0) ? (' ' + word) : (word) }
    ))
  }
  handleChange ({ html, text }) {
    // prevents quill from adding a newline to what is supposed to be a single-line input field
    text = text.replace('\n', '')
    this.name = text
    if (html.includes('</p><p>')) {
      html = html.replace('</p><p>', '')
    }
    this.contents = html
  }
  handleEnterKey (event) {
    if (this.isApproved) {
      event.preventDefault()
      this.quill.setText(this.originalName)
      return
    }
    if (event.key === 'Enter') {
      event.stopPropagation()
      event.stopImmediatePropagation()
      event.preventDefault()
      this.name = this.quill.getText()
      let Action = this.nameActions.find(action => action.type === 'brackets')
      if (Action && Action.message) {
        let replace = '[' + Action.message + ']'
        this.name = removeExcessSpaces(this.name.replace(replace, ''))
      }
      newReqModule.startAnalyzeName()
    }
  }
  handleSubmit (event: Event) {
    event.preventDefault()
    this.name = this.quill.getText()
    newReqModule.startAnalyzeName()
  }
  updateContents (text: string) {
    try {
      (this.quill as any).setContents([
        { insert: text }
      ])
    } catch {
      return
    }
  }
}

</script>

<style scoped lang="sass">
#name-search-bar
  margin: -20px 0 20px 0
  max-height: 40px
  min-height: 40px
.action
  color: $error !important
.approved
  color: $approved !important
.error-message
  color: red
  margin-left: 20px
  margin-top: 15px
.modal-activator
  background-color: unset !important
  color: $link !important
  cursor: pointer !important
  letter-spacing: unset !important
  text-decoration: underline
  text-transform: none !important
.strike
  text-decoration-line: line-through

</style>
