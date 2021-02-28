import Axios from 'axios'
import { addAxiosInterceptors } from 'sbc-common-components/src/util/interceptors'
import { CreateNRAffiliationRequestBody } from '@/interfaces'

const axios = addAxiosInterceptors(Axios.create())

export default class AuthServices {
  /** Auth API URL. */
  static authApiUrl = sessionStorage.getItem('AUTH_API_URL')

  /** Create an NR Affiliation */
  static async createNRAffiliation (orgIdentifier: number, affiliation: CreateNRAffiliationRequestBody): Promise<any> {
    return axios.post(
      `${AuthServices.authApiUrl}/orgs/${orgIdentifier}/affiliations?newBusiness=true`, affiliation
    )
  }
  /** Delete an NR Affiliation */
  static async removeAffiliation (orgIdentifier: number, incorporationNumber: string): Promise<any> {
    return axios.delete(
      `${AuthServices.authApiUrl}/orgs/${orgIdentifier}/affiliations/${incorporationNumber}`
    )
  }
}
