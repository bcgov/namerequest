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
              <template v-for="(word, i) in indexedName">
                <NameWordRenderer :key="word+i" :word="word" :index="i" :actions="nameActions" />
              </template>
            </template>
          </v-text-field>
        </v-form>
      </v-col>
    </v-row>
    <v-row no-gutters justify="center" class="mt-n2">
      <v-col cols="auto"
             v-if="json.status === 'Available'"
             class="approved h4"><v-icon class="approved">check_circle</v-icon>{{ json.status }}</v-col>
      <v-col cols="auto"
             v-else
             class="action h4"><v-icon class="action">stars</v-icon>{{ json.status }}</v-col>
    </v-row>

    <template v-if="issue.issue_type">
      <template v-if="issue.issue_type === 'consent_required'">
        <v-row no-gutters justify="center" v-for="(word, i) in issue.words" :key="i+word+'row'">
          <v-col cols="auto" class="normal-copy pt-2 pb-4 px-0 mx-0">
            <b>"{{ word }}"</b> requires consent from {{ issue.consenting_body.name }}.
            {{ issue.consenting_body.email ?  issue.consenting_body.email : '' }}
          </v-col>
        </v-row>
        <v-row no-gutters justify="center" class="pale-blue-text">
          <v-col cols="auto">
            <v-container class="square-card">
              <v-row>
                <v-col class="bold-text" cols="12"><v-icon class="pr-2 pale-blue-text">info</v-icon>Option 1</v-col>
                <v-col cols="12" class="small-copy pale-blue-text pt-0">
                  You can remove or replace the word <b>"{{ issue.word }}"</b> and try your search again.
                </v-col>
              </v-row>
            </v-container>
          </v-col>
          <v-col cols="auto" class="mx-3">
            <v-container class="square-card">
              <v-row align-items="end" align-content="space-between" align="end">
                <v-col class="bold-text" cols="12"><v-icon class="pr-2 pale-blue-text">info</v-icon>Option 2</v-col>
                <v-col cols="12" class="py-0 small-copy pale-blue-text">
                  You can choose to submit this name for examination. Examination wait times are listed above.
                </v-col>
                <v-col cols="auto" class="pt-4" align-self="end">
                  <v-btn>Submit for Examination</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-col>
          <v-col cols="auto">
            <v-container class="square-card">
              <v-row>
                <v-col class="bold-text" cols="12"><v-icon class="pr-2 pale-blue-text">info</v-icon>Option 3</v-col>
                <v-col cols="12" class="py-0 small-copy pale-blue-text">
                  This name can be auto-approved but you will be required to send confirmation of consent to the BC
                  Business Registry.
                </v-col>
                <v-col cols="12" class="pt-4" align-self="end">
                  <v-btn>Reserve Name and Continue</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      </template>

      <template v-if="issue.issue_type === 'add_distinctive'">
        <v-row no-gutters justify="center">
          <v-col cols="auto" class="normal-copy pt-2 pb-4">
            Requires a word at the beginning of your name that sets it apart.
          </v-col>
        </v-row>
        <v-row no-gutters justify="center" class="pale-blue-text">
          <v-col cols="auto">
            <v-container class="helpful-hint">
              <v-row>
                <v-col class="bold-text" cols="12"><v-icon class="pr-2 pale-blue-text">info</v-icon>Helpful Hint</v-col>
                <v-col cols="12" class="small-copy pale-blue-text pt-0">
                  Some words that can set your name apart include an individual's name or initials; a geographic
                  location;  a colour; a coined, made-up word; or an acronym.
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      </template>

      <template v-if="issue.issue_type === 'add_descriptive'">
        <v-row no-gutters justify="center">
          <v-col cols="auto" class="normal-copy pt-2 pb-4">
            <b>Requires a business category word</b>
          </v-col>
        </v-row>
        <v-row no-gutters justify="center" class="pale-blue-text">
          <v-col cols="auto">
            <v-container class="helpful-hint">
              <v-row>
                <v-col class="bold-text" cols="12"><v-icon class="pr-2 pale-blue-text">info</v-icon>Helpful Hint</v-col>
                <v-col cols="12" class="small-copy pale-blue-text pt-0">
                  Add a word to the end of your name that describes the business category. Use your own word or click on
                  one of the categories below to see word suggestions:
                </v-col>
              </v-row>
              <v-row justify="center" v-if="!openedCategory">
                <v-col v-for="(cat, w) in descriptiveWords"
                       :key="w+'cat'"
                       style="cursor: pointer"
                       @click="openedCategory = cat.category"
                       cols="auto">{{ cat.category }}</v-col>
              </v-row>
              <v-row justify="center" v-else>
                <v-col v-for="word in wordList"
                       :key="word"
                       cols="auto">{{ word }}</v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      </template>

      <template v-if="issue.issue_type === 'unclassified_word'">
        <v-row no-gutters justify="center">
          <v-col cols="auto" class="normal-copy pt-2 pb-4">
            <b>Contains Unclassified Word</b>
          </v-col>
        </v-row>
        <v-row no-gutters justify="center" class="pale-blue-text">
          <v-col cols="auto">
            <v-container class="helpful-hint">
              <v-row>
                <v-col class="bold-text" cols="12"><v-icon class="pr-2 pale-blue-text">info</v-icon>Helpful Hint</v-col>
                <v-col cols="12" class="small-copy pale-blue-text pt-0">
                  You can remove or replace any unknown words and try your search again, or you can choose to submit the
                  name above for examination.
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      </template>

      <template v-if="issue.issue_type === 'word_to_avoid'">
        <v-row no-gutters justify="center">
          <v-col cols="auto" class="normal-copy pt-2">
            <b>Contains Words To Avoid:</b>
          </v-col>
        </v-row>
        <v-row no-gutters justify="center">
          <v-col cols="auto" class="normal-copy pt-2 pb-4">
            {{ issue.word }}
          </v-col>
        </v-row>
        <v-row no-gutters justify="center" class="pale-blue-text">
          <v-col cols="auto">
            <v-container class="helpful-hint">
              <v-row>
                <v-col class="bold-text" cols="12"><v-icon class="pr-2 pale-blue-text">info</v-icon>Helpful Hint</v-col>
                <v-col cols="12" class="small-copy pale-blue-text pt-0">
                  Replace or remove the word <b>“{{ issue.word }}”</b> from your name and search again.
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      </template>

      <template v-if="issue.issue_type === 'corp_conflict'">
        <v-row no-gutters justify="center">
          <v-col cols="auto" class="normal-copy pt-2">
            <b>Too Similar to an Existing Name:</b>
          </v-col>
        </v-row>
        <v-row no-gutters justify="center">
          <v-col cols="auto" class="py-4">
            <div style="width: 600px;" v-for="(corp, n) in conflicts" :key="n">
              <div style="display: inline-block; border-bottom: 1px dashed grey; width: 80%">{{ corp.name }}</div>

              <div style="display: inline-block; border-bottom: 1px dashed grey; width: 20%"
                   class="text-right">{{ corp.date }}</div>
            </div>
          </v-col>
        </v-row>
        <v-row no-gutters justify="center" class="pale-blue-text">
          <v-col cols="auto">
            <v-container class="square-card">
              <v-row>
                <v-col class="bold-text" cols="12"><v-icon class="pr-2 pale-blue-text">info</v-icon>Option 1</v-col>
                <v-col cols="12" class="small-copy pale-blue-text pt-0">
                  Add a word to the beginning of your name that sets it apart such as a person’s name or initials;
                  geographic location; colour; a made up word; or an acronym.
                  <br>
                  Or remove <b>"{{ issue.word }}"</b> and replace it with a different word
                </v-col>
              </v-row>
            </v-container>
          </v-col>
          <v-col cols="auto" class="mx-3">
            <v-container class="square-card">
              <v-row align-items="end" align-content="space-between" align="end">
                <v-col class="bold-text" cols="12"><v-icon class="pr-2 pale-blue-text">info</v-icon>Option 2</v-col>
                <v-col cols="12" class="py-0 small-copy pale-blue-text">
                  You can choose to submit this name for examination. Examination wait times are listed above.
                </v-col>
                <v-col cols="auto" class="pt-4" align-self="end">
                  <v-btn>Submit for Examination</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-col>
          <v-col cols="auto">
            <v-container class="square-card">
              <v-row>
                <v-col class="bold-text" cols="12"><v-icon class="pr-2 pale-blue-text">info</v-icon>Option 3</v-col>
                <v-col cols="12" class="py-0 small-copy pale-blue-text">
                  If you are the registered owner of the existing name, it can be auto-approved but you are required to
                  send confirmation of consent to the BC Business Registry.
                </v-col>
                <v-col cols="12" class="pt-3" align-self="end">
                  <v-btn>Reserve Name and Continue</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      </template>

      <template v-if="issue.issue_type === 'wrong_designation'">
        <v-row no-gutters justify="center">
          <v-col cols="auto" class="normal-copy pt-2 pb-4">
            <b>{{ issue.word }}</b> designation cannot be used with the selected business type <b>Corporation</b>
          </v-col>
        </v-row>
        <v-row no-gutters justify="center" class="pale-blue-text">
          <v-col cols="auto">
            <v-container class="lg-square-card">
              <v-row>
                <v-col class="bold-text" cols="12"><v-icon class="pr-2 pale-blue-text">info</v-icon>Option 1</v-col>
                <v-col cols="12" class="small-copy pale-blue-text pt-0">
                  Change the designation from <b>“Cooperative”</b> to one of the following:
                </v-col>
                <v-col>{{ designations }}</v-col>
              </v-row>
            </v-container>
          </v-col>
          <v-col cols="auto" class="mx-3">
            <v-container class="lg-square-card">
              <v-row align-items="end" align-content="space-between" align="end">
                <v-col class="bold-text" cols="12"><v-icon class="pr-2 pale-blue-text">info</v-icon>Option 2</v-col>
                <v-col cols="12" class="py-0 small-copy pale-blue-text">
                  If you would like to start a Cooperative business instead of a Corporation, start your search over and
                  change your business type to “Cooperative”.
                </v-col>
                <v-col cols="auto" class="pt-4" align-self="end">
                  <v-btn>Change Business Type to Cooperative</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      </template>

      <template v-if="issue.issue_type === 'excess_words'">
        <v-row no-gutters justify="center">
          <v-col cols="auto" class="normal-copy pt-2 pb-4">
            Names with <b>more than 4 words</b> cannot be auto-approved
          </v-col>
        </v-row>
        <v-row no-gutters justify="center" class="pale-blue-text">
          <v-col cols="auto">
            <v-container class="helpful-hint">
              <v-row>
                <v-col class="bold-text" cols="12"><v-icon class="pr-2 pale-blue-text">info</v-icon>Helpful Hint</v-col>
                <v-col cols="12" class="small-copy pale-blue-text pt-0">
                  You can remove one or more words and try your search again, or you can choose to submit the name above
                  for examination.
                </v-col>
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      </template>

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
          <v-btn large>Reserve Name and Continue</v-btn>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import NewRequestNameInput from '@/components/new-request/name-input.vue'
import { Component, Vue } from 'vue-property-decorator'
import { IssueI } from '@/models'
import NameWordRenderer from '@/components/new-request/analyzed-name-word-renderer'

@Component({
  components: { NewRequestNameInput, NameWordRenderer }
})
export default class AnalyzeResults extends Vue {
  issueIndex: number = 0
  openedCategory: string = ''
  showActualInput: boolean = false

  get brackets () {
    let index: number = (this.nameActions as any).findIndex((action: any) => action.type === 'add_word_brackets')
    if (index !== null && this.nameActions[index] !== null && index >= 0) {
      let position: string | undefined = (this.nameActions[index] as any).position
      let message: string | undefined = (this.nameActions[index] as any).message
      return {
        index,
        position,
        message
      }
    }
    return null
  }
  get conflicts () {
    if ((this.issue as IssueI) && (this.issue as IssueI).conflicts) {
      return (this.issue as IssueI).conflicts
    }
    return null
  }
  get descriptiveWords () {
    if ((this.issue as IssueI) && (this.issue as IssueI).descriptive_words) {
      return (this.issue as IssueI).descriptive_words
    }
    return null
  }
  get designations () {
    if ((this.issue as IssueI) && (this.issue as IssueI).designations) {
      return (this.issue as IssueI).designations.join(', ')
    }
    return null
  }
  get entityText () {
    return newReqModule.entityTextFromValue
  }
  get entityType () {
    return newReqModule.entityType
  }
  get indexedName () {
    return newReqModule.name.split(' ')
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
      let actions = (this.issue as IssueI).name_actions
      return actions
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
  handleSubmit () {}
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

.helpful-hint
  padding: 15px 25px 15px 25px
  border-radius: 4px
  border: 1px dashed $pale-blue
  background-color: $grey-1
  min-width: 80%
  max-width: 80%

.lg-square-card
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

.square-card
  height: 215px
  width: 280px
  padding: 15px 25px 15px 25px
  border-radius: 4px
  border: 1px dashed $pale-blue
  background-color: $grey-1

.strike
  text-decoration-line: line-through

</style>
