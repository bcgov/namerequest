<template>
  <v-form v-model="isValid" ref="step2" id="applicant-info-3-form">
    <v-container fluid class="pa-0">
      <v-row>
        <v-col cols="2" class="h5" align-self="start">
        Contact Info
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['contact']"
                        :value="applicant.contact"
                        @blur="messages = {}"
                        @focus="messages['contact'] = 'Contact Name (if other than applicant. optional)'"
                        @input="mutateApplicant('contact', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Contact Name (if is not applicant, optional)" />
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['email']"
                        :rules="emailRules"
                        :value="applicant.emailAddress"
                        @blur="messages = {}"
                        @focus="messages['email'] = 'Notification Email'"
                        @input="mutateApplicant('emailAddress', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Email Address (for notifications)" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="2" />
        <v-col cols="5">
          <v-text-field :messages="messages['phone']"
                        :value="applicant.phoneNumber"
                        @blur="messages = {}"
                        @focus="messages['phone'] = 'Phone Number (Optional)'"
                        @input="mutateApplicant('phoneNumber', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Phone Number (Optional)" />
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['fax']"
                        :value="applicant.faxNumber"
                        @blur="messages = {}"
                        @focus="messages['fax'] = 'Fax Number (Optional)'"
                        @input="mutateApplicant('faxNumber', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Fax Number (Optional)" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="2" class="h5" align-self="start">
          Client
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['clientLast']"
                        :value="applicant.clientLastName"
                        @blur="messages = {}"
                        @focus="messages['clientLast'] = 'Last Name'"
                        @input="mutateApplicant('clientLastName', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Last Name" />
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['clientFirst']"
                        :value="applicant.clientFirstName"
                        @blur="messages = {}"
                        @focus="messages['clientFirst'] = 'First Name'"
                        @input="mutateApplicant('clientFirstName', $event)"
                        filled
                        hide-details="auto"
                        placeholder="First Name" />
        </v-col>
      </v-row>
      <v-row v-if="showAllFields">
        <v-col cols="2" class="h5" align-self="start">
          About The Business
        </v-col>
        <v-col cols="5" align-self="start">
          <v-textarea :messages="messages['nature']"
                      :rules="requiredRule"
                      :value="nrData.natureBusinessInfo"
                      @blur="messages = {}"
                      @focus="messages['nature'] = 'Nature of Business'"
                      @input="mutateNRData('natureBusinessInfo', $event)"
                      filled
                      hide-details="auto"
                      placeholder="Nature of Business"
                      rows="3" />
        </v-col>
        <v-col cols="5" align-self="start">
          <v-textarea :messages="messages['additional']"
                      :value="nrData.additionalInfo"
                      @blur="messages = {}"
                      @focus="messages['additional'] = 'Additional Info'"
                      @input="mutateNRData('additionalInfo', $event)"
                      filled
                      hide-details="auto"
                      placeholder="Additional Business Info (Optional)"
                      rows="3" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="2" />
        <v-col cols="5" v-if="showCorpNum">
          <v-text-field :messages="messages['corpNum']"
                        :rules="corpNumRules"
                        :error-messages="corpNumError"
                        validate-on-blur
                        @blur="messages = {}"
                        :loading="loading"
                        @focus="messages['corpNum'] = 'Incorporation Number (required)'"
                        filled
                        v-on:update:error="setError"
                        :hide-details="hideCorpNum"
                        placeholder="Incorporation Number (required)"
                        v-model="corpNum">
            <template v-slot:append>
              <v-icon :class="showCorpNumErrorState ? 'red--text' : 'green--text'"
                      v-if="hideCorpNum === 'auto'">
                {{ error || loading || corpNumDirty ? 'mdi-close' : 'mdi-check' }}</v-icon>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="5">
          <v-text-field :messages="messages['tradeMark']"
                        :value="nrData.tradeMark"
                        @blur="messages = {}"
                        @focus="messages['tradeMark'] = 'Registered Trademark (Optional)'"
                        @input="mutateNRData('tradeMark', $event)"
                        filled
                        hide-details="auto"
                        placeholder="Registered Trademark (Optional)" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="2" />
        <v-col cols="5" align-self="end" class="mt-1" v-if="showPriorityRequest">
          <v-checkbox v-model="priorityRequest" class="ma-0 pa-0">
            <template v-slot:label>
              Priority Request - <b>$100 Fee</b>
            </template>
          </v-checkbox>
        </v-col>
        <v-col v-else cols="5" />
        <ApplicantInfoNav :isValid="isValid" />
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import ApplicantInfoNav from '@/components/common/applicant-info-nav.vue'
import newReqModule, { NewRequestModule } from '@/store/new-request-module'
import paymentModule from '@/modules/payment'
import { Component, Vue, Watch } from 'vue-property-decorator'

@Component({
  components: {
    ApplicantInfoNav
  }
})
export default class ApplicantInfo3 extends Vue {
  corpNumDirty: boolean = false
  corpNumError: string = ''
  corpNumRules = [
    v => !!v || 'Required field',
    v => !!this.getCorpNum(v) || 'Cannot validate number.  Please try again'
  ]
  emailRules = [
    v => !!v || 'Required field',
    v => /.+@.+/.test(v) || 'Not a valid email'
  ]
  error: boolean = false
  isValid: boolean = false
  hideCorpNum: boolean | 'auto' = true
  loading: boolean = false
  messages = {}
  requiredRule = [
    v => !!v || 'Required field'
  ]

  @Watch('xproJurisdiction')
  async hanldeJurisdiction (newVal, oldVal) {
    if (newVal !== oldVal) {
      await this.$nextTick()
      this.validate()
    }
  }

  get applicant () {
    return newReqModule.applicant
  }
  get corpNum () {
    return newReqModule.corpNum
  }
  get editMode () {
    return newReqModule.editMode
  }
  get isPersonsName () {
    return newReqModule.isPersonsName
  }
  get location () {
    return newReqModule.location
  }
  get nr () {
    const nameRequest: NewRequestModule = newReqModule
    const nr: Partial<any> = nameRequest.nr || {}
    return nr
  }
  get nrData () {
    return newReqModule.nrData
  }
  get nrId () {
    return newReqModule.nrId
  }
  get nrNum () {
    return newReqModule.nrNum
  }
  get nrState () {
    return newReqModule.nrState
  }
  get priorityRequest () {
    return newReqModule.priorityRequest
  }
  get request_action_cd () {
    return newReqModule.request_action_cd
  }
  get showAllFields () {
    return (!this.editMode || this.nrState === 'DRAFT')
  }
  get showCorpNum () {
    return newReqModule.showCorpNum
  }
  get showPriorityRequest () {
    return newReqModule.showPriorityRequest
  }
  get submissionType () {
    return newReqModule.submissionType
  }
  get xproJurisdiction () {
    return (newReqModule.nrData || {}).xproJurisdiction
  }
  set corpNum (num) {
    if (!this.corpNumDirty) {
      this.corpNumDirty = true
    }
    if (this.isValid) {
      this.isValid = false
    }
    if (this.hideCorpNum !== 'auto') {
      this.hideCorpNum = 'auto'
    }
    newReqModule.mutateCorpNum(num)
  }
  set priorityRequest (value) {
    newReqModule.mutatePriorityRequest(value)
  }

  async submit () {
    if (this.editMode) {
      await newReqModule.patchNameRequests()
    } else {
      const { nrId } = this
      if (!nrId) {
        await newReqModule.postNameRequests('draft')
      } else {
        if (!this.editMode && ['COND-RESERVE', 'RESERVED'].includes(this.nrState)) {
          let request = await newReqModule.getNameRequest(nrId)
          if (request.stateCd === 'CANCELLED') {
            newReqModule.setActiveComponent('Timeout')
            return
          }
        }
        await newReqModule.putNameReservation(nrId)
      }
      await paymentModule.togglePaymentModal(true)
    }
  }
  clearValidation () {
    if (this.$refs.step2 as Vue) {
      (this.$refs.step2 as any).resetValidation()
    }
    this.corpNumError = ''
  }
  async getCorpNum (num) {
    if (!num) {
      return
    }
    if (num.length < 4) {
      this.corpNumError = 'Too short.  Please confirm number.'
      return
    }
    this.loading = true
    try {
      let resp = await newReqModule.getCorpNum(num)
      this.corpNumError = ''
      this.loading = false
      this.corpNumDirty = false
      return true
    } catch (error) {
      this.corpNumError = 'Error validating number. Please try again'
      this.loading = false
      this.corpNumDirty = false
      return false
    }
  }
  mutateApplicant (key, value) {
    this.clearValidation()
    newReqModule.mutateApplicant({ key, value })
  }
  mutateNRData (key, value) {
    this.clearValidation()
    newReqModule.mutateNRData({ key, value })
  }
  setError (error) {
    this.error = error
  }
  showPreviousTab () {
    newReqModule.mutateSubmissionTabComponent('ApplicantInfo1')
  }
  validate () {
    if (this.hideCorpNum !== 'auto') {
      this.hideCorpNum = 'auto'
    }
    if (this.$refs.step2 as any) {
      (this.$refs.step2 as any).validate()
    }
  }
}
</script>
