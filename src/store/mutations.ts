import * as types from './types'

export default {
  [types.SHOW_NR_SESSION_EXPIRY_MODAL]: (state) => {
    state.showNrSessionExpiryModal = true
  },

  [types.HIDE_NR_SESSION_EXPIRY_MODAL]: (state) => {
    state.showNrSessionExpiryModal = false
  }

  // NOT USED
  // [types.SET_ROLLBACK_ON_EXPIRE]: (state, value) => {
  //   state.rollbackOnExpire = value
  // },

  // NOT USED
  // [types.SET_CHECK_IN_ON_EXPIRE]: (state, value) => {
  //   state.checkInOnExpire = value
  // }
}
