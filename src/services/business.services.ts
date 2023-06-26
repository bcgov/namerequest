import Axios from 'axios'
import { AddAxiosInterceptors } from '@/plugins'
import { BusinessRequest } from '@/interfaces'

const axios = AddAxiosInterceptors(Axios.create())

export default class BusinessServices {
  /** Legal API URL. */
  static legalApiUrl = sessionStorage.getItem('LEGAL_API_URL')

  /** Creates a temporary (draft) business record. */
  static async createBusiness (businessRequest: BusinessRequest): Promise<any> {
    return axios.post(`${BusinessServices.legalApiUrl}/businesses?draft=true`, businessRequest)
  }

  /** Fetches a business record. */
  static async fetchBusiness (businessId: number): Promise<any> {
    return axios.get(`${BusinessServices.legalApiUrl}/businesses/${businessId}`)
  }
}
