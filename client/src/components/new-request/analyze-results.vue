<template>
  <v-container class="pa-9 pt-6 normal-copy" id="analyze-results-container">
    <v-row no-gutters justify="space-between" align-content="space-around">
      <v-col cols="auto" class="bold-text">
        You are searching for a name for {{ requestAction }}
        {{ entityText === 'BC Corporation' && location.text === 'BC' ? '' : location.text }}
        {{ entityText }}
      </v-col>
      <v-col cols="auto">
        <button id="back-to-search-btn"
               class="modal-activator pa-0"
               @click="startAgain()"><span class="normal-link">  Start Search Over</span></button>
      </v-col>
      <v-col cols="12" class="mt-3" @click="toggleRealInput">
        <v-form @submit="handleSubmit">
          <v-text-field v-model="name"
                        filled
                        autocomplete="off"
                        @focus="toggleRealInput"
                        v-if="showActualInput || !hasNameActions"
                        placeholder="Search a Name"
                        id="analyze-name-text-field">
            <template v-slot:append>
              <v-icon class="name-search-icon" @click="handleSubmit">search</v-icon>
            </template>
          </v-text-field>
          <v-text-field filled
                        autocomplete="off"
                        v-else
                        id="analyze-name-text-field-2">
            <template v-slot:append>
              <v-icon class="name-search-icon" @click="handleSubmit">search</v-icon>
            </template>
            <template v-slot:prepend-inner>
              <template v-for="(word, i) in chunkedName">
                <name-word-renderer :key="word+i" :word="word" :index="i" :actions="nameActions" />
              </template>
            </template>
          </v-text-field>
        </v-form>
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
              <v-col cols="auto">
                <div v-for="(corp, n) in conflicts" :key="'conflict-' + n">
                  {{ corp.name }}
                </div>
              </v-col>
            </v-row>

            <!--GREY BOXES-->
            <div class="row pale-blue-text no-gutters justify-center"
                 name="fade"
                 tag="div">
              <v-col :key="issue.issue_type + '-' + option.header + '-' + i"
                     cols="auto"
                     v-for="(option, i) in issue.setup">
                <v-container :class="optionClasses(i)"
                             :key="issue.issue_type + '-' + i  + '-container'">
                  <transition :name="i === 0 ? 'fade' : '' " mode="out-in">
                    <v-row class="small-copy pale-blue-text"
                           align-content="space-between"
                           :key="changesInBaseName+designationIsFixed+'key'+i">
                      <!-- Line 1 and Line 2-->
                      <v-col class="bold-text mt-n3" cols="12">
                        <h5><v-icon class="pr-2 pale-blue-text">info</v-icon>
                          {{ option.header }}</h5>
                      </v-col>
                      <!--LINE 1 + LINE 2 WHEN THERE ARE NO CHANGES IN BASE NAME AND REPLACE_DESIGNATION-->
                      <template v-if="option.type === 'replace_designation' && !changesInBaseName">
                        <v-col class="small-copy pale-blue-text pt-0"
                               cols="12"
                               v-if="!designationIsFixed"
                               v-html="option.line1" />
                        <v-col class="small-copy pale-blue-text pt-0"
                               cols="12"
                               v-if="!designationIsFixed"
                               v-html="option.line2" />
                        <v-col class="small-copy pale-blue-text pt-0"
                               cols="12"
                               v-else>
                          You have changed the designation to a compatible one.  You may proceed.
                        </v-col>
                      </template>
                      <template v-else-if="option.type === 'change_entity_type'">
                        <v-col class="small-copy pale-blue-text pt-0"
                               key="change-entity-type-col"
                               cols="12"
                               v-html="option.line1" />
                        <v-col class="text-center mt-4">
                          <v-btn @click="startAgain()">Restart and Change Type</v-btn>
                        </v-col>
                      </template>
                      <!--LINE 1 + LINE 2 WHEN REPLACE_DESIGNATION AND CHANGES IN BASE NAME + ANY OTHER SCENARIO-->
                      <template v-else>
                        <v-col class="small-copy pale-blue-text pt-0"
                               cols="12"
                               v-html="option.line1" />
                        <v-col class="small-copy pale-blue-text pt-0 flex-fill"
                               cols="12"
                               v-html="option.line2" />
                      </template>
                                            <!--button / checkbox driven ui-->
                      <transition name="fade" mode="out-in">
                        <v-col v-if="option.type === 'replace_designation'"
                               :key="changesInBaseName+designationIsFixed+'key'">
                          <!--Designation based issues-->
                          <p v-if="changesInBaseName">
                            You have made changes to the base name.
                            You must either change the name back or run a new search.
                          </p>
                          <div v-if="!designationIsFixed && !changesInBaseName">
                            <p class="mt-n3 mb-1 small-copy">Please choose one of the following:</p>
                            <button tag="div"
                                    :key="'designation-'+d"
                                    :id="'designation-'+d"
                                    @click="changeDesignation(des)"
                                    class="small-link mr-2"
                                    v-for="(des, d) in issue.designations">
                              {{ des }}{{ (d !== issue.designations.length - 1) ? ',' : '' }}
                            </button>
                          </div>
                          <div v-if="designationIsFixed && !changesInBaseName" class="text-center">
                            <ReserveSubmit id="reserve-submit-designation" style="display: inline"
                                           :setup="reserveAction" />
                          </div>
                        </v-col>
                      </transition>
                      <v-col v-if="option.type === 'send_to_examiner' && displayCheckbox"
                             class="pa-0"
                             id="examine-checkbox-col">
                        <v-checkbox :error="highlightCheckboxes"
                                    :label="examineLabel"
                                    class="ma-0 pa-0"
                                    id="examine-checkbox"
                                    v-model="examine[issueIndex]" />
                      </v-col>
                      <v-col v-if="option.type === 'send_to_examiner' && !displayCheckbox"
                             id="examine-checkbox-col"
                             class="pa-0">
                        <ReserveSubmit id="reserve-submit-examine"
                                       style="display: inline"
                                       :setup="json.issues.length > 1 ? reserveAction : 'examine'"/>
                      </v-col>
                      <v-col v-if="option.type === 'obtain_consent' && displayCheckbox"
                             id="consent-body-checkbox-col"
                             class="pa-0">
                        <v-checkbox :error="highlightCheckboxes"
                                    class="ma-0 pa-0"
                                    id="consent-body-checkbox"
                                    label="I am able to obtain and send written consent"
                                    v-model="consentBody[issueIndex]" />
                      </v-col>
                      <v-col v-if="option.type === 'obtain_consent' && !displayCheckbox"
                             id="consent-body-checkbox-col"
                             class="pa-0">
                        <ReserveSubmit id="reserve-submit-consent"
                                       style="display: inline"
                                       :setup="json.issues.length > 1 ? reserveAction : 'consent'" />
                      </v-col>
                      <v-col v-if="option.type === 'conflict_self_consent' && displayCheckbox"
                             id="consent-body-checkbox-col"
                             class="pa-0">
                        <v-checkbox :error="highlightCheckboxes"
                                    class="ma-0 pa-0"
                                    id="consent-body-checkbox"
                                    label="I have authority over the conflicting name.  I will send written consent."
                                    v-model="consentCorp[issueIndex]" />
                      </v-col>
                      <v-col v-if="option.type === 'conflict_self_consent' && !displayCheckbox"
                             id="consent-corp-checkbox-col"
                             class="pa-0">
                        <ReserveSubmit id="reserve-submit-consent"
                                       style="display: inline"
                                       :setup="json.issues.length > 1 ? reserveAction : 'consent'" />
                      </v-col>
                      <v-col v-if="issue.type === 'replace_designation'" id="examine-checkbox-col">
                        <p>{{ option.line1 }}</p>
                        <v-btn @click="restartNewType()" id="change-designation-restart-btn">
                          Change Type and Restart</v-btn>
                      </v-col>
                    </v-row>
                  </transition>
                </v-container>
              </v-col>
            </div>

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
              <v-col cols="auto" class="text-right">
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
                  {{ entityText === 'BC Corporation' && location.text === 'BC' ? '' : location.text }} {{ entityText }}
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

  </v-container>
</template>

<script lang="ts">
import ReserveSubmit from '@/components/new-request/reserve-submit'
import NameWordRenderer from '@/components/new-request/analyzed-name-word-renderer'
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { IssueI, SetupI, DisplayedComponentT } from '@/models'

@Component({
  components: { ReserveSubmit, NameWordRenderer }
})
export default class AnalyzeResults extends Vue {
  issueIndex: number = 0
  openedCategory: string = ''
  showActualInput: boolean = false
  originalName: string | null = null
  highlightCheckboxes: boolean = false
  consentBody = {
    0: false,
    1: false,
    2: false
  }
  consentCorp = {
    0: false,
    1: false,
    2: false
  }
  examine = {
    0: false,
    1: false,
    2: false
  }

  created () {
    this.originalName = newReqModule.name
  }

  @Watch('examine', { deep: true })
  handlerExamine (newVal, oldVal) {
    if (newVal[this.issueIndex]) {
      this.consentBody[this.issueIndex] = false
      this.consentCorp[this.issueIndex] = false
    }
  }
  @Watch('consentBody', { deep: true })
  handlerBody (newVal, oldVal) {
    if (newVal[this.issueIndex]) {
      this.examine[this.issueIndex] = false
    }
  }
  @Watch('consentCorp', { deep: true })
  handlerCorp (newVal, oldVal) {
    if (newVal[this.issueIndex]) {
      this.examine[this.issueIndex] = false
    }
  }

  get buttonSetup () {
    let output: string = ''
    for (let step in this.consentBody) {
      if (this.consentBody[step]) {
        output = 'consent'
      }
    }
    for (let step in this.consentCorp) {
      if (this.consentCorp[step]) {
        output = 'consent'
      }
    }
    for (let step in this.examine) {
      if (this.examine[step]) {
        output = 'examine'
      }
    }
    return output
  }
  get changesInBaseName () {
    if (this.issue.issue_type === 'designation_mismatch') {
      let nameEnd = this.originalName.indexOf(this.word)
      if (this.originalName.slice(0, nameEnd) !== this.name.slice(0, nameEnd)) {
        return true
      }
    }
    return false
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
  get hasNameActions () {
    if (!this.issue || this.issue.name_actions.length === 0) {
      return false
    }
    return true
  }
  get designationIsFixed () {
    if (this.issue.issue_type === 'designation_mismatch') {
      let { designations } = this.issue
      for (let des of designations) {
        des = des.toLowerCase()
        let name = this.name.toLowerCase()
        let regexStr = new RegExp('\\b' + des + '\\b')
        if (name.match(regexStr) !== null) {
          if (!this.changesInBaseName) {
            return true
          }
        }
      }
    }
    return false
  }
  get displayCheckbox () {
    if (Array.isArray(this.json.issues) && this.json.issues.length > 1) {
      if (this.issueIndex < this.json.issues.length - 1) {
        return true
      }
    }
    return false
  }
  get entityText () {
    return newReqModule.entityTextFromValue
  }
  get entityType () {
    return newReqModule.entityType
  }
  get examineLabel () {
    if (this.issue && this.issue.issue_type === 'corp_conflict') {
      return `I do not have authority over the conflicting name but I want my name examined.`
    }
    return `I do not need consent to use this word in this context. I want my name examined.`
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
    if (this.consentCorp[this.issueIndex] || this.consentBody[this.issueIndex] || this.examine[this.issueIndex]) {
      return false
    }
    return true
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
  get reserveAction () {
    let output
    for (let step in this.consentBody) {
      if (this.consentBody[step]) {
        output = 'consent'
      }
    }
    for (let step in this.consentCorp) {
      if (this.consentCorp[step]) {
        output = 'consent'
      }
    }
    for (let step in this.examine) {
      if (this.examine[step]) {
        output = 'examine'
      }
    }
    return output
  }
  get word () {
    if (Array.isArray(this.issue.name_actions) && this.issue.name_actions[0]) {
      return this.issue.name_actions[0].word
    }
    return ''
  }

  changeDesignation (des) {
    this.showActualInput = true
    this.name = this.originalName.replace(this.word, des)
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
      setTimeout(() => { reset() }, 4000)
    }
  }
  clickReserveNow () {
    newReqModule.mutateDisplayedComponent('ApplicantInfo')
  }
  handleSubmit (event: Event) {
    event.preventDefault()
    newReqModule.startAnalyzeName()
  }
  toggleRealInput () {
    if (!this.showActualInput) {
      this.showActualInput = true
      this.$nextTick(function () {
        let position = this.name.length
        let elem = document.getElementById('analyze-name-text-field') as HTMLInputElement
        if (elem.setSelectionRange) {
          elem.focus()
          elem.setSelectionRange(position, position)
          return
        }
        elem.focus()
      })
    }
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
  restartNewType () {
    newReqModule.mutate('search')
  }
  startAgain () {
    newReqModule.startAgain()
  }
}

</script>

<style scoped lang="sass">
#examine-checkbox
  font-size: 13px !important
  line-height: 16px !important
.action
  color: $error !important
.approved
  color: $approved !important
.error-message
  color: red
  margin-left: 20px
  margin-top: 15px
.helpful-hint
  padding: 15px 25px 15px 25px
  border-radius: 4px
  border: 1px dashed $pale-blue
  background-color: $grey-1
  min-width: 80%
  max-width: 80%
.square-card-x2
  height: 215px
  width: 420px
  padding: 15px 25px 15px 25px
  border-radius: 4px
  border: 1px dashed $pale-blue
  background-color: $grey-1
.modal-activator
  color: $link !important
  letter-spacing: unset !important
  text-decoration: underline
  cursor: pointer !important
  background-color: unset !important
  text-transform: none !important
.pale-blue-text
  color: $p-blue-text !important
.square-card-x3
  height: 215px
  width: 280px
  padding: 15px 25px 15px 25px
  border-radius: 4px
  border: 1px dashed $pale-blue
  background-color: $grey-1
.strike
  text-decoration-line: line-through
.fade-enter
  opacity: 0
.fade-enter-active, .fade-leave-active
  transition: all .15s ease-in
.fade-enter-to
  opacity: 1
.fade-leave
  opacity: 1
.fade-leave-to
  opacity: 0

</style>
