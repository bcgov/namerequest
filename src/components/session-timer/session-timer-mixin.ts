import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import timerModule from '@/modules/vx-timer'

import * as types from '@/store/types'

@Component
export default class SessionTimerMixin extends Vue {
  startNewNrTimer (): Promise<any> {
    return this.startTimer({
      id: this.$NR_COMPLETION_TIMER_NAME,
      expirationFn: () => {
        this.$store.dispatch(types.SHOW_NR_SESSION_EXPIRY_MODAL)
          .then(() => {})
      },
      timeoutMs: this.$NR_COMPLETION_TIMEOUT_MS
    })
  }

  startExistingNrTimer (): Promise<any> {
    return this.startTimer({
      id: this.$EXISTING_NR_TIMER_NAME,
      expirationFn: () => {
        this.$store.dispatch(types.SHOW_NR_SESSION_EXPIRY_MODAL)
          .then(() => {})
      },
      timeoutMs: this.$EXISTING_NR_TIMEOUT_MS
    })
  }

  async startTimer (timerConfig): Promise<any> {
    // Start the user session timer
    return timerModule.createAndStartTimer(timerConfig)
  }
}
