import * as actions from './actions'
import getters from './getters'
import mutations from './mutations'

export const STATE_KEY = 'timers'

const state = {
  timers: {}
}

export default {
  state,
  actions,
  getters,
  mutations
}
