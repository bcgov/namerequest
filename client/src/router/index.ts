import Vue from 'vue'
import VueRouter from 'vue-router'
import Landing from '../views/landing.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: Landing
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: '/namerequest',
  routes
})

export default router
