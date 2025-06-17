import Axios from 'axios'
import { AddAxiosInterceptors } from '@/plugins'
import { GetFeatureFlag } from '@/plugins/featureFlags'
import { BusinessRequest } from '@/interfaces'

const axios = AddAxiosInterceptors(Axios.create())

export default class BusinessServices {
  /** Legal API URL. */
  static legalApiUrl (): string {
    return GetFeatureFlag('use-business-api-gw-url')
      ? sessionStorage.getItem('BUSINESS_API_GW_URL')
      : sessionStorage.getItem('LEGAL_API_URL')
  }

  /**
   * Creates (posts) a draft (temporary) business record.
   * Must be logged in to use this.
   * Throws an exception on error.
   */
  static async createBusiness (businessRequest: BusinessRequest): Promise<any> {
    const url = `${this.legalApiUrl()}/businesses?draft=true`

    // Add API gateway-specific headers (in addition to interceptor)
    const extraHeaders = GetFeatureFlag('use-business-api-gw-url') ? {
      'Account-Id': String(businessRequest.filing.header.accountId),
      'X-Apikey': process.env.VUE_APP_BUSINESS_API_KEY || ''
    } : {}

    return axios.post(url, businessRequest, { headers: extraHeaders })
  }
}
