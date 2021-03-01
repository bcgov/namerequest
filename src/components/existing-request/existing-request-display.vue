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
                  <span>Last Update:</span>
                  &nbsp;{{ lastUpdate }}
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

                <v-col cols="12" v-if="expiryDate">
                  <span>Expiry Date:</span>
                  &nbsp;{{ expiryDate }}
                </v-col>

                <v-col cols="12" v-if="extensionsRemainingText">
                  <span>Expiry Extensions Remaining:</span>&nbsp;
                  <v-tooltip right transition="fade-transition" content-class="tooltip">
                    <template v-slot:activator="{ on, attrs }">
                      <span v-bind="attrs" v-on="on"
                        class="dotted-underline app-blue font-weight-regular cursor-default"
                      >{{ extensionsRemainingText }}</span>
                    </template>
                    Once approved, you normally have 56 days to use your Name Request.
                    However, within 5 days of expiry, you can renew a Name Request two
                    times for an additional 56 days each time.
                  </v-tooltip>
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
                           @click="handleButtonClick('RETRY_PAYMENT')">Retry Payment</v-btn>
                    <v-btn block
                           class="button button-red  mt-8"
                           @click="handleButtonClick('CANCEL')">Cancel Name Request</v-btn>
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
import { Component, Mixins, Vue, Watch } from 'vue-property-decorator'
import { mapGetters } from 'vuex'
import Moment from 'moment'

import MainContainer from '@/components/new-request/main-container.vue'
import newReqModule from '@/store/new-request-module'
import NrAffiliationMixin from '@/components/mixins/nr-affiliation-mixin'
import PaymentMixin from '@/components/payment/payment-mixin'
import CommonMixin from '@/components/mixins/common-mixin'
import DateMixin from '@/components/mixins/date-mixin'
import paymentModule from '@/modules/payment'
import NamesGrayBox from './names-gray-box.vue'
import CheckStatusGrayBox from './check-status-gray-box.vue'
import NrApprovedGrayBox from './nr-approved-gray-box.vue'
import NrNotApprovedGrayBox from './nr-not-approved-gray-box.vue'
import { NameState, NrAction, NrState, PaymentStatus, SbcPaymentStatus } from '@/enums'
import { sleep } from '@/plugins'
import { getBaseUrl } from '@/components/payment/payment-utils'

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
export default class ExistingRequestDisplay extends Mixins(
  NrAffiliationMixin,
  CommonMixin,
  DateMixin,
  PaymentMixin) {
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

  private pendingPayment = null

  /** The actions list, with some buttons forced to the bottom. */
  private get actions (): NrAction[] {
    const actions = (this.nr.actions || []) as NrAction[]
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

  /** The current NR object. */
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

  /** The display text for Expiry Extensions Remaining. */
  private get extensionsRemainingText (): string {
    // do not display text if NR is consumed/expired/cancelled/rejected
    if (this.isNrConsumed || this.isNrExpired || this.isNrCancelledOrRejected) return ''

    const extensions = 2
    // total is # extensions + the original approval
    return `${extensions + 1 - this.nr.submitCount}/${extensions}`
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
        case NrState.DRAFT: return 'Not Yet Processed'
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
    const expireDays = this.daysFromToday(this.nr.expirationDate)
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
    return this.pendingPayment?.sbcPayment?.statusCode === PaymentStatus.CREATED
  }

  private get isPaymentProcessing () {
    return this.pendingPayment?.sbcPayment?.statusCode === PaymentStatus.COMPLETED
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

  private async handleButtonClick (action: NrAction) {
    // const confirmed = await newReqModule.confirmAction(action)
    const confirmed = true
    if (confirmed) {
      switch (action) {
        case NrAction.EDIT:
          // eslint-disable-next-line no-case-declarations
          const doCheckout = ([NrState.DRAFT, NrState.IN_PROGRESS].indexOf(newReqModule.nrState) > -1)
          // eslint-disable-next-line no-case-declarations
          let success: boolean | undefined
          if (doCheckout) {
            const { dispatch } = this.$store
            // Check out the NR - this sets the INPROGRESS lock on the NR
            // and needs to be done before you can edit the Name Request
            success = await newReqModule.checkoutNameRequest()
          }

          // Only proceed with editing if the checkout was successful,
          // as the Name Request could be locked by another user session!
          if (!doCheckout || (doCheckout && success)) {
            await newReqModule.editExistingRequest()
          }
          break
        case NrAction.UPGRADE:
          await paymentModule.toggleUpgradeModal(true)
          break
        case NrAction.REAPPLY:
          await paymentModule.toggleReapplyModal(true)
          break
        case NrAction.RECEIPTS:
          await paymentModule.togglePaymentHistoryModal(true)
          break
        case NrAction.REFUND:
          await paymentModule.toggleRefundModal(true)
          break
        case NrAction.CANCEL:
          await paymentModule.toggleCancelModal(true)
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

          // Request the outputs
          await newReqModule.downloadOutputs(this.nr.id)

          // clear spinner
          this.$root.$emit('showSpinner', false)
          break
        default:
          if (await newReqModule.patchNameRequestsByAction(action)) {
            newReqModule.mutateDisplayedComponent('Success')
            await sleep(1000)
            newReqModule.mutateDisplayedComponent('ExistingRequestDisplay')
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
    this.refreshCount += 1
    this.checking = true
    try {
      const resp = await newReqModule.getNameRequest(this.nr.id)
      this.checking = false
      if (resp?.furnished === 'Y') {
        this.furnished = 'furnished'
        newReqModule.setNrResponse(resp)
      }
    } catch (error) {
      // NB: errors are handled by newReqModule
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

  private get isVisible () {
    const componentName = newReqModule.displayedComponent
    return (componentName === 'ExistingRequestDisplay')
  }

  @Watch('isVisible', { immediate: true })
  onVisibleChanged (val: boolean) {
    if (val && this.$el.querySelector) {
      this.$nextTick(() => {
        // add classname to button text (for more detail in Sentry breadcrumbs)
        const existingNrCancelBtn = this.$el.querySelector("#CANCEL-btn > span")
        if (existingNrCancelBtn) existingNrCancelBtn.classList.add("existing-nr-cancel-btn")
        const exitingNrEditBtn = this.$el.querySelector("#EDIT-btn > span")
        if (exitingNrEditBtn) exitingNrEditBtn.classList.add("existing-nr-edit-btn")
        const existingNrReapplyBtn = this.$el.querySelector("#REAPPLY-btn > span")
        if (existingNrReapplyBtn) existingNrReapplyBtn.classList.add("existing-nr-reapply-btn")
        const existingNrReceiptBtn = this.$el.querySelector("#RECEIPT-btn > span")
        if (existingNrReceiptBtn) existingNrReceiptBtn.classList.add("existing-nr-receipt-btn")
        const existingNrRefundBtn = this.$el.querySelector("#REQUEST_REFUND-btn > span")
        if (existingNrRefundBtn) existingNrRefundBtn.classList.add("existing-nr-refund-btn")
        const existingNrResendBtn = this.$el.querySelector("#RESEND-btn > span")
        if (existingNrResendBtn) existingNrResendBtn.classList.add("existing-nr-resend-btn")
        const existingNrResultBtn = this.$el.querySelector("#RESULT-btn > span")
        if (existingNrResultBtn) existingNrResultBtn.classList.add("existing-nr-result-btn")
        const existingNrUpgradeBtn = this.$el.querySelector("#UPGRADE-btn > span")
        if (existingNrUpgradeBtn) existingNrUpgradeBtn.classList.add("existing-nr-upgrade-btn")
        const existingNrIncorporateBtn = this.$el.querySelector("#INCORPORATE-btn > span")
        if (existingNrIncorporateBtn) existingNrIncorporateBtn.classList.add("existing-nr-incorporate-btn")
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
      await this.fetchNrPayments(this.nr.id)
      this.pendingPayment = this.payments.find(sbcPayment => (sbcPayment.statusCode !== PaymentStatus.COMPLETED))
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
