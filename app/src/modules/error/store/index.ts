import * as actions from './actions'
import getters from './getters'
import mutations from './mutations'

export const STATE_KEY = 'errors'

const state = {
  [STATE_KEY]: []
}

export default {
  state,
  actions,
  getters,
  mutations
}
