import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { getConfig } from '@/plugins/getConfig'
import vuetify from './plugins/vuetify'

import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import '@/sass/main.sass'
import '@/sass/overrides.sass'

import designations from '@/store/list-data/designations.js'
import canadaJurisdictions from '@/store/list-data/canada-jurisdictions.js'
import internationalJurisdictions from '@/store/list-data/intl-jurisdictions.js'

Vue.config.productionTip = true
Vue.config.devtools = true

async function startVue () {
  Vue.prototype.$PAYMENT_PORTAL_URL = await getConfig()
  Vue.prototype.$designations = designations
  Vue.prototype.$canadaJurisdictions = canadaJurisdictions
  Vue.prototype.$internationalJurisdictions = internationalJurisdictions

  new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
  }).$mount('#app')
}

startVue()
