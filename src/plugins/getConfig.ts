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

  const baseURL = response.data['NAMEX_API_URL'] + response.data['NAMEX_API_VERSION']
  sessionStorage.setItem('BASE_URL', baseURL)
  axios.defaults.baseURL = baseURL

  const paymentPortalUrl = response.data['PAYMENT_PORTAL_URL']
  sessionStorage.setItem('PAYMENT_PORTAL_URL', paymentPortalUrl)

  const businessesUrl = response.data['BUSINESSES_URL']
  sessionStorage.setItem('BUSINESSES_URL', businessesUrl)

  const dashboardUrl = response.data['DASHBOARD_URL']
  sessionStorage.setItem('DASHBOARD_URL', dashboardUrl)

  const keycloakConfigPath = response.data['KEYCLOAK_CONFIG_PATH']
  sessionStorage.setItem('KEYCLOAK_CONFIG_PATH', keycloakConfigPath)

  const legalApiUrl: string = response.data['LEGAL_API_URL'] + response.data['LEGAL_API_VERSION']
  sessionStorage.setItem('LEGAL_API_URL', legalApiUrl)

  const authApiUrl: string = response.data['AUTH_API_URL'] + response.data['AUTH_API_VERSION']
  sessionStorage.setItem('AUTH_API_URL', authApiUrl)

  const siteminderLogoutUrl: string = response.data['SITEMINDER_LOGOUT_URL']
  sessionStorage.setItem('SITEMINDER_LOGOUT_URL', siteminderLogoutUrl)

  const registryHomeUrl: string = response.data['REGISTRY_HOME_URL']
  sessionStorage.setItem('REGISTRY_HOME_URL', registryHomeUrl)

  // for system alert banner (sbc-common-components)
  const statusApiUrl: string = response.data['STATUS_API_URL'] + response.data['STATUS_API_VERSION']
  sessionStorage.setItem('STATUS_API_URL', statusApiUrl)

  // for sbc header (sbc-common-components)
  const authWebUrl: string = response.data['AUTH_WEB_URL']
  sessionStorage.setItem('AUTH_WEB_URL', authWebUrl)

  const sentryEnable = response.data['SENTRY_ENABLE'];
  (<any>window).sentryEnable = sentryEnable

  const sentryDsn: string = response.data['SENTRY_DSN'];
  (<any>window).sentryDsn = sentryDsn

  const hotjarId: string = response.data['HOTJAR_ID'];
  (<any>window).hotjarId = hotjarId

  const ldClientId: string = response.data['NAMEREQUEST_LD_CLIENT_ID'];
  (<any>window).ldClientId = ldClientId

  const authTokenUrl: string = response.data['AUTH_TOKEN_URL'];
  (<any>window).authTokenUrl = authTokenUrl

  const quickSearchPublicId: string = response.data['QUICK_SEARCH_PUBLIC_ID'];
  (<any>window).quickSearchPublicId = quickSearchPublicId

  const quickSearchPublicSecret: string = response.data['QUICK_SEARCH_PUBLIC_SECRET'];
  (<any>window).quickSearchPublicSecret = quickSearchPublicSecret

  const genesysEnv: string = response.data.GENESYS_ENV;
  (<any>window).genesysEnv = genesysEnv

  const genesysId: string = response.data.GENESYS_ID;
  (<any>window).genesysId = genesysId

  const genesysUrl: string = response.data.GENESYS_URL;
  (<any>window).genesysUrl = genesysUrl

  const webChatUrl: string = response.data['WEBCHAT_URL'];
  (<any>window).webChatUrl = webChatUrl

  const webChatReason: string = response.data['WEBCHAT_REASON'];
  (<any>window).webChatReason = webChatReason

  const webChatStatusUrl: string = response.data['WEBCHAT_STATUS_URL'];
  (<any>window).webChatStatusUrl = webChatStatusUrl

  const entitySelectorUrl = response.data['ENTITY_SELECTOR_URL']
  entitySelectorUrl && sessionStorage.setItem('ENTITY_SELECTOR_URL', entitySelectorUrl)

  return {
    $PAYMENT_PORTAL_URL: paymentPortalUrl
  } as EnvConfigI
}
