import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import store from '@/store/new-request-module'

export async function createPaymentRequest (nrNumber, data): Promise<AxiosResponse<any>> {
  const url = `/payments/${nrNumber}`
  return axios.post(url, data)
}

/* export async function completePaymentRequest (nrNumber, data): Promise<AxiosResponse<any>> {
  const url = `/payments/${nrNumber}`
  return axios.put(url, data)
} */

export async function getPayment (paymentId, params): Promise<AxiosResponse<any>> {
  const url = `/payments/${paymentId}`
  return axios.get(url, params)
}

export async function getPaymentFees (params): Promise<AxiosResponse<any>> {
  const url = `/payments/fees`
  return axios.post(url, params)
}

export async function getInvoiceRequest (paymentId, params): Promise<AxiosResponse<any>> {
  const url = `/payments/${paymentId}/invoice`
  return axios.get(url, params)
}

export async function getInvoicesRequest (paymentId, params): Promise<AxiosResponse<any>> {
  const url = `/payments/${paymentId}/invoices`
  return axios.get(url, params)
}

export async function getReceiptRequest (paymentId, invoiceId, data): Promise<AxiosResponse<any>> {
  const params = { responseType: 'blob' } as AxiosRequestConfig
  const url = `/payments/${paymentId}/receipt`
  return axios.post(url, data, params)
}
