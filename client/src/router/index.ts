import Vue from 'vue'
import VueRouter from 'vue-router'
import Signin from '@/views/auth/Signin.vue'
import Landing from '@/views/landing.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: Landing
  },
  { path: '/signin/:idpHint', name: 'signin', component: Signin, props: true, meta: { requiresAuth: false } },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
