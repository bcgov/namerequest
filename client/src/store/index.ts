import Vue from 'vue'
import Vuex from 'vuex'
import { AnalyzeName } from './analyze-name-module'

import * as rootActions from './actions'
import rootMutations from './mutations'

Vue.use(Vuex)

export interface RootStateI {
  analyzeName?: AnalyzeName,
  showNrSessionExpiryModal?: boolean
}

export default new Vuex.Store<RootStateI>({
  state: {
    showNrSessionExpiryModal: false
  },
  actions: rootActions,
  mutations: rootMutations
})
