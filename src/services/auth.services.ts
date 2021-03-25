import Axios from 'axios'
import { addAxiosInterceptors } from 'sbc-common-components/src/util/interceptors'
import { CreateNRAffiliationRequestBody } from '@/interfaces'

const axios = addAxiosInterceptors(Axios.create())

export default class AuthServices {
  /** The Auth API URL. */
  static authApiUrl = sessionStorage.getItem('AUTH_API_URL')

  /** Creates an NR Affiliation */
  static async createNRAffiliation (orgIdentifier: number, affiliation: CreateNRAffiliationRequestBody): Promise<any> {
    const url = `${this.authApiUrl}/orgs/${orgIdentifier}/affiliations?newBusiness=true`
    return axios.post(url, affiliation)
  }

  /** Deletes an NR Affiliation */
  static async removeAffiliation (orgIdentifier: number, incorporationNumber: string): Promise<any> {
    const url = `${this.authApiUrl}/orgs/${orgIdentifier}/affiliations/${incorporationNumber}`
    return axios.delete(url)
  }

  /** Fetches current user info. */
  static async fetchUserInfo (): Promise<any> {
    const url = `${this.authApiUrl}/users/@me`
    return axios.get(url)
      .then(response => {
        if (response?.data) return response.data
        else throw new Error('Invalid user info')
      })
  }
}
