<template>
  <div>
    <v-col cols="12" class="mb-4">
      <Stats v-if="!isMobile" class="pr-10"/>
    </v-col>
    <v-col cols="12" class="mb-n2">
      <span class="h2 colour-white">Name Request
      </span>
    </v-col>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import Stats from '@/components/new-request/stats.vue'

@Component({
  components: {
    Stats
  }
})
export default class AppTitleCols extends Vue {
  @Prop(String)
  readonly id: string

  @Getter isMobile!: boolean
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';

.colour-white {
  color: white !important;
}

</style>
