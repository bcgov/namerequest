import Axios from 'axios'
import { AddAxiosInterceptors } from '@/plugins'
import { BusinessRequest } from '@/interfaces'

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
}
