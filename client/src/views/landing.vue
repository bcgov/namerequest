<template>
  <v-container id="landing-container" fluid>
    <v-row id="upper-row" no-gutters align-content="start">
      <Stats />
      <v-col align-self="end" cols="12" class="h2 mb-n4 white-text">
        Name Request
      </v-col>
      <v-col>
        <transition name="flip" mode="out-in">
          <Tabs id="new-req-existing-req-container"
                class="flip-class box-style"
                v-if="searchShowStage === 'search' "
                key="landing-1" />
          <AnalyzePending v-if="searchShowStage === 'analyzing' "
                          id="analyze-pending-container"
                          key="landing-2"
                          class="box-style flip-class" />
          <AnalyzeResults v-if="searchShowStage === 'results' "
                          id="analyze-results-container"
                          key="landing-3"
                          class="box-style flip-class" />
        </transition>
      </v-col>
    </v-row>
    <v-row id="lower-row" no-gutters>
      <LowerContainer />
    </v-row>
 </v-container>
</template>

<script lang="ts">
import AnalyzePending from '@/components/new-request/analyze-pending.vue'
import AnalyzeResults from '@/components/new-request/analyze-results.vue'
import LowerContainer from '@/components/lower-info-area/lower-container.vue'
import Stats from '@/components/new-request/stats.vue'
import newReqModule from '@/store/new-request-module'
import Tabs from '@/components/tabs.vue'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: { Stats, AnalyzePending, AnalyzeResults, LowerContainer, Tabs }
})
export default class Landing extends Vue {
  get searchShowStage () {
    return newReqModule.searchShowStage
  }
}

</script>

<style lang="sass" scoped>
#landing-container
  margin: 0
  padding: 0

#name-container, .box-style
  background-color: white
  padding: 0
  margin-top: 25px
  border-radius: 5px
  font-size: 16px
  color: $text
  margin-bottom: auto

#upper-row
  background: url('../assets/images/analyze-name-bg.jpg')
  background-size: 1380px 700px
  height: 700px
  color: white
  padding: 0 200px 0 200px

.flip-class
  transform-style: preserve-3d
  perspective: 1000px
  perspective-origin: center
  backface-visibility: visible

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
