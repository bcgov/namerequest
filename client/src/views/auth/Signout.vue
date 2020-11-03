<template>
  <sbc-signout :redirect-url="nameRequestUrl" />
</template>

<script lang="ts">
// Libraries
import { Component, Vue } from 'vue-property-decorator'

// Components
import SbcSignout from 'sbc-common-components/src/components/SbcSignout.vue'

  @Component({
    components: {
      SbcSignout
    }
  })
export default class Signout extends Vue {
  private get nameRequestUrl (): string {
    return `${window.location.origin}${process.env.VUE_APP_PATH}`
  }
}
</script>
