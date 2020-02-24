<template>
  <v-app id="app">
    <div id="main-column">
      <Header />
      <router-view />
    </div>
    <!--All v-dialogue (modal) components App-wide-->
    <HelpMeChoose />
    <NrNotRequired />
    <PickEntity />
    <PickRequestType />
  </v-app>
</template>

<script lang="ts">
import HelpMeChoose from '@/components/modals/help-me-choose.vue'
import NrNotRequired from '@/components/modals/nr-not-required.vue'
import PickEntity from '@/components/modals/pick-entity.vue'
import PickRequestType from '@/components/modals/pick-request-type.vue'
import { Component, Vue, Ref } from 'vue-property-decorator'
import Header from '@/components/header'

@Component({
  components: { NrNotRequired, HelpMeChoose, PickEntity, PickRequestType, Header }
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
