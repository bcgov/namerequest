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
