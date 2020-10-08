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
    <SessionTimer />
  </v-app>
</template>

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
// import ErrorMessage from '@/components/common/error/message.vue'

import { Component, Vue, Ref } from 'vue-property-decorator'

import Header from '@/components/header.vue'
import SessionTimer from "@/components/session-timer/session-timer.vue"

@Component({
  components: {
    SessionTimer,
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
  }
})
export default class App extends Vue {}

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
