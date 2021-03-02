<template>
  <sbc-signout :redirect-url="getNameRequestUrl" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mapGetters } from 'vuex'
import SbcSignout from 'sbc-common-components/src/components/SbcSignout.vue'

@Component({
  components: {
    SbcSignout
  },
  computed: {
    ...mapGetters(['getNameRequestUrl'])
  }
})
export default class Signout extends Vue {
  readonly getNameRequestUrl!: string
}
</script>
