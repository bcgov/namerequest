import * as types from './types'
import { TimerOptions } from '../timer'

export const createAndStartTimer = ({ commit }, opts: TimerOptions) => {
  // eslint-disable-next-line no-debugger
  commit(types.CREATE_AND_START_TIMER, opts)
}

export const createPromiseTimer = ({ commit }, opts: TimerOptions) => {
  commit(types.CREATE_PROMISE_TIMER, opts)
}

export const restartTimer = ({ commit }, opts: TimerOptions) => {
  commit(types.RESTART_TIMER, opts)
}

export const refreshTimer = ({ commit }, opts: TimerOptions) => {
  commit(types.REFRESH_TIMER, opts)
}

export const stopTimer = ({ commit }, opts: TimerOptions) => {
  commit(types.STOP_TIMER, opts)
}
