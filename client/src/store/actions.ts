import * as types from './types'

export const showNrSessionExpiryModal = ({ commit }) => {
  commit(types.SHOW_NR_SESSION_EXPIRY_MODAL)
}

export const hideNrSessionExpiryModal = ({ commit }) => {
  commit(types.HIDE_NR_SESSION_EXPIRY_MODAL)
}
