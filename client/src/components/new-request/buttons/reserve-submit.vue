<template>
  <v-btn @click="reserve" large>Reserve Name and Continue</v-btn>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class ReserveSubmitButton extends Vue {
  reserve () {
    return null
  }
}
</script>

<style scoped lang="sass">

</style>
