<template>
  <v-app id="app">
    <div id="main-column">
      <Header />
      <router-view />
    </div>
    <!--All v-dialogue (modal) components App-wide-->
    <Conditions />
    <LocationInfoModal />
    <HelpMeChoose />
    <NrNotRequired />
    <PickEntityOrConversion />
    <PickRequestType />
    <PaymentModal />
    <UpgradeModal />
    <ReapplyModal />
    <PaymentCompleteModal />
    <PaymentHistoryModal />
    <IncorporateLoginModal />
    <AffiliationErrorModal />
    <ApiErrorModal />
    <TimeoutModal
      :show="showNrSessionExpiryModal"
      :onTimerExpired="this.onTimerModalExpired"
      :onExtendSession="this.onTimerModalSessionExtended"
    />
  </v-app>
</template>df

<script lang="ts">
import Conditions from '@/components/modals/conditions.vue'
import HelpMeChoose from '@/components/modals/help-me-choose.vue'
import LocationInfoModal from '@/components/modals/location-info.vue'
import NrNotRequired from '@/components/modals/nr-not-required.vue'
import PickEntityOrConversion from '@/components/modals/pick-entity-or-conversion.vue'
import PickRequestType from '@/components/modals/pick-request-type.vue'
import PaymentModal from '@/components/payment/payment-modal.vue'
import PaymentHistoryModal from '@/components/payment/payment-history-modal.vue'
import UpgradeModal from '@/components/payment/upgrade-modal.vue'
import ReapplyModal from '@/components/payment/reapply-modal.vue'
import PaymentCompleteModal from '@/components/payment/payment-complete-modal.vue'
import IncorporateLoginModal from '@/components/modals/incorporate-login.vue'
import AffiliationErrorModal from '@/components/modals/affiliation-error.vue'
import ApiErrorModal from '@/components/common/error/modal.vue'

import { Component, Vue, Ref } from 'vue-property-decorator'
import { mapState } from 'vuex'

import Header from '@/components/header.vue'
import TimeoutModal, {
  TIMER_MODAL_TIMEOUT_MS
} from '@/components/session-timer/timeout-modal.vue'

import newRequestModule, {
  NR_COMPLETION_TIMER_NAME,
  NR_COMPLETION_TIMEOUT_MS,
  ROLLBACK_ACTIONS as rollbackActions
} from '@/store/new-request-module'
import timerModule from '@/modules/vx-timer'
import * as types from '@/store/types'

@Component({
  components: {
    TimeoutModal,
    Conditions,
    Header,
    LocationInfoModal,
    NrNotRequired,
    HelpMeChoose,
    PickEntityOrConversion,
    PickRequestType,
    PaymentModal,
    UpgradeModal,
    ReapplyModal,
    PaymentCompleteModal,
    PaymentHistoryModal,
    IncorporateLoginModal,
    AffiliationErrorModal,
    ApiErrorModal
  },
  computed: mapState([
    'showNrSessionExpiryModal'
  ])
})
export default class App extends Vue {
  async onTimerModalExpired () {
    const { nrId } = newRequestModule
    if (nrId) {
      // Cancel the NR using the rollback endpoint if we were processing a NEW NR
      await newRequestModule.rollbackNameRequest({ nrId, action: rollbackActions.CANCEL })
    }
    // Redirect to the start
    // Catch any errors, so we don't get errors like:
    // Avoided redundant navigation to current location: "/"
    // eslint-disable-next-line no-console
    console.log('Timer modal expired, redirecting to /')
    this.$router.replace('/').catch(() => {})

    // Display the tabs
    await newRequestModule.resetAnalyzeName()
    await newRequestModule.mutateName('')
    await newRequestModule.mutateDisplayedComponent('Tabs')
  }

  async onTimerModalSessionExtended () {
    const { nrId } = newRequestModule
    if (nrId) {
      // eslint-disable-next-line no-console
      console.log('Starting the session timer')
      // eslint-disable-next-line no-console
      console.log(`Starting NR timer [${NR_COMPLETION_TIMER_NAME}]`)
      timerModule.createAndStartTimer({
        id: NR_COMPLETION_TIMER_NAME,
        expirationFn: () => {
          this.$store.dispatch(types.SHOW_NR_SESSION_EXPIRY_MODAL)
        },
        timeoutMs: NR_COMPLETION_TIMEOUT_MS
      })
    }
  }
}

</script>

<style lang="sass">
#app
  background-color: $body-bg
#main-column
  padding: 0
  margin: 0 auto 0 auto
  width: 1380px
  max-width: 1380px

</style>
