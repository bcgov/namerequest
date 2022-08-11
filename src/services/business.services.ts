import Axios from 'axios'
import { addAxiosInterceptors } from 'sbc-common-components/src/util/interceptors'
import { BusinessRequest } from '@/interfaces'

const axios = addAxiosInterceptors(Axios.create())

export default class BusinessServices {
  /** Legal API URL. */
  static legalApiUrl = sessionStorage.getItem('LEGAL_API_URL')

  /** Creates a temporary (draft) business record. */
  static async createBusiness (businessRequest: BusinessRequest): Promise<any> {
    return axios.post(`${BusinessServices.legalApiUrl}/businesses?draft=true`, businessRequest)
      .catch(error => error?.response)
  }

  /** Fetches a business record. */
  static async fetchBusiness (businessId: number): Promise<any> {
    return axios.get(`${BusinessServices.legalApiUrl}/businesses/${businessId}`)
      .catch(error => error?.response)
  }
}
