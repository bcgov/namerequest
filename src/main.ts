import Vue from 'vue'
import App from './App.vue'
import Hotjar from 'vue-hotjar'
import { getVueRouter } from '@/router'
import { getVuexStore } from '@/store'
import { getConfig, getVuetify, initLdClient, isSigningIn, isSigningOut } from '@/plugins'
import KeycloakService from 'sbc-common-components/src/services/keycloak.services'
import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'

// NB: order matters - do not change
import 'quill/dist/quill.core.css'
import '@mdi/font/css/materialdesignicons.min.css'

import '@/assets/scss/base.scss'
import '@/assets/scss/layout.scss'
import '@/assets/scss/overrides.scss'

import {
  Designations, AllDesignationsList, CanJurisdictions, MrasJurisdictions, IntlJurisdictions,
  ConversionTypes, EntityTypesBcData, EntityTypesXproData, RequestActions, Locations, UsaStateCodes,
  BcMapping, XproMapping, ColinRequestActions, ColinRequestTypes, XproColinRequestTypes
} from '@/list-data'

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
  const store = await getVuexStore()

  // TODO: remove these config assignments if possible
  // Load environment config
  Vue.prototype.$PAYMENT_PORTAL_URL = envConfig.$PAYMENT_PORTAL_URL
  // Load Vuex config
  store.state.config = envConfig

  // Load global data
  Vue.prototype.$designations = Designations
  Vue.prototype.$canJurisdictions = CanJurisdictions
  Vue.prototype.$mrasJurisdictions = MrasJurisdictions
  Vue.prototype.$intlJurisdictions = IntlJurisdictions
  Vue.prototype.$usaStateCodes = UsaStateCodes
  Vue.prototype.$bcMapping = BcMapping
  Vue.prototype.$xproMapping = XproMapping
  Vue.prototype.$conversionTypes = ConversionTypes
  Vue.prototype.$allDesignationsList = AllDesignationsList
  Vue.prototype.$entityTypesBcData = EntityTypesBcData
  Vue.prototype.$entityTypesXproData = EntityTypesXproData
  Vue.prototype.$requestActions = RequestActions
  Vue.prototype.$locations = Locations
  Vue.prototype.$colinRequestActions = ColinRequestActions
  Vue.prototype.$colinRequestTypes = ColinRequestTypes
  Vue.prototype.$xproColinRequestTypes = XproColinRequestTypes

  if (window['sentryEnable'] === 'true') {
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
  }

  // Initialize Keycloak / sync SSO
  await syncSession()

  // Initialize Hotjar
  if (window['hotjarId']) {
    console.info('Initializing Hotjar...') // eslint-disable-line no-console
    Vue.use(Hotjar, { id: window['hotjarId'] })
  }

  // Initialize Launch Darkly
  if (window['ldClientId']) {
    console.info('Initializing Launch Darkly...') // eslint-disable-line no-console
    await initLdClient()
  }

  // Start Vue application
  console.info('Starting app...') // eslint-disable-line no-console
  new Vue({
    vuetify: getVuetify(),
    router: getVueRouter(),
    store,
    render: h => h(App)
  }).$mount('#app')
}

async function syncSession () {
  console.info('Starting Keycloak service...') // eslint-disable-line no-console
  await KeycloakService.setKeycloakConfigUrl(sessionStorage.getItem('KEYCLOAK_CONFIG_PATH'))

  // Auto authenticate user only if they are not trying a login or logout
  if (!isSigningIn() && !isSigningOut()) {
    // Initialize token service which will do a check-sso to initiate session
    await KeycloakService.initializeToken(null).then(() => {}).catch(err => {
      if (err?.message !== 'NOT_AUTHENTICATED') {
        throw err
      }
    })
  }
}

// NB: the .then() makes sure linter doesn't pick up on an un-awaited promise
startVue().then().catch(error => {
  Sentry.captureException(error)
  console.error('main =', error) // eslint-disable-line no-console
})
