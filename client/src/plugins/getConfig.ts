import axios from 'axios'

export interface EnvConfigI {
    $APP_IS_RUNNING_LOCALLY?: boolean
    $PAYMENT_PORTAL_URL?: string
    // NEW NR completion timer
    $NR_COMPLETION_TIMER_NAME?: string
    $NR_COMPLETION_TIMEOUT_MS?: number
    // EXISTING NR timer
    $EXISTING_NR_TIMER_NAME?: string
    $EXISTING_NR_TIMEOUT_MS?: number
}

// Detailed commentary on how this works @ github.com/bcgov/business-filings-ui/utils/fetch-config.ts
export function getConfig (): Promise<EnvConfigI> {
  return new Promise(async resolve => {
    const { origin } = window.location
    const { BASE_URL } = process.env

    const response = await axios.get(origin + BASE_URL + 'config/configuration.json', {
      headers: {
        'Accept': 'application/json',
        'ResponseType': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })

    const baseURL = response.data[0]['URL'] + '/api/v1'

    const paymentUrl = response.data[0]['PAYMENT_PORTAL_URL']
    const nrCompletionTimerName = response.data[0]['NR_COMPLETION_TIMER_NAME']
    const nrCompletionTimeoutMs = response.data[0]['NR_COMPLETION_TIMEOUT_MS']
    const nrCompletionTimeoutMs_dev = response.data[0]['DEV_NR_COMPLETION_TIMEOUT_MS']

    const existingNrTimerName = response.data[0]['EXISTING_NR_TIMER_NAME']
    const existingNrTimeoutMs = response.data[0]['EXISTING_NR_TIMEOUT_MS']
    const existingNrTimeoutMs_dev = response.data[0]['DEV_EXISTING_NR_TIMEOUT_MS']

    const keycloakConfigPath = response.data[0]['KEYCLOAK_CONFIG_PATH']
    sessionStorage.setItem('KEYCLOAK_CONFIG_PATH', keycloakConfigPath)

    const businessUrl = response.data[0]['BUSINESSES_URL']
    sessionStorage.setItem('BUSINESSES_URL', businessUrl)

    const authApiUrl = response.data[0]['AUTH_API_URL']
    sessionStorage.setItem('AUTH_API_URL', authApiUrl)

    const authPayUrl = response.data[0]['VUE_APP_PAY_ROOT_API']
    sessionStorage.setItem('VUE_APP_PAY_ROOT_API', authPayUrl)

    const legalApiUrl = response.data[0]['LEGAL_API_URL']
    sessionStorage.setItem('LEGAL_API_URL', legalApiUrl)

    const entitySelectorUrl = response.data[0]['ENTITY_SELECTOR_URL']
    entitySelectorUrl && sessionStorage.setItem('ENTITY_SELECTOR_URL', entitySelectorUrl)

    const hotjarId: string = response.data[0]['HOTJAR_ID'];
    (<any>window).hotjarId = hotjarId

    const ldClientId: string = response.data[0]['LD_CLIENT_ID'];
    (<any>window).ldClientId = ldClientId

    const sentryDsn: string = response.data[0]['SENTRY_DSN'];
    (<any>window).sentryDsn = sentryDsn

    const authTokenUrl: string = response.data[0]['AUTH_TOKEN_URL'];
    (<any>window).authTokenUrl = authTokenUrl

    const quickSearchPublicId: string = response.data[0]['QUICK_SEARCH_PUBLIC_ID'];
    (<any>window).quickSearchPublicId = quickSearchPublicId

    const quickSearchPublicSecret: string = response.data[0]['QUICK_SEARCH_PUBLIC_SECRET'];
    (<any>window).quickSearchPublicSecret = quickSearchPublicSecret

    const webChatUrl: string = response.data[0]['WEBCHAT_URL'];
    (<any>window).webChatUrl = webChatUrl

    const webChatReason: string = response.data[0]['WEBCHAT_REASON'];
    (<any>window).webChatReason = webChatReason

    const webChatStatusUrl: string = response.data[0]['WEBCHAT_STATUS_URL'];
    (<any>window).webChatStatusUrl = webChatStatusUrl

    /**
     * authConfig is a workaround to fix the user settings call as it expects a URL with no trailing slash.
     * This will be removed when a fix is made to sbc-common-components to handle this
     */
    const nameRequestUrl = response.data[0]['NAME_REQUEST_URL']
    const nroUrl = response.data[0]['NRO_URL']
    const authConfig = {
      'AUTH_URL': businessUrl,
      'VUE_APP_PAY_ROOT_API': authPayUrl,
      'NAME_REQUEST_URL': nameRequestUrl,
      'NRO_URL': nroUrl
    }
    const authConfigString = JSON.stringify(authConfig)
    sessionStorage.setItem('AUTH_API_CONFIG', authConfigString)

    axios.defaults.baseURL = baseURL

    const appIsRunningLocally = !!(window['webpackHotUpdate'])

    const config: EnvConfigI = {
      // NB: window['webpackHotUpdate'] is a function when running locally, otherwise it's undefined
      $APP_IS_RUNNING_LOCALLY: appIsRunningLocally,
      $PAYMENT_PORTAL_URL: paymentUrl,
      $NR_COMPLETION_TIMER_NAME: nrCompletionTimerName,
      $NR_COMPLETION_TIMEOUT_MS: appIsRunningLocally ? nrCompletionTimeoutMs_dev : nrCompletionTimeoutMs,
      $EXISTING_NR_TIMER_NAME: existingNrTimerName,
      $EXISTING_NR_TIMEOUT_MS: appIsRunningLocally ? existingNrTimeoutMs_dev : existingNrTimeoutMs
    }
    resolve(config)
  })
}
