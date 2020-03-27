<template>
  <v-form v-model="isValid">
    <v-container fluid class="pa-0 pt-9">
      <v-row>
        <v-col cols="2" class="py-0 h5" align-self="start">
          First Choice
        </v-col>
        <v-col :cols="designationAtEnd ? 7 : 10" class="py-0">
          <v-text-field filled
                        :error-messages="name1Message"
                        :readonly="designationAtEnd"
                        id="choice-1-text-field"
                        @input="editChoices('name1', $event)"
                        :value="nameChoices.name1" />
        </v-col>
        <v-col cols="3" class="py-0" v-if="designationAtEnd">
          <v-select filled
                    :error-messages="des1Message"
                    hide-details="auto"
                    :items="items"
                    placeholder="Designation"
                    id="designation-1-select"
                    @input="editChoices('designation1', $event)"
                    :value="nameChoices.designation1" />
        </v-col>
      </v-row>
      <v-row class="grey-text">
        <v-col cols="9">You may provide up to two additional names which will be considered at no further cost, in the
                        order provided, only if your First Choice cannot be approved.</v-col>
      </v-row>
      <v-row class="mt-2">
        <v-col cols="2" class="py-0 h5" align-self="start">
          Second Choice
        </v-col>
        <v-col :cols="designationAtEnd ? 7 : 10" class="py-0">
          <v-text-field filled
                        hide-details
                        id="choice-2-text-field"
                        placeholder="Second Alternate Name (Optional)"
                        @input="editChoices('name2', $event)"
                        :value="nameChoices.name2" />
        </v-col>
        <v-col cols="3" class="py-0" v-if="designationAtEnd">
          <v-select filled
                    :error-messages="des2Message"
                    hide-details="auto"
                    placeholder="Designation"
                    :items="items"
                    id="designation-2-select"
                    @input="editChoices('designation2', $event)"
                    :value="nameChoices.designation2" />
        </v-col>
      </v-row>
      <v-row no gutters class="mt-2">
        <v-col cols="2" class="py-0 h5" align-self="start">
          Third Choice
        </v-col>
        <v-col :cols="designationAtEnd ? 7 : 10" class="py-0" style="height:60px">
          <v-text-field filled
                        :error-messages="name3Message"
                        hide-details="auto"
                        id="choice-3-text-field"
                        placeholder="Third Alternate Name (Optional)"
                        @input="editChoices('name3', $event)"
                        :value="nameChoices.name3" />
        </v-col>
        <v-col cols="3" class="py-0" style="height: 60px" v-if="designationAtEnd">
          <v-select filled
                    :error-messages="des3Message"
                    hide-details="auto"
                    :items="items"
                    id="designation-3-select"
                    placeholder="Designation"
                    @input="editChoices('designation3', $event)"
                    :value="nameChoices.designation3" />
        </v-col>
      </v-row>
      <v-row class="mt-3">
        <v-col cols="12" class="text-right">
          <v-btn x-large
                 v-if="choice1Valid && choice2Valid && choice3Valid"
                 id="submit-continue-btn"
                 @click="showNextTab()">Continue</v-btn>
          <v-btn x-large
                 v-else
                 id="submit-continue-btn-disabled"
                 @click="validate()">Continue</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Watch } from 'vue-property-decorator'
import designations from '@/store/list-data/designations'

@Component({})
export default class SendForExamination extends Vue {
  des1Message = ''
  des2Message = ''
  des3Message = ''
  name1Message = ''
  name3Message = ''
  isValid: boolean = false

  mounted () {
    newReqModule.mutateSubmissionType('examination')
    this.$nextTick(function () {
      if (this.designationAtEnd) {
        for (let item of this.items) {
          if (this.name.endsWith(item.text)) {
            this.editChoices('designation1', item.text)
            let value = this.name.replace(item.text, '').trim()
            newReqModule.mutateNameChoices({ key: 'name1', value })
            return
          }
        }
      }
    })
    newReqModule.mutateNameChoices({ key: 'name1', value: this.name })
  }

  get choice1Valid () {
    if (this.designationAtEnd) {
      if (this.nameChoices.designation1) {
        return true
      }
      return false
    }
    if (this.nameChoices.name1) {
      return true
    }
    return false
  }
  get choice2Valid () {
    let choices = this.nameChoices
    if (!choices.name2) {
      return true
    }
    if (this.designationAtEnd) {
      if (choices.name2 && choices.designation2) {
        return true
      }
      return false
    }
    if (!choices.name1) {
      return false
    }
    return true
  }
  get choice3Valid () {
    let choices = this.nameChoices
    if (!choices.name3) {
      return true
    }
    if (this.designationAtEnd) {
      if (choices.name2 && choices.designation3) {
        return true
      }
      return false
    }
    if (this.nameChoices.name1 && this.nameChoices.name2) {
      return true
    }
    return false
  }
  get entityType () {
    return newReqModule.entityType
  }
  get designationAtEnd () {
    return designations[this.entityType].end
  }
  get name () {
    return newReqModule.name
  }
  get nameChoices () {
    return newReqModule.nameChoices
  }
  get items () {
    return newReqModule.designationItems
  }

  editChoices (key, value) {
    value = value.toUpperCase()
    newReqModule.mutateNameChoices({ key, value })
    let messages = ['des1Message', 'des2Message', 'des3Message', 'name1Message', 'name3Message']
    messages.forEach(messsage => {
      this[messsage] = ''
    })
  }
  showNextTab () {
    newReqModule.mutateSubmissionTabComponent('ApplicantInfo1')
  }
  validate () {
    if (!this.choice1Valid) {
      this.des1Message = 'Required Field'
    }
    if (!this.choice2Valid) {
      this.des2Message = 'Required Field'
    }
    if (!this.choice3Valid) {
      if (this.nameChoices.name3 && !this.nameChoices.name2) {
        this.name3Message = 'Please enter a second choice before entering your third choice'
      } else {
        this.des3Message = 'Required Field'
      }
    }
    if (!this.designationAtEnd && !this.nameChoices.name1) {
      this.name1Message = 'Please enter a first choice'
    }
  }
}
</script>

<style lang="sass">

</style>
