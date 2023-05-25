import Vue from 'vue'
import VueRouter from 'vue-router'
import { routes } from './routes'

/**
 * Configures and returns Vue Router.
 */

let appBaseURL = ''; // Global variable to store the custom base URL

export function getVueRouter () {
  Vue.use(VueRouter)

  const customBaseURL = 'https://namex-dev.apps.silver.devops.gov.bc.ca/api/v1'
  appBaseURL = customBaseURL  // Assign the custom base URL to the global variable

  return new VueRouter({
    mode: 'history',
    base: customBaseURL,
    routes,
    scrollBehavior (to, from, savedPosition) {
      // see https://router.vuejs.org/guide/advanced/scroll-behavior.html
      return { x: 0, y: 0 }
    }
  })
}

export { appBaseURL }; // Export the global variable for use in other files