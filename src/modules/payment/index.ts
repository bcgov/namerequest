import { Module, VuexModule, getModule } from 'vuex-module-decorators'
import { getVuexStore } from '@/store'
import paymentStore from './store'

const store = getVuexStore()

@Module({ dynamic: true, namespaced: false, store, name: 'paymentModule' })
export class PaymentModule extends VuexModule {
  static state = paymentStore.state
  static actions = paymentStore.actions
  static mutations = paymentStore.mutations
  static getters = paymentStore.getters
}

export default getModule(PaymentModule) as any
