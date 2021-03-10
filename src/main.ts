import Vue from 'vue'
import App from './App.vue'
import Hotjar from 'vue-hotjar'
import { getVueRouter } from '@/router'
import store from './store'
import { getConfig, getVuetify, initLdClient } from '@/plugins'
import KeycloakService from 'sbc-common-components/src/services/keycloak.services'
import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'

// NB: order matters - do not change
import 'quill/dist/quill.core.css'
import '@mdi/font/css/materialdesignicons.min.css'
import '@/assets/sass/main.sass'
import '@/assets/sass/overrides.sass'

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
 * Our app start code, which is a function so that:
 * 1. we can use await
 * 2. we can catch errors
 **/
async function startVue () {
  // Fetch the configuration
  const envConfig = await getConfig()
  //
  // *** TODO: remove these config assignments if possible
  //
  // Load environment config
  Vue.prototype.$PAYMENT_PORTAL_URL = envConfig.$PAYMENT_PORTAL_URL
  // Load Vuex config
  store.state.config = envConfig

  // Load global data
  Vue.prototype.$designations = designations
  Vue.prototype.$canJurisdictions = canJurisdictions
  Vue.prototype.$intJurisdictions = intJurisdictions
  Vue.prototype.$USAStateCodes = USAStateCodes
  Vue.prototype.$xproMapping = mapping.xproMapping

  // Initialize Hotjar
  if (window['hotjarId']) {
    console.info('Initializing Hotjar...') // eslint-disable-line no-console
    Vue.use(Hotjar, { id: window['hotjarId'] })
  }

  // Initialize Sentry
  if (window['sentryDsn']) {
    console.info('Initializing Sentry...') // eslint-disable-line no-console
    const release = process.env.ABOUT_TEXT.replace(/<br>.*/, '')
    Sentry.init({
      dsn: window['sentryDsn'],
      integrations: [
        // new Integrations.Vue({ Vue, attachProps: true }), // FUTURE maybe
        new Integrations.CaptureConsole({ levels: ['error'] })
      ],
      ignoreErrors: [
        // these errors are safe to ignore, ref: https://stackoverflow.com/a/50387233/8679162
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        // ignore Launch Darkly errors (partial match)
        'LD: [error]'
      ],
      release
    })
  }

  // Initialize Launch Darkly
  if (window['ldClientId']) {
    console.info('Initializing Launch Darkly...') // eslint-disable-line no-console
    await initLdClient()
  }

  // Initialize Keyloak Service
  console.info('Starting Keycloak service...') // eslint-disable-line no-console
  await KeycloakService.setKeycloakConfigUrl(sessionStorage.getItem('KEYCLOAK_CONFIG_PATH'))

  // Start Vue application
  console.info('Starting app...') // eslint-disable-line no-console
  new Vue({
    vuetify: getVuetify(),
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
