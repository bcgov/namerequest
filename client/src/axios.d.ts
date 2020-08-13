import { AxiosRequestConfig } from 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    PAYMENT_URL?: string
  }
}
