import { Module, VuexModule, getModule } from 'vuex-module-decorators'
import store from '@/store'

import errorStore from './store'

@Module({ dynamic: true, namespaced: false, store, name: 'errorModule' })
export class ErrorModule extends VuexModule {
  static state = errorStore.state
  static actions = errorStore.actions
  static mutations = errorStore.mutations
  static getters = errorStore.getters
}

export default getModule(ErrorModule) as any
