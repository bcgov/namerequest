import Vue from 'vue'
import Vuex from 'vuex'
import * as getters from './getters'
import { EnvConfigI } from '@/plugins/getConfig'

Vue.use(Vuex)

export interface RootStateI {
  config?: EnvConfigI
}

export default new Vuex.Store<RootStateI>({
  state: {
    config: {} as EnvConfigI
  },
  getters: getters as any
})
