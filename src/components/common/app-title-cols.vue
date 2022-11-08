<template>
  <v-row no-gutters>
    <v-col cols="12" md="6" lg="6" class="mt-4 pl-2" :class="{'pt-10': !isMobile}">
      <span class="h2 colour-white">Name Request
      </span>
    </v-col>
    <v-col cols="12" md="6" lg="6">
      <Stats />
    </v-col>
  </v-row>
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
@import '@/assets/styles/theme.scss';

.colour-white {
  color: white !important;
}

</style>
