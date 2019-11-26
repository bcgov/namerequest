<template>
  <div id="top-header">
    <img src="@/assets/images/bc-gov-logo.png"
         height="65"
         alt="Weclome to Name Reservations Online"
         title="Name Reservations Online Logo"
         id="bc-gov-logo" />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({})
export default class extends Vue {}

</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#top-header {
  background-color: $header-blue;
  display: inline-block;
  width: 100%;
  align-content: left;
  border-bottom: 3px solid $gold
}
</style>
