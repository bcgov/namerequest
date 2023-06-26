import { AxiosInstance } from 'axios'
import ConfigHelper from 'sbc-common-components/src/util/config-helper'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

export function AddAxiosInterceptors (axiosInstance: AxiosInstance): AxiosInstance {
  axiosInstance.interceptors.request.use(config => {
    const token = ConfigHelper.getFromSession(SessionStorageKeys.KeyCloakToken)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  err => {
    return Promise.reject(err)
  })
  return axiosInstance
}
