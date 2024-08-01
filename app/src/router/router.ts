import Vue from 'vue'
import VueRouter from 'vue-router'
import { routes } from './routes'

/** Global variable to store the custom base URL. */
const appBaseURL: string = process.env.VUE_APP_NAMEX_API_URL + process.env.VUE_APP_NAMEX_API_VERSION

/** Configures and returns Vue Router. */
export function getVueRouter () {
  Vue.use(VueRouter)

  return new VueRouter({
    mode: 'history',
    base: '',
    routes,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    scrollBehavior (to, from, savedPosition) {
      // see https://router.vuejs.org/guide/advanced/scroll-behavior.html
      return { x: 0, y: 0 }
    }
  })
}

export { appBaseURL }
