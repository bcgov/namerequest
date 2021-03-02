import { Module, VuexModule, getModule } from 'vuex-module-decorators'
import store from '@/store'
import paymentStore from './store'

@Module({ dynamic: true, namespaced: false, store, name: 'paymentModule' })
export class PaymentModule extends VuexModule {
  static state = paymentStore.state
  static actions = paymentStore.actions
  static mutations = paymentStore.mutations
  static getters = paymentStore.getters
}

export default getModule(PaymentModule) as any
