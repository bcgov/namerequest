<template>
  <v-container id="landing-container" class="ma-0 pa-0" fluid>
    <v-row id="upper-row" no-gutters align-content="start">
      <v-container class="landing-content-container">
        <v-col cols="12" class="mb-4">
          <Stats class="pr-10"/>
        </v-col>
        <v-col cols="12" class="mb-n2">
          <span class="h2 colour-white">Name Request
            <v-tooltip bottom nudge-right="10"
                       nudge-top="5"
                       content-class="bottom-tooltip"
                       transition="fade-transition"
                       class="test-class"
                       :open-on-hover="false">
              <template v-slot:activator="{ on }">
                <v-btn class="beta-wrapper-btn ml-n2 mb-n2 pa-0"
                       @click="on.click"
                       @blur="on.blur"
                       :ripple="false"
                       retain-focus-on-click>
                  <sup class="beta-tag">Beta</sup>
                </v-btn>
              </template>
              <p>The Name Request website is available as a Beta version. Name Requests obtained through the Beta are
                official name requests and can be used in the province of British Columbia.</p>
              <p class="mb-0">As part of a new
                <a class="white--text" :href="agileUrl" target="_blank">agile software development process</a>,
                the Name Request website will be continually updated and improved based on feedback from citizens and
                businesses in BC.</p>
            </v-tooltip>
          </span>
        </v-col>
        <div class="main-container-style mt-3">
          <transition name="fade" mode="out-in" :duration="{ enter: 100, leave: 100 }">
            <keep-alive :include="['Tabs']">
              <component :is="displayedComponent" :key="displayedComponent" transition="fade-transition" />
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

import AnalyzeCharacters from '@/components/new-request/analyze-characters.vue'
import AnalyzePending from '@/components/new-request/analyze-pending.vue'
import AnalyzeResults from '@/components/new-request/analyze-results.vue'
import SendToExamination from '@/components/new-request/send-to-examination.vue'
import ExistingRequestDisplay from '@/components/existing-request/existing-request-display.vue'
import ExistingRequestEdit from '@/components/existing-request/existing-request-edit.vue'
import LowerContainer from '@/components/lower-info-area/lower-container.vue'
import QuickSearchPending from '@/components/new-request/quick-search-pending.vue'
import QuickSearchResults from '@/components/new-request/quick-search-results.vue'
import SearchPending from '@/components/existing-request/search-pending.vue'
import Stats from '@/components/new-request/stats.vue'
import SubmissionTabs from '@/components/new-request/submit-request/submission-tabs.vue'
import Success from '@/components/common/success.vue'
import Tabs from '@/components/tabs.vue'
import newRequestModule from '@/store/new-request-module'

@Component({
  components: {
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
  @Prop(String) id: string
  private agileUrl = 'https://www2.gov.bc.ca/gov/content/employment-business/business/managing-a-business' +
    '/permits-licences/news-updates/modernization'

  async mounted () {
    const { id } = this
    // If the ID prop is set, load the existing NR
    if (id) {
      await this.fetchNr(+id)
    }
  }

  async fetchNr (nrId: number): Promise<void> {
    const nrData = await newRequestModule.getNameRequest(nrId)
    await newRequestModule.loadExistingNameRequest(nrData)
  }

  get displayedComponent () {
    return newRequestModule.displayedComponent
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';

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
.beta-tag {
  top: -1rem;
  color: $BCgovGold5;
  font-size: 19px;
  font-weight: bold;
  text-transform: uppercase;
  &:hover {
    cursor: pointer;
  }
}
.beta-wrapper-btn {
  background-color: inherit !important;
  box-shadow: unset !important;
  font: inherit !important;
  height: inherit !important;
  &:before {
    background-color: inherit !important;
  }
}
.v-tooltip__content {
  pointer-events: auto !important;
}
</style>
