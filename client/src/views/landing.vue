<template>
  <v-container id="landing-container" fluid>
    <v-row id="upper-row" no-gutters align-content="start">
      <Stats class="py-0 mt-3 mb-n8 mr-3" />
      <v-col align-self="end" cols="12" class="h2 mb-1 white-text">
        Name Request
      </v-col>
      <v-col>
        <transition name="flip" mode="out-in">
          <component :is="displayedComponent" :key="displayedComponent" />
        </transition>
      </v-col>
    </v-row>
    <v-row id="lower-row" no-gutters>
      <LowerContainer />
    </v-row>
 </v-container>
</template>

<script lang="ts">
import AnalyzeCharacters from '@/components/new-request/analyze-characters'
import AnalyzePending from '@/components/new-request/analyze-pending'
import AnalyzeResults from '@/components/new-request/analyze-results'
import LowerContainer from '@/components/lower-info-area/lower-container'
import newReqModule from '@/store/new-request-module'
import Stats from '@/components/new-request/stats'
import SubmissionTabs from '@/components/new-request/submit-request/submission-tabs'
import Tabs from '@/components/tabs'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: {
    AnalyzeCharacters,
    AnalyzePending,
    AnalyzeResults,
    LowerContainer,
    Stats,
    SubmissionTabs,
    Tabs
  }
})
export default class Landing extends Vue {
  get displayedComponent () {
    return newReqModule.displayedComponent
  }
}

</script>

<style lang="sass" scoped>
#landing-container
  margin: 0
  padding: 0

#name-container, .box-style
  background-color: white
  border-radius: 5px
  color: $text
  font-size: 16px
  margin-bottom: auto
  margin-top: 0
  padding: 0

#upper-row
  background-size: 1380px 700px
  background: url('../assets/images/analyze-name-bg.jpg')
  color: white
  height: 700px
  padding: 0 200px 0 200px

.flip-class
  backface-visibility: visible
  perspective-origin: center
  perspective: 1000px
  transform-style: preserve-3d

.flip-enter
  transform: rotateX(90deg)

.flip-enter-active, .flip-leave-active
  transition: all .2s ease-in

.flip-enter-to
  transform: rotateX(0deg)

.flip-leave
  transform: rotateX(0deg)

.flip-leave-to
  transform: rotateX(90deg)

.white-text
  color: white

</style>
