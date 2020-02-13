<template>
  <v-container class="px-9 pt-6 pb-9">
    <v-row no-gutters justify="space-between" id>
      <v-col cols="auto" class="bold-text">
        You are searching for a name for {{ requestType }}
        {{ entityText === 'BC Corporation' && location.text === 'BC' ? '' : location.text }}
        {{ entityText }}
      </v-col>
      <v-col cols="auto" >
        <v-btn text
               id="back-to-search-btn"
               class="modal-activator"
               @click="startAgain()"><span class="normal-link">Start Search Over</span></v-btn>
      </v-col>
      <v-col cols="12">
        <v-form @submit="handleSubmit">
          <v-text-field v-model="name"
                        filled
                        autocomplete="off"
                        v-if="showActualInput || !nameActions || issue.issue_type === 'none'"
                        placeholder="Search a Name"
                        id="analyze-name-text-field">
            <template v-slot:append>
              <v-icon class="name-search-icon" @click="handleSubmit">search</v-icon>
            </template>
          </v-text-field>
          <v-text-field filled
                        autocomplete="off"
                        v-else
                        @focus="focusInput"
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

    <v-row no-gutters justify="center" class="mt-n4">
      <v-col cols="auto" :class="json.status === 'ap' ? 'approved' : 'action'" class="h4">
        <v-icon :class="json.status === 'ap' ? 'approved' : 'action'">
          {{ json.status === 'ap' ? 'check_circle' : 'stars' }}
        </v-icon>
        {{ json.header }}
      </v-col>
    </v-row>

    <template v-if="issue && issue.issue_type">
      <v-row no-gutters justify="center">
        <v-col cols="12"
               v-if="issue.line1"
               v-html="issue.line1"
               class="pt-2 pb-4 mt-n1 text-center" />
        <v-col cols="12"
               v-if="issue.line2"
               v-html="issue.line2"
               class="mt-n3 pb-4 text-center" />
      </v-row>
      <v-row justify="center" v-if="issue.consenting_body && issue.consenting_body.name">
        <v-col class="text-center my-n2">
          The word <b>"{{ word }}"</b> requires consent from:
          <p>{{ issue.consenting_body.name }}</p>
          <p class="mt-n4"><a :href="'mailto:'+issue.consenting_body.email">
            {{ issue.consenting_body.email }}</a></p>
        </v-col>
      </v-row>
      <v-row no-gutters justify="center" v-if="conflicts.length > 0" class="mt-n7">
          <v-col cols="auto" class="py-4">
            <div style="width: 600px;" v-for="(corp, n) in conflicts" :key="n">
              <div style="display: inline-block; border-bottom: 1px dashed grey; width: 80%">{{ corp.name }}</div>

              <div style="display: inline-block; border-bottom: 1px dashed grey; width: 20%"
                   class="text-right">{{ corp.date }}</div>
            </div>
          </v-col>
        </v-row>
        <transition-group tag="div" class="row pale-blue-text no-gutters justify-center" name="flip-list">
          <v-col cols="auto" v-for="(option, i) in issue.setup" :key="issue.issue_type+' '+option.header+' '+i">
            <v-container :class="optionClasses(i)" :key="issue.issue_type+' '+i+' container'">
            <v-row align-content="space-around" align-items="center">
              <!-- Line 1 and Line 2-->
              <v-col class="bold-text mt-n3" cols="12"><v-icon class="pr-2 pale-blue-text">info</v-icon>
                {{ option.header }}
              </v-col>
              <v-col cols="12" class="small-copy pale-blue-text pt-0" v-html="option.line1" />
              <v-col cols="12"
                     class="small-copy pale-blue-text pt-0"
                     v-if="option.line2 && i === 0"
                     v-html="option.line2" />
              <!--button / checkbox driven ui-->
              <v-col v-if="option.button === 'designation'">
                <transition name="fade" mode="out-in">
                  <div v-if="!designationFixed" key="designation-div-1">
                    <p class="mt-n3 mb-1 small-copy">Please choose one of the following:</p>
                    <span v-for="(des, d) in issue.designations" :key="'des '+d"
                          @click="changeDesignation(des)"
                          class="small-link mr-2">
                      {{ des }}{{ d !== issue.designations.length - 1 ? ',' : '' }}
                    </span>
                  </div>
                  <div v-else key="designation-div-2">
                    <v-btn large>
                      {{ examinationRequested ? 'Send to Examination' : 'Reserve Name and Continue' }}
                    </v-btn>
                  </div>
                </transition>
              </v-col>
              <v-col v-if="option.checkbox === 'examine'" id="examine-checkbox-col">
               <v-checkbox label="I want to submit this name for examination"
                           @change="clickCheckbox"
                           class="mt-n4"
                           v-model="responses[issueIndex].examine"
                           id="examine-checkbox"/>
              </v-col>
              <v-col v-if="option.checkbox === 'consent_body'" id="consent-body-checkbox-col">
               <v-checkbox label="I am able to obtain and send written consent"
                           @change="clickCheckbox"
                           class="mt-n4"
                           v-model="responses[issueIndex].consentBody"
                           id="consent-body-checkbox"/>
              </v-col>
              <v-col v-if="option.button === 'consent_corp'" id="consent-corp-checkbox-col">
                <transition name="fade" mode="out-in">
                  <div v-if="!responses[issueIndex].consentCorp">
                    <v-checkbox label="I am the registered owner of the conflicting business I will send written consent"
                                @change="clickCheckbox"
                                class="mt-n4"
                                v-if="!registeredOwnerConfirmation"
                                v-model="responses[issueIndex].consentCorp"
                                id="consent-corp-checkbox"/>
                  </div>
                  <div v-else>
                    <v-btn class="mt-n3">
                  {{ examinationRequested ? 'Send to Examination' : 'Conditionally Reserve' }}</v-btn>
                  </div>
                </transition>
              </v-col>
              <v-col v-if="option.button === 'examine'" id="examine-checkbox-col">
                <v-btn class="mt-n3" v-if="!registeredOwnerConfirmation">
                  Send to Examination</v-btn>
              </v-col>
              <!--wrong-designation issue type-->
              <v-col v-if="option.button === 'restart'" id="examine-checkbox-col">
                <v-btn @click="restartNewType()">Change Type and Restart</v-btn>
              </v-col>
            </v-row>
          </v-container>
          </v-col>
        </transition-group>
      <v-row v-if="issue.show_examination_button" justify="center" class="mt-3">
        <v-col cols="auto"><v-btn id="send-to-examination-btn" large>Send to Examination</v-btn></v-col>
      </v-row>
      <v-row v-if="json.issues.length > 1"  no-gutters>
        <v-col cols="12" class="text-right">
          <v-btn @click="issueIndex--"
                 class="mt-3 mb-n4 rnd-wht-btn"
                 color="#1669bb"
                 id="previous-issue-btn"
                 large
                 outlined
                 v-if="issueIndex > 0">Previous Issue</v-btn>
          <v-btn :class="!nextButtonDisabled ? 'active-issue-btn' : '' "
                 :disabled="nextButtonDisabled"
                 @click="issueIndex++"
                 class="mt-3 mb-n4"
                 id="next-issue-btn"
                 large
                 outlined
                 v-if="(json.issues.length - 1) > issueIndex">Next Issue</v-btn>
        </v-col>
      </v-row>
    </template>

    <template v-else>
      <v-row no-gutters justify="center">
        <v-col cols="auto" class="normal-copy pt-2 pb-4">
          Name Approved for a {{ requestType }}
          {{ entityText === 'BC Corporation' && location.text === 'BC' ? '' : location.text }} {{ entityText }}
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="auto">
          <ReserveSubmit />
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script lang="ts">
import NameWordRenderer from '@/components/new-request/analyzed-name-word-renderer'
import newReqModule from '@/store/new-request-module'
import NewRequestNameInput from '@/components/new-request/name-input'
import ReserveSubmit from '@/components/new-request/buttons/reserve-submit'
import { Component, Vue } from 'vue-property-decorator'
import { IssueI } from '@/models'

@Component({
  components: { NameWordRenderer, NewRequestNameInput, ReserveSubmit }
})
export default class AnalyzeResults extends Vue {
  examinationRequested: boolean = false
  issueIndex: number = 0
  openedCategory: string = ''
  responses = {
    0: {
      examine: false,
      consentCorp: false,
      consentBody: false
    },
    1: {
      examine: false,
      consentCorp: false,
      consentBody: false
    },
    2: {
      examine: false,
      consentCorp: false,
      consentBody: false
    }
  }

  registeredOwnerConfirmation: boolean = false
  reserveWithConsentRequested: boolean = false
  showActualInput: boolean = false

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
  get nameClasses () {
    if ((this.nameActions as any).findIndex((action: any) => action.type === 'strike') >= 0) {
      return 'action strike'
    }
    if ((this.nameActions as any).findIndex((action: any) => action.type === 'highlight') >= 0) {
      return 'action'
    }
    return null
  }
  get nextButtonDisabled () {
    let keys = Object.keys(this.responses[this.issueIndex])
    for (let key of keys) {
      if (this.responses[this.issueIndex][key]) {
        return false
      }
    }
    return true
  }
  get designationFixed () {
    if (this.issue.issue_type === 'wrong_designation') {
      let { designations } = this.issue
      for (let des of designations) {
        if (this.name.includes(des)) {
          return true
        }
      }
    }
    return false
  }
  get showNextorPrevious () {
    if (Array.isArray(this.json.issues) && this.json.issues.length > 1) {
      if (this.issueIndex === 0) {
        return 'next'
      }
      return 'previous'
    }
    return ''
  }
  get requestType () {
    switch (newReqModule.requestType) {
      case 'new':
        return 'a new'
      case 'existing':
        return 'an existing'
      default:
        return 'a new'
    }
  }
  get word () {
    if (Array.isArray(this.issue.name_actions) && this.issue.name_actions[0]) {
      return this.issue.name_actions[0].word
    }
    return ''
  }

  clickCheckbox () {
    // eslint-disable-next-line
    console.log('yaaa')
    let emptyResp = {
      examine: false,
      consent_body: false,
      consent_corp: false
    }
    Vue.set(this.responses, this.issueIndex, emptyResp)
  }
  async focusInput (event: Event) {
    this.showActualInput = true
    await this.$nextTick()
    let elem = document.getElementById('analyze-name-text-field')
    let length = this.name.length
    if (elem.createTextRange) {
      let range = elem.createTextRange()
      range.move('character', length)
      range.select()
    } else {
      if (elem.selectionStart) {
        elem.focus()
        elem.setSelectionRange(length, length)
      } else {
        elem.focus()
      }
    }
  }
  handleSubmit (event: Event) {
    event.preventDefault()
    newReqModule.startAnalyzeName()
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
    let currentDes = this.issue.name_actions[0].word
    let value = newReqModule.entityValueFromText(currentDes)
    newReqModule.mutateEntityType(value)
    newReqModule.mutateShowSearchStage('search')
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
  color: $error
.approved
  color: $approved
.fade-enter-active, .fade-leave-active
  transition: opacity .2s
.fade-enter, .fade-leave-to
  opacity: 0
.flip-list-move
  transition: ease-in-out 1s
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
.list-enter-active, .list-leave-active
  transition: all 1s
.list-enter, .list-leave-to
  opacity: 0
.strike
  text-decoration-line: line-through
</style>
