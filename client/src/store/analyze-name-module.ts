import { Module, VuexModule, getModule, Mutation } from 'vuex-module-decorators'
import { SearchType } from '../models'
import store from '@/store'

@Module({ dynamic: true, namespaced: false, store, name: 'analyzeName' })
export class AnalyzeName extends VuexModule {
  analyzedName: string = ''
  searchType: SearchType = 'unsure'

  @Mutation
  captureName (name: string) {
    this.analyzedName = name
  }
  @Mutation
  setSearchType (type: SearchType) {
    this.searchType = type
  }
}

export default getModule(AnalyzeName)
