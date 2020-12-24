import Vue from 'vue'
import App from './App.vue'
import { getVueRouter } from '@/router'
import store from './store'
import { EnvConfigI, getConfig } from '@/plugins/getConfig'
import vuetify from '@/plugins/vuetify'
import { featureFlags, initLDClient } from '@/plugins/featureFlags'
import KeycloakService from 'sbc-common-components/src/services/keycloak.services'
import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'

// NB: order matters - do not change
import 'quill/dist/quill.core.css'
import '@mdi/font/css/materialdesignicons.min.css'
import '@/sass/main.sass'
import '@/sass/overrides.sass'

import '@/assets/scss/base.scss'
import '@/assets/scss/layout.scss'
import '@/assets/scss/overrides.scss'

import designations from '@/store/list-data/designations'
import canJurisdictions from '@/store/list-data/canada-jurisdictions'
import intJurisdictions from '@/store/list-data/intl-jurisdictions'
import USAStateCodes from '@/store/list-data/us-states'
import * as mapping from '@/store/list-data/request-action-mapping'

Vue.config.productionTip = true
Vue.config.devtools = true

/**
 * Set configuration properties directly to the Vue object so they are available in all components.
 * @param config
 */
function setVueEnvironment (config: EnvConfigI): void {
  // Load environment config
  Vue.prototype.$PAYMENT_PORTAL_URL = config.$PAYMENT_PORTAL_URL

  Vue.prototype.$NR_COMPLETION_TIMER_NAME = config.$NR_COMPLETION_TIMER_NAME
  Vue.prototype.$NR_COMPLETION_TIMEOUT_MS = config.$NR_COMPLETION_TIMEOUT_MS

  Vue.prototype.$EXISTING_NR_TIMER_NAME = config.$EXISTING_NR_TIMER_NAME
  Vue.prototype.$EXISTING_NR_TIMEOUT_MS = config.$EXISTING_NR_TIMEOUT_MS

  Vue.prototype.$PAYMENT_COMPLETION_TIMER_NAME = config.$PAYMENT_COMPLETION_TIMER_NAME
  Vue.prototype.$PAYMENT_COMPLETION_TIMEOUT_MS = config.$PAYMENT_COMPLETION_TIMEOUT_MS
}

/**
 * Set configuration properties directly to the Vuex state so we can use our environment vars in Vuex modules.
 * @param store
 * @param config
 */
function setVuexEnvironment (store, config: EnvConfigI): void {
  // We can just assign the config object, don't worry about actions or anything like that,
  // as the store isn't doing anything yet, and the App hasn't been initialized!
  store.state.config = config
}

/**
 * Our app start code, which is a function so that:
 * 1. we can use await
 * 2. we can catch errors
 **/
async function startVue () {
  // Fetch the configuration
  const envConfig: EnvConfigI = await getConfig()
  setVueEnvironment(envConfig)
  setVuexEnvironment(store, envConfig)

  // Load global data
  Vue.prototype.$designations = designations
  Vue.prototype.$canJurisdictions = canJurisdictions
  Vue.prototype.$intJurisdictions = intJurisdictions
  Vue.prototype.$USAStateCodes = USAStateCodes
  Vue.prototype.$xproMapping = mapping.xproMapping

  // Initialize Sentry
  if (window['sentryDsn']) {
    console.info('Initializing Sentry...') // eslint-disable-line no-console
    Sentry.init({
      dsn: window['sentryDsn'],
      integrations: [
        // new Integrations.Vue({ Vue, attachProps: true }), // FUTURE maybe
        new Integrations.CaptureConsole({ levels: ['error'] })
      ],
      ignoreErrors: [
        // this error is safe to ignore, ref: https://stackoverflow.com/a/50387233/8679162
        'ResizeObserver loop limit exceeded',
        // ignore Launch Darkly errors (partial match)
        'LD: [error]'
      ]
    })
  }

  // Initialize Launch Darkly
  if (window['ldClientId']) {
    console.info('Initializing Launch Darkly...') // eslint-disable-line no-console
    await initLDClient()
  }

  // Check app feature flag
  if (!featureFlags.getFlag('namerequest-ui-enabled')) {
    alert('Sorry, the Name Request web app is temporarily disabled.\n' +
      'Please try again later.')
    return
  }

  // Initialize Keyloak Service
  console.info('Starting Keycloak service...') // eslint-disable-line no-console
  await KeycloakService.setKeycloakConfigUrl(sessionStorage.getItem('KEYCLOAK_CONFIG_PATH'))

  // Start Vue application
  console.info('Starting app...') // eslint-disable-line no-console
  new Vue({
    vuetify: vuetify,
    router: getVueRouter(),
    store,
    render: h => h(App)
  }).$mount('#app')
}

// NB: the .then() makes sure linter doesn't pick up on an un-awaited promise
startVue().then().catch(error => {
  Sentry.captureException(error)
  console.error('main =', error) // eslint-disable-line no-console
})
