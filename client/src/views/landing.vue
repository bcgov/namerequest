<template>
  <v-container id="landing-container" class="ma-0 pa-0" fluid>
    <v-row id="upper-row" no-gutters align-content="start">
      <v-container class="landing-content-container">
        <v-col cols="12" class="mb-4">
          <Stats class="pr-10"/>
        </v-col>
        <v-col cols="12" class="mb-n2">
          <span class="h2 colour-white">Name Request
            <v-tooltip bottom nudge-right="10" content-class="bottom-tooltip" transition="fade-transition">
              <template v-slot:activator="{ on }">
                <sup class="beta-tag" v-on="on">Beta</sup>
              </template>
              <p>The Name Request website is available as a Beta version. Name Requests obtained through the Beta are
                official name requests and can be used in the province of British Columbia.</p>
              <p>As part of a new <a class="" :href="agileUrl">agile software development process</a>, the Name Request
                website will be continually updated and improved based on feedback from citizens and businesses in
                BC.</p>
            </v-tooltip>
          </span>
        </v-col>
        <div class="main-container-style mt-3">
          <transition name="fade" mode="out-in" :duration="{ enter: 100, leave: 100 }">
            <keep-alive :include="['Tabs', 'AnalyzePending']">
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
import ExistingRequestDisplay from '@/components/existing-request/existing-request-display.vue'
import ExistingRequestEdit from '@/components/existing-request/existing-request-edit.vue'
import LowerContainer from '@/components/lower-info-area/lower-container.vue'
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
    ExistingRequestDisplay,
    ExistingRequestEdit,
    LowerContainer,
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

  mounted () {
    const { id } = this
    // If the ID prop is set, load the existing NR
    if (id) {
      this.fetchNr(id)
    }
  }

  async fetchNr (nrId) {
    const existingNr = await newRequestModule.getNameRequest(nrId)
    await newRequestModule.loadExistingNameRequest(existingNr)
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
    cursor: default;
  }
}
.v-application a {
  color: white;
}
</style>
