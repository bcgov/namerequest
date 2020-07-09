import * as types from './types'

import { STATE_KEY } from '../store'

export default {
  [types.GET_TIMER]: (state, timerId) => {
    return (state[STATE_KEY].currentTimers.has(timerId))
      ? state[STATE_KEY].currentTimers.get(timerId)
      : undefined
  }
}
