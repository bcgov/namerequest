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
    <PickEntity />
    <PickRequestType />
    <PaymentModal />
  </v-app>
</template>

<script lang="ts">
import HelpMeChoose from '@/components/modals/help-me-choose.vue'
import LocationInfoModal from '@/components/modals/location-info.vue'
import NrNotRequired from '@/components/modals/nr-not-required.vue'
import PickEntity from '@/components/modals/pick-entity.vue'
import PickRequestType from '@/components/modals/pick-request-type.vue'
import PaymentModal from '@/components/modals/payment.vue'
import { Component, Vue, Ref } from 'vue-property-decorator'

import Header from '@/components/header.vue'

@Component({
  components: {
    Header,
    LocationInfoModal,
    NrNotRequired,
    HelpMeChoose,
    PickEntity,
    PickRequestType,
    PaymentModal
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
