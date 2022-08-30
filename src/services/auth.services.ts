import Axios from 'axios'
import { addAxiosInterceptors } from 'sbc-common-components/src/util/interceptors'
import { CreateNRAffiliationRequestBody } from '@/interfaces'

const axios = addAxiosInterceptors(Axios.create())

export default class AuthServices {
  /** The Auth API URL. */
  static authApiUrl = sessionStorage.getItem('AUTH_API_URL')

  /**
   * Creates an affiliation for the specified account and NR.
   * Returns response on error.
   */
  static async createNrAffiliation (accountId: number, nr: any): Promise<any> {
    const url = `${this.authApiUrl}/orgs/${accountId}/affiliations?newBusiness=true`
    const requestBody: CreateNRAffiliationRequestBody = {
      businessIdentifier: nr.nrNum,
      phone: nr.applicants?.phoneNumber || '',
      email: nr.applicants?.emailAddress || ''
    }

    return axios.post(url, requestBody)
      .catch(error => error?.response)
  }

  /**
   * Removes an affiliation for the specified account and NR.
   * Throws on error.
   */
  static async removeNrAffiliation (accountId: number, nrNumber: string): Promise<any> {
    const url = `${this.authApiUrl}/orgs/${accountId}/affiliations/${nrNumber}`

    return axios.delete(url)
  }

  /**
   * Fetches affiliations for the specified account.
   * Throws on error.
   */
  static async fetchAffiliations (accountId: number): Promise<any> {
    const url = `${this.authApiUrl}/orgs/${accountId}/affiliations`

    return axios.get(url)
      .then(response => {
        if (response?.data) return response.data
        throw new Error('Invalid affiliations')
      })
  }

  /**
   * Fetches current user's info.
   * Throws on error.
   */
  static async fetchUserInfo (): Promise<any> {
    const url = `${this.authApiUrl}/users/@me`

    return axios.get(url)
      .then(response => {
        if (response?.data) return response.data
        throw new Error('Invalid user info')
      })
  }

  /**
   * Fetches specified org's info.
   * Throws on error.
   */
  static async fetchOrgInfo (orgId: number): Promise<any> {
    const url = `${this.authApiUrl}/orgs/${orgId}`

    return axios.get(url)
      .then(response => {
        if (response?.data) return response.data
        throw new Error('Invalid org info')
      })
  }
}
