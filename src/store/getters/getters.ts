import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

/** Returns current name request URL. */
export const getNameRequestUrl = (state: any): string => {
  return `${window.location.origin}${process.env.VUE_APP_PATH}`
}

/** Returns True if user is authenticated, else False. */
export const isAuthenticated = (state: any): boolean => {
  return Boolean(sessionStorage.getItem(SessionStorageKeys.KeyCloakToken))
}
