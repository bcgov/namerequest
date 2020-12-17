<template>
  <v-app id="app">
    <div id="main-column">
      <sbc-authentication-options-dialog
        attach="#app"
        :showModal="showAuthModal"
        :redirectUrl="getNameRequestUrl"
        @close="closeAuthModal()"
      />

      <!-- Loading Spinner -->
      <v-fade-transition>
        <div class="loading-container grayed-out" v-show="showSpinner">
          <div class="loading__content">
            <v-progress-circular color="primary" size="50" indeterminate />
          </div>
        </div>
      </v-fade-transition>

      <sbc-header
        class="sbc-header"
        :in-auth="false"
        :redirectOnLoginSuccess="getNameRequestUrl"
        :redirect-on-login-fail="getNameRequestUrl"
        :redirect-on-logout="getNameRequestUrl"
        :show-actions="false"
      />
      <v-alert
        tile dense
        type="warning"
        class="mb-0 text-center colour-dk-text"
        v-if="bannerText"
        v-html="bannerText"
      />
      <router-view />
      <sbc-footer />
    </div>
    <!--All v-dialogue (modal) components App-wide-->
    <Conditions />
    <LocationInfoModal />
    <MrasSearchInfoModal />
    <HelpMeChoose />
    <NrNotRequired />
    <PickEntityOrConversion />
    <PickRequestType />
    <PaymentModal
      :onActivate="onPaymentModalActivated"
      :onCancel="onPaymentCancelled"
    />
    <UpgradeModal />
    <ReapplyModal />
    <PaymentCompleteModal />
    <ReceiptsModal />
    <RefundModal />
    <CancelModal />
    <AffiliationErrorModal />
    <ErrorModal />
    <TimeoutModal
      :show="showNrSessionExpiryModal"
      :onTimerExpired="this.onTimerModalExpired"
      :onExtendSession="this.onTimerModalSessionExtended"
      :displayExpireNowButton="true"
    />
  </v-app>
</template>

<script lang="ts">
import SbcHeader from 'sbc-common-components/src/components/SbcHeader.vue'
import SbcFooter from 'sbc-common-components/src/components/SbcFooter.vue'
import Conditions from '@/components/modals/conditions.vue'
import HelpMeChoose from '@/components/modals/help-me-choose.vue'
import LocationInfoModal from '@/components/modals/location-info.vue'
import MrasSearchInfoModal from '@/components/modals/mras-search-info.vue'
import NrNotRequired from '@/components/modals/nr-not-required.vue'
import PickEntityOrConversion from '@/components/modals/pick-entity-or-conversion.vue'
import PickRequestType from '@/components/modals/pick-request-type.vue'
import PaymentModal from '@/components/payment/payment-modal.vue'
import ReceiptsModal from '@/components/payment/receipts-modal.vue'
import RefundModal from '@/components/payment/refund-modal.vue'
import CancelModal from '@/components/payment/cancel-modal.vue'
import UpgradeModal from '@/components/payment/upgrade-modal.vue'
import ReapplyModal from '@/components/payment/reapply-modal.vue'
import PaymentCompleteModal from '@/components/payment/payment-complete-modal.vue'
import AffiliationErrorModal from '@/components/modals/affiliation-error.vue'
import ErrorModal from '@/components/common/error-modal.vue'
import SbcAuthenticationOptionsDialog from 'sbc-common-components/src/components/SbcAuthenticationOptionsDialog.vue'

import { Component, Mixins } from 'vue-property-decorator'
import { mapState, mapGetters } from 'vuex'
import { featureFlags } from '@/plugins/featureFlags'

import TimeoutModal from '@/components/session-timer/timeout-modal.vue'
import SessionTimerMixin from '@/components/session-timer/session-timer-mixin'

import newRequestModule, {
  ROLLBACK_ACTIONS as rollbackActions
} from '@/store/new-request-module'

import timerModule from '@/modules/vx-timer'
import paymentModule from '@/modules/payment'

@Component({
  components: {
    TimeoutModal,
    Conditions,
    SbcHeader,
    SbcFooter,
    LocationInfoModal,
    MrasSearchInfoModal,
    NrNotRequired,
    HelpMeChoose,
    PickEntityOrConversion,
    PickRequestType,
    PaymentModal,
    UpgradeModal,
    ReapplyModal,
    PaymentCompleteModal,
    ReceiptsModal,
    RefundModal,
    CancelModal,
    AffiliationErrorModal,
    ErrorModal,
    SbcAuthenticationOptionsDialog
  },
  computed: {
    ...mapState([
      'showNrSessionExpiryModal',
      'rollbackOnExpire',
      'checkInOnExpire'
    ]),
    ...mapGetters(['getNameRequestUrl'])
  }
})
export default class App extends Mixins(SessionTimerMixin) {
  rollbackOnExpire: boolean
  checkInOnExpire: boolean
  readonly getNameRequestUrl!: string
  private showSpinner = false

  get bannerText (): string | null {
    const bannerText: string = featureFlags.getFlag('banner-text')
    // remove spaces so that " " becomes falsy
    return bannerText?.trim()
  }

  get showAuthModal () {
    return newRequestModule.incorporateLoginModalVisible
  }

  created (): void {
    // listen for spinner show/hide events
    this.$root.$on('showSpinner', (flag = false) => { this.showSpinner = flag })
  }

  destroyed (): void {
    // stop listening for spinner show/hide events
    this.$root.$off('showSpinner')
  }

  async resetAppState () {
    // Redirect to the start
    // Catch any errors, so we don't get errors like:
    // Avoided redundant navigation to current location: "/"
    this.$router.replace('/').catch(() => {})

    // Display the tabs
    await newRequestModule.resetAnalyzeName()
    await newRequestModule.mutateName('')
    await newRequestModule.mutateDisplayedComponent('Tabs')
  }

  async onTimerModalExpired () {
    const { nrId } = newRequestModule
    const componentName = newRequestModule.displayedComponent
    if (nrId && ['SubmissionTabs'].indexOf(componentName) > -1) {
      // Cancel the NR using the rollback endpoint if we were processing a NEW NR
      // Don't await this request, that way there's no lag, fire it off async and don't block I/O
      // The empty then clause just prevents a linting issue that warns when you don't
      // await an async function which is not an issue, since we don't want to block I/O
      newRequestModule.rollbackNameRequest({ nrId, action: rollbackActions.CANCEL }).then(() => {})
    } else if (nrId && ['ExistingRequestEdit'].indexOf(componentName) > -1) {
      newRequestModule.checkinNameRequest().then(() => {})
    }

    await this.resetAppState()
  }

  async onTimerModalSessionExtended () {
    const { nrId } = newRequestModule
    const componentName = newRequestModule.displayedComponent
    if (['SubmissionTabs'].indexOf(componentName) > -1 && this.$NR_COMPLETION_TIMEOUT_MS > 0) {
      await this.startNewNrTimer()
    } else if (nrId && ['ExistingRequestEdit'].indexOf(componentName) > -1 && this.$EXISTING_NR_TIMEOUT_MS > 0) {
      await this.startExistingNrTimer()
    }
  }

  async onPaymentModalActivated () {
    const { nrId } = newRequestModule
    const componentName = newRequestModule.displayedComponent
    // Only do this for New NRs!!!
    if (nrId && ['SubmissionTabs'].indexOf(componentName) > -1) {
      if (this.$NR_COMPLETION_TIMEOUT_MS > 0) {
        // First, clear the NR session timer
        await timerModule.stopTimer({ id: this.$NR_COMPLETION_TIMER_NAME })
      }

      if (this.$PAYMENT_COMPLETION_TIMEOUT_MS > 0) {
        // Start a new timer for the payment
        timerModule.createAndStartTimer({
          id: this.$PAYMENT_COMPLETION_TIMER_NAME,
          expirationFn: async () => {
            const { nrId } = newRequestModule
            // Cancel the NR using the rollback endpoint if we were processing a NEW NR
            // Don't await this request, that way there's no lag, fire it off async and don't block I/O
            // The empty then clause just prevents a linting issue that warns when you don't
            // await an async function which is not an issue, since we don't want to block I/O
            newRequestModule.rollbackNameRequest({ nrId, action: rollbackActions.CANCEL }).then(() => {})
            paymentModule.togglePaymentModal(false)
            // Direct the user back to the start
            await this.resetAppState()
          },
          timeoutMs: this.$PAYMENT_COMPLETION_TIMEOUT_MS
        })
      }
    }
  }

  async onPaymentCancelled () {
    const { nrId } = newRequestModule
    const componentName = newRequestModule.displayedComponent
    // Only do this for New NRs!!!
    if (nrId && ['SubmissionTabs'].indexOf(componentName) > -1) {
      // Cancel the NR using the rollback endpoint if we were processing a NEW NR
      // Don't await this request, that way there's no lag, fire it off async and don't block I/O
      // The empty then clause just prevents a linting issue that warns when you don't
      // await an async function which is not an issue, since we don't want to block I/O
      newRequestModule.rollbackNameRequest({ nrId, action: rollbackActions.CANCEL }).then(() => {})

      // If the payment was cancelled direct the user back to the start
      await this.resetAppState()
    }

    paymentModule.togglePaymentModal(false)
  }

  private closeAuthModal () {
    newRequestModule.mutateIncorporateLoginModalVisible(false)
  }
}

</script>

<style lang="sass">
#app
  background-color: $body-bg

#main-column
  display: flex
  flex-flow: column nowrap
  min-height: 100vh

  .sbc-header
    .v-btn
      box-shadow: none !important

.loading-container.grayed-out
  opacity: 0.46
  background-color: rgb(33, 33, 33) // grey darken-4
  border-color: rgb(33, 33, 33) // grey darken-4

.app-header
  .v-btn
    box-shadow: unset !important

.app-footer
  .container
    max-width: 1300px
    padding-right: 1rem
    padding-left: 1rem
</style>
