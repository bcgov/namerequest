<template>
  <v-container height="400" id="tabs-landing-comp">
    <v-tabs v-model="tabNumber"
            background-color="#003366"
            active-class="active-tab"
            style="border-radius: 4px 4px 0 0"
            hide-slider
            height="64"
            centered
            grow>
      <v-tab ripple="false"
              id="new-tab"
              class="upper-left-border"
              tabindex="0">
        <span :class="tabNumber === 0 ? 'h5' : 'h5-lt'">New Name Search</span>
      </v-tab>
      <v-tab ripple="false"
              id="existing-tab"
              class="upper-right-border"
              tabindex="1">
        <span :class="tabNumber === 1 ? 'h5' : 'h5-lt'">Existing Name Request</span>
      </v-tab>
      <v-tabs-items class="rounded-b tab-items" v-model="tabNumber">
        <v-tab-item>
          <NewSearch />
        </v-tab-item>
        <v-tab-item>
          <ExistingRequestSearch/>
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>
  </v-container>
</template>

<script lang="ts">
import NewSearch from '@/components/new-request/search.vue'
import ExistingRequestSearch from './existing-request/existing-request-search.vue'
import newReqModule from '../store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: {
    NewSearch,
    ExistingRequestSearch
  }
})
export default class Tabs extends Vue {
  get tabNumber () {
    return newReqModule.tabNumber
  }
  set tabNumber (tab: number) {
    newReqModule.mutateTabNumber(tab)
  }
}

</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';
#tabs-landing-comp {
  max-width: 1140px !important;
  padding: 0 !important;
}
#new-tab, #existing-tab {
  min-height: 64px;
}
.upper-left-border {
  border-top-left-radius: 4px;
  min-height: 58px;
  max-height: 58px;
}
.upper-right-border {
  border-top-right-radius: 4px;
  min-height: 58px;
  max-height: 58px;
}
</style>
