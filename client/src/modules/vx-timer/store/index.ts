import * as actions from './actions'
import getters from './getters'
import mutations from './mutations'

export const STATE_KEY = 'vxtimers'

const state = {
  [STATE_KEY]: {
    currentTimers: new Map()
  }
}

export default {
  state,
  actions,
  getters,
  mutations
}
