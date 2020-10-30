import axios from 'axios'

// Detailed commentary on how this works @ github.com/bcgov/business-filings-ui/utils/fetch-config.ts
export function getConfig (): Promise<void> {
  return new Promise(async resolve => {
    const { origin } = window.location
    const { BASE_URL } = process.env

    let response = await axios.get(origin + BASE_URL + 'config/configuration.json', {
      headers: {
        'Accept': 'application/json',
        'ResponseType': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })
    const baseURL = response.data[0]['URL'] + '/api/v1'
    const paymentURL = response.data[0]['PAYMENT_PORTAL_URL']

    const keycloakConfigPath = response.data[0]['KEYCLOAK_CONFIG_PATH']
    sessionStorage.setItem('KEYCLOAK_CONFIG_PATH', keycloakConfigPath)

    const businessUrl = response.data[0]['BUSINESSES_URL']
    sessionStorage.setItem('BUSINESSES_URL', businessUrl)

    const authApiUrl = response.data[0]['AUTH_API_URL']
    sessionStorage.setItem('AUTH_API_URL', authApiUrl)

    const legalApiUrl = response.data[0]['LEGAL_API_URL']
    sessionStorage.setItem('LEGAL_API_URL', legalApiUrl)

    /**
     * authConfig is a workaround to fix the user settings call as it expects a URL with no trailing slash.
     * This will be removed when a fix is made to sbc-common-components to handle this
     */
    const authConfig = {
      'AUTH_URL': businessUrl
    }
    const authConfigString = JSON.stringify(authConfig)
    sessionStorage.setItem('AUTH_API_CONFIG', authConfigString)

    axios.defaults.baseURL = baseURL
    resolve(paymentURL)
  })
}
