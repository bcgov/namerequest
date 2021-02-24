import * as types from './types'

import { STATE_KEY } from '../store'

export default {
  [types.GET_TIMER]: (state) => (timerId) => {
    return (state[STATE_KEY] && state[STATE_KEY].hasOwnProperty(timerId))
      ? state[STATE_KEY][timerId]
      : undefined
  }
}
