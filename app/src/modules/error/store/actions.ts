import * as types from './types'

export interface ErrorI {
  id: string,
  error: any
}

export const setAppError = ({ commit }, error: ErrorI) => {
  commit(types.SET_ERROR, error)
}

export const setAppErrors = ({ commit }, errors: ErrorI[]) => {
  commit(types.SET_ERRORS, errors)
}

export const clearAppError = ({ commit }, id: string) => {
  commit(types.CLEAR_ERROR, id)
}

export const clearAppErrors = ({ commit }) => {
  commit(types.CLEAR_ERRORS)
}
