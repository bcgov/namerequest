import { Module, VuexModule, getModule, Mutation, Action } from 'vuex-module-decorators'
import store from '@/store'
import { SearchType } from '@/models'

@Module({dynamic: true, namespaced: false, store, name: 'analyzeName'})
export class AnalyzeName extends VuexModule {
  analyzedName: string = ''
  searchType: SearchType = 'name'

  @Mutation
  captureName(name: string) {
    this.analyzedName = name
  }
  @Mutation
  setSearchType(type: SearchType) {
    this.searchType = type
  }
}

export default getModule(AnalyzeName)
