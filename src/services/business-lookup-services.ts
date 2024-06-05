import Axios from 'axios'
import { AddAxiosInterceptors } from '@/plugins'
import { BusinessLookupResultIF } from '@/interfaces'

const axios = AddAxiosInterceptors(Axios.create())

/**
 * Class that provides integration with the BusinessLookup API.
 */
export default class BusinessLookupServices {
  /** The Business API URL, from session storage. */
  static get registriesSearchApiUrl (): string {
    return sessionStorage.getItem('REGISTRIES_SEARCH_API_URL')
  }

  /** The Business API Key, from session storage. */
  static get registriesSearchApiKey (): string {
    return sessionStorage.getItem('BUSINESS_API_KEY')
  }

  /** The Account ID, from session storage. */
  static get accountId (): string {
    // if we can't get account id from ACCOUNT_ID
    // then try to get it from CURRENT_ACCOUNT
    let accountId = sessionStorage.getItem('ACCOUNT_ID')
    if (!accountId) {
      const currentAccount = sessionStorage.getItem('CURRENT_ACCOUNT')
      accountId = JSON.parse(currentAccount)?.id
    }
    return accountId
  }

  /**
   * Searches for business by code or words.
   * @param query code or words to search
   * @param status status to match (ACTIVE or HISTORICAL or empty to match all statuses)
   * @returns a promise to return the search results
   */
  static async search (query: string, status = ''): Promise<BusinessLookupResultIF[]> {
    const legalType = 'A,BC,BEN,C,CBEN,CC,CCC,CP,CUL,FI,GP,LL,LLC,LP,PA,S,SP,ULC,XCP,XL,XP,XS'

    let url = this.registriesSearchApiUrl + 'businesses/search/facets?start=0&rows=20'
    url += `&categories=legalType:${legalType}${status ? '::status:' + status : ''}`
    url += `&query=value:${encodeURIComponent(query)}`

    return axios.get(url, {
      headers: {
        'x-apikey': this.registriesSearchApiKey,
        'Account-Id': this.accountId
      }
    }).then(response => {
      const results: Array<BusinessLookupResultIF> = response?.data?.searchResults?.results
      if (!results) {
        throw new Error('Invalid API response')
      }

      // filter out results without a valid identifier
      return results.filter(result => {
        const pattern = /^[A-Z]{1,3}\d{7}$/
        return pattern.test(result.identifier)
      })
    })
  }
}
