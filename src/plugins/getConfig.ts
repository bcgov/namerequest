import axios from 'axios'
import { EnvConfigI } from '@/interfaces'

export async function getConfig (): Promise<EnvConfigI> {
  // get config from environment
  const windowLocationOrigin = window.location.origin
  const processEnvBaseUrl = process.env.BASE_URL

  if (!processEnvBaseUrl || !windowLocationOrigin) {
    return Promise.reject(new Error('Missing environment variables'))
  }

  // fetch config from server
  const url = `${windowLocationOrigin}${processEnvBaseUrl}config/configuration.json`
  const headers = {
    'Accept': 'application/json',
    'ResponseType': 'application/json',
    'Cache-Control': 'no-cache'
  }
  const response = await axios.get(url, { headers }).catch(() => {
    return Promise.reject(new Error('Could not fetch configuration.json'))
  })

  const baseURL = response.data[0]['URL'] + '/api/v1'
  axios.defaults.baseURL = baseURL

  const paymentPortalUrl = response.data[0]['PAYMENT_PORTAL_URL']
  sessionStorage.setItem('PAYMENT_PORTAL_URL', paymentPortalUrl)

  const businessesUrl = response.data[0]['BUSINESSES_URL']
  sessionStorage.setItem('BUSINESSES_URL', businessesUrl)

  const keycloakConfigPath = response.data[0]['KEYCLOAK_CONFIG_PATH']
  sessionStorage.setItem('KEYCLOAK_CONFIG_PATH', keycloakConfigPath)

  const authApiUrl = response.data[0]['AUTH_API_URL']
  sessionStorage.setItem('AUTH_API_URL', authApiUrl)

  const legalApiUrl = response.data[0]['LEGAL_API_URL']
  sessionStorage.setItem('LEGAL_API_URL', legalApiUrl)

  const vueAppPayRootApi = response.data[0]['VUE_APP_PAY_ROOT_API']
  sessionStorage.setItem('VUE_APP_PAY_ROOT_API', vueAppPayRootApi)

  const sentryDsn: string = response.data[0]['SENTRY_DSN'];
  (<any>window).sentryDsn = sentryDsn

  const ldClientId: string = response.data[0]['LD_CLIENT_ID'];
  (<any>window).ldClientId = ldClientId

  const authTokenUrl: string = response.data[0]['AUTH_TOKEN_URL'];
  (<any>window).authTokenUrl = authTokenUrl

  const quickSearchPublicId: string = response.data[0]['QUICK_SEARCH_PUBLIC_ID'];
  (<any>window).quickSearchPublicId = quickSearchPublicId

  const quickSearchPublicSecret: string = response.data[0]['QUICK_SEARCH_PUBLIC_SECRET'];
  (<any>window).quickSearchPublicSecret = quickSearchPublicSecret

  const entitySelectorUrl = response.data[0]['ENTITY_SELECTOR_URL']
  entitySelectorUrl && sessionStorage.setItem('ENTITY_SELECTOR_URL', entitySelectorUrl)

  /**
   * "authConfig" is a workaround to fix the user settings call as it expects a URL with no trailing slash.
   * This can be removed when a fix is made to sbc-common-components to handle this.
   */
  const nameRequestUrl = response.data[0]['NAME_REQUEST_URL']
  const nroUrl = response.data[0]['NRO_URL']
  const authConfig = {
    'AUTH_URL': businessesUrl,
    'VUE_APP_PAY_ROOT_API': vueAppPayRootApi,
    'NAME_REQUEST_URL': nameRequestUrl,
    'NRO_URL': nroUrl
  }
  const authConfigString = JSON.stringify(authConfig)
  sessionStorage.setItem('AUTH_API_CONFIG', authConfigString)

  const config: EnvConfigI = {
    $PAYMENT_PORTAL_URL: paymentPortalUrl
  }

  return config
}
