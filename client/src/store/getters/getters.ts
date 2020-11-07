import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

/** Fetch current name request url */
export const getNameRequestUrl = (state: any): string => {
  return `${window.location.origin}${process.env.VUE_APP_PATH}`
}

/** Returns True if user is authenticated, else False. */
export const isAuthenticated = (state: any): boolean => {
  return Boolean(sessionStorage.getItem(SessionStorageKeys.KeyCloakToken))
}
