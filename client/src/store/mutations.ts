import * as types from './types'

export default {
  [types.SHOW_NR_SESSION_EXPIRY_MODAL]: (state) => {
    state.showNrSessionExpiryModal = true
  },
  [types.HIDE_NR_SESSION_EXPIRY_MODAL]: (state) => {
    state.showNrSessionExpiryModal = false
  }
}
