<template>
  <v-container fluid class="white rounded copy-normal pa-10">
    <v-row justify="space-between" class="submission-tabs-top">
      <slot name="container-header" />
      <v-col cols="auto" class="py-0" v-if="displayedComponent !== 'Success'">
        <button id="back-to-search-btn"
                class="modal-activator link-std-sans-ul"
                @click="cancelAndResetState()">
          <span class="link-std-sans-ul" v-if="isExistingRequestDisplay">
            Exit
            <v-icon color="primary" class="dialog-close mt-n1">mdi-close</v-icon>
          </span>
          <span class="link-std-sans-ul" v-else>
            <v-icon class="mr-n1 mini-back-arrow">mdi-chevron-left</v-icon>
            {{ editMode ? 'Return' : 'Start Search Over' }}
          </span>
        </button>
        <countdown-timer :timerName="timerName" colorString="#1669bb" bgColorString="#efefef" />
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

import newReqModule from '@/store/new-request-module'
import timerModule from "@/modules/vx-timer"

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

  get isExistingRequestDisplay (): boolean {
    return (newReqModule.displayedComponent === 'ExistingRequestDisplay')
  }

  @Watch('componentName')
  async onDisplayedComponentChanged () {
    const componentName = newReqModule.displayedComponent
    if (['SubmissionTabs'].indexOf(componentName) > -1) {
      await this.startNewNrTimer()
      this.$set(this, 'displayTimer', true)
      this.$set(this, 'timerName', this.$NR_COMPLETION_TIMER_NAME)
      this.$set(this, 'countdownMins', this.$NR_COMPLETION_TIMEOUT_MS / 1000 / 60)
    } else if (['ExistingRequestEdit'].indexOf(componentName) > -1) {
      await this.startExistingNrTimer()
      this.$set(this, 'displayTimer', true)
      this.$set(this, 'timerName', this.$EXISTING_NR_TIMER_NAME)
      this.$set(this, 'countdownMins', this.$EXISTING_NR_TIMEOUT_MS / 1000 / 60)
    }
  }
}
</script>
