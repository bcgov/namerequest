<template>
  <v-row no-gutters id="lower-info-area-footer">
    <v-col>
      <a href="http://www.bcregistryservices.gov.bc.ca">Home</a>
      <span class="mx-2">|</span>
      <a href="https://www2.gov.bc.ca/gov/content/home/disclaimer">Disclaimer</a>
      <span class="mx-2">|</span>
      <a href="https://www2.gov.bc.ca/gov/content/home/privacy">Privacy</a>
      <span class="mx-2">|</span>
      <a href="https://www2.gov.bc.ca/gov/content/home/accessible-government">Accessibility</a>
      <span class="mx-2">|</span>
      <a href="https://www2.gov.bc.ca/gov/content/home/copyright">Copyright</a>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class Footer extends Vue {}

</script>

<style lang="sass" scoped>
a, a:visited, a:hover, a:active
  color: white !important

#lower-info-area-footer
  background-color: $header-blue
  border-top: 3px solid $gold
  height: 58px
  color: white
  padding: 15px

</style>
