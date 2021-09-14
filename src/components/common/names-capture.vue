<template>
  <v-form @keydown="validate" id="send-to-examination-form">
    <v-container fluid class="pa-0" id="send-to-examination-container">
      <template v-if="getEditMode">
        <v-row class="mt-5">
          <v-col cols="6" class="font-weight-bold py-0">I need a name to:</v-col>
          <v-col cols="6" class="d-flex justify-end py-0"></v-col>
        </v-row>

        <v-row class="mt-3">
        <v-col cols="5" class="py-0">
            <v-select :error-messages="getErrors.includes('request_action_cd') ? 'Please select an action' : ''"
                      :hide-details="!getErrors.includes('request_action_cd')"
                      :items="getRequestTypeOptions"
                      @change="clearErrors()"
                      filled
                      id="search-type-options-select"
                      v-model="request_action_cd" />
          </v-col>
          <v-col cols="2" class="py-0">
            <v-select :error-messages="getErrors.includes('location') ? 'Please select a jurisdiction' : ''"
                      :hide-details="!getErrors.includes('location')"
                      :items="getLocationOptions"
                      @change="clearErrors()"
                      filled
                      id="location-options-select"
                      v-model="location" />
          </v-col>
          <v-col cols="5" class="py-0">
            <v-select :error-messages="getErrors.includes('entity_type_cd') ? 'Please select a business type' : ''"
                      :hide-details="!getErrors.includes('entity_type_cd')"
                      :items="getEntityTypeOptions"
                      @change="clearErrors()"
                      filled
                      id="entity-type-options-select"
                      v-model="entity_type_cd" />
          </v-col>
        </v-row>
      </template>

      <v-row class="mt-5" v-if="getEditMode || getIsAssumedName">
        <v-col cols="auto" class="font-weight-bold h5 py-0" v-if="getEditMode">
          Name Choices
        </v-col>
        <v-col cols="auto" class="text-body-3 py-0" v-else-if="getIsAssumedName">
          Name in Home Jurisdiction: {{getName}}
        </v-col>
      </v-row>

      <v-row class="mt-5">
        <v-col cols="2" class="label-style align-self-start pt-0" key="static-1">
          {{choicesLabelsAndHints[0].label}}
        </v-col>
        <transition name="fade" mode="out-in">
          <v-col :key="transitionKey(1)" class="ma-0 pa-0" cols="10">
            <v-row class="ma-0 pa-0" v-if="location === 'BC'">
              <v-col :cols="designationAtEnd ? 8 : 12" class="py-0" >
                <v-text-field :error-messages="messages.name1"
                              :hide-details="hideDetails"
                              :value="nameChoices.name1"
                              @blur="handleBlur()"
                              @input="editChoices('name1', $event, true)"
                              filled
                              id="choice-1-text-field"
                              :label="choicesLabelsAndHints[0].hint"
                              :name="Math.random()"/>
              </v-col>
              <v-col cols="4" class="py-0" v-if="designationAtEnd">
                <v-tooltip top
                  transition="fade-transition"
                  content-class="top-tooltip"
                >
                  <template v-slot:activator="{ on }">
                    <div v-on="on">
                      <v-select :error-messages="des1Message"
                                :hide-details="hideDetails"
                                :items="items"
                                :menu-props="menuProps"
                                :value="nameChoices.designation1"
                                @blur="handleBlur(); showDesignationErrors.des1 = true"
                                @input="editChoices('designation1', $event, true)"
                                filled
                                id="designation-1-select"
                                label="Designation" />
                    </div>
                  </template>
                  <span>Your company name must include a designation.
                  There are no legal differences between these designations.
                  You can choose whichever you prefer.</span>
                </v-tooltip>
              </v-col>
            </v-row>
            <v-row class="ma-0 pa-0" v-else>
              <v-col :cols="getIsAssumedName ? 8 : 12" class="py-0" >
                <v-text-field :error-messages="messages.name1"
                              :hide-details="hideDetails"
                              :value="xproNameWithoutConflict"
                              @blur="handleBlur()"
                              @input="editChoices('name1', $event, true)"
                              :filled="getIsAssumedName"
                              :class="{ 'read-only-mode': !getIsAssumedName }"
                              id="choice-1-text-field"
                              :label="choicesLabelsAndHints[0].hint"
                              :disabled="!getIsAssumedName"
                              :name="Math.random()"/>
              </v-col>
              <v-col cols="4" class="py-0" v-if="getIsAssumedName">
                <v-tooltip top
                  transition="fade-transition"
                  content-class="top-tooltip"
                >
                  <template v-slot:activator="{ on }">
                    <div v-on="on">
                      <v-select :error-messages="des1Message"
                                :hide-details="hideDetails"
                                :items="items"
                                :menu-props="menuProps"
                                :value="nameChoices.designation1"
                                @blur="handleBlur(); showDesignationErrors.des1 = true"
                                @input="editChoices('designation1', $event, true)"
                                filled
                                id="designation-1-select"
                                label="Designation" />
                    </div>
                  </template>
                  <span>Your company name must include a designation.
                  There are no legal differences between these designations.
                  You can choose whichever you prefer.</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-col>
        </transition>
      </v-row>

      <v-row v-if="!getEditMode" class="my-1 py-0 colour-text mt-5">
        <v-col cols="2" class="py-0"></v-col>
        <v-col cols="10" class="py-0 text-body-3">
          <span v-if="location!=='BC'">
            <span v-if="getIsAssumedName">
              You may provide up to two additional assumed names which will be considered at no further
              cost, in the order provided, if your first choice cannot be approved. Be sure to follow all
              <a :href="buildNameURL" target="_blank">
                guidelines for how to build a name.
                <v-icon class="launch-icon">mdi-launch</v-icon>
              </a>
            </span>
            <span v-else-if="!showSecondAndThirdNameChoices">
              <div class="mt-1">
                The name of your business must be the same in BC and in your home jurisdiction.
              </div>
              <div class="mt-5">
                If, after review, your current name is not approved for use in BC you will need to change
                your business name in your home jurisdiction, and request your new name in BC as well.
              </div>
            </span>
            <span v-else>
              You may provide up to two additional assumed names which will be considered at no further cost, in
              the order provided, if the name in the home jurisdiction cannot be approved. Be sure to follow all
              <a :href="buildNameURL" target="_blank">
                guidelines for how to build a name.
                <v-icon class="launch-icon">mdi-launch</v-icon>
              </a>
            </span>
          </span>
          <span v-else>
            You may provide up to two additional names which will be considered at no further cost, in
            the order provided, only if your first choice cannot be approved. Be sure to follow all
            <a :href="buildNameURL" target="_blank">
              guidelines for how to build a name.
              <v-icon class="launch-icon">mdi-launch</v-icon>
            </a>
          </span>
        </v-col>
      </v-row>

      <v-row class="mt-5" v-if="showSecondAndThirdNameChoices">
        <v-col cols="2" class="label-style align-self-start pt-0" key="static-2">
          {{choicesLabelsAndHints[1].label}}
        </v-col>
        <transition name="fade" mode="out-in">
          <v-col :key="transitionKey(2)" class="ma-0 pa-0" cols="10">
            <v-row class="ma-0 pa-0">
              <v-col :cols="designationAtEnd ? 8: 12" class="py-0">
                <v-text-field :error-messages="messages.name2"
                              :hide-details="hideDetails"
                              :value="nameChoices.name2"
                              @blur="handleBlur()"
                              @input="editChoices('name2', $event, true)"
                              filled
                              id="choice-2-text-field"
                              :label="choicesLabelsAndHints[1].hint"
                              :name="Math.random()" />
              </v-col>
              <v-col cols="4" class="py-0" v-if="designationAtEnd">
                <v-tooltip top
                  transition="fade-transition"
                  content-class="top-tooltip"
                >
                  <template v-slot:activator="{ on }">
                    <div v-on="on">
                      <v-select :error-messages="des2Message"
                                :hide-details="hideDetails"
                                :items="items"
                                :menu-props="menuProps"
                                :value="nameChoices.designation2"
                                @blur="handleBlur(); showDesignationErrors.des2 = true"
                                @input="editChoices('designation2', $event, true)"
                                filled
                                id="designation-2-select"
                                label="Designation" />
                    </div>
                  </template>
                  <span>Your company name must include a designation.
                  There are no legal differences between these designations.
                  You can choose whichever you prefer.</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-col>
        </transition>
      </v-row>

      <v-row no gutters class="mt-5" key="static-3" v-if="showSecondAndThirdNameChoices">
        <v-col cols="2" class="label-style align-self-start pt-0">
          {{choicesLabelsAndHints[2].label}}
        </v-col>
        <transition name="fade" mode="out-in">
          <v-col :key="transitionKey(3)" class="ma-0 pa-0" cols="10">
            <v-row class="ma-0 pa-0">
              <v-col :cols="designationAtEnd? 8: 12" class="py-0" style="height:60px">
                <v-text-field :error-messages="messages.name3"
                              :hide-details="hideDetails"
                              :value="nameChoices.name3"
                              @blur="handleBlur()"
                              @input="editChoices('name3', $event)"
                              filled
                              id="choice-3-text-field"
                              :label="choicesLabelsAndHints[2].hint"
                              :name="Math.random()" />
              </v-col>
              <v-col cols="4" class="py-0" style="height: 60px" v-if="designationAtEnd">
                <v-tooltip top
                  transition="fade-transition"
                  content-class="top-tooltip"
                >
                  <template v-slot:activator="{ on }">
                    <div v-on="on">
                      <v-select :error-messages="des3Message"
                                :hide-details="hideDetails"
                                :items="items"
                                :value="nameChoices.designation3"
                                @blur="handleBlur(); showDesignationErrors.des3 = true"
                                @input="editChoices('designation3', $event, true)"
                                filled
                                id="designation-3-select"
                                label="Designation" />
                    </div>
                  </template>
                  <span>Your company name must include a designation.
                  There are no legal differences between these designations.
                  You can choose whichever you prefer.</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-col>
        </transition>
      </v-row>

      <v-row class="mt-7">
        <v-col cols="7" class="py-0" />
        <ApplicantInfoNav @nextAction="validateButton()" />
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import ApplicantInfoNav from '@/components/common/applicant-info-nav.vue'
import { EntityI, NameChoicesIF, NameRequestI, RequestActionsI } from '@/interfaces'
import { sanitizeName } from '@/plugins'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { EntityType, Location, RequestCode } from '@/enums'
import { CommonMixin } from '@/mixins'

@Component({
  components: {
    ApplicantInfoNav
  }
})
export default class NamesCapture extends Mixins(CommonMixin) {
  // Global getters
  @Getter getDisplayedComponent!: string
  @Getter getDesignation!: string
  @Getter getEditMode!: boolean
  @Getter getErrors!: string[]
  @Getter getEntityTypeCd!: EntityType
  @Getter getEntityTypeOptions!: Array<EntityI>
  @Getter getIsAssumedName!: boolean
  @Getter getLocation!: Location
  @Getter getLocationOptions!: any[]
  @Getter getName!: string
  @Getter getNameChoices!: NameChoicesIF
  @Getter getNr!: Partial<NameRequestI>
  @Getter getRequestActionCd!: RequestCode
  @Getter getRequestTypeOptions!: RequestActionsI[]
  @Getter getSubmissionTabNumber!: number

  // Global actions
  @Action setClearErrors!: ActionBindingIF
  @Action setEntityTypeCd!: ActionBindingIF
  @Action setDisplayedComponent!: ActionBindingIF
  @Action setLocation!: ActionBindingIF
  @Action setLocationInfoModalVisible!: ActionBindingIF
  @Action setNameChoices!: ActionBindingIF
  @Action setNameChoicesToInitialState!: ActionBindingIF
  @Action setNRData!: ActionBindingIF
  @Action setPickEntityModalVisible!: ActionBindingIF
  @Action setPickRequestTypeModalVisible!: ActionBindingIF
  @Action setRequestAction!: ActionBindingIF
  @Action setSubmissionTabComponent!: ActionBindingIF
  @Action setSubmissionType!: ActionBindingIF
  @Action startEditName!: ActionBindingIF

  readonly buildNameURL = 'https://www2.gov.bc.ca/gov/content?id=4A6A55FAD204494D9AF0B53BDC13A24F'

  hideDetails: boolean | 'auto' = true
  messages = {
    des1: '',
    des2: '',
    des3: '',
    name1: '',
    name2: '',
    name3: ''
  }
  menuProps = {
    disableKeys: false
  }
  showDesignationErrors = {
    des1: false,
    des2: false,
    des3: false
  }

  async mounted (): Promise<void> {
    // add event listener when this component is mounted
    // eg, when user continues to send for review
    this.$el.addEventListener('keydown', this.handleKeydown)

    this.setNameChoicesToInitialState(null)
    if (this.getIsAssumedName && !this.getEditMode) {
      await this.$nextTick() // FUTURE: remove if not needed
      this.hideDetails = true
      return
    }

    await this.$nextTick() // FUTURE: remove if not needed
    if (this.getEditMode) {
      this.populateNames()
      return
    }

    // if we get here it's a new name
    this.setSubmissionType('examination')
    if (this.getDesignation) this.setNameChoices({ key: 'designation1', value: this.getDesignation })
    this.setNameChoices({ key: 'name1', value: this.getName })

    this.scrollTo('namerequest-sbc-header')
  }

  destroyed () {
    // remove the event listener when this component is destroyed
    // eg, when user clicks Start Search Over
    this.$el.removeEventListener('keydown', this.handleKeydown)
  }

  get isVisible (): boolean {
    const myComponent = (
      this.getDisplayedComponent === 'SubmissionTabs' ||
      this.getDisplayedComponent === 'ExistingRequestEdit'
    )
    const myTab = (this.getSubmissionTabNumber === 1)
    return (myComponent && myTab)
  }

  get showSecondAndThirdNameChoices () {
    if (this.location !== Location.BC) {
      if (this.entity_type_cd === EntityType.XLP ||
        this.entity_type_cd === EntityType.XLL ||
        this.entity_type_cd === EntityType.XCP ||
        this.entity_type_cd === EntityType.XSO) {
        return false
      }
    }
    return true
  }

  get autofocusField () {
    if (this.getIsAssumedName) {
      return 'name1'
    }
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

  get des1Message (): string {
    if (this.showDesignationErrors.des1) {
      return this.messages.des1
    }
    return ''
  }

  get des2Message (): string {
    if (this.showDesignationErrors.des2) {
      return this.messages.des2
    }
    return ''
  }

  get des3Message (): string {
    if (this.showDesignationErrors.des3) {
      return this.messages.des3
    }
    return ''
  }

  get designationAtEnd () {
    if (this.entity_type_cd && this.$designations[this.entity_type_cd]) {
      return this.$designations[this.entity_type_cd].end
    }
    return false
  }

  get choicesLabelsAndHints () {
    if (this.location === 'BC') {
      return [
        {
          'label': 'First Choice',
          'hint': 'First Name Choice'
        },
        {
          'label': 'Second Choice',
          'hint': 'Second Name Choice (Optional)'
        },
        {
          'label': 'Third Choice',
          'hint': 'Third Name Choice (Optional)'
        }
      ]
    } else if (this.getIsAssumedName) {
      return [
        {
          'label': 'Assumed Name First Choice',
          'hint': 'Enter your first choice for an assumed name'
        },
        {
          'label': 'Assumed Name Second Choice',
          'hint': 'Enter your second choice for an assumed name (Optional)'
        },
        {
          'label': 'Assumed Name Third Choice',
          'hint': 'Enter your third choice for an assumed name (Optional)'
        }
      ]
    } else {
      return [
        {
          'label': 'Name in Home Jurisdiction',
          'hint': ''
        },
        {
          'label': 'Assumed Name First Choice',
          'hint': 'Enter your first choice for an assumed name (Optional)'
        },
        {
          'label': 'Assumed Name Second Choice',
          'hint': 'Enter your second choice for an assumed name (Optional)'
        }
      ]
    }
  }

  get entityPhraseChoices () {
    if (!this.entity_type_cd || !this.$designations[this.entity_type_cd]) {
      return []
    }
    let basePhrases = this.$designations[this.entity_type_cd].words
    // these are the inner phrases for the CCC and CP types.  Filtering out CR designations from CPs has no effect
    // and CCC designations are a mix of CR-type ending designations and CCC specific inner phrases so filter out
    // the CR designations for the purposes of this getter
    return basePhrases.filter(phrase => !this.$designations['CR'].words.includes(phrase))
  }

  get entityPhraseRequired (): boolean {
    if (!this.entity_type_cd) return false
    return [EntityType.CC, EntityType.CP].includes(this.entity_type_cd)
  }

  get entityPhraseText (): string {
    return this.entityPhraseChoices.join(', ')
  }

  get entity_type_cd (): EntityType {
    return this.getEntityTypeCd
  }

  set entity_type_cd (type: EntityType) {
    this.setEntityTypeCd(type)
  }

  get entityTypeText (): string {
    return (this.entity_type_cd === EntityType.CC) ? 'Community Contribution Company' : 'Cooperative'
  }

  get isValid (): boolean {
    // invalid if there are any errors
    if (this.getErrors.length > 0) return false

    let { nameChoices, messages, designationAtEnd, validatePhrases, location } = this

    if (this.getIsAssumedName && this.getEditMode) {
      if (!nameChoices['name1']) {
        messages['name1'] = 'Please enter at least one name'
        return false
      }
      messages['name1'] = ''
      return true
    }

    if (this.getIsAssumedName) {
      if (!nameChoices['name1']) {
        if (!nameChoices['name2'] && !nameChoices['name3']) {
          return false
        }
        if (nameChoices['name2'] || nameChoices['name3']) {
          messages['name1'] = 'Please enter a first choice before any subsequent choices'
          return false
        }
      }
      if (designationAtEnd && !nameChoices.designation1) {
        return false
      }
      let outcome = true
      for (let choice of [1, 2, 3]) {
        if (nameChoices[`name${choice}`] === this.getName) {
          messages[`name${choice}`] = 'This is identical to the name you originally entered. Please enter a new name.'
          this.hideDetails = 'auto'
          outcome = false
        }
      }
      return outcome
    }

    function name1 () {
      messages.name1 = ''
      messages.des1 = ''

      validatePhrases('name1')
      if (!nameChoices.name1) {
        if (nameChoices.name2 || nameChoices.name3) {
          messages.name1 = 'Please enter a first choice before any subsequent choices'
        } else {
          messages.name1 = 'Please enter at least one name'
        }
      }
      if (location === 'BC') {
        if (designationAtEnd && !nameChoices.designation1) {
          messages.des1 = 'Please choose a designation'
        }
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
        messages.name2 = 'This is identical to your first name choice. Please enter a unique name.'
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
        messages.name3 = 'This is identical to your first name choice. Please enter a unique name.'
      }
      if (nameChoices.name3 === nameChoices.name2) {
        messages.name3 = 'This is identical to your second name choice. Please enter a unique name.'
      }
      if (designationAtEnd && !nameChoices.designation3) {
        messages.des3 = 'Please choose a designation'
      }
      if (messages.name3 || messages.des3) {
        return false
      }
      return true
    }

    if (this.getEditMode) {
      let outcome = true
      if (designationAtEnd) {
        if (!name1() || !name2() || !name3()) {
          outcome = false
        } else {
          for (let choice of [1, 2, 3]) {
            if (nameChoices[`name${choice}`]) {
              if (!nameChoices[`designation${choice}`]) {
                if (location === 'BC' || this.getIsAssumedName) {
                  messages[`des${choice}`] = 'Please choose a designation'
                  this.showDesignationErrors[`des${choice}`] = true
                  outcome = false
                }
              } else {
                this.messages[`des${choice}`] = ''
              }
            }
          }
        }
        if (!outcome) {
          this.hideDetails = 'auto'
        }
      }
      return outcome
    }

    let step1 = name1()
    let step2 = name2()
    let step3 = name3()

    this.$nextTick(function () {
      if (!(step1 && step2 && step3)) {
        this.hideDetails = 'auto'
      }
    })
    return (step1 && step2 && step3)
  }

  get items (): string[] {
    let output: string[] = this.$designations[this.entity_type_cd].words
    if (this.entity_type_cd === EntityType.CC) {
      output = this.$designations['CR'].words
    }
    return output
  }

  get location (): Location {
    return this.getLocation
  }

  set location (location: Location) {
    this.setLocation(location)
  }

  get nameChoices (): NameChoicesIF {
    return this.getNameChoices
  }

  get request_action_cd (): RequestCode {
    return this.getRequestActionCd
  }

  set request_action_cd (value: RequestCode) {
    this.setRequestAction(value)
    if (value === RequestCode.INFO) {
      this.setPickRequestTypeModalVisible(true)
    }
  }

  get xproNameWithoutConflict () {
    var name = this.nameChoices.name1
    if (!this.getIsAssumedName && this.nameChoices.designation1) {
      name = `${name} ${this.nameChoices.designation1}`
    }
    return name
  }

  clearErrors () {
    this.setClearErrors(null)
  }

  editChoices (key, value, userInitiated = false) {
    if (userInitiated) {
      this.hideDetails = true
      for (let key in this.messages) {
        this.messages[key] = ''
      }
    }
    this.setNameChoices({ key, value })
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
      this.menuProps.disableKeys = true
      this.validateButton()
    }
  }

  populateNames () {
    let nr = this.getNr
    for (let name of nr.names) {
      let { choice } = name
      if (name.designation) {
        this.setNameChoices({ key: `designation${choice}`, value: name.designation })
      }
      this.setNameChoices({ key: `name${choice}`, value: name.name })
    }
    const { nameChoices } = this
    if (nr && nr.names && Array.isArray(nr.names)) {
      for (let choice of [1, 2, 3]) {
        if (nr.names.find(name => name.choice === choice)) {
          let { name } = nr.names.find(name => name.choice === choice)
          if (name.designation && name.name) {
            this.setNameChoices({ key: `name${choice}`, value: name.name })
            this.setNameChoices({ key: `designation${choice}`, value: name.designation })
            continue
          }
          if (this.designationAtEnd) {
            for (let item of this.items) {
              if ([' LTD', ' INC', ' CORP'].some(des => name.endsWith(des))) {
                name = name + '.'
              }
              if (item) {
                if (name.endsWith(item)) {
                  this.setNameChoices({ key: `designation${choice}`, value: item })
                  let value = name.replace(item, '').trim()
                  this.setNameChoices({ key: `name${choice}`, value })
                }
              }
            }
            if (!nameChoices[`name${choice}`]) {
              this.setNameChoices({ key: `name${choice}`, value: name })
            }
          } else {
            this.setNameChoices({ key: `name${choice}`, value: name })
          }
        }
        if (this.designationAtEnd) {
          if (nameChoices[`name${choice}`] && nameChoices[`designation${choice}`]) {
            if (nameChoices[`name${choice}`].endsWith(' ' + nameChoices[`designation${choice}`])) {
              let newName = nameChoices[`name${choice}`].replace(nameChoices[`designation${choice}`], '').trim()
              this.setNameChoices({ key: `name${choice}`, value: newName })
            }
          }
        } else if (this.designationAtEnd && nameChoices[`designation${choice}`]) {
          if (!nameChoices[`name${choice}`].endsWith(nameChoices[`designation${choice}`])) {
            let newName = nameChoices[`name${choice}`] + ' ' + nameChoices[`designation${choice}`]
            this.setNameChoices({ key: `name${choice}`, value: newName })
          }
        }
      }
    }
  }

  showNextTab () {
    this.setSubmissionTabComponent('ApplicantInfo1')
  }

  transitionKey (i) {
    if (this.designationAtEnd) {
      return `transition-state-1-${i}`
    }
    return `transition-state-2-${i}`
  }

  validate (next = false) {
    if (!this.isValid) {
      this.hideDetails = 'auto'
      this.menuProps.disableKeys = false
      return
    }
    this.hideDetails = true
    if (next) {
      this.showNextTab()
    }
  }

  validateButton () {
    for (let key in this.showDesignationErrors) {
      this.showDesignationErrors[key] = true
    }
    this.startEditName(null)
    this.validate(true)
  }

  validatePhrases (choice: string) {
    if (this.entityPhraseRequired) {
      const name = this.nameChoices[choice].toUpperCase()
      if (this.entityPhraseChoices.every(phrase => {
        phrase = phrase.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
        return (name.search(new RegExp('(\\s)' + phrase + '(\\s|$)')) === -1)
      })) {
        this.messages[choice] = `A ${this.entityTypeText} name must include (but not start with)
          one of the following phrases: ${this.entityPhraseText}`
      }
      if (this.entityPhraseChoices.some(phrase => name.startsWith(phrase))) {
        this.messages[choice] = `A ${this.entityTypeText} name must not begin with one of the
          following phrases: ${this.entityPhraseText}`
      }
    }
  }

  @Watch('isValid')
  onValidChanged (val: boolean) {
    if (val) {
      this.$nextTick(() => {
        if (this.$el?.querySelector instanceof Function) {
          // add classname to button text (for more detail in Sentry breadcrumbs)
          const choicesContinueBtn = this.$el.querySelector('.submit-continue-btn > span')
          if (choicesContinueBtn) choicesContinueBtn.classList.add('choices-continue-btn')
        }
      })
    }
  }

  @Watch('isVisible')
  private onVisibleChanged (val: boolean) {
    if (val) {
      // add event listener when this component is displayed
      // eg, when user comes back from next tab
      this.$el.addEventListener('keydown', this.handleKeydown)
    } else {
      // remove the event listener when this component is hidden
      // eg, when user continues to next tab
      this.$el.removeEventListener('keydown', this.handleKeydown)
    }
  }

  @Watch('request_action_cd')
  updateLocationOnAssumedName (newVal: RequestCode, oldVal: RequestCode) {
    if (newVal === RequestCode.ASSUMED && this.location === Location.BC) {
      this.location = Location.CA
    }
  }

  @Watch('entity_type_cd')
  handleEntityType (newVal: EntityType, oldVal: EntityType) {
    // special case for sub-menu
    if (newVal === EntityType.INFO) {
      this.setPickEntityModalVisible(true)
      this.entity_type_cd = oldVal
    }
  }

  @Watch('location')
  handleLocation (newVal: Location, oldVal: Location) {
    // reset search values when location has changed
    if (newVal !== oldVal) {
      this.setNRData({ key: 'xproJurisdiction', value: '' })
      this.setNRData({ key: 'name', value: '' })
      this.setNRData({ key: 'corpSearch', value: '' })
      this.setNRData({ key: 'homeJurisNum', value: '' })
    }

    // special case for sub-menu
    if (newVal === Location.INFO) {
      let type = this.entity_type_cd
      this.setLocationInfoModalVisible(true)
      this.$nextTick(function () {
        this.location = oldVal
        this.entity_type_cd = type
      })
    } else {
      this.$nextTick(function () {
        if (this.getEditMode) {
          this.populateNames()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/theme.scss";

::v-deep .v-messages__message {
  line-height: 14px !important;
}

.label-style {
  font-size: 1rem;
  font-weight: bold;
  color: $gray9;
}

.launch-icon {
  display: inline-block;
  font-size: 0.875rem;
  color: $app-blue;
}

::v-deep .read-only-mode .v-input__slot:not(.v-input--checkbox .v-input__slot) {
  background-color: transparent !important;
}

::v-deep .theme--light.v-input--is-disabled input, .theme--light.v-input--is-disabled textarea {
  color: $gray9 !important;
}
</style>
