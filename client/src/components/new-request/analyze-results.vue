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
                          v-if="!showActualInput && hasNameActions"
                          @focus="toggleRealInput()"
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
import GreyBox from '@/components/new-request/grey-box'
import MainContainer from '@/components/new-request/main-container'
import ReserveSubmit from '@/components/new-request/submit-request/reserve-submit'
import NameWordRenderer from '@/components/new-request/analyzed-name-word-renderer'
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { IssueI } from '@/models'

@Component({
  components: { GreyBox, MainContainer, NameWordRenderer, ReserveSubmit }
})
export default class AnalyzeResults extends Vue {
  issueIndex: number = 0
  originalName: string | null = null
  highlightCheckboxes: boolean = false

  @Watch('issueIndex')
  resetShowActualInput (newVal, oldVal) {
    if (newVal !== oldVal) {
      this.showActualInput = false
    }
  }

  created () {
    this.originalName = newReqModule.name
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
    name = name.toUpperCase()
    newReqModule.mutateName(name)
  }
  get nameActions () {
    if ((this.issue as IssueI) && (this.issue as IssueI).name_actions) {
      return (this.issue as IssueI).name_actions
    }
    return null
  }
  get nextButtonDisabled () {
    for (let type of ['obtain_consent', 'conflict_self_consent', 'send_to_examiner']) {
      if (this.requestExaminationOrProvideConsent[this.issueIndex][type]) {
        return false
      }
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
  handleSubmit (event: Event) {
    event.preventDefault()
    newReqModule.startAnalyzeName()
  }
  cancelAnalyzeName () {
    newReqModule.cancelAnalyzeName()
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

</style>
