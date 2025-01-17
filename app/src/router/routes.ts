import { Landing, Signin, Signout } from '@/views'
import { Routes } from '@/enums'

export const routes = [
  {
    path: '/',
    name: Routes.REQUEST, // "Request a Business Name" tab
    component: Landing
  },
  {
    path: '/:businessAccountId',
    name: Routes.BUSINESS_ACCOUNT, // Add a corresponding name in your Routes enum
    component: Landing,
    props: true
  },
  {
    path: '/manage',
    name: Routes.MANAGE, // "Manage My Name Request" tab
    component: Landing
  },
  {
    path: '/nr/:id',
    name: Routes.EXISTING, // "Existing Name Request" page
    component: Landing,
    props: true
  },
  {
    // SbcHeader.login() redirects here:
    path: '/signin/:idpHint',
    name: Routes.SIGNIN,
    component: Signin,
    props: true
  },
  {
    // SbcHeader.logout() redirects here:
    path: '/signout',
    name: Routes.SIGNOUT,
    component: Signout
  },
  {
    // default/fallback route
    // must be last
    path: '*',
    redirect: '/'
  }
]
