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
    <v-row no-gutters justify="center" class="mt-n2">
      <v-col cols="auto"
             :class="json.status === 'ap' ? 'approved' : 'action'"
             class="h4">
        <v-icon :class="json.status === 'ap' ? 'approved' : 'action'">
          {{ json.status === 'ap' ? 'check_circle' : 'stars' }}
        </v-icon>
        {{ json.header }}
      </v-col>
    </v-row>

    <template v-if="issue.issue_type">
      <v-row no-gutters justify="center">
          <v-col cols="12"
                 v-if="issue.line1"
                 v-html="issue.line1"
                 class="normal-copy pt-2 pb-4 text-center" />
        <v-col cols="12"
               v-if="issue.line2"
               v-html="issue.line2"
               class="normal-copy pt-2 pb-4 text-center" />
      </v-row>
      <v-row no-gutters justify="center" v-if="issue.consenting_body.name">
        <v-col class="text-center mb-3">The word {{ word }} requires consent from {{ issue.consenting_body.name
                                       }}</v-col>
      </v-row>
      <v-row no-gutters justify="center" v-if="conflicts.length > 0" class="mt-n5">
          <v-col cols="auto" class="py-4">
            <div style="width: 600px;" v-for="(corp, n) in conflicts" :key="n">
              <div style="display: inline-block; border-bottom: 1px dashed grey; width: 80%">{{ corp.name }}</div>

              <div style="display: inline-block; border-bottom: 1px dashed grey; width: 20%"
                   class="text-right">{{ corp.date }}</div>
            </div>
          </v-col>
        </v-row>
        <v-row no-gutters justify="center" class="pale-blue-text">
          <v-col cols="auto" v-for="(option, i) in issue.setup" :key="'option '+i">
            <v-container :class="optionClasses(i)">
              <v-row>
                <v-col class="bold-text" cols="12"><v-icon class="pr-2 pale-blue-text">info</v-icon>
                  {{ option.header }}
                </v-col>
                <v-col cols="12" class="small-copy pale-blue-text pt-0" v-html="option.line1" />
                <v-col cols="12"
                       class="small-copy pale-blue-text pt-0"
                       v-if="option.line2 && i === 0"
                       v-html="option.line2" />
                <template v-if="issue.issue_type === 'wrong_designation' && i === 0">
                  <transition name="fade" mode="out-in">
                    <v-col cols="12"
                          key="list-col"
                          class="small-copy pale-blue-text pt-0"
                          v-if="!showDesignationReserveBtn">
                      <p>Please choose one of the following:</p>
                      <span v-for="(des, d) in issue.designations" :key="'des '+d"
                            @click="changeDesignation(des)"
                            class="small-link mr-2">{{ des }}</span>
                    </v-col>
                    <v-col cols="12"
                           key="button-col"
                           v-if="showDesignationReserveBtn">
                      <ReserveSubmit />
                    </v-col>
                  </transition>
                </template>
                <v-col cols="12" v-if="issue.issue_type === 'wrong_designation' && i === 1">
                  <v-btn @click="restartNewType()">Change Type and Restart</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      <v-row v-if="issue.show_examination_button" justify="center" class="mt-3">
        <v-col cols="auto"><v-btn id="send-to-examination-btn" large>Send to Examination</v-btn></v-col>
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
import ReserveSubmit from '@/components/new-request/buttons/reserve-submit'
import newReqModule from '@/store/new-request-module'
import NewRequestNameInput from '@/components/new-request/name-input'
import { Component, Vue } from 'vue-property-decorator'
import { IssueI } from '@/models'
import { normalizeWordCase } from '@/plugins/utilities'
import NameWordRenderer from '@/components/new-request/analyzed-name-word-renderer'

@Component({
  components: { ReserveSubmit, NewRequestNameInput, NameWordRenderer }
})
export default class AnalyzeResults extends Vue {
  issueIndex: number = 0
  openedCategory: string = ''
  showActualInput: boolean = false

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
  get chunkedName () {
    return this.name.split(' ')
  }
  get issue () {
    if (this.json.issues) {
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
  get name () {
    return newReqModule.name
  }
  set name (name: string) {
    newReqModule.mutateName(name)
  }
  get showDesignationReserveBtn () {
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
  get wordIndex () {
    if ((this.issue as IssueI) && (this.issue as IssueI).word_index) {
      return (this.issue as IssueI).word_index
    }
    return null
  }
  get word () {
    if (Array.isArray(this.issue.name_actions) && this.issue.name_actions[0]) {
      return this.issue.name_actions[0].word
    }
    return ''
  }
  get wordList () {
    if (this.descriptiveWords && this.openedCategory) {
      let index = this.descriptiveWords.findIndex((word: any) => word.category === this.openedCategory)
      if (index >= 0) {
        return (this.descriptiveWords[index] as any).word_list
      }
    }
    return null
  }
  changeDesignation (des) {
    if (Array.isArray(this.issue.name_actions)) {
      let prevDesignation = this.issue.name_actions[0].word
      this.name = this.name.replace(prevDesignation, des)
      return
    }
    this.name = this.name + ' ' + des
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
  startAgain () {
    newReqModule.startAgain()
  }
}

</script>

<style scoped lang="sass">
.action
  color: $error
.approved
  color: $approved
.fade-enter-active, .fade-leave-active
  transition: opacity .2s
.fade-enter, .fade-leave-to
  opacity: 0
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
</style>
