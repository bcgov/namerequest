import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import Axios from '@/plugins/axios'

import vuetify from './plugins/vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

import '@/sass/main.sass'
import '@/sass/overrides.sass'

Vue.config.productionTip = true
Vue.config.devtools = true
Vue.prototype.$axios = Axios

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
