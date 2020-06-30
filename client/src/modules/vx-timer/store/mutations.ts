import * as types from './types'
import { Timer } from '../timer'

import { STATE_KEY } from '../store'

function _startTimer (timers, timer) {
  timers[timer.id] = timer
  timer.start()
}

export default {
  [types.CREATE_AND_START_TIMER]: (state, opts: any) => {
    const { id } = opts

    if (!id) {
      // console.log(`[Error] Timer needs a name, none provided`, opts)
      return false
    }
    // TODO: Should we validate all timer options here as well??
    if (this.getTimer(id)) {
      // If timer already exists, should we fail here? Or start again, or?
      // console.log(`[Warning] Timer already exists, not creating a new one`, opts)
      return false
    }

    // TODO: Catch any errors here in the the creation??
    const timer = new Timer(opts)
    this._startTimer(timer)

    // Return the timer instance
    return timer
  },
  [types.CREATE_PROMISE_TIMER]: (state, opts: any) => {
    const { milliseconds, name } = opts

    return new Promise((resolve) => { // $.Deferred()
      this.createAndStartNewTimer({
        name: `promiseTimer:${name}`,
        timeout_ms: milliseconds,
        expiration_fn() {
          resolve()
        },
        poll_rate: 100 // Check every 100 milliseconds
      })
    })
  },
  [types.RESTART_TIMER]: (state, opts: any) => {
    const { id, config } = opts

    const timer = this.getTimer(id)
    if (!timer) {
      if (!config.silent) {
        // console.log(`[Warning] No timer found to restart for ${id}`)
      }
      return
    }
    this._startTimer(timer)
  },
  [types.REFRESH_TIMER]: (state, opts: any) => {
    const { id, newTimeoutMs } = opts

    const timer = this.getTimer(id)
    if (!timer) {
      // console.log(`[Warning] No timer found to refresh for ${id}`)
      return
    }
    timer.refresh()
    if (newTimeoutMs) {
      timer.timeout_ms = newTimeoutMs
    }
  },
  [types.STOP_TIMER]: (state, opts: any) => {
    const { id } = opts

    const timer = this.getTimer(id)
    if (!timer) {
      // console.log(`[Warning] No timer found to stop for ${id}`)
      return
    }
    timer.stop()
    delete this._currentTimers[id]
  }
}
