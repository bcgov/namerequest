import Vue from 'vue'
import Vuex from 'vuex'
import { AnalyzeName } from './analyze-name-module'

Vue.use(Vuex)

export interface RootStateI {
  analyzeName: AnalyzeName
}

export default new Vuex.Store<RootStateI>({})
