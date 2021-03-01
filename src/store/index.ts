import Vue from 'vue'
import Vuex from 'vuex'
import * as getters from './getters'
import { EnvConfigI } from '@/interfaces'

//
// *** TODO: try to change this to `getVuexStore()`
//     but test locally as you go as this seems to break stuff
//
Vue.use(Vuex)

export interface RootStateI {
  config?: EnvConfigI
}

export default new Vuex.Store<RootStateI>({
  state: {
    config: {} as EnvConfigI
  },
  getters
})
