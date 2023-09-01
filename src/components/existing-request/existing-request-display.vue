<template>
  <MainContainer id="existing-request-display" class="pa-10">
    <template v-slot:container-header>
      <v-col cols="auto" class="py-0">
        <span v-if="!isIncompletePayment" class="h3 user-select-all mr-4">{{ nr.nrNum }}</span>
        <span class="h6">{{ entityTypeCdToText(nr.entity_type_cd) }}</span>
      </v-col>
    </template>

    <template v-slot:content>
      <div v-if="isIncompletePayment" class="pt-6 pb-4">
        <v-row class="warning-message px-5 py-4 rounded-sm" no-gutters>
          <v-col cols="auto" class="pt-1 mr-2">
            <v-icon color="error" size="20" class="mt-n1 ml-1">mdi-alert</v-icon>
          </v-col>
          <v-col cols="11" class="pt-1 pb-1">
          <strong>Payment Incomplete:</strong> Keep this page open and retry your payment;
          leaving this page will result in this Name Request being deleted from BC Registries.
          If your Name Request is deleted you will need to resubmit your name(s) with a new Name Request.
          </v-col>
        </v-row>
      </div>

      <NamesGrayBox
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
          <v-row class="mt-6 mb-0" :key="refreshCount">
            <!-- labels and values -->
            <v-col cols="12" md="9" lg="9" class="py-0">
              <v-row dense>
                <v-col  v-if="!isIncompletePayment" cols="12" class="submitted-date">
                  <span>Submitted Date:</span>
                  &nbsp;{{ submittedDate  }}
                </v-col>

                <v-col cols="12" class="request-type">
                  <span>Request Type:</span>
                  &nbsp;{{ requestType  }}
                </v-col>

                <v-col cols="12" class="request-status">
                  <span>Request Status:</span>
                  &nbsp;
                  <span :class="requestStatusTextClass">
                    {{ requestStatusText }}
                    <span v-if="isRefundRequested">
                      <v-tooltip
                        content-class="top-tooltip"
                        top nudge-top
                        min-width="24rem"
                        :disabled="isMobile"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <span v-bind="attrs" v-on="on">
                            <span  class="refund-label">{{ getRefundParams.refundLabel }}</span>
                            <v-icon v-if="getRefundParams.showAlertIcon" icon color="error">
                              mdi-alert
                            </v-icon>
                          </span>
                        </template>
                        <div v-html="getRefundParams.refundMessageText1" />
                        <br v-if="getRefundParams.refundMessageText2" />
                        <div v-if="getRefundParams.refundMessageText2"
                          v-html="getRefundParams.refundMessageText2" />
                        <div v-if="getRefundParams.showStaffContact">
                          <br/>
                          <ContactInfo
                            id="tooltip-contact-info"
                            direction="col" />
                        </div>
                      </v-tooltip>
                    </span>
                  </span>
                  <v-icon v-if="isAlertState && !isIncompletePayment" color="error" size="20" class="mt-n1 ml-1">
                    mdi-alert
                  </v-icon>
                  <a href="#"
                    class="link-sm ml-1"
                    v-if="showConditionsLink"
                    @click.prevent="showConditionsModal()"
                  >Conditions</a>
                </v-col>

                <v-col cols="12" class="priority-request">
                  <span>Priority Request:</span>
                  &nbsp;{{ isPriorityReq(nr) ? 'Yes' : 'No' }}
                </v-col>

                <v-col cols="12" v-if="showEstimatedDateNotPriority" class="estimated-review-date">
                  <span>Estimated Review Date:</span>
                  &nbsp;
                  <v-tooltip
                    right
                    transition="fade-transition"
                    content-class="tooltip"
                    :disabled="isMobile"
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

                <v-col cols="12" v-if="showEstimatedDatePriority" class="font-italic priority-requests-blurb">
                  Priority Requests are usually reviewed within 1 to 2 business days
                </v-col>

                <v-col cols="12" v-if="expiryDate" class="expiry-date">
                  <span>Expiry Date:</span>
                  &nbsp;{{ expiryDate }}
                </v-col>

                <v-col cols="12" v-if="consentDate" class="consent-status">
                  <span>Consent Status:</span>
                  &nbsp;{{ consentDate }}
                </v-col>

                <v-col cols="12" class="applicant-name">
                  <span>Applicant Name:</span>
                  &nbsp;{{ nr && nr.applicants && nr.applicants.lastName }},
                  &nbsp;{{ nr && nr.applicants && nr.applicants.firstName }}
                </v-col>

                <v-col cols="12" class="applicant-address">
                  <span>Address:</span>
                  &nbsp;{{ address }}
                </v-col>
              </v-row>
            </v-col>

            <!-- action buttons -->
            <v-col cols="12" md="3" lg="3" class="py-0" :class="{ 'mt-6': isMobile }">
              <v-row dense>
                <template v-for="action of actions">
                  <!-- incorporate action is a distinct button below -->
                  <template v-if="action !== NrAction.INCORPORATE">
                    <v-col cols="12" :key="action+'-button'">
                      <v-tooltip top
                        content-class="top-tooltip"
                        transition="fade-transition"
                        :disabled="isMobile || !actionTooltip(action)"
                      >
                        <template v-slot:activator="{ on }">
                          <div v-on="on" class="width-fit-content">
                            <v-btn block
                              class="button"
                              :id="action+'-btn'"
                              :class="isRedButton(action) ? 'button-red' : 'button-blue'"
                              :disabled="isDisabledButton(action)"
                              @click="handleButtonClick(action)"
                            >{{ actionText(action) }}</v-btn>
                          </div>
                        </template>
                        <span>{{ actionTooltip(action) }}</span>
                      </v-tooltip>
                    </v-col>
                  </template>
                </template>
              </v-row>
            </v-col>
          </v-row>

          <CheckStatusGrayBox
            class="mt-5"
            v-if="showCheckStatusGrayBox"
            :nrNum="nr.nrNum"
          />

          <NrApprovedGrayBox
            class="mt-5"
            v-if="showNrApprovedGrayBox"
            :nrNum="nr && nr.nrNum"
            :approvedName="approvedName && approvedName.name"
            :emailAddress="nr && nr.applicants && nr.applicants.emailAddress"
            :showIncorporateNowButton="showIncorporateButton"
            :showRegisterButton="showRegisterButton"
            :showAlterNowButton="showAlterNowButton"
            :isAllowAlterOnline="isAlterOnline(nr.requestTypeCd)"
            :showOpenExternalIcon="showOpenExternalIcon"
            :showGoToSocietiesButton="showGoToSocietiesButton"
            :disabled="disableUnfurnished"
            @incorporateRegisterYourBusiness="incorporateRegisterYourBusiness()"
            @goToSocietiesOnline="goToSocietiesOnline"
            @goToCorpOnline="goToCorpOnline"
            @goToEntityDashboard="goToEntityDashboard(nr.corpNum)"
          />

          <NrNotApprovedGrayBox
            class="mt-5"
            v-if="showNrNotApprovedGrayBox"
            :nrNum="nr.nrNum"
          />
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
import { NameState, NrAction, NrState, PaymentStatus, SbcPaymentStatus, PaymentAction, Furnished,
  NrRequestActionCodes, NrRequestTypeCodes, EntityType } from '@/enums'
import { Sleep, GetFeatureFlag, Navigate } from '@/plugins'
import NamexServices from '@/services/namex-services'
import ContactInfo from '@/components/common/contact-info.vue'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({
  components: {
    MainContainer,
    NamesGrayBox,
    CheckStatusGrayBox,
    NrApprovedGrayBox,
    NrNotApprovedGrayBox,
    ContactInfo
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
  @Getter getNrId!: number
  @Getter getNrState!: NrState
  @Getter isMobile!: boolean

  // Global actions
  @Action editExistingRequest!: ActionBindingIF
  @Action setDisplayedComponent!: ActionBindingIF
  @Action setConditionsModalVisible!: ActionBindingIF
  @Action setNrResponse!: ActionBindingIF
  @Action toggleUpgradeModal!: ActionBindingIF
  @Action toggleResubmitModal!: ActionBindingIF
  @Action toggleRetryModal!: ActionBindingIF
  @Action toggleRenewModal!: ActionBindingIF
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
  get actions (): NrAction[] {
    const actions = (this.nr.actions || []) as NrAction[]
    // move 'REQUEST_REFUND' or 'CANCEL' action (if present) to bottom of list
    // eg ['EDIT', 'REQUEST_REFUND', 'RECEIPT'] -> ['EDIT', 'RECEIPT', 'REQUEST_REFUND']
    // or ['EDIT', 'CANCEL', 'RECEIPT'] -> ['EDIT', 'RECEIPT', 'CANCEL']
    return actions.sort((a: any, b: any) => {
      if ([NrAction.REQUEST_REFUND, NrAction.CANCEL].includes(b)) return -1
      return 0
    })
  }

  get address (): string {
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

  get addressLines (): string[] {
    const output = [ this.nr.applicants.addrLine1 ]
    if (this.nr.applicants.addrLine2) {
      output.push(this.nr.applicants.addrLine2)
    }
    return output
  }

  get cityProvPostal (): string {
    const { applicants } = this.nr
    return applicants.city + ', ' + applicants.stateProvinceCd + ', ' + applicants.postalCd
  }

  get consentDate (): string {
    if (!this.nr.consentFlag || (this.nr.consentFlag === 'N')) return ''

    let ret: string
    if (this.nr.consent_dt) {
      const date = new Date(this.nr.consent_dt)
      ret = this.dateToPacificDate(date)
    }
    return ret || 'Not Yet Received'
  }

  get expiryDate (): string {
    let ret: string
    if (this.nr.expirationDate) {
      const date = new Date(this.nr.expirationDate)
      ret = this.dateToPacificDateTime(date)
    }
    return ret || ''
  }

  get reviewDate (): string {
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

  get queueDate (): string {
    let ret: string
    if (this.nr.oldest_draft) {
      const date = new Date(this.nr.oldest_draft)
      ret = this.dateToPacificDate(date)
    }
    return ret || 'Unknown'
  }

  get submittedDate (): string {
    let ret: string
    if (this.nr.submittedDate) {
      const date = new Date(this.nr.submittedDate)
      ret = this.dateToPacificDateTime(date)
    }
    return ret || 'Unknown'
  }

  get requestType (): string {
    return this.requestActionCdToText(this.nr.request_action_cd) || 'Unknown'
  }

  get disableUnfurnished (): boolean {
    return (
      (this.nr.furnished === Furnished.NO) &&
      [NrState.CONDITIONAL, NrState.REJECTED, NrState.APPROVED].includes(this.nr.stateCd)
    )
  }

  /** The names list, sorted by choice number. Used by names-gray-box. */
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

  /** The current NR object. */
  get nr () {
    return this.getNr
  }

  /**
   * True if the Incorporate button should be shown.
   * (It is shown as a distinct button instead of an action.)
   */
  get showIncorporateButton (): boolean {
    return (
      this.isSupportedEntity(this.nr) &&
      this.nr.request_action_cd === NrRequestActionCodes.NEW_BUSINESS &&
      NrState.APPROVED === this.nr.state
    )
  }

  /** True if the Register button should be shown. */
  get showRegisterButton (): boolean {
    return this.isFirm(this.nr) &&
           this.nr.request_action_cd === NrRequestActionCodes.NEW_BUSINESS &&
           (NrState.APPROVED === this.nr.state ||
            this.isConsentUnRequired)
  }

  get showAlterNowButton (): boolean {
    return this.nr.request_action_cd === NrRequestActionCodes.CONVERSION &&
          this.nr.state === NrState.APPROVED
  }

  get showOpenExternalIcon (): boolean {
    if (this.showAlterNowButton) {
      return !this.isSupportedAlteration(this.nr.requestTypeCd)
    }
    return false
  }

  /** True if the Go To Societies Online button should be shown. */
  get showGoToSocietiesButton (): boolean {
    return this.nr?.entity_type_cd === EntityType.SO &&
           this.nr.request_action_cd === NrRequestActionCodes.NEW_BUSINESS &&
           (NrState.APPROVED === this.nr.state ||
            this.isConsentUnRequired)
  }

  get isConsentUnRequired (): boolean {
    return NrState.CONDITIONAL === this.nr.state &&
            (this.nr.consentFlag === null ||
              this.nr.consentFlag === 'R' ||
              this.nr.consentFlag === 'N')
  }

  /** True if the Check Status gray box should be shown. */
  get showCheckStatusGrayBox (): boolean {
    return [NrState.DRAFT, NrState.INPROGRESS, NrState.HOLD].includes(this.nr.state)
  }

  /** True if the NR Approved gray box should be shown. */
  get showNrApprovedGrayBox (): boolean {
    return this.isNrApprovedOrConditional
  }

  /** True if the NR Not Approved gray box should be shown. */
  get showNrNotApprovedGrayBox (): boolean {
    return (
      this.isXProCompany(this.nr) &&
      (this.nr.state === NrState.REJECTED)
    )
  }

  /** True if the non priority estimated date should be shown. */
  get showEstimatedDateNotPriority (): boolean {
    return !this.isPriorityReq(this.nr) && (this.nr.state === NrState.DRAFT)
  }

  /** True if priority estimated date text should be shown. */
  get showEstimatedDatePriority (): boolean {
    return this.isPriorityReq(this.nr) && (this.nr.state === NrState.DRAFT)
  }

  /** True if the Conditions link should be shown. */
  get showConditionsLink (): boolean {
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
  get requestStatusText (): string {
    if (this.nr.state === NrState.REFUND_REQUESTED) {
      return 'Cancelled, ' // this label will be composed with 'getRefundParams.refundLabel'
    } else if (this.isNotPaid) {
      return 'Payment Incomplete'
    } else if (this.isPaymentProcessing) {
      return 'Processing Payment'
    } else {
      switch (this.nr.state) {
        case NrState.CONSUMED:
          return `${this.approvedName.state === NameState.CONDITIONAL ? 'Conditional Approval' : 'Approved'}
                 / Used For ${this.approvedName.corpNum}`
        case NrState.APPROVED:
          return 'Approved'
        case NrState.CANCELLED: return 'Cancelled'
        case NrState.CONDITIONAL:
          return 'Conditional Approval'
        case NrState.DRAFT: return 'Pending Staff Review'
        case NrState.EXPIRED: return 'Expired'
        case NrState.HOLD: return 'In Progress' // show HOLD as "In Progress"
        case NrState.INPROGRESS: return 'In Progress'
        case NrState.REJECTED: return 'Rejected'
        default: return '-' // should never happen
      }
    }
  }

  /** True if NR is in Approved or Conditional state. */
  get isNrApprovedOrConditional (): boolean {
    return [NrState.APPROVED, NrState.CONDITIONAL].includes(this.nr.state)
  }

  /** True if NR is in Cancelled or Rejected state. */
  get isNrCancelledOrRejected (): boolean {
    return [NrState.CANCELLED, NrState.REFUNDED, NrState.REJECTED].includes(this.nr.state)
  }

  /** The NR's (first) approved name object, if any. */
  get approvedName (): any {
    return this.nr.names.find(name => [NameState.APPROVED, NameState.CONDITIONAL].includes(name.state))
  }

  /** The NR's (first) conditional name object, if any. */
  get conditionalName (): any {
    return this.nr.names.find(name => (name.state === NameState.CONDITIONAL))
  }

  /** True if the current state should display an alert icon. */
  get isAlertState (): boolean {
    return ['Cancelled', 'Expired'].includes(this.requestStatusText) || this.isNotPaid
  }

  get isNotPaid () {
    return (this.pendingPayment?.sbcPayment?.statusCode === PaymentStatus.CREATED) &&
            ([NrState.DRAFT, NrState.PENDING_PAYMENT].includes(this.nr.state))
  }

  get isPaymentProcessing () {
    return ([PaymentStatus.APPROVED, PaymentStatus.COMPLETED].includes(this.pendingPayment?.sbcPayment?.statusCode))
  }

  /** Returns the css class for the requestStatusText. */
  get requestStatusTextClass (): string {
    if (this.isRefundRequested) return ''
    else if (this.isNotPaid) return 'app-red'
    else if (this.isPaymentProcessing) return 'app-green'
    return ''
  }

  /** Whether Upgrade Priority button should be enabled. */
  get enableUpgradeButton (): boolean {
    return GetFeatureFlag('enable-priority-checkbox')
  }

  /** Returns True if the specified action button should be disabled. */
  isDisabledButton (action: NrAction): boolean {
    if (action === NrAction.UPGRADE && !this.enableUpgradeButton) return true
    if (this.disableUnfurnished && action !== NrAction.RECEIPTS) return true
    return false
  }

  /** Returns tooltip (or '') for the specified action button. */
  actionTooltip (action: NrAction): string {
    if (action === NrAction.UPGRADE && !this.enableUpgradeButton) {
      return 'Due to the on-going labour dispute between the government and its employees, ' +
        'priority filings are temporarily disabled.'
    }
    return ''
  }

  /** Returns True if the specified action should display a red button. */
  isRedButton (action: NrAction): boolean {
    return [NrAction.REQUEST_REFUND, NrAction.CANCEL].includes(action)
  }

  /** Returns display text for the specified action button. */
  actionText (action: NrAction): string {
    switch (action) {
      case NrAction.CANCEL: return 'Cancel Name Request'
      case NrAction.RENEW: return 'Renew Name Request ($30)' // FUTURE: fetch this fee
      case NrAction.RECEIPTS: return 'Download Receipts'
      case NrAction.REQUEST_REFUND: return 'Cancel and Refund'
      case NrAction.RESEND: return 'Resend Email' // FUTURE: will be removed
      case NrAction.RESULT: return 'Download Results'
      case NrAction.RESUBMIT: return 'Resubmit Name Request ($30)'
      case NrAction.RETRY_PAYMENT: return 'Retry Payment'
      case NrAction.UPGRADE: return 'Upgrade Priority ($100)' // FUTURE: fetch this fee
      default: return this.toTitleCase(action)
    }
  }

  async handleButtonClick (action: NrAction) {
    // FUTURE: reinstate this check?
    // const confirmed = await newReqModule.confirmAction(action)
    const confirmed = true

    if (confirmed) {
      switch (action) {
        case NrAction.EDIT: {
          const doCheckout = ([NrState.DRAFT, NrState.INPROGRESS].indexOf(this.getNrState) > -1)
          let success = false
          if (doCheckout) {
            const { dispatch } = this.$store
            // Check out the NR - this sets the INPROGRESS lock on the NR
            // and needs to be done before you can edit the Name Request
            success = await NamexServices.checkoutNameRequest(this.getNrId)
          }

          // Only proceed with editing if the checkout was successful,
          // as the Name Request could be locked by another user session!
          if (!doCheckout || success) {
            await this.editExistingRequest(null)
          }
          break
        }

        case NrAction.UPGRADE:
          await this.toggleUpgradeModal(true)
          break

        case NrAction.RESUBMIT:
          await this.toggleResubmitModal(true)
          break

        case NrAction.RENEW:
          await this.toggleRenewModal(true)
          break

        case NrAction.RECEIPTS:
          await this.togglePaymentHistoryModal(true)
          break

        case NrAction.REQUEST_REFUND:
          await this.toggleRefundModal(true)
          break

        case NrAction.CANCEL:
          await this.toggleCancelModal(true)
          break

        case NrAction.INCORPORATE:
          await this.affiliateOrLogin()
          break

        case NrAction.RETRY_PAYMENT:
          await this.toggleRetryModal(true)
          break

        case NrAction.RESULT:
          // show spinner since the network calls below can take a few seconds
          this.$root.$emit('showSpinner', true)
          // download the outputs
          await NamexServices.downloadOutputs(this.nr.id)
          // hide spinner
          this.$root.$emit('showSpinner', false)
          break

        default:
          if (await NamexServices.patchNameRequestsByAction(this.getNrId, action)) {
            this.setDisplayedComponent('Success')
            await Sleep(1000)
            this.setDisplayedComponent('ExistingRequestDisplay')
          }
          break
      }
    }
    // else do nothing -- errors are handled by newReqModule
  }

  async refresh (): Promise<void> {
    this.$root.$emit('showSpinner', true)
    this.refreshCount += 1
    try {
      const resp = await NamexServices.getNameRequest(true)
      this.$root.$emit('showSpinner', false)
      if (resp?.furnished === Furnished.YES) {
        this.furnished = 'furnished'
        this.setNrResponse(resp)
      }
    } catch (error) {
      // NB: errors are handled by newReqModule
      this.$root.$emit('showSpinner', false)
    }
  }

  showConditionsModal () {
    this.setConditionsModalVisible(true)
  }

  /** Called to incorporate/register the business. */
  async incorporateRegisterYourBusiness (): Promise<void> {
    // safety check
    if (!this.isNrApprovedOrConditional) return

    return this.affiliateOrLogin()
  }

  /** Affiliates the current NR if authenticated, or prompts login if unauthenticated. */
  private async affiliateOrLogin (): Promise<any> {
    if (this.getIsAuthenticated) {
      await this.createAffiliation(this.nr)
    } else {
      // persist NR in session for affiliation upon authentication via Signin component
      sessionStorage.setItem('NR_DATA', JSON.stringify(this.nr))
      // navigate to BC Registry login page with return parameter
      const registryHomeUrl = sessionStorage.getItem('REGISTRY_HOME_URL')
      const nameRequestUrl = `${window.location.origin}`
      Navigate(`${registryHomeUrl}login?return=${nameRequestUrl}`)
    }
  }

  // redirect to Societies Online
  goToSocietiesOnline () {
    const societyHomeUrl = sessionStorage.getItem('SOCIETIES_ONLINE_HOME_URL')
    Navigate(`${societyHomeUrl}`)
  }

  // redirect to Corporate Online
  goToCorpOnline () {
    const corporateHomeUrl = sessionStorage.getItem('CORPORATE_ONLINE_URL')
    Navigate(`${corporateHomeUrl}`)
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

  get isVisible () {
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
          const existingNrRenewBtn = this.$el.querySelector('#RENEW-btn > span')
          if (existingNrRenewBtn) existingNrRenewBtn.classList.add('existing-nr-renew-btn')
          const existingNrReceiptBtn = this.$el.querySelector('#RECEIPT-btn > span')
          if (existingNrReceiptBtn) existingNrReceiptBtn.classList.add('existing-nr-receipt-btn')
          const existingNrRefundBtn = this.$el.querySelector('#REQUEST_REFUND-btn > span')
          if (existingNrRefundBtn) existingNrRefundBtn.classList.add('existing-nr-refund-btn')
          const existingNrResendBtn = this.$el.querySelector('#RESEND-btn > span')
          if (existingNrResendBtn) existingNrResendBtn.classList.add('existing-nr-resend-btn')
          const existingNrResubmitBtn = this.$el.querySelector('#RESUBMIT-btn > span')
          if (existingNrResubmitBtn) existingNrResubmitBtn.classList.add('existing-nr-resubmit-btn')
          const existingNrResultBtn = this.$el.querySelector('#RESULT-btn > span')
          if (existingNrResultBtn) existingNrResultBtn.classList.add('existing-nr-result-btn')
          const existingNrUpgradeBtn = this.$el.querySelector('#UPGRADE-btn > span')
          if (existingNrUpgradeBtn) existingNrUpgradeBtn.classList.add('existing-nr-upgrade-btn')
          const existingNrRetryPaymentBtn = this.$el.querySelector('#RETRY_PAYMENT-btn > span')
          if (existingNrRetryPaymentBtn) existingNrRetryPaymentBtn.classList.add('existing-nr-retry-payment-btn')
          const existingNrIncorporateBtn = this.$el.querySelector('#INCORPORATE-btn > span')
          if (existingNrIncorporateBtn) existingNrIncorporateBtn.classList.add('existing-nr-incorporate-btn')
        }
      })
    }
  }

  protected created (): void {
    this.$root.$on('paymentComplete', (flag = false) => { this.pendingPayment = null })
  }

  protected destroyed (): void {
    this.$root.$off('paymentComplete')
  }

  protected async mounted () {
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

      // get the first pending payment
      this.pendingPayment = this.payments.find(
        payment => (
          ![PaymentStatus.APPROVED, PaymentStatus.COMPLETED, PaymentStatus.CANCELLED, PaymentStatus.REFUND_REQUESTED]
            .includes(payment.statusCode)
        )
      )

      // hide spinner
      this.$root.$emit('showSpinner', false)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme";

.nr-data .col {
  color: $text;
  font-size: $px-16;

  span {
    color: $dk-text;
    font-weight: bold;
  }
}

.refund-label {
  color: $app-blue !important;
  font-weight: normal !important;
  text-decoration-line: underline;
  text-decoration-style: dotted;
  text-underline-offset: 0.12em;
  text-decoration-thickness: 0.1rem;
}

::v-deep {
  .contact-icon {
    color: white;
  }
  .contact-value {
    color: white;
    text-decoration: none;
  }
}

.warning-message {
  color: $gray7;
  background-color: $app-red-background;
  border: 1px solid $app-red;
}

button.theme--light.v-btn--disabled {
  color: $disabled-action !important;
}
</style>
