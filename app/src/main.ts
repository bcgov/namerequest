import Vue from 'vue'
import App from './App.vue'
import Hotjar from 'vue-hotjar'
import { getVueRouter } from '@/router'
import { getVuexStore } from '@/store'
import { getConfig, getVuetify, InitLdClient, isSigningIn, isSigningOut } from '@/plugins'
import KeycloakService from 'sbc-common-components/src/services/keycloak.services'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'
import ConfigHelper from 'sbc-common-components/src/util/config-helper'

// NB: order matters - do not change
import 'quill/dist/quill.core.css'
import '@mdi/font/css/materialdesignicons.min.css'

import '@/assets/styles/base.scss'
import '@/assets/styles/layout.scss'
import '@/assets/styles/overrides.scss'

Vue.config.productionTip = true
Vue.config.devtools = true

/**
 * Our app start code, which is a function so that:
 * 1. we can use await
 * 2. we can catch errors
 */
async function startVue () {
  // Fetch the configuration
  const envConfig = await getConfig()
  const store = getVuexStore()

  // FUTURE: remove this global assignment if possible
  // Load environment config
  Vue.prototype.$PAYMENT_PORTAL_URL = envConfig.$PAYMENT_PORTAL_URL

  // FUTURE: remove this config assignment if possible
  // Load Vuex config
  store.state.config = envConfig

  // Initialize Keycloak / sync SSO
  await syncSession()

  // Initialize Hotjar
  if (window['hotjarId']) {
    console.info('Initializing Hotjar...') // eslint-disable-line no-console
    Vue.use(Hotjar, { id: window['hotjarId'], isProduction: true })
  }

  // Initialize Launch Darkly
  if (window['ldClientId']) {
    console.info('Initializing Launch Darkly...') // eslint-disable-line no-console
    await InitLdClient()
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
  const keycloakConfig: any = {
    url: `${window['keycloakAuthUrl']}`,
    realm: `${window['keycloakRealm']}`,
    clientId: `${window['keycloakClientId']}`
  }

  await KeycloakService.setKeycloakConfigUrl(keycloakConfig)
  // Auto authenticate user only if they are not trying a login or logout
  if (!isSigningIn() && !isSigningOut()) {
    // Initialize token service which will do a check-sso to initiate session
    await KeycloakService.initializeToken(null).then(() => {
      const token = ConfigHelper.getFromSession(SessionStorageKeys.KeyCloakToken)
      if (!token) {
        // when there is no token in session storage, e.g. because token has expired due to user inactivity,
        // make sure to clear out account info saved on previous login
        ConfigHelper.removeFromSession(SessionStorageKeys.CurrentAccount)
      }
    }).catch(err => {
      if (err?.message !== 'NOT_AUTHENTICATED') {
        throw err
      }
    })
  }
}

// NB: the .then() makes sure linter doesn't pick up on an un-awaited promise
startVue().then().catch(error => {
  console.error('main =', error) // eslint-disable-line no-console
})
