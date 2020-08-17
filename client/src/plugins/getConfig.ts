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
    // eslint-disable-next-line no-console
    console.info('Set KeyCloak Config Path to: ' + keycloakConfigPath)

    const authApiUrl = response.data[0]['VUE_APP_AUTH_ROOT_API']
    sessionStorage.setItem('AUTH_API_URL', authApiUrl)
    // eslint-disable-next-line no-console
    console.log('Set Auth URL to: ' + authApiUrl)

    const legalApiUrl = response.data[0]['VUE_APP_LEGAL_ROOT_API']
    sessionStorage.setItem('LEGAL_API_URL', legalApiUrl)
    // eslint-disable-next-line no-console
    console.log('Set Legal URL to: ' + legalApiUrl)

    axios.defaults.baseURL = baseURL
    resolve(paymentURL)
  })
}
