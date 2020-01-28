<template>
  <div id="top-header">
    <img alt="Weclome to Name Reservations Online"
         height="65"
         id="bc-gov-logo"
         src="@/assets/images/bc-gov-logo.png"
         title="Name Reservations Online Logo" />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({})
export default class Header extends Vue {}

</script>

<style lang="sass" scoped>
#top-header
  background-color: $header-blue
  display: inline-block
  width: 100%
  align-content: left
  border-bottom: 3px solid $gold

</style>
