<template>
  <v-container id="landing-container" class="ma-0 pa-0" fluid>
    <v-row id="upper-row" no-gutters align-content="start">
      <v-container class="landing-content-container">
        <AppTitleCols />

        <div class="main-container-style mt-3">
          <transition name="fade" mode="out-in" :duration="{ enter: 100, leave: 100 }">
            <keep-alive :include="['Tabs']">
              <component :is="getDisplayedComponent" :key="getDisplayedComponent" transition="fade-transition" />
            </keep-alive>
          </transition>
        </div>
      </v-container>
    </v-row>

    <v-row id="lower-row" no-gutters>
      <LowerContainer />
    </v-row>
 </v-container>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

// Components
import { AppTitleCols } from '@/components/common'
import LowerContainer from '@/components/lower-info-area/lower-container.vue'

import AnalyzeCharacters from '@/components/new-request/analyze-characters.vue'
import AnalyzePending from '@/components/new-request/analyze-pending.vue'
import AnalyzeResults from '@/components/new-request/analyze-results.vue'
import SendToExamination from '@/components/new-request/send-to-examination.vue'
import ExistingRequestDisplay from '@/components/existing-request/existing-request-display.vue'
import ExistingRequestEdit from '@/components/existing-request/existing-request-edit.vue'
import QuickSearchPending from '@/components/new-request/quick-search-pending.vue'
import QuickSearchResults from '@/components/new-request/quick-search-results.vue'
import SearchPending from '@/components/existing-request/search-pending.vue'
import Stats from '@/components/new-request/stats.vue'
import SubmissionTabs from '@/components/new-request/submit-request/submission-tabs.vue'
import Success from '@/components/common/success.vue'
import Tabs from '@/components/tabs.vue'

import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({
  components: {
    AppTitleCols,
    AnalyzeCharacters,
    AnalyzePending,
    AnalyzeResults,
    SendToExamination,
    ExistingRequestDisplay,
    ExistingRequestEdit,
    LowerContainer,
    QuickSearchPending,
    QuickSearchResults,
    SearchPending,
    Stats,
    SubmissionTabs,
    Success,
    Tabs
  }
})
export default class Landing extends Vue {
  @Getter getDisplayedComponent!: string

  @Action getNameRequest!: ActionBindingIF
  @Action loadExistingNameRequest!: ActionBindingIF
  @Action setDisplayedComponent!: ActionBindingIF

  // TODO: IS THIS USED?
  @Prop(String) id: string

  private agileUrl = 'https://www2.gov.bc.ca/gov/content/employment-business/business/managing-a-business' +
    '/permits-licences/news-updates/modernization'

  // TODO: IS THIS USED?
  async mounted () {
    const { id } = this
    // If the ID prop is set, load the existing NR
    if (id) {
      await this.fetchNr(+id)
    }
  }

  // TODO: IS THIS USED?
  async fetchNr (nrId: number): Promise<void> {
    const nrData = await this.getNameRequest(nrId)
    await this.loadExistingNameRequest(nrData)
  }
}
</script>

<style lang="scss" scoped>
/*@import '@/assets/scss/theme.scss';*/

.landing-content-container {
  min-width: 940px;
  max-width: 1140px;
}

#upper-row {
  background: url('../assets/images/analyze-name-bg.jpg') no-repeat bottom;
  background-size: cover;
  color: white;
  min-height: 700px;
}
</style>
