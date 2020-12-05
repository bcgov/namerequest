<template>
  <MainContainer id="existing-request-display" class="pa-10">
    <template v-slot:container-header>
      <v-col cols="auto" class="py-0">
        <span class="h3">{{ nr.nrNum }}</span>
        <span class="h6 ml-4">{{ entityTypeCdToText(nr.entity_type_cd) }}</span>
      </v-col>
    </template>

    <template v-slot:content>
      <names-gray-box
        v-if="nr.nrNum"
        class="mt-5"
        :names="names"
      />

      <transition mode="out-in" name="fade">
        <v-row v-if="disableUnfurnished" class="mx-0 mt-5 bg-light-blue" :key="furnished">
          <v-col cols="12" class="font-italic px-4" key="initial-msg">
            We are currently processing your request.
            Click<a class="link" href="#" @click.prevent="refresh()">&nbsp;Refresh&nbsp;</a>
            {{ $route.query && $route.query.paymentId ? '' : 'or retry your search ' }}
            after 5 minutes to enable all the buttons.
          </v-col>
        </v-row>
      </transition>

      <transition mode="out-in" name="fade">
        <v-container class="nr-data pa-0">
          <v-row class="mt-5" :key="refreshCount">
            <!-- labels and values -->
            <v-col cols="9" class="py-0">
              <v-row dense>
                <v-col cols="12">
                  <span>Last Update:</span>
                  &nbsp;{{ lastUpdate }}
                </v-col>

                <v-col cols="12">
                  <span>Request Status:</span>
                  &nbsp;{{ requestStatusText }}
                  <v-icon v-if="isAlertState" color="error" size="20" class="mt-n1 ml-1">
                    mdi-alert
                  </v-icon>
                  <a href="#"
                    class="link-sm ml-1"
                    v-if="isNrConditional"
                    @click.prevent="showConditionsModal()"
                  >Conditions</a>
                </v-col>

                <v-col cols="12">
                  <span>Priority Request:</span>
                  &nbsp;{{ isPriorityReq(nr) ? 'Yes' : 'No' }}
                </v-col>

                <v-col cols="12" v-if="expiryDate">
                  <span>Expiry Date:</span>
                  &nbsp;{{ expiryDate }}
                </v-col>

                <v-col cols="12">
                  <span>Expiry Extensions Remaining:</span>&nbsp;
                  <v-tooltip right content-class="tooltip">
                    <template v-slot:activator="{ on, attrs }">
                      <span v-bind="attrs" v-on="on"
                        class="dotted-underline app-blue font-weight-regular cursor-help"
                        >{{ extensionsRemainingText }}</span>
                    </template>
                    Once approved, you normally have 56 days to use your Name Request.
                    However, within 5 days of expiry, you can renew a Name Request two
                    times for an additional 56 days each time.
                  </v-tooltip>
                </v-col>

                <v-col cols="12" v-if="nr.consentFlag && (nr.consentFlag !== 'N')">
                  <span>Consent Rec'd:</span>
                  &nbsp;{{ consentDate }}
                </v-col>

                <v-col cols="12">
                  <span>Applicant Name:</span>
                  &nbsp;{{ nr.applicants.lastName }},
                  &nbsp;{{ nr.applicants.firstName }}
                </v-col>

                <v-col cols="12">
                  <span>Address:</span>
                  &nbsp;{{ address }}
                </v-col>
              </v-row>
            </v-col>

            <!-- action buttons -->
            <v-col cols="3" class="py-0" v-if="nr.state !== NrState.CANCELLED">
              <v-row dense>
                <template v-for="action of actions">
                  <!-- incorporate action is a distinct button below -->
                  <template v-if="action !== NrAction.INCORPORATE">
                    <v-col cols="12" :key="action+'-button'">
                      <v-btn block
                             class="button"
                             :class="isRedButton(action) ? 'button-red' : 'button-blue'"
                             :disabled="disableUnfurnished && (action !== NrAction.RECEIPT)"
                             @click="handleButtonClick(action)">{{ actionText(action) }}</v-btn>
                    </v-col>
                  </template>
                </template>
              </v-row>
            </v-col>
          </v-row>

          <check-status-gray-box
            class="mt-5"
            v-if="showCheckStatus"
            :nrNum="nr.nrNum"
          />

          <nr-approved-gray-box
            class="mt-5"
            v-if="showNrApproved"
            :nrNum="nr.nrNum"
            :approvedName="approvedName && approvedName.name"
            :emailAddress="nr.applicants.emailAddress"
          />

          <nr-not-approved-gray-box
            class="mt-5"
            v-if="showNrNotApproved"
            :nrNum="nr.nrNum"
          />

          <!-- incorporate button -->
          <div class="mt-5 text-center" v-if="showIncorporateButton">
            <v-btn @click="handleButtonClick(NrAction.INCORPORATE)">Incorporate Using This Name Request</v-btn>
          </div>
        </v-container>
      </transition>
    </template>
  </MainContainer>
</template>

<script lang="ts">
import { Component, Mixins, Vue } from 'vue-property-decorator'
import { mapGetters } from 'vuex'
import Moment from 'moment'

import MainContainer from '@/components/new-request/main-container.vue'
import newReqModule from '@/store/new-request-module'
import NrAffiliationMixin from '@/components/mixins/nr-affiliation-mixin'
import CommonMixin from '@/components/mixins/common-mixin'
import DateMixin from '@/components/mixins/date-mixin'
import paymentModule from '@/modules/payment'
import timerModule from '@/modules/vx-timer'
import * as types from '@/store/types'
import NamesGrayBox from './names-gray-box.vue'
import CheckStatusGrayBox from './check-status-gray-box.vue'
import NrApprovedGrayBox from './nr-approved-gray-box.vue'
import NrNotApprovedGrayBox from './nr-not-approved-gray-box.vue'
import { NameState, NrAction, NrState } from '@/enums'

@Component({
  components: {
    MainContainer,
    NamesGrayBox,
    CheckStatusGrayBox,
    NrApprovedGrayBox,
    NrNotApprovedGrayBox
  },
  computed: {
    ...mapGetters(['isAuthenticated'])
  }
})
export default class ExistingRequestDisplay extends Mixins(NrAffiliationMixin, CommonMixin, DateMixin) {
  // enums used in the template:
  NameState = NameState
  NrAction = NrAction
  NrState = NrState

  // external getter
  readonly isAuthenticated!: boolean

  /** This is True while refreshing the NR. (Not used in template at the moment.) */
  private checking = false

  /**
   * This is used in the template as the transition key for the affected template,
   * triggering a fade in/out.
   */
  private refreshCount = 0

  /**
   * This is used in the template at the transition key for the affected template,
   * triggering a fade in/out.
   */
  private furnished = 'notfurnished'

  /** The actions list, with some buttons forced to the bottom. */
  private get actions () {
    const actions = this.nr.actions || []
    // move 'REFUND' or 'CANCEL' action (if present) to bottom of list
    // eg ['EDIT', 'REFUND', 'RECEIPT'] -> ['EDIT', 'RECEIPT', 'REFUND']
    // or ['EDIT', 'CANCEL', 'RECEIPT'] -> ['EDIT', 'RECEIPT', 'CANCEL']
    return actions.sort((a, b) => {
      if ([NrAction.REFUND, NrAction.CANCEL].includes(b)) return -1
      return 0
    })
  }

  private get address () {
    const fields = ['addrLine2', 'city', 'stateProvinceCd', 'countryCd', 'postalCd']
    let output: string = this.nr.applicants.addrLine1
    for (let field of fields) {
      if (this.nr.applicants[field]) {
        output += ', ' + this.nr.applicants[field]
      }
    }
    return output
  }

  private get addressLines () {
    const output = [ this.nr.applicants.addrLine1 ]
    if (this.nr.applicants.addrLine2) {
      output.push(this.nr.applicants.addrLine2)
    }
    return output
  }

  private get cityProvPostal () {
    const { applicants } = this.nr
    return applicants.city + ', ' + applicants.stateProvinceCd + ', ' + applicants.postalCd
  }

  private get consentDate () {
    if (this.nr.consent_dt) {
      return Moment(this.nr.consent_dt).utc().format('MMM Do[,] YYYY')
    }
    return 'Not Yet Received'
  }

  private get expiryDate () {
    if (this.nr.expirationDate) {
      return Moment(this.nr.expirationDate).format('MMM Do[,] YYYY')
    }
    return ''
  }

  private get lastUpdate () {
    if (this.nr.lastUpdate) {
      return Moment(this.nr.lastUpdate).format('MMM Do[,] YYYY')
    }
    return ''
  }

  private get disableUnfurnished (): boolean {
    return (
      this.nr.furnished === 'N' &&
      [NrState.CONDITIONAL, NrState.REJECTED, NrState.APPROVED].includes(this.nr.stateCd)
    )
  }

  /** The names list, sorted by choice number. */
  private get names () {
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

  private get nr () {
    return newReqModule.nr
  }

  /**
   * True if the incorporate button should be shown.
   * (It is shown as a distinct button instead of an action.)
   */
  private get showIncorporateButton (): boolean {
    return (
      this.isBenefitCompany(this.nr) &&
      this.actions.includes(NrAction.INCORPORATE)
    )
  }

  /** True if the Check Status component should be shown. */
  private get showCheckStatus (): boolean {
    return [NrState.DRAFT, NrState.IN_PROGRESS, NrState.ON_HOLD].includes(this.nr.state)
  }

  /** True if the NR Approved component should be shown. */
  private get showNrApproved (): boolean {
    return (
      !this.isBenefitCompany(this.nr) &&
      [NrState.APPROVED, NrState.CONDITIONAL, NrState.COND_RESERVED].includes(this.nr.state)
    )
  }

  /** True if the NR NotApproved component should be shown. */
  private get showNrNotApproved (): boolean {
    return (
      this.isXProCompany(this.nr) &&
      (this.nr.state === NrState.REJECTED)
    )
  }

  /** True if the NR is in a conditional state. */
  private get isNrConditional (): boolean {
    return [NrState.CONDITIONAL, NrState.COND_RESERVED].includes(this.nr.state)
  }

  /** The display text for Expiry Extensions Remaining. */
  private get extensionsRemainingText (): string {
    const extensions = 2
    // total is # extensions + the original approval
    return `${extensions + 1 - this.nr.submitCount}/${extensions}`
  }

  /** The display text for Request Status. */
  private get requestStatusText (): string {
    switch (this.nr.state) {
      case NrState.COMPLETED: {
        if (this.isNrConsumed) return `Approved / Used For ${this.approvedName.corpNum}`
        if (this.isNrExpired) return 'Expired'
        return 'Completed' // should never happen
      }
      case NrState.COND_RESERVED: return 'Approved' // show COND_RESERVED as "Approved"
      case NrState.CONDITIONAL: return 'Approved' // show CONDITIONAL as "Approved"
      case NrState.ON_HOLD: return 'In Progress' // show ON_HOLD as "In Progress"
      case NrState.IN_PROGRESS: return 'In Progress'
      case NrState.REFUND_REQUESTED: return 'Cancelled, Refund Requested'
      default: return this.toTitleCase(this.nr.state)
    }
  }

  /** True if the NR is consumed. */
  private get isNrConsumed (): boolean {
    // consumed = NR is completed + a name is approved + approved name is consumed
    return (this.isNrCompleted &&
      !!this.approvedName &&
      this.isApprovedNameConsumed)
  }

  // FUTURE: remove this when EXPIRED state is implemented (ticket #5669)
  /** True if the NR is expired. */
  private get isNrExpired (): boolean {
    // expired = NR is completed + a name is approved + approved name is not consumed + expiry date has passed
    return (this.isNrCompleted &&
      !!this.approvedName &&
      !this.isApprovedNameConsumed &&
      this.hasExpirationDatePassed)
  }

  /** True if NR is in Completed state. */
  private get isNrCompleted (): boolean {
    return (this.nr.state === NrState.COMPLETED)
  }

  /** The NR's (first) approved name object, if any. */
  private get approvedName (): any {
    return this.nr.names.find(name => [NameState.APPROVED, NameState.CONDITIONAL].includes(name.state))
  }

  /** True if the Approved Name is consumed. */
  private get isApprovedNameConsumed (): boolean {
    // consumed = name is approved + has a consumption date + has a corp num
    return (!!this.approvedName?.consumptionDate && !!this.approvedName?.corpNum)
  }

  /** True if the NR's expiration date has passed. */
  private get hasExpirationDatePassed (): boolean {
    const expireDays = this.daysFromToday(this.nr.expirationDate)
    // 0 means today (which means it's expired)
    return (isNaN(expireDays) || expireDays < 1)
  }

  /** True if the current state should display an alert icon. */
  private get isAlertState (): boolean {
    return ['Cancelled', 'Cancelled, Refund Requested', 'Expired'].includes(this.requestStatusText)
    // FUTURE: use enums when EXPIRED state is implemented (ticket #5669)
    // return [NrState.CANCELLED, NrState.REFUND_REQUESTED, NrState.EXPIRED].includes(this.nr.state)
  }

  /** Returns True if the specified action should display a red button. */
  private isRedButton (action: NrAction): boolean {
    return [NrAction.REFUND, NrAction.CANCEL].includes(action)
  }

  /** Returns display text for the specified action code. */
  private actionText (action: NrAction): string {
    switch (action) {
      case NrAction.CANCEL: return 'Cancel Name Request'
      case NrAction.REAPPLY: return 'Extend Expiry ($30)'
      case NrAction.RECEIPTS: return 'Download Receipts'
      case NrAction.REFUND: return 'Cancel and Refund'
      case NrAction.RESEND: return 'Resend Email' // FUTURE: will be removed
      case NrAction.RESULTS: return 'Download Results' // FUTURE: will be implemented
      case NrAction.UPGRADE: return 'Upgrade Priority ($100)'
      default: return this.toTitleCase(action)
    }
  }

  private async handleButtonClick (action) {
    let outcome = await newReqModule.confirmAction(action)
    if (outcome) {
      switch (action) {
        case NrAction.EDIT:
          // eslint-disable-next-line no-case-declarations
          const doCheckout = ([NrState.DRAFT, NrState.IN_PROGRESS].indexOf(newReqModule.nrState) > -1)
          // eslint-disable-next-line no-case-declarations
          let success: boolean | undefined
          if (doCheckout) {
            const { dispatch } = this.$store
            // Disable rollback on expire, it's only for new NRs
            await dispatch(types.SET_ROLLBACK_ON_EXPIRE, false)
            // Set check in on expire
            await dispatch(types.SET_CHECK_IN_ON_EXPIRE, true)
            // Check out the NR - this sets the INPROGRESS lock on the NR
            // and needs to be done before you can edit the Name Request
            success = await newReqModule.checkoutNameRequest()
          }

          // Only proceed with editing if the checkout was successful,
          // the Name Request could be locked by another user session!
          if (!doCheckout || (doCheckout && success)) {
            await newReqModule.editExistingRequest()
          }
          break
        case NrAction.UPGRADE:
          paymentModule.toggleUpgradeModal(true)
          break
        case NrAction.REAPPLY:
          paymentModule.toggleReapplyModal(true)
          break
        case NrAction.RECEIPTS:
          paymentModule.togglePaymentHistoryModal(true)
          break
        case NrAction.REFUND:
          paymentModule.toggleRefundModal(true)
          break
        case NrAction.INCORPORATE:
          await this.affiliateOrLogin()
          break
        default:
          await newReqModule.patchNameRequestsByAction(action)
          break
      }
    } else {
      newReqModule.setActiveComponent('InvalidActionMessage')
    }
  }

  private async refresh (event) {
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

  private showConditionsModal () {
    newReqModule.mutateConditionsModalVisible(true)
  }

  /** Affiliates the current NR if authenticated, or prompts login if unauthenticated. */
  private async affiliateOrLogin (): Promise<any> {
    if (this.isAuthenticated) {
      await this.createAffiliation(this.nr)
    } else {
      // Persist Nr in session for use in affiliation upon authentication via SignIn.vue.
      sessionStorage.setItem('NR_DATA', JSON.stringify(this.nr))
      newReqModule.mutateIncorporateLoginModalVisible(true)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/theme";

.nr-data .col {
  color: $text;
  font-size: 1rem;

  span {
    color: $dk-text;
    font-weight: bold;
  }
}
</style>
