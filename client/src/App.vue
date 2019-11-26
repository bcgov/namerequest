<template>
  <v-app id="app">
    <div id="main-column">
      <Header />
      <router-view />
    </div>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Header from '@/components/header.vue'

@Component({
  components: { Header }
})
export default class App extends Vue {}
</script>
<style lang="stylus">
  @import './assets/styles/variables.styl'
  @import './assets/styles/base.styl'

  #app
    background-color #1f1f1f

  #main-column
    padding 0
    margin 0 auto 0 auto
    width 1380px
    max-width 1380px

</style>
