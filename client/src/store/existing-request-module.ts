import {
  Action,
  getModule,
  Module,
  Mutation,
  VuexModule
} from 'vuex-module-decorators'
import {
  NrDataResponseT,
  NrDataT,
  SearchDataI
} from '../models'
import store from '@/store'

const response = {
  nrNumber: 4564651,
  applicantName: 'John Smeathers',
  address: '18 Rue Joseph, Lavalle, QC, P9Q 1B1',
  status: 'In Progress',
  expiry: '2019-18-12',
  name: 'Some name which will be shown sit long too long'
}

@Module({ dynamic: true, namespaced: false, store, name: 'existingRequestModule' })
export class ExistingRequestModule extends VuexModule {
  //  STATE
  email: NrDataT = null
  forgotNRModalVisible: boolean = true
  nrNumber: NrDataT = null
  phone: NrDataT = null
  requestData: NrDataResponseT = null

  //  MUTATIONS
  @Mutation
  setEmail (email: NrDataT) {
    this.email = email
  }
  @Mutation
  toggleForgotNRModal (value: boolean) {
    this.forgotNRModalVisible = value
  }
  @Mutation
  setNrNumber (nr: NrDataT) {
    this.nrNumber = nr
  }
  @Mutation
  setPhone (phone: NrDataT) {
    this.phone = phone
  }
  @Mutation
  setRequestData (value: NrDataResponseT) {
    this.requestData = value
  }

  //  ACTIONS
  @Action
  httpGetRequestData (search: SearchDataI): void {
    this.setRequestData(response)
  }
}

export default getModule(ExistingRequestModule)
