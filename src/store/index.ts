// import Vue from 'vue'
// import Vuex from 'vuex'
// import * as getters from './getters'
// import { EnvConfigI } from '@/interfaces'
//
// //
// // *** TODO: try to change this to `getVuexStore()`
// //     but test locally as you go as this seems to break stuff
// //
// Vue.use(Vuex)
//
// export interface RootStateI {
//   config?: EnvConfigI
// }
//
// export default new Vuex.Store<RootStateI>({
//   state: {
//     config: {} as EnvConfigI
//   },
//   getters: getters as any
// })

// Libraries
import Vue from 'vue'
import Vuex from 'vuex'
import { EnvConfigI } from '@/interfaces'

// Store modules
import * as States from './state'
import * as Getters from './getters'
import * as Mutations from './mutations'
import * as Actions from './actions'

Vue.use(Vuex)

export interface RootStateI {
  config?: EnvConfigI
}

/**
 * Configures and returns Vuex Store.
 */
export function getVuexStore () {
  Vue.use(Vuex)

  const store = new Vuex.Store<any>({
    state: {
      ...States,
      config: {} as EnvConfigI
    },
    getters: { ...Getters },
    mutations: { ...Mutations },
    actions: { ...Actions } as any
  })

  return store
}
