import * as actions from './actions'
import getters from './getters'
import mutations from './mutations'

export const STATE_KEY = 'payment'

const state = {
  [STATE_KEY]: {
    isVisible: false,
    isProcessing: false,
    paymentTimeoutTimer: undefined,
    fees: {},
    request: {},
    invoice: {},
    receipt: {}
  }
}

export default {
  state,
  actions,
  getters,
  mutations
}
