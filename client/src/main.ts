import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { getConfig } from '@/plugins/getConfig'
import vuetify from './plugins/vuetify'
import KeyCloakService from 'sbc-common-components/src/services/keycloak.services'

import 'quill/dist/quill.core.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import '@/sass/main.sass'
import '@/sass/overrides.sass'

import designations from '@/store/list-data/designations'
import canJurisdictions from '@/store/list-data/canada-jurisdictions'
import intJurisdictions from '@/store/list-data/intl-jurisdictions'

Vue.config.productionTip = true
Vue.config.devtools = true

async function startVue () {
  Vue.prototype.$designations = designations
  Vue.prototype.$canJurisdictions = canJurisdictions
  Vue.prototype.$intJurisdictions = intJurisdictions
  Vue.prototype.$PAYMENT_PORTAL_URL = await getConfig()

  // // configure Keycloak Service
  // await KeyCloakService.setKeycloakConfigUrl(sessionStorage.getItem('KEYCLOAK_CONFIG_PATH'))
  // if (!window.location.pathname.includes('/signin')) {
  //   await KeyCloakService.initializeToken(null).catch(err => {
  //     if (err?.message !== 'NOT_AUTHENTICATED') {
  //       throw err
  //     }
  //   })
  // }

  new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
  }).$mount('#app')
}

startVue()
