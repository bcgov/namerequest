import * as types from './types'

export const showNrSessionExpiryModal = ({ commit }) => {
  commit(types.SHOW_NR_SESSION_EXPIRY_MODAL)
}

export const hideNrSessionExpiryModal = ({ commit }) => {
  commit(types.HIDE_NR_SESSION_EXPIRY_MODAL)
}

export const setRollbackOnExpire = ({ commit }, value) => {
  commit(types.SET_ROLLBACK_ON_EXPIRE, value)
}

export const setCheckInOnExpire = ({ commit }, value) => {
  commit(types.SET_CHECK_IN_ON_EXPIRE, value)
}
