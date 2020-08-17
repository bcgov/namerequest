<template>
  <v-app id="app">
    <div id="main-column">
      <Header />
      <router-view />
    </div>
    <!--All v-dialogue (modal) components App-wide-->
    <LocationInfoModal />
    <HelpMeChoose />
    <NrNotRequired />
    <PickEntityOrConversion />
    <PickRequestType />
    <PaymentModal />
    <ReceiptModal />
    <IncorporateLoginModal />
    <AffiliationErrorModal />
  </v-app>
</template>

<script lang="ts">
import HelpMeChoose from '@/components/modals/help-me-choose.vue'
import LocationInfoModal from '@/components/modals/location-info.vue'
import NrNotRequired from '@/components/modals/nr-not-required.vue'
import PickEntityOrConversion from '@/components/modals/pick-entity-or-conversion.vue'
import PickRequestType from '@/components/modals/pick-request-type.vue'
import PaymentModal from '@/components/modals/payment.vue'
import ReceiptModal from '@/components/modals/receipt.vue'
import IncorporateLoginModal from '@/components/modals/incorporate-login.vue'
import AffiliationErrorModal from '@/components/modals/affiliation-error.vue'

import { Component, Vue, Ref } from 'vue-property-decorator'

import Header from '@/components/header.vue'

@Component({
  components: {
    Header,
    LocationInfoModal,
    NrNotRequired,
    HelpMeChoose,
    PickEntityOrConversion,
    PickRequestType,
    PaymentModal,
    ReceiptModal,
    IncorporateLoginModal,
    AffiliationErrorModal
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
