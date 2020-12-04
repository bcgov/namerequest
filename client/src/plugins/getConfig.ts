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
    // PAYMENT timer
    $PAYMENT_COMPLETION_TIMER_NAME?: string
    $PAYMENT_COMPLETION_TIMEOUT_MS?: number
}

// Detailed commentary on how this works @ github.com/bcgov/business-filings-ui/utils/fetch-config.ts
export function getConfig (): Promise<EnvConfigI> {
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

    const paymentUrl = response.data[0]['PAYMENT_PORTAL_URL']
    const nrCompletionTimerName = response.data[0]['NR_COMPLETION_TIMER_NAME']
    const nrCompletionTimeoutMs = response.data[0]['NR_COMPLETION_TIMEOUT_MS']
    const nrCompletionTimeoutMs_dev = response.data[0]['DEV_NR_COMPLETION_TIMEOUT_MS']

    const existingNrTimerName = response.data[0]['EXISTING_NR_TIMER_NAME']
    const existingNrTimeoutMs = response.data[0]['EXISTING_NR_TIMEOUT_MS']
    const existingNrTimeoutMs_dev = response.data[0]['DEV_EXISTING_NR_TIMEOUT_MS']

    const paymentCompletionTimerName = response.data[0]['PAYMENT_COMPLETION_TIMER_NAME']
    const paymentCompletionTimeoutMs = response.data[0]['PAYMENT_COMPLETION_TIMEOUT_MS']
    const paymentCompletionTimeoutMs_dev = response.data[0]['DEV_PAYMENT_COMPLETION_TIMEOUT_MS']

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

    const ldClientId: string = response.data[0]['LD_CLIENT_ID'];
    (<any>window).ldClientId = ldClientId

    /**
     * authConfig is a workaround to fix the user settings call as it expects a URL with no trailing slash.
     * This will be removed when a fix is made to sbc-common-components to handle this
     */
    const authConfig = {
      'AUTH_URL': businessUrl,
      'VUE_APP_PAY_ROOT_API': authPayUrl
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
      $NR_COMPLETION_TIMEOUT_MS: !appIsRunningLocally ? nrCompletionTimeoutMs : nrCompletionTimeoutMs_dev,
      $EXISTING_NR_TIMER_NAME: existingNrTimerName,
      $EXISTING_NR_TIMEOUT_MS: !appIsRunningLocally ? existingNrTimeoutMs : existingNrTimeoutMs_dev,
      $PAYMENT_COMPLETION_TIMER_NAME: paymentCompletionTimerName,
      $PAYMENT_COMPLETION_TIMEOUT_MS: appIsRunningLocally ? paymentCompletionTimeoutMs : paymentCompletionTimeoutMs_dev
    }
    resolve(config)
  })
}
