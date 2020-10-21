<template>
  <MainContainer id="existing-request-display">
    <template v-slot:container-header>
      <v-col cols="auto">
        <b>Your search returned the following Name Request:</b>
      </v-col>
    </template>
    <template v-slot:content>
      <v-row align="start" v-if="nr.nrNum">
        <v-col cols="auto" class="fs-24">
          <span class="h3 mr-2">{{ nr.nrNum }}</span>
        </v-col>
        <v-col class="copy-bold">
          <div style="display: inline-block" class="">
            <div v-for="name of names"
                 :class="getNameFormatting(name).class"
                 :key="name.choice+'-name'">{{ `${name.choice}) ${name.name}` }}
              <v-icon v-if="getNameFormatting(name).icon" :class="getNameFormatting(name).class"
                      style="font-size: 20px; position: relative; top: -3px;">
                {{ getNameFormatting(name).icon }}</v-icon>
              <a class="link-sm ml-3"
                 @click.prevent="showConditionsModal"
                 href="#"
                 v-if="name.state === 'CONDITION'">Conditions</a>
            </div>
          </div>
        </v-col>
      </v-row>
      <transition mode="out-in" name="fade">
        <v-row style="background-color: rgba(165,205,230,0.31)"
               :key="furnished"
               class="mx-1"
               v-if="disableUnfurnished">
          <v-col cols="12"
                 key="initial-msg"
                 class="copy-normal font-italic">
            We are currently processing your request.
            Click<a class="link" href="#" @click.prevent="refresh"> Refresh </a>
            {{ $route.query && $route.query.paymentId ? '' : 'or retry your search ' }}
            after 5 mins to enable all the buttons below.
          </v-col>
        </v-row>
      </transition>
      <transition mode="out-in" name="fade">
        <v-row :key="refreshCount">
          <v-col cols="12">
            <v-row class="pt-3">
              <v-col cols="9">
                <v-row dense class="mt-n5">
                  <v-col cols="12">
                    <span class="fw-700">Last Update: </span> {{ lastUpdate }}
                  </v-col>
                  <v-col cols="12">
                    <span class="fw-700">Status: </span> {{ nr.state }}
                  </v-col>
                  <v-col cols="12">
                    <span class="fw-700">Priority Request: </span> {{ priorityReq ? 'Yes' : 'No' }}
                  </v-col>
                  <v-col cols="12">
                    <span class="fw-700">Expiry Date: </span> {{ expiryDate }}
                  </v-col>
                  <v-col cols="12">
                    <span class="fw-700">Submit Count: </span>{{ nr.submitCount }}
                  </v-col>
                  <v-col cols="12" v-if="nr.consentFlag && nr.consentFlag !== 'N'">
                    <span class="fw-700">Consent Rec'd: </span> {{ consentDate }}
                  </v-col>
                  <v-col cols="12">
                    <span class="fw-700">Submitting Party: </span> {{ nr.applicants.lastName }},
                    {{ nr.applicants.firstName }}
                  </v-col>
                  <v-col cols="12">
                    <span class="fw-700">Address: </span> {{ address }}
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="3" v-if="nr.state !== 'CANCELLED'">
                <v-row dense>
                  <v-col cols="12" v-for="action of actions" :key="action+'-button'">
                    <v-btn @click="handleButtonClick(action)"
                           block
                           :disabled="disableUnfurnished && action !== 'RECEIPT'">{{ action }}</v-btn>
                  </v-col>
                  <!--<v-btn @click="activateILModal">incorporate now</v-btn>-->
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </transition>
    </template>
  </MainContainer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Moment from 'moment'

import MainContainer from '@/components/new-request/main-container.vue'
import newReqModule, { EXISTING_NR_TIMER_NAME, EXISTING_NR_TIMEOUT_MS } from '@/store/new-request-module'
import paymentModule from '@/modules/payment'
import timerModule from '@/modules/vx-timer'
import * as types from '@/store/types'

@Component({
  components: { MainContainer }
})
export default class ExistingRequestDisplay extends Vue {
  daysBeforeExpiry: number = 5
  checking: boolean = false
  refreshCount: number = 0
  furnished: string = 'notfurnished'

  get actions () {
    return this.nr.actions
  }
  get address () {
    let fields = ['addrLine2', 'city', 'stateProvinceCd', 'countryCd', 'postalCd']
    let output: string = this.nr.applicants.addrLine1
    for (let field of fields) {
      if (this.nr.applicants[field]) {
        output += ', ' + this.nr.applicants[field]
      }
    }
    return output
  }
  get addressLines () {
    let output = [ this.nr.applicants.addrLine1 ]
    if (this.nr.applicants.addrLine2) {
      output.push(this.nr.applicants.addrLine2)
    }
    return output
  }
  get cityProvPostal () {
    let { applicants } = this.nr
    return applicants.city + ', ' + applicants.stateProvinceCd + ', ' + applicants.postalCd
  }
  get condition () {
    if (this.nr.names.some(name => name.state === 'CONDITION' && name.decision_text)) {
      let found = this.nr.names.find(name => name.state === 'CONDITION' && name.decision_text)
      return found.decision_text
    }
    return ''
  }
  get consentDate () {
    if (this.nr.consent_dt) {
      return Moment(this.nr.consent_dt).utc().format('MMM Do[,] YYYY')
    }
    return 'Not Yet Received'
  }
  get expiryDate () {
    if (this.nr.expirationDate) {
      return Moment(this.nr.expirationDate).format('MMM Do[,] YYYY')
    }
    return ''
  }
  get lastUpdate () {
    if (this.nr.lastUpdate) {
      return Moment(this.nr.lastUpdate).format('MMM Do[,] YYYY')
    }
    return ''
  }
  get name () {
    let nameObj = this.nr.names.find(name => name.choice === 1)
    return nameObj.name
  }
  get disableUnfurnished (): boolean {
    return (['CONDITIONAL', 'REJECTED', 'APPROVED'].includes(this.nr.stateCd) && this.nr.furnished === 'N')
  }
  get names () {
    return this.nr.names.sort((a, b) => {
      if (a.choice > b.choice) {
        return 1
      }
      if (a.choice < b.choice) {
        return -1
      }
      return 0
    })
  }

  get nr () {
    return newReqModule.nr
  }
  get priorityReq () {
    return (this.nr && this.nr.priorityCd && this.nr.priorityCd === 'Y')
  }

  getNameFormatting (name) {
    if (name.state === 'NE') {
      return {
        icon: false,
        class: ''
      }
    }
    if (name.state === 'APPROVED' || name.state === 'CONDITION') {
      return {
        icon: 'check',
        class: 'approved'
      }
    }
    if (name.state === 'REJECTED') {
      return {
        icon: 'close',
        class: 'action'
      }
    }

    // Rendering template looks for an icon and class, so make sure to set a default here!
    return {
      icon: false,
      class: ''
    }
  }

  async handleButtonClick (action) {
    let outcome = await newReqModule.confirmAction(action)
    if (outcome) {
      switch (action) {
        case 'EDIT':
          // eslint-disable-next-line no-case-declarations
          const { dispatch } = this.$store
          // Disable rollback on expire, it's only for new NRs
          await dispatch(types.SET_ROLLBACK_ON_EXPIRE, false)
          // Set check in on expire
          await dispatch(types.SET_CHECK_IN_ON_EXPIRE, true)

          // Check out the NR - this sets the INPROGRESS lock on the NR
          // and needs to be done before you can edit the Name Request
          // eslint-disable-next-line no-case-declarations
          const success = await newReqModule.checkoutNameRequest()
          // Only proceed with editing if the checkout was successful,
          // the Name Request could be locked by another user session!
          if (success) {
            await newReqModule.editExistingRequest()
            timerModule.createAndStartTimer({
              id: EXISTING_NR_TIMER_NAME,
              expirationFn: () => {
                this.$store.dispatch(types.SHOW_NR_SESSION_EXPIRY_MODAL)
              },
              timeoutMs: EXISTING_NR_TIMEOUT_MS
            })
          }
          break
        case 'UPGRADE':
          paymentModule.toggleUpgradeModal(true)
          break
        case 'REAPPLY':
          paymentModule.toggleReapplyModal(true)
          break
        case 'RECEIPT':
          paymentModule.togglePaymentHistoryModal(true)
          break
        default:
          await newReqModule.patchNameRequestsByAction(action)
          break
      }
    } else {
      newReqModule.setActiveComponent('InvalidActionMessage')
    }
  }
  async goBack () {
    await newReqModule.cancelEditExistingRequest()
    newReqModule.cancelAnalyzeName('Tabs')
  }
  async refresh (event) {
    this.refreshCount += 1
    this.checking = true
    try {
      let resp = await newReqModule.getNameRequest(this.nr.id)
      this.checking = false
      if (resp.furnished === 'Y') {
        this.furnished = 'furnished'
        newReqModule.setNrResponse(resp)
      }
    } catch (error) {
      this.checking = false
    }
  }
  showConditionsModal () {
    newReqModule.mutateConditionsModalVisible(true)
  }

  /** Open Incorporate Now Login Modal and apply NR Data to Session */
  activateILModal () {
    newReqModule.mutateIncorporateLoginModalVisible(true)
    // nr persisted in the session to be used for affiliation/creation upon authentication in Signin.vue.
    sessionStorage.setItem('NR_DATA', JSON.stringify(this.nr))
  }
}
</script>

<style lang="sass" scoped>
.whitesmoke-bg
  background-color: whitesmoke
.max-height
  max-height: 60px
.no-style-button
  background-color: unset !important
  border: 0 !important
  border-radius: 0 !important
  box-shadow: unset !important
.forgot-nr-link
  text-decoration: underline
  cursor: pointer !important
.action
  color: $error !important
.approved
  color: $approved !important
</style>
