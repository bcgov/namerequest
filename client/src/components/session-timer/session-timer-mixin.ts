import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import timerModule from '@/modules/vx-timer'
import {
  EXISTING_NR_TIMEOUT_MS,
  EXISTING_NR_TIMER_NAME,
  NR_COMPLETION_TIMEOUT_MS,
  NR_COMPLETION_TIMER_NAME
} from '@/store/new-request-module'

import * as types from '@/store/types'

@Component
export default class SessionTimerMixin extends Vue {
  startNewNrTimer (): Promise<any> {
    return this.startTimer({
      id: NR_COMPLETION_TIMER_NAME,
      expirationFn: () => {
        this.$store.dispatch(types.SHOW_NR_SESSION_EXPIRY_MODAL)
          .then(() => {})
      },
      timeoutMs: NR_COMPLETION_TIMEOUT_MS
    })
  }

  startExistingNrTimer (): Promise<any> {
    return this.startTimer({
      id: EXISTING_NR_TIMER_NAME,
      expirationFn: () => {
        this.$store.dispatch(types.SHOW_NR_SESSION_EXPIRY_MODAL)
          .then(() => {})
      },
      timeoutMs: EXISTING_NR_TIMEOUT_MS
    })
  }

  async startTimer (timerConfig): Promise<any> {
    // Start the user session timer
    return timerModule.createAndStartTimer(timerConfig)
  }
}
