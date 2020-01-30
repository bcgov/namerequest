<template>
  <v-container height="400">
    <v-row no-gutters>
      <v-tabs v-model="tabNumber"
              background-color="#003366"
              active-class="active-tab"
              style="border-radius: 5px 5px 0 0"
              :show-arrows="false"
              hide-slider
              height="64"
              centered
              grow>
        <v-tab :ripple="false"
               style="min-height: 64px"
               class="upper-left-border"
               tabindex="0"><span
               :class="tabNumber !== 1 ? 'h5' : 'h5-lt'">New Name Search</span></v-tab>
        <v-tab :ripple="false"
               style="min-height: 64px"
               class="upper-right-border"
               tabindex="1"><span
               :class="tabNumber === 1 ? 'h5' : 'h5-lt'">Existing Name Request</span></v-tab>
        <v-tabs-items v-model="tabNumber">
          <v-tab-item>
            <NewRequest/>
          </v-tab-item>
          <v-tab-item>
            <ExistingRequestSearch/>
          </v-tab-item>
        </v-tabs-items>
      </v-tabs>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import AnalyzePending from '@/components/new-request/analyze-pending'
import AnalyzeResults from '@/components/new-request/analyze-results'
import ExistingRequestDisplay from './existing-request/existing-request-display'
import ExistingRequestSearch from './existing-request/existing-request-search'
import newReqModule from '../store/new-request-module'
import NewRequest from './new-request/new-request'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: {
    AnalyzePending,
    AnalyzeResults,
    ExistingRequestDisplay,
    ExistingRequestSearch,
    NewRequest
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

<style lang="sass" scoped>
.active-tab
   background-color: #003366

.upper-left-border
   border-top-left-radius: 6px
   min-height: 58px
   max-height: 58px

.upper-right-border
   border-top-right-radius: 6px
   min-height: 58px
   max-height: 58px

</style>
