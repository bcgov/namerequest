import * as types from './types'

import { STATE_KEY } from '../store'

export default {
  // TODO: Remove this doesn't appear to work...
  [types.HAS_ERRORS]: (state): boolean => {
    return state[STATE_KEY].length > 0
  },
  [types.GET_ERROR]: (state, errorId: string) => {
    const error = state[STATE_KEY].find((item) => item.id === errorId)
    return error || undefined
  },
  [types.GET_ERRORS]: (state) => {
    return state[STATE_KEY]
  }
}
