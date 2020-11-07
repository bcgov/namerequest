import Vue from 'vue'
import Vuex from 'vuex'
import { AnalyzeName } from './analyze-name-module'

import * as actions from './actions'
import mutations from './mutations'
import * as getters from './getters'

Vue.use(Vuex)

export interface RootStateI {
  analyzeName?: AnalyzeName
  rollbackOnExpire?: boolean
  checkInOnExpire?: boolean
  showNrSessionExpiryModal?: boolean
}

export default new Vuex.Store<RootStateI>({
  state: {
    showNrSessionExpiryModal: false,
    rollbackOnExpire: true,
    checkInOnExpire: false
  },
  actions,
  mutations,
  getters
})
