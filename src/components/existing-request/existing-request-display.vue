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
        <div class="nr-data">
          <v-row class="mt-5" :key="refreshCount">
            <!-- labels and values -->
            <v-col cols="9" class="py-0">
              <v-row dense>
                <v-col cols="12">
                  <span>Submitted Date:</span>
                  &nbsp;{{ submittedDate  }}
                </v-col>

                <v-col cols="12">
                  <span>Request Status:</span>
                  &nbsp;<span :class="isNotPaid ? 'app-red' : isPaymentProcessing ? 'app-green' : ''">
                    {{ requestStatusText }}</span>
                  <v-icon v-if="isAlertState" color="error" size="20" class="mt-n1 ml-1">
                    mdi-alert
                  </v-icon>
                  <a href="#"
                    class="link-sm ml-1"
                    v-if="showConditionsLink"
                    @click.prevent="showConditionsModal()"
                  >Conditions</a>
                </v-col>

                <v-col cols="12">
                  <span>Priority Request:</span>
                  &nbsp;{{ isPriorityReq(nr) ? 'Yes' : 'No' }}
                </v-col>

                <v-col cols="12" v-if="showEstimatedDateNotPriority">
                  <span>Estimated Review Date:</span>
                  &nbsp;
                  <v-tooltip
                    right
                    transition="fade-transition"
                    content-class="tooltip"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <span
                        v-bind="attrs"
                        v-on="on"
                        class="dotted-underline app-blue font-weight-regular cursor-default"
                      >{{ reviewDate }}</span>
                    </template>
                    This is an estimate only, actual review date may vary. Staff are
                    currently reviewing Name Requests submitted on {{ queueDate }}.
                  </v-tooltip>
                </v-col>

                <v-col cols="12" v-if="showEstimatedDatePriority" class="font-italic">
                  Priority Requests are usually reviewed within 1 to 2 business days
                </v-col>

                <v-col cols="12" v-if="expiryDate">
                  <span>Expiry Date:</span>
                  &nbsp;{{ expiryDate }}
                </v-col>

                <v-col cols="12" v-if="nr.consentFlag && (nr.consentFlag !== 'N')">
                  <span>Consent Status:</span>
                  &nbsp;{{ consentDate }}
                </v-col>

                <v-col cols="12">
                  <span>Applicant Name:</span>
                  &nbsp;{{ nr && nr.applicants && nr.applicants.lastName }},
                  &nbsp;{{ nr && nr.applicants && nr.applicants.firstName }}
                </v-col>

                <v-col cols="12">
                  <span>Address:</span>
                  &nbsp;{{ address }}
                </v-col>
              </v-row>
            </v-col>

            <!-- action buttons -->
            <v-col cols="3" class="py-0">
              <v-row dense>
                <template v-if="pendingPayment">
                  <v-col cols="12" v-if="isNotPaid">
                    <v-btn block
                           class="button button-blue"
                           @click="handleButtonClick(NrAction.RETRY_PAYMENT)"
                    >{{ actionText(NrAction.RETRY_PAYMENT) }}</v-btn>
                    <v-btn block
                           class="button button-red mt-8"
                           @click="handleButtonClick(NrAction.CANCEL)"
                    >{{ actionText(NrAction.CANCEL) }}</v-btn>
                  </v-col>
                </template>
                <template v-for="action of actions" v-else>
                  <!-- incorporate action is a distinct button below -->
                  <template v-if="action !== NrAction.INCORPORATE">
                    <v-col cols="12" :key="action+'-button'">
                      <v-btn block
                        class="button"
                        :id="action+'-btn'"
                        :class="isRedButton(action) ? 'button-red' : 'button-blue'"
                        :disabled="disableUnfurnished && (action !== NrAction.RECEIPT)"
                        @click="handleButtonClick(action)"
                      >{{ actionText(action) }}</v-btn>
                    </v-col>
                  </template>
                </template>
              </v-row>
            </v-col>
          </v-row>

          <check-status-gray-box
            class="mt-5"
            v-if="showCheckStatusGrayBox"
            :nrNum="nr.nrNum"
          />

          <nr-approved-gray-box
            class="mt-5"
            v-if="showNrApprovedGrayBox"
            :nrNum="nr.nrNum"
            :approvedName="approvedName && approvedName.name"
            :emailAddress="nr && nr.applicants && nr.applicants.emailAddress"
          />

          <nr-not-approved-gray-box
            class="mt-5"
            v-if="showNrNotApprovedGrayBox"
            :nrNum="nr.nrNum"
          />

          <!-- incorporate button -->
          <div class="mt-5 text-center" v-if="showIncorporateButton">
            <v-btn id="INCORPORATE-btn" @click="handleButtonClick(NrAction.INCORPORATE)">
              Incorporate Using This Name Request
            </v-btn>
          </div>
        </div>
      </transition>
    </template>
  </MainContainer>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import MainContainer from '@/components/new-request/main-container.vue'
import { NrAffiliationMixin, CommonMixin, DateMixin, PaymentMixin } from '@/mixins'
import NamesGrayBox from './names-gray-box.vue'
import CheckStatusGrayBox from './check-status-gray-box.vue'
import NrApprovedGrayBox from './nr-approved-gray-box.vue'
import NrNotApprovedGrayBox from './nr-not-approved-gray-box.vue'
import { NameState, NrAction, NrState, PaymentStatus, SbcPaymentStatus, PaymentAction } from '@/enums'
import { sleep } from '@/plugins'
import { getBaseUrl } from '@/components/payment/payment-utils'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'
import NamexServices from '@/services/namex.services'

// Interfaces
import { NameRequestI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import error from '@/modules/error'

@Component({
  components: {
    MainContainer,
    NamesGrayBox,
    CheckStatusGrayBox,
    NrApprovedGrayBox,
    NrNotApprovedGrayBox
  }
})
export default class ExistingRequestDisplay extends Mixins(
  NrAffiliationMixin,
  CommonMixin,
  DateMixin,
  PaymentMixin
) {
  // Global getters
  @Getter getDisplayedComponent!: string
  @Getter getIsAuthenticated!: boolean
  @Getter getNr!: Partial<NameRequestI>
  @Getter getNrId!: number
  @Getter getNrState!: NrState
  @Getter getCurrentJsDate!: Date

  // Global actions
  @Action editExistingRequest!: ActionBindingIF
  @Action setDisplayedComponent!: ActionBindingIF
  @Action setConditionsModalVisible!: ActionBindingIF
  @Action setIncorporateLoginModalVisible!: ActionBindingIF
  @Action setNrResponse!: ActionBindingIF
  @Action toggleUpgradeModal!: ActionBindingIF
  @Action toggleReapplyModal!: ActionBindingIF
  @Action togglePaymentHistoryModal!: ActionBindingIF
  @Action toggleRefundModal!: ActionBindingIF
  @Action toggleCancelModal!: ActionBindingIF

  // enums used in the template
  NameState = NameState
  NrAction = NrAction
  NrState = NrState

  /** This is used in the template as the transition key for the affected template, triggering a fade in/out. */
  refreshCount = 0

  /** This is used in the template as the transition key for the affected template, triggering a fade in/out. */
  furnished = 'notfurnished'

  /** The pending payment, if any. See mounted(). */
  private pendingPayment = null

  /** The actions list, with some buttons forced to the bottom. */
  private get actions (): NrAction[] {
    const actions = (this.nr.actions || []) as NrAction[]
    // move 'REFUND' or 'CANCEL' action (if present) to bottom of list
    // eg ['EDIT', 'REFUND', 'RECEIPT'] -> ['EDIT', 'RECEIPT', 'REFUND']
    // or ['EDIT', 'CANCEL', 'RECEIPT'] -> ['EDIT', 'RECEIPT', 'CANCEL']
    return actions.sort((a: any, b: any) => {
      if ([NrAction.REFUND, NrAction.CANCEL].includes(b)) return -1
      return 0
    })
  }

  private get address (): string {
    // FUTURE: delete this check as it hides an error that shouldn't happen
    //         for now, report the error and don't crash
    if (!this.nr.applicants) {
      console.error('undefined applicants, nr =', this.nr) // eslint-disable-line no-console
      return ''
    }
    let output: string = this.nr.applicants.addrLine1
    const fields = ['addrLine2', 'city', 'stateProvinceCd', 'countryCd', 'postalCd']
    for (let field of fields) {
      if (this.nr.applicants[field]) {
        output += ', ' + this.nr.applicants[field]
      }
    }
    return output
  }

  private get addressLines (): string[] {
    const output = [ this.nr.applicants.addrLine1 ]
    if (this.nr.applicants.addrLine2) {
      output.push(this.nr.applicants.addrLine2)
    }
    return output
  }

  private get cityProvPostal (): string {
    const { applicants } = this.nr
    return applicants.city + ', ' + applicants.stateProvinceCd + ', ' + applicants.postalCd
  }

  private get consentDate (): string {
    let ret: string
    if (this.nr.consent_dt) {
      const date = new Date(this.nr.consent_dt)
      ret = this.dateToPacificDate(date)
    }
    return ret || 'Not Yet Received'
  }

  private get expiryDate (): string {
    let ret: string
    if (this.nr.expirationDate) {
      const date = new Date(this.nr.expirationDate)
      ret = this.dateToPacificDateTime(date)
    }
    return ret || ''
  }

  private get reviewDate (): string {
    if (this.nr.waiting_time) {
      // get current wait days
      const waitDays: number = this.nr.waiting_time
      // get number of days since the NR was submitted
      const daysSince = -this.daysFromToday(new Date(this.nr.submittedDate))
      // subtract the current wait days from the amount that we have already been waiting
      let remainingDays = waitDays - daysSince
      // safety check
      if (!isNaN(remainingDays)) {
        // add the diff to today's date
        let date = new Date(this.getCurrentJsDate)
        date.setDate(this.getCurrentJsDate.getDate() + remainingDays)
        return this.dateToPacificDate(date) + ` (${this.nr.waiting_time} days)`
      }
    }
    return 'Unknown'
  }

  private get queueDate (): string {
    let ret: string
    if (this.nr.oldest_draft) {
      const date = new Date(this.nr.oldest_draft)
      ret = this.dateToPacificDate(date)
    }
    return ret || 'Unknown'
  }

  private get submittedDate (): string {
    let ret: string
    if (this.nr.submittedDate) {
      const date = new Date(this.nr.submittedDate)
      ret = this.dateToPacificDateTime(date)
    }
    return ret || 'Unknown'
  }

  private get disableUnfurnished (): boolean {
    return (
      this.nr.furnished === 'N' &&
      [NrState.CONDITIONAL, NrState.REJECTED, NrState.APPROVED].includes(this.nr.stateCd)
    )
  }

  /** The names list, sorted by choice number. Used by names-gray-box. */
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

  /** The current NR object. */
  private get nr () {
    return this.getNr
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

  /** True if the Check Status gray box should be shown. */
  private get showCheckStatusGrayBox (): boolean {
    return [NrState.DRAFT, NrState.IN_PROGRESS, NrState.ON_HOLD].includes(this.nr.state)
  }

  /** True if the NR Approved gray box should be shown. */
  private get showNrApprovedGrayBox (): boolean {
    return (
      !this.isBenefitCompany(this.nr) &&
      this.isNrApprovedOrConditional
    )
  }

  /** True if the NR Not Approved gray box should be shown. */
  private get showNrNotApprovedGrayBox (): boolean {
    return (
      this.isXProCompany(this.nr) &&
      (this.nr.state === NrState.REJECTED)
    )
  }

  /** True if the non priority estimated date should be shown. */
  private get showEstimatedDateNotPriority (): boolean {
    return !this.isPriorityReq(this.nr) && (this.nr.state === NrState.DRAFT)
  }

  /** True if priority estimated date text should be shown. */
  private get showEstimatedDatePriority (): boolean {
    return this.isPriorityReq(this.nr) && (this.nr.state === NrState.DRAFT)
  }

  /** True if the Conditions link should be shown. */
  private get showConditionsLink (): boolean {
    // 1. NR is approved or conditional
    // 2. there is a conditional name
    // 3. the conditional name has some decision text
    // (see also Conditions modal)
    return (
      this.isNrApprovedOrConditional &&
      !!this.conditionalName?.decision_text
    )
  }

  /** The display text for Request Status. */
  private get requestStatusText (): string {
    if (this.isNotPaid) {
      return 'Payment Incomplete'
    } else if (this.isPaymentProcessing) {
      return 'Processing Payment'
    } else {
      switch (this.nr.state) {
        case NrState.APPROVED:
          if (this.isNrConsumed) return `Approved / Used For ${this.approvedName.corpNum}`
          if (this.isNrExpired) return 'Expired'
          return 'Approved'
        case NrState.CANCELLED: return 'Cancelled'
        case NrState.CONDITIONAL:
          if (this.isNrConsumed) return `Conditional Approval / Used For ${this.approvedName.corpNum}`
          if (this.isNrExpired) return 'Expired'
          return 'Conditional Approval'
        case NrState.DRAFT: return 'Pending Staff Review'
        case NrState.ON_HOLD: return 'In Progress' // show ON HOLD as "In Progress"
        case NrState.IN_PROGRESS: return 'In Progress'
        case NrState.REFUND_REQUESTED: return 'Cancelled, Refund Requested'
        case NrState.REJECTED: return 'Rejected'
        default: return '-' // should never happen
      }
    }
  }

  /** True if the NR is consumed. */
  private get isNrConsumed (): boolean {
    // 1. NR is approved or conditional
    // 2. a Name is approved
    // 3. Approved Name is consumed
    return (
      this.isNrApprovedOrConditional &&
      !!this.approvedName &&
      this.isApprovedNameConsumed
    )
  }

  // FUTURE: remove this when EXPIRED state is implemented (ticket #5669)
  /** True if the NR is expired. */
  private get isNrExpired (): boolean {
    // 1. NR is approved or conditional
    // 2. a Name is approved
    // 3. Approved Name is not consumed
    // 4. Expiration Date has passed
    return (
      this.isNrApprovedOrConditional &&
      !!this.approvedName &&
      !this.isApprovedNameConsumed &&
      this.hasExpirationDatePassed
    )
  }

  /** True if NR is in Approved or Conditional state. */
  private get isNrApprovedOrConditional (): boolean {
    return [NrState.APPROVED, NrState.CONDITIONAL].includes(this.nr.state)
  }

  /** True if NR is in Cancelled or Rejected state. */
  private get isNrCancelledOrRejected (): boolean {
    return [NrState.CANCELLED, NrState.REFUNDED, NrState.REJECTED].includes(this.nr.state)
  }

  /** The NR's (first) approved name object, if any. */
  private get approvedName (): any {
    return this.nr.names.find(name => [NameState.APPROVED, NameState.CONDITIONAL].includes(name.state))
  }

  /** The NR's (first) conditional name object, if any. */
  private get conditionalName (): any {
    return this.nr.names.find(name => (name.state === NameState.CONDITIONAL))
  }

  /** True if the Approved Name is consumed. */
  private get isApprovedNameConsumed (): boolean {
    // consumed = name is approved + has a consumption date + has a corp num
    return (!!this.approvedName?.consumptionDate && !!this.approvedName?.corpNum)
  }

  /** True if the NR's expiration date has passed. */
  private get hasExpirationDatePassed (): boolean {
    if (!this.nr.expirationDate) return false
    const expireDays = this.daysFromToday(new Date(this.nr.expirationDate))
    // 0 means today (which means it's expired)
    return (isNaN(expireDays) || expireDays < 1)
  }

  /** True if the current state should display an alert icon. */
  private get isAlertState (): boolean {
    return ['Cancelled', 'Cancelled, Refund Requested', 'Expired'].includes(this.requestStatusText) ||
    this.isNotPaid
    // FUTURE: use enums when EXPIRED state is implemented (ticket #5669)
    // return [NrState.CANCELLED, NrState.REFUND_REQUESTED, NrState.EXPIRED].includes(this.nr.state)
  }

  private get isNotPaid () {
    return (this.pendingPayment?.sbcPayment?.statusCode === PaymentStatus.CREATED)
  }

  private get isPaymentProcessing () {
    return ([PaymentStatus.APPROVED, PaymentStatus.COMPLETED].includes(this.pendingPayment?.sbcPayment?.statusCode))
  }

  /** Returns True if the specified action should display a red button. */
  private isRedButton (action: NrAction): boolean {
    return [NrAction.REFUND, NrAction.CANCEL].includes(action)
  }

  /** Returns display text for the specified action code. */
  private actionText (action: NrAction): string {
    switch (action) {
      case NrAction.CANCEL: return 'Cancel Name Request'
      case NrAction.REAPPLY: return 'Renew Name Request ($30)'
      case NrAction.RECEIPTS: return 'Download Receipts'
      case NrAction.REFUND: return 'Cancel and Refund'
      case NrAction.RESEND: return 'Resend Email' // FUTURE: will be removed
      case NrAction.RESULTS: return 'Download Results' // FUTURE: will be implemented
      case NrAction.RETRY_PAYMENT: return 'Retry Payment'
      case NrAction.UPGRADE: return 'Upgrade Priority ($100)'
      default: return this.toTitleCase(action)
    }
  }

  private async handleButtonClick (action: NrAction) {
    // const confirmed = await newReqModule.confirmAction(action)
    const confirmed = true
    if (confirmed) {
      switch (action) {
        case NrAction.EDIT:
          // eslint-disable-next-line no-case-declarations
          const doCheckout = ([NrState.DRAFT, NrState.IN_PROGRESS].indexOf(this.getNrState) > -1)
          // eslint-disable-next-line no-case-declarations
          let success: boolean | undefined
          if (doCheckout) {
            const { dispatch } = this.$store
            // Check out the NR - this sets the INPROGRESS lock on the NR
            // and needs to be done before you can edit the Name Request
            // *** TODO: declare checkoutNameRequest differently so it's not void
            success = await NamexServices.checkoutNameRequest(this.getNrId) as unknown as boolean
          }

          // Only proceed with editing if the checkout was successful,
          // as the Name Request could be locked by another user session!
          if (!doCheckout || (doCheckout && success)) {
            await this.editExistingRequest(null)
          }
          break
        case NrAction.UPGRADE:
          await this.toggleUpgradeModal(true)
          break
        case NrAction.REAPPLY:
          await this.toggleReapplyModal(true)
          break
        case NrAction.RECEIPTS:
          await this.togglePaymentHistoryModal(true)
          break
        case NrAction.REFUND:
          await this.toggleRefundModal(true)
          break
        case NrAction.CANCEL:
          await this.toggleCancelModal(true)
          break
        case NrAction.INCORPORATE:
          await this.affiliateOrLogin()
          break
        case NrAction.RETRY_PAYMENT:
          this.navigateToPaymentPortal()
          break
        case NrAction.RESULTS:
          // show spinner since the network calls below can take a few seconds
          this.$root.$emit('showSpinner', true)
          // download the outputs
          await NamexServices.downloadOutputs(this.nr.id)
          // hide spinner
          this.$root.$emit('showSpinner', false)
          break
        default:
          // *** TODO: declare patchNameRequestsByAction differently so it's not void
          if (await NamexServices.patchNameRequestsByAction(this.getNrId, action) as unknown as boolean) {
            this.setDisplayedComponent('Success')
            await sleep(1000)
            this.setDisplayedComponent('ExistingRequestDisplay')
          }
          break
      }
    }
    // else do nothing -- errors are handled by newReqModule
  }

  private navigateToPaymentPortal () {
    const { id, token, nrId, action } = this.pendingPayment
    sessionStorage.setItem('paymentInProgress', 'true')
    sessionStorage.setItem('paymentId', id)
    sessionStorage.setItem('paymentToken', token)
    sessionStorage.setItem('nrId', nrId)
    sessionStorage.setItem('paymentAction', action)
    const baseUrl = getBaseUrl()
    const redirectUrl = encodeURIComponent(`${baseUrl}/nr/${nrId}/?paymentId=${id}`)
    this.redirectToPaymentPortal(id, token, redirectUrl)
  }

  private async refresh (event) {
    this.$root.$emit('showSpinner', true)
    this.refreshCount += 1
    try {
      const resp = await NamexServices.getNameRequest(true) as any // *** TODO use a real type here
      this.$root.$emit('showSpinner', false)
      if (resp?.furnished === 'Y') {
        this.furnished = 'furnished'
        this.setNrResponse(resp)
      }
    } catch (error) {
      // NB: errors are handled by newReqModule
      this.$root.$emit('showSpinner', false)
    }
  }

  private showConditionsModal () {
    this.setConditionsModalVisible(true)
  }

  /** Affiliates the current NR if authenticated, or prompts login if unauthenticated. */
  private async affiliateOrLogin (): Promise<any> {
    if (this.getIsAuthenticated) {
      await this.createAffiliation(this.nr)
    } else {
      // Persist NR in session for use in affiliation upon authentication via Signin component
      sessionStorage.setItem('NR_DATA', JSON.stringify(this.nr))
      this.setIncorporateLoginModalVisible(true)
    }
  }

  private cancelledUpgrade (status: string, payments: any): string {
    let paymentId = null
    if (status === 'PAYMENT_CANCELLED') {
      for (let i = 0; i < payments.length; i++) {
        if (
          payments[i].action === PaymentAction.UPGRADE &&
          payments[i].sbcPayment.statusCode === SbcPaymentStatus.CREATED
        ) {
          paymentId = payments[i].sbcPayment.id
          break
        }
      }
    }
    return paymentId
  }

  private get isVisible () {
    const componentName = this.getDisplayedComponent
    return (componentName === 'ExistingRequestDisplay')
  }

  @Watch('isVisible', { immediate: true })
  onVisibleChanged (val: boolean) {
    if (val) {
      this.$nextTick(() => {
        if (this.$el?.querySelector instanceof Function) {
          // add classname to button text (for more detail in Sentry breadcrumbs)
          const existingNrCancelBtn = this.$el.querySelector('#CANCEL-btn > span')
          if (existingNrCancelBtn) existingNrCancelBtn.classList.add('existing-nr-cancel-btn')
          const exitingNrEditBtn = this.$el.querySelector('#EDIT-btn > span')
          if (exitingNrEditBtn) exitingNrEditBtn.classList.add('existing-nr-edit-btn')
          const existingNrReapplyBtn = this.$el.querySelector('#REAPPLY-btn > span')
          if (existingNrReapplyBtn) existingNrReapplyBtn.classList.add('existing-nr-reapply-btn')
          const existingNrReceiptBtn = this.$el.querySelector('#RECEIPT-btn > span')
          if (existingNrReceiptBtn) existingNrReceiptBtn.classList.add('existing-nr-receipt-btn')
          const existingNrRefundBtn = this.$el.querySelector('#REQUEST_REFUND-btn > span')
          if (existingNrRefundBtn) existingNrRefundBtn.classList.add('existing-nr-refund-btn')
          const existingNrResendBtn = this.$el.querySelector('#RESEND-btn > span')
          if (existingNrResendBtn) existingNrResendBtn.classList.add('existing-nr-resend-btn')
          const existingNrResultBtn = this.$el.querySelector('#RESULT-btn > span')
          if (existingNrResultBtn) existingNrResultBtn.classList.add('existing-nr-result-btn')
          const existingNrUpgradeBtn = this.$el.querySelector('#UPGRADE-btn > span')
          if (existingNrUpgradeBtn) existingNrUpgradeBtn.classList.add('existing-nr-upgrade-btn')
          const existingNrIncorporateBtn = this.$el.querySelector('#INCORPORATE-btn > span')
          if (existingNrIncorporateBtn) existingNrIncorporateBtn.classList.add('existing-nr-incorporate-btn')
        }
      })
    }
  }

  created (): void {
    this.$root.$on('paymentComplete', (flag = false) => { this.pendingPayment = null })
  }

  destroyed (): void {
    this.$root.$off('paymentComplete')
  }

  async mounted () {
    if (this.nr.id && this.nr.state !== NrState.CANCELLED) {
      // show spinner since the network calls below can take a few seconds
      this.$root.$emit('showSpinner', true)

      await this.fetchNrPayments(this.nr.id)
      const status = this.$route?.query?.status?.toString()
      const paymentId = status ? this.cancelledUpgrade(atob(status), this.payments) : null
      if (paymentId) {
        // cancel the upgrade invoice
        const nrId = this.nr.id
        await NamexServices.cancelPayment(nrId, paymentId)
        // fetch updated payments
        await this.fetchNrPayments(nrId)
      }
      this.pendingPayment = this.payments.find(
        payment => (
          ![PaymentStatus.APPROVED, PaymentStatus.COMPLETED, PaymentStatus.CANCELLED].includes(payment.statusCode)
        )
      )

      // hide spinner
      this.$root.$emit('showSpinner', false)
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
