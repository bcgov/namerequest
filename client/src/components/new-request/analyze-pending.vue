<template>
  <MainContainer id="analyze-pending-container">
    <template v-slot:container-header>
      <v-col cols="auto" class="font-weight-bold py-0 mt-1">
        You are searching for a name for a
        {{ entityText === ' BC Corporation' && location.text === ' BC' ? '' : ' ' + location.text }} {{ entityText }}
      </v-col>
    </template>
    <template v-slot:content>
      <v-row no-gutters class="mt-3">
        <NameInput is-search-again="true"/>
      </v-row>
      <v-row justify="center" class="mt-n7 mb-n3 py-0">
        <v-col cols="auto">
          Names containing these words: {{ totalNamesAnalyzing }}
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="auto">
          <v-progress-circular
            id="analyze-pending-spinner"
            :rotate="-90"
            :size="70"
            :width="6.5"
            :value="percentAnalyzed"
            style="color:#FCBA19; font-size=16px"
          >
            <b style="color:#495057">{{ percentAnalyzed }}%</b>
          </v-progress-circular>
        </v-col>
      </v-row>
      <v-row justify="center" class="mt-n3">
        <v-col cols="auto" class="copy-small">
          <b>Estimated Analysis Time:</b>
        </v-col>
      </v-row>
      <v-row justify="center" class="mt-n3">
        <v-col cols="auto" class="copy-small">
          {{ estimatedTime }}
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="auto" class="pb-0 pr-1">
          <v-btn id="analyze-pending-stop-button" @click="startOver">Stop Search</v-btn>
        </v-col>
        <v-col cols="auto" class="pb-0">
          <ReserveSubmit setup="cancel" />
        </v-col>
      </v-row>
    </template>
  </MainContainer>
</template>

<script lang="ts">
import MainContainer from '@/components/new-request/main-container.vue'
import ReserveSubmit from '@/components/new-request/submit-request/reserve-submit.vue'
import newReqModule from '@/store/new-request-module'
import NameInput from '@/components/new-request/name-input.vue'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: { ReserveSubmit, MainContainer, NameInput }
})
export default class AnalyzePending extends Vue {
  get entityObject () {
    return newReqModule.entityTypeOptions.find((ent: any) => ent.value === this.entity_type_cd)
  }
  get entityText () {
    return newReqModule.entityTextFromValue
  }
  get entity_type_cd () {
    return newReqModule.entity_type_cd
  }
  get estimatedTime () {
    let start = newReqModule.pendingStartTime
    let lastProgressUpdate = newReqModule.pendingLastProgressUpdate
    if (!start || !lastProgressUpdate || !this.percentAnalyzed) {
      return '...'
    }
    let timeTaken = (lastProgressUpdate - start) / 1000
    let timeLeft = Math.floor(timeTaken * (100 / this.percentAnalyzed) - timeTaken)
    let minutes = Math.floor(timeLeft / 60)
    let time = minutes + ' minutes ' + timeLeft % 60 + ' seconds'
    if (minutes === 1) {
      time = time.replace('minutes', 'minute')
    }
    return time
  }
  get location () {
    let value = newReqModule.location
    let options = newReqModule.locationOptions
    return options.find((opt: any) => opt.value === value)
  }
  get percentAnalyzed () {
    let processed = newReqModule.pendingProcessed
    let total = newReqModule.pendingTotal
    if (!total) {
      return 0
    }
    return Math.floor((processed / total) * 100)
  }
  get request_action_cd () {
    switch (newReqModule.request_action_cd) {
      case 'new':
        return 'a new'
      case 'existing':
        return 'an existing'
      default:
        return 'a new'
    }
  }
  get totalNamesAnalyzing () {
    return newReqModule.pendingTotal
  }
  startOver () {
    newReqModule.cancelAnalyzeName('Tabs')
  }
}

</script>

<style lang="scss" scoped>

</style>
