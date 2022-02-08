import Axios from 'axios'
import { addAxiosInterceptors } from 'sbc-common-components/src/util/interceptors'
import AuthServices from '@/services/auth.services'
import { BusinessRequest } from '@/interfaces'

const axios = addAxiosInterceptors(Axios.create())

export default class BusinessServices {
  /** Legal API URL. */
  static legalApiUrl = sessionStorage.getItem('LEGAL_API_URL')

  /** Create a draft Incorporation Application for org and requested business */
  static async createBusiness (filingBody: BusinessRequest): Promise<any> {
    try {
      const response = await axios.post(
        `${BusinessServices.legalApiUrl}/businesses?draft=true`, filingBody
      )
      if (response?.status >= 200 && response?.status < 300) {
        return response
      }
    } catch {
      // delete the created affiliation if the update failed for avoiding orphan records
      const orgId = filingBody?.filing?.header?.accountId
      const nrNumber = filingBody?.filing?.incorporationApplication?.nameRequest?.nrNumber
      await AuthServices.removeAffiliation(orgId, nrNumber)
      return {
        errorMsg: 'Cannot add business due to some technical reasons'
      }
    }
  }
}
