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

  const baseURL = response.data['URL'] + '/api/v1'
  sessionStorage.setItem('BASE_URL', baseURL)
  console.log('here', baseURL)
  axios.defaults.baseURL = baseURL

  const paymentPortalUrl = response.data['PAYMENT_PORTAL_URL']
  sessionStorage.setItem('PAYMENT_PORTAL_URL', paymentPortalUrl)

  const businessesUrl = response.data['BUSINESSES_URL']
  sessionStorage.setItem('BUSINESSES_URL', businessesUrl)

  const keycloakConfigPath = response.data['KEYCLOAK_CONFIG_PATH']
  sessionStorage.setItem('KEYCLOAK_CONFIG_PATH', keycloakConfigPath)

  const authApiUrl = response.data['AUTH_API_URL']
  sessionStorage.setItem('AUTH_API_URL', authApiUrl)

  const legalApiUrl = response.data['LEGAL_API_URL']
  sessionStorage.setItem('LEGAL_API_URL', legalApiUrl)

  const vueAppPayRootApi = response.data['VUE_APP_PAY_ROOT_API']
  sessionStorage.setItem('VUE_APP_PAY_ROOT_API', vueAppPayRootApi)

  const sentryDsn: string = response.data['SENTRY_DSN'];
  (<any>window).sentryDsn = sentryDsn

  const hotjarId: string = response.data['HOTJAR_ID'];
  (<any>window).hotjarId = hotjarId

  const ldClientId: string = response.data['LD_CLIENT_ID'];
  (<any>window).ldClientId = ldClientId

  const authTokenUrl: string = response.data['AUTH_TOKEN_URL'];
  (<any>window).authTokenUrl = authTokenUrl

  const quickSearchPublicId: string = response.data['QUICK_SEARCH_PUBLIC_ID'];
  (<any>window).quickSearchPublicId = quickSearchPublicId

  const quickSearchPublicSecret: string = response.data['QUICK_SEARCH_PUBLIC_SECRET'];
  (<any>window).quickSearchPublicSecret = quickSearchPublicSecret

  const webChatUrl: string = response.data['WEBCHAT_URL'];
  (<any>window).webChatUrl = webChatUrl

  const webChatReason: string = response.data['WEBCHAT_REASON'];
  (<any>window).webChatReason = webChatReason

  const webChatStatusUrl: string = response.data['WEBCHAT_STATUS_URL'];
  (<any>window).webChatStatusUrl = webChatStatusUrl

  const entitySelectorUrl = response.data['ENTITY_SELECTOR_URL']
  entitySelectorUrl && sessionStorage.setItem('ENTITY_SELECTOR_URL', entitySelectorUrl)

  /**
   * "authConfig" is a workaround to fix the user settings call as it expects a URL with no trailing slash.
   * This can be removed when a fix is made to sbc-common-components to handle this.
   */
  const nameRequestUrl = response.data['NAME_REQUEST_URL']
  const nroUrl = response.data['NRO_URL']
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
