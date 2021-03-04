import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    options: {
      customProperties: true
    },
    themes: {
      light: {
        primary: '#1669bb', // same as $app-blue
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#d3272c', // same as $app-red
        info: '#2196F3',
        success: '#1a9031', // same as $app-green
        warning: '#FFC107',
        bcgovblue: {
          base: '#003366'
        }
      }
    }
  },
  icons: {
    iconfont: 'mdi'
  }
})
