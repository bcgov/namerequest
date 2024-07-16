import * as types from './types'

import { ErrorI } from '@/modules/error/store/actions'

import { STATE_KEY } from '../store'

export default {
  [types.SET_ERROR]: (state, err: ErrorI) => {
    const existingError = state[STATE_KEY].find((item) => item.id === err.id)
    if (existingError) {
      state[STATE_KEY][state[STATE_KEY].indexOf(existingError)] = existingError
    } else {
      state[STATE_KEY].push(err)
    }
  },
  [types.SET_ERRORS]: (state, errArr: ErrorI[]) => {
    const errors = state[STATE_KEY]
    errArr.map((err) => {
      const existingError = state[STATE_KEY].find((item) => item.id === err.id)
      if (existingError) {
        state[STATE_KEY][state[STATE_KEY].indexOf(existingError)] = existingError
      } else {
        state[STATE_KEY].push(err)
      }
    })
    state[STATE_KEY] = errors
  },
  [types.CLEAR_ERROR]: (state, id: any) => {
    const existingError = state[STATE_KEY].find((item) => item.id === id)
    if (existingError) {
      delete state[STATE_KEY][state[STATE_KEY].indexOf(existingError)]
    }
  },
  [types.CLEAR_ERRORS]: (state) => {
    state[STATE_KEY] = []
  }
}
