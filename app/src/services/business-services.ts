import Axios from 'axios'
import { AddAxiosInterceptors } from '@/plugins'
import { BusinessRequest } from '@/interfaces'
import { NOT_FOUND } from 'http-status-codes'

const axios = AddAxiosInterceptors(Axios.create())

export default class BusinessServices {
  /** Legal API URL. */
  static legalApiUrl = sessionStorage.getItem('LEGAL_API_URL')

  /**
   * Creates (posts) a draft (temporary) business record.
   * Must be logged in to use this.
   * Throws an exception on error.
   */
  static async createBusiness (businessRequest: BusinessRequest): Promise<any> {
    const url = `${BusinessServices.legalApiUrl}/businesses?draft=true`
    return axios.post(url, businessRequest)
  }

  /**
   * Fetches a business record.
   * Must be logged in to use this.
   * Throws an exception on error.
   */
  static async fetchBusiness (identifier: string): Promise<any> {
    const url = `${BusinessServices.legalApiUrl}/businesses/${identifier}`
    return axios.get(url)
      .then(response => {
        if (response.data?.business) {
          return response.data?.business
        }
        console.log('fetchBusiness() error - invalid response =', response)
        throw new Error('Invalid API response')
      }).catch(error => {
        if (error?.response?.status === NOT_FOUND) {
          return null // Business not found (not an error)
        }
        throw error
      })
  }
}
