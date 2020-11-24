<template>
  <v-container id="landing-container" fluid>
    <v-row id="upper-row" no-gutters align-content="start">
      <v-container class="content-container" fluid>
        <Stats class="pr-10"/>
        <v-col cols="12" class="h2 ml-3 mt-5 colour-white">
          Name Request <sup class="beta-tag">Beta</sup>
        </v-col>
        <v-col>
          <transition name="flip" mode="out-in">
            <component :is="displayedComponent" :key="displayedComponent" />
          </transition>
        </v-col>
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

<style lang="sass" scoped>
#landing-container
  margin: 0
  padding: 0
  min-width: 1280px !important

.content-container
  max-width: 1280px

#upper-row
  background: url('../assets/images/analyze-name-bg.jpg') no-repeat bottom
  color: white
  min-height: 700px
  padding: 0 200px 0 200px
  background-size: 100%

  @media only screen and (max-width: 1440px)
    background-size: 110%

.beta-tag
  top: -1rem
  color: #FCBA19
  font-size: 19px
  font-weight: bold
  text-transform: uppercase
</style>
