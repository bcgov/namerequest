import { Module, VuexModule, getModule, Mutation } from 'vuex-module-decorators'
import store from '@/store'

@Module({ dynamic: true, namespaced: false, store, name: 'analyzeName' })
export class AnalyzeName extends VuexModule {
  analyzedName: string = ''

  @Mutation
  captureName (name: string) {
    this.analyzedName = name
  }
}

export default getModule(AnalyzeName)
