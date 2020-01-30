<template>
  <v-btn :color="setup === 'consent' ? 'red' : ''" class="mt-auto margin-top-auto">
    {{ text }}
  </v-btn>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({})
export default class ReserveSubmitButton extends Vue {
  @Prop(String) setup: string
  get text () {
    switch (this.setup) {
      case 'consent':
        return 'Conditionally Reserve'
      case 'examine':
        return 'Send for Examination'
      default:
        return 'Reserve and Continue'
    }
  }
}
</script>

<style scoped lang="sass">
.margin-top-auto
  margin-top: auto !important
</style>
