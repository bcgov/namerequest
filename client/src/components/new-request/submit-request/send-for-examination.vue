<template>
  <v-form @keydown="validate" id="send-to-examination-form">
    <v-container fluid class="pa-0 pt-9" id="send-to-examination-container">
      <v-row>
        <v-col cols="2" class="py-0 h5" align-self="start">
          First Choice
        </v-col>
        <v-col :cols="designationAtEnd ? 7 : 10" class="py-0">
          <v-text-field :autofocus="autofocusField === 'name1'"
                        :error-messages="messages.name1"
                        :hide-details="hide"
                        :value="nameChoices.name1"
                        @blur="handleBlur()"
                        @input="editChoices('name1', $event)"
                        filled
                        id="choice-1-text-field" />
        </v-col>
        <v-col cols="3" class="py-0" v-if="designationAtEnd">
          <v-select :autofocus="autofocusField === 'des1'"
                    :error-messages="des1Message"
                    :hide-details="hide"
                    :items="items"
                    :menu-props="props"
                    :value="nameChoices.designation1"
                    @blur="handleBlur(); showDesignationErrors.des1 = true"
                    @input="editChoices('designation1', $event)"
                    filled
                    id="designation-1-select"
                    placeholder="Designation" />
        </v-col>
      </v-row>
      <v-row class="grey-text">
        <v-col cols="10" v-if="entityPhraseRequired" class="mt-n2">
          A {{ entityType === 'CC' ? 'Community Contribution Company' : 'Cooperative'}} name must
          include (but not start with) one of the following phrases: <b>{{ entityPhraseText }}</b></v-col>
        <v-col cols="9">You may provide up to two additional names which will be considered at no further cost, in the
                        order provided, only if your First Choice cannot be approved.</v-col>
      </v-row>
      <v-row class="mt-2">
        <v-col cols="2" class="py-0 h5" align-self="start">
          Second Choice
        </v-col>
        <v-col :cols="designationAtEnd ? 7 : 10" class="py-0">
          <v-text-field :autofocus="autofocusField === 'name2'"
                        :error-messages="messages.name2"
                        :hide-details="hide"
                        :value="nameChoices.name2"
                        @blur="handleBlur()"
                        @input="editChoices('name2', $event)"
                        filled
                        id="choice-2-text-field"
                        placeholder="Second Alternate Name (Optional)" />
        </v-col>
        <v-col cols="3" class="py-0" v-if="designationAtEnd">
          <v-select :error-messages="des2Message"
                    :hide-details="hide"
                    :items="items"
                    :menu-props="props"
                    :value="nameChoices.designation2"
                    @blur="handleBlur(); showDesignationErrors.des2 = true"
                    @input="editChoices('designation2', $event)"
                    filled
                    id="designation-2-select"
                    placeholder="Designation" />
        </v-col>
      </v-row>
      <v-row no gutters class="mt-2">
        <v-col cols="2" class="py-0 h5" align-self="start">
          Third Choice
        </v-col>
        <v-col :cols="designationAtEnd ? 7 : 10" class="py-0" style="height:60px">
          <v-text-field :error-messages="messages.name3"
                        :hide-details="hide"
                        :value="nameChoices.name3"
                        @blur="handleBlur()"
                        @input="editChoices('name3', $event)"
                        filled
                        id="choice-3-text-field"
                        placeholder="Third Alternate Name (Optional)" />
        </v-col>
        <v-col cols="3" class="py-0" style="height: 60px" v-if="designationAtEnd">
          <v-select :error-messages="des3Message"
                    :hide-details="hide"
                    :items="items"
                    :value="nameChoices.designation3"
                    @blur="handleBlur(); showDesignationErrors.des3 = true"
                    @input="editChoices('designation3', $event)"
                    filled
                    id="designation-3-select"
                    placeholder="Designation" />
        </v-col>
      </v-row>
      <v-row class="mt-3">
        <v-col cols="12" class="text-right">
          <v-btn x-large
                 v-if="isValid"
                 id="submit-continue-btn"
                 @click="validate(true)">Continue</v-btn>
          <v-btn x-large
                 v-else
                 id="submit-continue-btn-disabled"
                 @click="validateButton">Continue</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Watch } from 'vue-property-decorator'
import designations from '@/store/list-data/designations'
import { sanitizeName } from '@/plugins/utilities'

@Component({})
export default class SendForExamination extends Vue {
  hide: boolean | 'auto' = true
  messages = {
    des1: '',
    des2: '',
    des3: '',
    name1: '',
    name2: '',
    name3: ''
  }
  showDesignationErrors = {
    des1: false,
    des2: false,
    des3: false
  }
  props = {
    disableKeys: false
  }

  mounted () {
    this.$el.addEventListener('keydown', this.handleKeydown)
    newReqModule.mutateSubmissionType('examination')
    newReqModule.mutateNameChoicesToInitialState()
    this.$nextTick(function () {
      if (this.designationAtEnd) {
        for (let item of this.items) {
          let { name } = this
          if ([' LTD', ' INC', ' CORP'].some(des => name.endsWith(des))) {
            name = name + '.'
          }
          if (item) {
            if (name.endsWith(item)) {
              this.editChoices('designation1', item)
              let value = name.replace(item, '').trim()
              newReqModule.mutateNameChoices({ key: 'name1', value })
              return
            }
          }
        }
      }
      newReqModule.mutateNameChoices({ key: 'name1', value: this.name })
    })
  }
  destroyed () {
    this.$el.removeEventListener('keydown', this.handleKeydown)
  }

  get autofocusField () {
    let output = 'name2'
    if (this.designationAtEnd) {
      if (!this.messages.name1 && !this.messages.des1) {
        return output
      }
      if (this.messages.des1) {
        output = 'des1'
      }
      if (this.messages.name1) {
        output = 'name1'
      }
      return output
    }
    if (this.messages.name1) {
      output = 'name1'
    }
    return output
  }
  get des1Message () {
    if (this.showDesignationErrors.des1) {
      return this.messages.des1
    }
    return ''
  }
  get des2Message () {
    if (this.showDesignationErrors.des2) {
      return this.messages.des2
    }
    return ''
  }
  get des3Message () {
    if (this.showDesignationErrors.des3) {
      return this.messages.des3
    }
    return ''
  }
  get designationAtEnd () {
    if (this.location === 'BC') {
      return designations[this.entityType].end
    }
    return false
  }
  get entityPhraseChoices () {
    let basePhrases = designations[this.entityType].words
    // these are the inner phrases for the CCC and CP types.  Filtering out CR designations from CPs has no effect
    // and CCC designations are a mix of CR-type ending designations and CCC specific inner phrases so filter out
    // the CR designations for the purposes of this getter
    return basePhrases.filter(phrase => !designations['CR'].words.includes(phrase))
  }
  get entityPhraseRequired () {
    return ['CC', 'CP'].includes(this.entityType)
  }
  get entityPhraseText () {
    return this.entityPhraseChoices.join(', ')
  }
  get entityType () {
    return newReqModule.entityType
  }
  get isValid () {
    let { nameChoices, messages, designationAtEnd, validatePhrases } = this
    function name1 () {
      messages.name1 = ''
      messages.des1 = ''

      validatePhrases('name1')
      if (!nameChoices.name1) {
        messages.name1 = 'Please enter at least one name'
      }
      if (designationAtEnd && !nameChoices.designation1) {
        messages.des1 = 'Please choose a designation'
      }
      if (messages.name1 || messages.des1) {
        return false
      }
      return true
    }
    function name2 () {
      messages.name2 = ''
      messages.des2 = ''

      if (!nameChoices.name2) {
        return true
      }
      validatePhrases('name2')
      if (nameChoices.name2 === nameChoices.name1) {
        messages.name2 = 'This is identical to your first name choice.  Please enter a unique name'
      }
      if (designationAtEnd && !nameChoices.designation2) {
        messages.des2 = 'Please choose a designation'
      }
      if (messages.name2 || messages.des2) {
        return false
      }
      return true
    }
    function name3 () {
      messages.name3 = ''
      messages.des3 = ''
      if (!nameChoices.name3) {
        return true
      }
      if (!nameChoices.name2) {
        messages.name3 = 'Please choose a second name before entering a third name'
        return false
      }
      validatePhrases('name3')
      if (nameChoices.name3 === nameChoices.name1) {
        messages.name3 = 'This is identical to your first name choice.  Please enter a unique name'
      }
      if (nameChoices.name3 === nameChoices.name2) {
        messages.name3 = 'This is identical to your second name choice.  Please enter a unique name'
      }
      if (designationAtEnd && !nameChoices.designation3) {
        messages.des3 = 'Please choose a designation'
      }
      if (messages.name3 || messages.des3) {
        return false
      }
      return true
    }

    let step1 = name1()
    let step2 = name2()
    let step3 = name3()
    return (step1 && step2 && step3
    )
  }
  get items () {
    let output: string[] = designations[this.entityType].words
    if (this.entityType === 'CC') {
      output = designations['CR'].words
    }
    output.unshift('')
    return output
  }
  get location () {
    return newReqModule.location
  }
  get name () {
    return newReqModule.name
  }
  get nameChoices () {
    return newReqModule.nameChoices
  }
  get requestAction () {
    return newReqModule.requestAction
  }

  autoCapitalize (key: string) {
    let value = sanitizeName(this.nameChoices[key])
    newReqModule.mutateNameChoices({ key, value })
  }
  editChoices (key, value) {
    this.hide = true
    for (let key in this.messages) {
      this.messages[key] = ''
    }
    newReqModule.mutateNameChoices({ key, value })
  }
  handleBlur () {
    for (let key in this.nameChoices) {
      let value = this.nameChoices[key] ? sanitizeName(this.nameChoices[key]) : ''
      this.editChoices(key, value)
    }
    this.validate()
  }
  handleKeydown (event) {
    if (event.key === 'Enter') {
      this.props.disableKeys = true
      this.validateButton()
    }
  }
  showNextTab () {
    newReqModule.mutateSubmissionTabComponent('ApplicantInfo1')
  }
  validate (next = false) {
    if (!this.isValid) {
      this.hide = 'auto'
      this.props.disableKeys = false
      return
    }
    this.hide = true
    if (next) {
      this.showNextTab()
    }
  }
  validateButton () {
    for (let key in this.showDesignationErrors) {
      this.showDesignationErrors[key] = true
    }
    this.validate(true)
  }
  validatePhrases (choice: string) {
    let name = this.nameChoices[choice]
    if (this.entityPhraseRequired) {
      let name = this.nameChoices[choice].toUpperCase()
      if (this.entityPhraseChoices.every(phrase => {
        phrase = phrase.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
        return (name.search(new RegExp('(\\s)' + phrase + '(\\s|$)')) === -1)
      })) {
        this.messages[choice] = 'Your name must contain one of the required phrases'
      }
      if (this.entityPhraseChoices.some(phrase => name.startsWith(phrase))) {
        this.messages[choice] = 'Your name must not begin with one of the required phrases'
      }
    }
  }
}
</script>

<style lang="sass">

</style>
