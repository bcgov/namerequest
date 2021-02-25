import { Module, VuexModule, getModule } from 'vuex-module-decorators'
import store from '@/store'

import timerStore from './store'

@Module({ dynamic: true, namespaced: false, store, name: 'timerModule' })
export class VuexTimerModule extends VuexModule {
  static state = timerStore.state
  static actions = timerStore.actions
  static mutations = timerStore.mutations
  static getters = timerStore.getters
}

export default getModule(VuexTimerModule) as any
