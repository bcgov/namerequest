<template>
  <v-container class="main-container-style px-9 copy-normal">
    <v-row justify="space-between" class="submission-tabs-top">
      <slot name="container-header" />
      <v-col cols="auto" v-if="displayedComponent !== 'Success'">
        <button id="back-to-search-btn"
                class="modal-activator pa-0 link-std-sans-ul"
                @click="cancelAndResetState">
          <span class="link-std-sans-ul">
            <v-icon class="ma-0 pa-0 mr-n1 mini-back-arrow">arrow_back_ios</v-icon>
            {{ editMode ? 'Return' : 'Start Search Over' }}
          </span>
        </button>
        <countdown-timer v-if="displayTimer" :timerName="timerName" colorString="#1669bb" bgColorString="#efefef" />
      </v-col>
    </v-row>
    <slot name="content"/>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'

import DisplayedComponentMixin from '@/components/mixins/displayed-component-mixin'
import SessionTimerMixin from '@/components/session-timer/session-timer-mixin'
import CountdownTimer from '@/components/session-timer/countdown-timer.vue'

import newReqModule, {
  EXISTING_NR_TIMER_NAME, EXISTING_NR_TIMEOUT_MS,
  NR_COMPLETION_TIMER_NAME, NR_COMPLETION_TIMEOUT_MS
} from '@/store/new-request-module'

@Component({
  components: {
    CountdownTimer
  }
})
export default class MainContainer extends Mixins(SessionTimerMixin, DisplayedComponentMixin) {
  componentName: string = ''
  displayTimer: boolean = false
  timerName: string = ''
  countdownMins: number = 0

  get editMode () {
    return newReqModule.editMode
  }

  @Watch('componentName')
  async onDisplayedComponentChanged () {
    const componentName = newReqModule.displayedComponent
    if (['SubmissionTabs'].indexOf(componentName) > -1) {
      await this.startNewNrTimer()
      this.$set(this, 'displayTimer', true)
      this.$set(this, 'timerName', NR_COMPLETION_TIMER_NAME)
      this.$set(this, 'countdownMins', NR_COMPLETION_TIMEOUT_MS / 1000 / 60)
    } else if (['ExistingRequestEdit'].indexOf(componentName) > -1) {
      await this.startExistingNrTimer()
      this.$set(this, 'displayTimer', true)
      this.$set(this, 'timerName', EXISTING_NR_TIMER_NAME)
      this.$set(this, 'countdownMins', EXISTING_NR_TIMEOUT_MS / 1000 / 60)
    }
  }
}
</script>

<style lang="sass" scoped>
.rounded-corner-6px
  border-radius: 6px !important
</style>
