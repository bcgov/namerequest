<template>
  <MainContainer id="analyze-results-container">
    <template v-slot:container-header>
      <v-col cols="auto" class="h4">
        You are searching for a name for {{ requestAction }}
        {{ entityText === 'BC Corporation' && location.text === 'BC' ? '' : location.text }}
        {{ entityText }}
      </v-col>
    </template>
    <template v-slot:content>
      <v-row>
        <v-col cols="12" class="mt-3" @click="clickNameField">
          <quill-editor ref="quill"
                        id="name-search-bar"
                        :contents="contents"
                        :options="config"
                        @change="handleChange($event)"
                        @keydown.native.capture="handleEnterKey" />
          <div style="position: relative; left: 865px; top: -45px; z-index: 1000">
            <v-icon class="name-search-icon"
                    id="name-input-icon"
                    @click.capture.stop="handleSubmit">search</v-icon>
          </div>
        </v-col>
      </v-row>
      <transition name="fade" mode="out-in" >
        <v-row no-gutters  :key="issueIndex+'vcol'">
          <v-col>
            <!--"FURTHER ACTION REQUIRED" OR "APPROVABLE" TEXT + ICON-->
            <v-row no-gutters justify="center" class="mt-n4">
              <v-col cols="auto" :class="json.status === 'Available' ? 'approved' : 'action' " class="h4">
                <v-icon :class="json.status === 'Available' ? 'approved' : 'action' ">
                  {{ json.status === 'Available' ? 'check_circle' : 'stars' }}
                </v-icon>
                {{ json.header }}
              </v-col>
            </v-row>

            <!--ISSUE_TYPE: FURTHER ACTION REQUIRED-->
            <template v-if="issue && issue.issue_type">
              <!--MAIN HEADINGS / INFO: LINE 1 & LINE 2-->
              <v-row no-gutters justify="center">
                <v-col class="pt-2 pb-4 mt-n1 text-center"
                       cols="12"
                       v-html="issue.line1"
                       v-if="issue.line1" />
                <v-col class="mt-n3 pb-4 text-center"
                       cols="12"
                       v-html="issue.line2"
                       v-if="issue.line2" />
              </v-row>

              <!--CORP CONFLICT TABLE-->
              <v-row no-gutters justify="center" v-if="conflicts.length > 0" class="mt-n7 py-5">
                <v-col cols="auto" >
                  <div v-for="(corp, n) in conflicts" :key="'conflict-' + n">
                      {{ corp.name }}
                  </div>
                </v-col>
              </v-row>

            <!--GREY BOXES-->
            <v-row class="row pale-blue-text no-gutters justify-center">
              <v-col :key="issue.issue_type + '-' + option.header + '-' + optionIndex"
                     cols="auto"
                     v-for="(option, optionIndex) of issue.setup">
                <GreyBox :issueIndex="issueIndex" :i="optionIndex" :option="option" :originalName="originalName" />
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
                       class="small-copy text-center">
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
                <v-col cols="12" class="normal-copy pt-2 pb-4">
                  <v-row justify="center">
                    <v-col cols="auto">
                      Name is available for {{ requestAction }}
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
import ReserveSubmit from '@/components/new-request/submit-request/reserve-submit.vue'
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { IssueI, QuillOpsI, SelectionI } from '@/models'
import { removeExcessSpaces } from '@/plugins/utilities'
import { quillEditor } from 'vue-quill-editor'

@Component({
  components: { GreyBox, MainContainer, ReserveSubmit, quillEditor }
})
export default class AnalyzeResults extends Vue {
  config = {
    modules: {
      toolbar: false
    },
    placeholder: '',
    scrollingContainer: false
  }
  highlightCheckboxes: boolean = false
  issueIndex: number = 0
  contents: string = ''
  originalName: string | null = null
  originalOps = []

  @Watch('issueIndex')
  resetShowActualInput (newVal, oldVal) {
    if (newVal !== oldVal) {
      this.showActualInput = false
    }
  }

  created () {
    this.originalName = newReqModule.name
  }
  mounted () {
    this.$root.$on('updatecontents', this.updateContents)
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

  get chunkedName () {
    return this.name.split(' ')
  }
  get conflicts () {
    if (Array.isArray((this.issue as IssueI).conflicts)) {
      return (this.issue as IssueI).conflicts
    }
    return []
  }
  get entityText () {
    return newReqModule.entityTextFromValue
  }
  get entityType () {
    return newReqModule.entityType
  }
  get hasNameActions () {
    if (this.issue && this.issue.name_actions && Array.isArray(this.issue.name_actions)) {
      if (this.issue.name_actions.length > 0) {
        return true
      }
    }
    return false
  }
  get isApproved () {
    return (this.json.status === 'Available')
  }
  get issue () {
    if (Array.isArray(this.json.issues)) {
      return this.json.issues[this.issueIndex]
    }
    return {}
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
  set name (name: string) {
    newReqModule.mutateName(name)
  }
  get nameActions () {
    if ((this.issue as IssueI) && (this.issue as IssueI).name_actions) {
      return (this.issue as IssueI).name_actions
    }
    return null
  }
  get nextButtonDisabled () {
    if (this.issue.issue_type === 'designation_misplaced') {
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
  get quill (): quillEditor {
    return (this.$refs as any).quill.quill
  }
  get requestAction () {
    switch (newReqModule.requestAction) {
      case 'NEW':
        return 'a new'
      case 'existing':
        return 'an existing'
      default:
        return 'a new'
    }
  }
  get requestExaminationOrProvideConsent () {
    return newReqModule.requestExaminationOrProvideConsent
  }
  get showActualInput () {
    return newReqModule.showActualInput
  }
  set showActualInput (value) {
    newReqModule.mutateShowActualInput(value)
  }
  get word () {
    if (Array.isArray(this.issue.name_actions) && this.issue.name_actions[0]) {
      return this.issue.name_actions[0].word.toUpperCase()
    }
    return ''
  }

  cancelAnalyzeName () {
    newReqModule.cancelAnalyzeName()
  }
  clickNameField () {
    if (!this.showActualInput) {
      this.showActualInput = true
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
        // matching insert phrases which are not surrounded with [ ] (ie. that are not 'brackets' type name_actions)
        // 'brackets' type name_actions disappear when the user clicks the field so to map the length of the unclicked
        // field to the clicked field we need to account for the presence of these.  if there are none all the indexes
        // map 1 : 1 directly.
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
    let nameWords = this.name.split(' ')
    return nameWords.map((word, i) => (
      { insert: (i > 0) ? (' ' + word) : (word) }
    ))
  }
  handleChange ({ html, text }) {
    if (this.showActualInput) {
      if (text.endsWith('\n')) {
        text = removeExcessSpaces(text.replace('\n', ''))
      }
      this.name = text.toUpperCase()
    }
    if (html.includes('</p><p>')) {
      html = html.replace('</p><p>', '')
    }
    this.contents = html
  }
  handleEnterKey (event) {
    if (this.isApproved) {
      // eslint-disable-next-line
      console.log('not this')
      event.preventDefault()
      this.quill.setText(this.originalName)
      return
    }
    if (event.key === 'Enter') {
      // eslint-disable-next-line
      console.log('bur rhis')
      event.stopPropagation()
      event.stopImmediatePropagation()
      event.preventDefault()
      this.name = this.quill.getText()
      let Action = this.nameActions.find(action => action.type === 'brackets')
      if (Action && Action.message) {
        // eslint-disable-next-line
        console.log('was actuiob')
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
  updateContents (text) {
    this.quill.setText(text)
  }
}

</script>

<style scoped lang="sass">
.action
  color: $error !important

.approved
  color: $approved !important

.error-message
  color: red
  margin-left: 20px
  margin-top: 15px

.modal-activator
  color: $link !important
  letter-spacing: unset !important
  text-decoration: underline
  cursor: pointer !important
  background-color: unset !important
  text-transform: none !important

.strike
  text-decoration-line: line-through
#name-search-bar
  min-height: 40px
  max-height: 40px
  margin: -20px 0 20px 0

</style>
