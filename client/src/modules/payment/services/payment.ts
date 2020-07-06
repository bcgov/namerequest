import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'

const PAYMENT_API_URL = 'payments'

export async function createPaymentRequest (nrNumber, data): Promise<AxiosResponse<any>> {
  const url = `${PAYMENT_API_URL}/${nrNumber}`
  return axios.post(url, data)
}

export async function getPayment (paymentId, params): Promise<AxiosResponse<any>> {
  const url = `${PAYMENT_API_URL}/${paymentId}`
  return axios.get(url, params)
}

export async function getPaymentFees (params): Promise<AxiosResponse<any>> {
  const url = `${PAYMENT_API_URL}/fees`
  return axios.post(url, params)
}

export async function getInvoiceRequest (paymentId, params): Promise<AxiosResponse<any>> {
  const url = `${PAYMENT_API_URL}/${paymentId}/invoice`
  return axios.get(url, params)
}

export async function getInvoicesRequest (paymentId, params): Promise<AxiosResponse<any>> {
  const url = `${PAYMENT_API_URL}/${paymentId}/invoices`
  return axios.get(url, params)
}

export async function getReceiptRequest (paymentId, invoiceId, data): Promise<AxiosResponse<any>> {
  const params = { responseType: 'blob' } as AxiosRequestConfig
  const url = `${PAYMENT_API_URL}/${paymentId}/receipt`
  return axios.post(url, data, params)
}
