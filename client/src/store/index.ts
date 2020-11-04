import Vue from 'vue'
import Vuex from 'vuex'
import { AnalyzeName } from './analyze-name-module'

import * as rootActions from './actions'
import rootMutations from './mutations'
import * as Getters from './getters'

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
  actions: rootActions,
  mutations: rootMutations,
  getters: Getters
})
