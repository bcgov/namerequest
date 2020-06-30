import * as types from './types'

export const createAndStartTimer = ({ commit }, param: boolean) => {
  commit(types.CREATE_AND_START_TIMER, param)
}

export const createPromiseTimer = ({ commit }, param: boolean) => {
  commit(types.CREATE_PROMISE_TIMER, param)
}

export const restartTimer = ({ commit }, param: boolean) => {
  commit(types.RESTART_TIMER, param)
}

export const refreshTimer = ({ commit }, param: boolean) => {
  commit(types.REFRESH_TIMER, param)
}

export const stopTimer = ({ commit }, param: boolean) => {
  commit(types.STOP_TIMER, param)
}
