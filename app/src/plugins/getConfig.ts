import axios from 'axios'
import { EnvConfigI } from '@/interfaces'
import { appBaseURL } from '../router/router'

export async function getConfig (): Promise<EnvConfigI> {
  // get config from environment
  const windowLocationOrigin = window.location.origin

  if (!{ appBaseURL } || !windowLocationOrigin) {
    return Promise.reject(new Error('Missing environment variables'))
  }
  axios.defaults.baseURL = appBaseURL

  const paymentPortalUrl: string = process.env.VUE_APP_PAYMENT_PORTAL_URL
  sessionStorage.setItem('PAYMENT_PORTAL_URL', paymentPortalUrl)

  const businessesUrl: string = process.env.VUE_APP_BUSINESSES_URL
  sessionStorage.setItem('BUSINESSES_URL', businessesUrl)

  const corporateOnlineUrl: string = process.env.VUE_APP_CORPORATE_ONLINE_URL
  sessionStorage.setItem('CORPORATE_ONLINE_URL', corporateOnlineUrl)

  const businessDashUrl: string = process.env.VUE_APP_BUSINESS_DASH_URL
  sessionStorage.setItem('BUSINESS_DASH_URL', businessDashUrl)

  const businessRegistryUrl: string = process.env.VUE_APP_BUSINESS_REGISTRY_URL
  sessionStorage.setItem('BUSINESS_REGISTRY_URL', businessRegistryUrl)

  const legalApiUrl: string = process.env.VUE_APP_LEGAL_API_URL + process.env.VUE_APP_LEGAL_API_VERSION_2
  sessionStorage.setItem('LEGAL_API_URL', legalApiUrl)

  const businessApiGwUrl: string = process.env.VUE_APP_BUSINESS_API_GW_URL + process.env.VUE_APP_LEGAL_API_VERSION_2
  sessionStorage.setItem('BUSINESS_API_GW_URL', businessApiGwUrl)

  const authApiUrl: string = process.env.VUE_APP_AUTH_API_URL + process.env.VUE_APP_AUTH_API_VERSION
  sessionStorage.setItem('AUTH_API_URL', authApiUrl)

  const siteminderLogoutUrl: string = process.env.VUE_APP_SITEMINDER_LOGOUT_URL
  sessionStorage.setItem('SITEMINDER_LOGOUT_URL', siteminderLogoutUrl)

  const registryHomeUrl: string = process.env.VUE_APP_REGISTRY_HOME_URL
  sessionStorage.setItem('REGISTRY_HOME_URL', registryHomeUrl)

  const societiesOnlineHomeUrl: string = process.env.VUE_APP_SOCIETIES_ONLINE_HOME_URL
  sessionStorage.setItem('SOCIETIES_ONLINE_HOME_URL', societiesOnlineHomeUrl)

  const stepsToRestoreUrl: string = process.env.VUE_APP_STEPS_TO_RESTORE_URL
  sessionStorage.setItem('STEPS_TO_RESTORE_URL', stepsToRestoreUrl)

  // for system alert banner (sbc-common-components)
  const statusApiUrl: string = process.env.VUE_APP_STATUS_API_URL + process.env.VUE_APP_STATUS_API_VERSION
  sessionStorage.setItem('STATUS_API_URL', statusApiUrl)

  // for sbc header (sbc-common-components)
  const authWebUrl: string = process.env.VUE_APP_AUTH_WEB_URL
  sessionStorage.setItem('AUTH_WEB_URL', authWebUrl)

  const registriesSearchApiUrl: string =
    (process.env.VUE_APP_REGISTRIES_SEARCH_API_URL + process.env.VUE_APP_REGISTRIES_SEARCH_API_VERSION_2 + '/')
  sessionStorage.setItem('REGISTRIES_SEARCH_API_URL', registriesSearchApiUrl)

  const hotjarId: string = process.env.VUE_APP_HOTJAR_ID;
  (<any>window).hotjarId = hotjarId

  const ldClientId: string = process.env.VUE_APP_NAMEREQUEST_LD_CLIENT_ID;
  (<any>window).ldClientId = ldClientId

  const authTokenUrl: string = process.env.VUE_APP_AUTH_TOKEN_URL;
  (<any>window).authTokenUrl = authTokenUrl

  const quickSearchPublicId: string = process.env.VUE_APP_QUICK_SEARCH_PUBLIC_ID;
  (<any>window).quickSearchPublicId = quickSearchPublicId

  const quickSearchPublicSecret: string = process.env.VUE_APP_QUICK_SEARCH_PUBLIC_SECRET;
  (<any>window).quickSearchPublicSecret = quickSearchPublicSecret

  const genesysEnv: string = process.env.VUE_APP_GENESYS_ENV;
  (<any>window).genesysEnv = genesysEnv

  const genesysId: string = process.env.VUE_APP_GENESYS_ID;
  (<any>window).genesysId = genesysId

  const genesysUrl: string = process.env.VUE_APP_GENESYS_URL;
  (<any>window).genesysUrl = genesysUrl

  const webChatUrl: string = process.env.VUE_APP_WEBCHAT_URL;
  (<any>window).webChatUrl = webChatUrl

  const webChatReason: string = process.env.VUE_APP_WEBCHAT_REASON;
  (<any>window).webChatReason = webChatReason

  const webChatStatusUrl: string = process.env.VUE_APP_WEBCHAT_STATUS_URL;
  (<any>window).webChatStatusUrl = webChatStatusUrl

  const entitySelectorUrl: string = process.env.VUE_APP_ENTITY_SELECTOR_URL
  entitySelectorUrl && sessionStorage.setItem('ENTITY_SELECTOR_URL', entitySelectorUrl)

  const keycloakAuthUrl: string = process.env.VUE_APP_KEYCLOAK_AUTH_URL;
  (<any>window).keycloakAuthUrl = keycloakAuthUrl

  const keycloakRealm: string = process.env.VUE_APP_KEYCLOAK_REALM;
  (<any>window).keycloakRealm = keycloakRealm

  const keycloakClientId: string = process.env.VUE_APP_KEYCLOAK_CLIENTID;
  (<any>window).keycloakClientId = keycloakClientId

  return {
    $PAYMENT_PORTAL_URL: paymentPortalUrl
  } as EnvConfigI
}
