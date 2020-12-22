import { Timer, TimerOptions } from '../timer'

// TODO: Do something to correct IDE param detection... maybe we can curry these or something.
export default {
  createAndStartTimer: (state, opts: TimerOptions): Timer | undefined => {
    const { id } = opts
    const { timers } = state
    if (!id) throw new Error(`[Error] Timer needs an ID, none provided`)
    // console.info('Creating and starting timer =', id) // eslint-disable-line no-console
    const timer = new Timer(opts)
    // Add the timer to state
    timers[id] = timer
    timer.start()
    state.timers = timers
    return timer
  },
  // NOT USED
  // createPromiseTimer: (state, opts: TimerOptions): Promise<Timer | any> => {
  //   const { id, timeoutMs } = opts
  //   const { timers } = state
  //   if (!id) throw new Error(`[Error] Timer needs an ID, none provided`)
  //   if (timers.hasOwnProperty(id)) {
  //     // eslint-disable-next-line no-console
  //     console.warn(`[Warning] Timer [${id}] already exists`)
  //     return
  //   }
  //   const promiseTimer = new Promise((resolve) => {
  //     const timer = new Timer({
  //       id: `promiseTimer:${id}`,
  //       timeoutMs: timeoutMs,
  //       expirationFn: () => {
  //         // eslint-disable-next-line no-debugger
  //         // alert('Promise expired')
  //         resolve(null)
  //       },
  //       pollRate: 100 // Check every 100 milliseconds
  //     })
  //     // Add the timer to state
  //     timers[id] = timer
  //     timer.start()
  //     state.timers = timers
  //   })
  //   return promiseTimer
  // },
  restartTimer: (state, opts: TimerOptions): void => {
    const { id } = opts
    const { timers } = state
    if (!id) throw new Error(`[Error] Timer ID was not provided`)
    if (!timers.hasOwnProperty(id)) throw new Error(`[Error] Timer with ID [${id}] does not exist`)
    // console.info('Restarting timer =', id) // eslint-disable-line no-console
    const timer = timers[id]
    // Update the timer in state
    timers[id] = timer
    state.timers = timers
  },
  refreshTimer: (state, opts: TimerOptions): void => {
    const { id, timeoutMs } = opts
    const { timers } = state
    if (!id) throw new Error(`[Error] Timer ID was not provided`)
    if (!timers.hasOwnProperty(id)) throw new Error(`[Error] Timer with ID [${id}] does not exist`)
    // console.info('Refreshing timer =', id) // eslint-disable-line no-console
    const timer = timers[id]
    timer.refresh()
    if (timeoutMs) {
      timer.timeoutMs = timeoutMs
    }
    // Update the timer in state
    timers[id] = timer
    state.timers = timers
  },
  stopTimer: (state, opts: TimerOptions): void => {
    const { id } = opts
    const { timers = {} } = state
    if (!id) throw new Error(`[Error] Timer ID was not provided`)
    const timer = timers[id]
    if (timer) {
      // console.info('Stopping timer =', id) // eslint-disable-line no-console
      timer.stop()
      // Remove the timer from state
      delete timers[id]
      state.timers = timers
    }
  }
}
