import Vue from 'vue'
import App from './App.vue'
import { getVueRouter } from '@/router'
import store from './store'
import { getConfig } from '@/plugins/getConfig'
import vuetify from '@/plugins/vuetify'
import KeyCloakService from 'sbc-common-components/src/services/keycloak.services'

// NB: order matters - do not change
import 'quill/dist/quill.core.css'
import '@mdi/font/css/materialdesignicons.min.css' // ensure you are using css-loader
import '@/sass/main.sass'
import '@/sass/overrides.sass'

import designations from '@/store/list-data/designations'
import canJurisdictions from '@/store/list-data/canada-jurisdictions'
import intJurisdictions from '@/store/list-data/intl-jurisdictions'
import USAStateCodes from '@/store/list-data/us-states'
import * as mapping from '@/store/list-data/request-action-mapping'

Vue.config.productionTip = true
Vue.config.devtools = true

async function startVue () {
  Vue.prototype.$designations = designations
  Vue.prototype.$canJurisdictions = canJurisdictions
  Vue.prototype.$intJurisdictions = intJurisdictions
  Vue.prototype.$PAYMENT_PORTAL_URL = await getConfig()
  Vue.prototype.$USAStateCodes = USAStateCodes
  Vue.prototype.$xproMapping = mapping.xproMapping

  // configure Keycloak Service
  console.info('Starting Keycloak service...') // eslint-disable-line no-console
  await KeyCloakService.setKeycloakConfigUrl(sessionStorage.getItem('KEYCLOAK_CONFIG_PATH'))

  new Vue({
    vuetify: vuetify,
    router: getVueRouter(),
    store,
    render: h => h(App)
  }).$mount('#app')
}

startVue()
