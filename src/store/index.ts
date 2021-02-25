import Vue from 'vue'
import Vuex from 'vuex'
import { AnalyzeName } from './analyze-name-module'

import * as actions from './actions'
import mutations from './mutations'
import * as getters from './getters'

import { EnvConfigI } from '@/plugins/getConfig'

Vue.use(Vuex)

export interface RootStateI {
  config?: EnvConfigI
  analyzeName?: AnalyzeName
  // rollbackOnExpire?: boolean // NOT USED
  // checkInOnExpire?: boolean // NOT USED
  showNrSessionExpiryModal?: boolean
}

export default new Vuex.Store<RootStateI>({
  state: {
    config: {} as EnvConfigI,
    showNrSessionExpiryModal: false
    // rollbackOnExpire: true, // NOT USED
    // checkInOnExpire: false // NOT USED
  },
  actions,
  mutations,
  getters
})
