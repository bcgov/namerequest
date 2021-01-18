<template>
  <v-container fluid class="white rounded copy-normal pa-10">
    <v-row justify="space-between" class="submission-tabs-top">
      <slot name="container-header" />
      <v-col cols="auto" class="py-0" v-if="displayedComponent !== 'Success'">
        <button id="back-to-search-btn"
                class="modal-activator link-std-sans-ul"
                @click="backToSearch()">
          <span class="link-std-sans-ul" v-if="showExit">
            Exit
            <v-icon color="primary" class="dialog-close mt-n1">mdi-close</v-icon>
          </span>
          <span class="link-std-sans-ul" v-else>
            <v-icon class="mr-n1 mini-back-arrow">mdi-chevron-left</v-icon>
            {{ editMode ? 'Return' : 'Start Over' }}
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

  private mounted () {
    this.$nextTick(() => {
      // add classname to button text (for more detail in Sentry breadcrumbs)
      if (this.showExit) {
        this.$el.querySelector("#back-to-search-btn > span")?.classList.add("exit-btn")
      } else if (this.editMode) {
        this.$el.querySelector("#back-to-search-btn > span")?.classList.add("return-btn")
      } else {
        this.$el.querySelector("#back-to-search-btn > span")?.classList.add("start-search-over-btn")
      }
    })
  }

  get editMode () {
    return newReqModule.editMode
  }

  get showExit (): boolean {
    return [2, 3].includes(newReqModule.submissionTabNumber) ||
      newReqModule.displayedComponent === 'ExistingRequestDisplay'
  }

  backToSearch () {
    if ([2, 3].includes(newReqModule.submissionTabNumber) && !this.editMode &&
      newReqModule.displayedComponent !== 'ExistingRequestDisplay') {
      newReqModule.mutateExitModalVisible(true)
    } else {
      this.cancelAndResetState()
    }
  }

  @Watch('componentName')
  async onDisplayedComponentChanged () {
    const componentName = newReqModule.displayedComponent
    if (['SubmissionTabs'].indexOf(componentName) > -1 && this.$NR_COMPLETION_TIMEOUT_MS > 0) {
      await this.startNewNrTimer()
      this.$set(this, 'displayTimer', true)
      this.$set(this, 'timerName', this.$NR_COMPLETION_TIMER_NAME)
      this.$set(this, 'countdownMins', this.$NR_COMPLETION_TIMEOUT_MS / 1000 / 60)
    } else if (['ExistingRequestEdit'].indexOf(componentName) > -1 && this.$EXISTING_NR_TIMEOUT_MS > 0) {
      await this.startExistingNrTimer()
      this.$set(this, 'displayTimer', true)
      this.$set(this, 'timerName', this.$EXISTING_NR_TIMER_NAME)
      this.$set(this, 'countdownMins', this.$EXISTING_NR_TIMEOUT_MS / 1000 / 60)
    }
  }
}
</script>

<style lang="scss" scoped>
#back-to-search-btn:focus {
  outline:0;
}
</style>
