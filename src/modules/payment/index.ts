import { Module, VuexModule } from 'vuex-module-decorators'
import paymentStore from './store'

@Module
export default class PaymentModule extends VuexModule {
  static state = paymentStore.state
  static actions = paymentStore.actions
  static mutations = paymentStore.mutations
  static getters = paymentStore.getters
}
