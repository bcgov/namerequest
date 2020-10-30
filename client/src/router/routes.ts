import { Signin, Signout, Landing } from '@/views'

export const routes = [
  {
    path: '/',
    name: 'landing',
    component: Landing
  },
  {
    path: '/nr/:id',
    name: 'existing-nr',
    component: Landing,
    props: true
  },
  {
    path: '/signin/:idpHint',
    name: 'signin',
    component: Signin,
    props: true,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/signin/:idpHint/:redirectUrl',
    name: 'signin-redirect',
    component: Signin,
    props: true,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/signin/:idpHint/:redirectUrl/:redirectUrlLoginFail',
    name: 'signin-redirect-full',
    component: Signin,
    props: true,
    meta: { requiresAuth: false }
  },
  {
    // SbcHeader.logout() redirects here:
    path: '/signout',
    name: 'signout',
    component: Signout,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/signout/:redirectUrl',
    name: 'signout-redirect',
    component: Signout,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '*',
    redirect: '/'
  }
]
