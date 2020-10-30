<template>
  <sbc-signout :redirect-url="redirectUrl" />
</template>

<script lang="ts">
// Libraries
import { Component, Vue, Prop } from 'vue-property-decorator'

// Components
import SbcSignout from 'sbc-common-components/src/components/SbcSignout.vue'

  @Component({
    components: {
      SbcSignout
    }
  })
export default class Signout extends Vue {
  @Prop() redirectUrl: string
}
</script>
