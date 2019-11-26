<template>
  <div id="top-header">
    <img src="@/assets/images/bc-gov-logo.png" id="bc-gov-logo" />
  </div>
</template>

<script>
  export default {
    name: 'Header'
  }
</script>

<style lang="stylus" scoped>
  #top-header
    height 68px
    top 0px
    left 0px
    width 100%
    background-color var(--d-blue)
    border-bottom 2px solid var(--gold)
</style>
