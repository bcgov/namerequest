import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios'

import {
  NameRequestPayment, NameRequestPaymentResponse
} from '@/modules/payment/models'

export class PaymentApiError extends Error {}

function isAxiosError (err: AxiosError | Error): err is AxiosError {
  return (err as AxiosError).isAxiosError !== undefined
}

async function handleApiError (err, defaultMessage = '') {
  if (isAxiosError(err)) {
    let message
    const responseData = (err && err.response && err.response.data)
    const hasResponseData = !!responseData
    if (hasResponseData && responseData instanceof Blob) {
      // Handle any cases where the API error response is a Blob (eg. request for PDF receipt fails)
      const errorText = await responseData.text()
      const errorJson = JSON.parse(errorText)
      if (errorJson && errorJson.message) {
        message = errorJson.message
      }
    } else if (hasResponseData && responseData instanceof String) {
      message = responseData
      // Handle any cases where the API error response is a string
    } else if (hasResponseData && responseData.message) {
      // Handle API errors, they will be supplied as an object { message: 'Ipsum lorem dolor' }
      message = responseData.message
    }

    // Clean the error message, replace line breaks with HTML breaks
    const regex = /(?:\r\n|\r|\n)/g
    message = message.replace(regex, '<br>')
    throw new PaymentApiError(message)
  } else {
    const { message } = err
    throw new PaymentApiError(message || defaultMessage)
  }
}

export async function createPaymentRequest (nrId, data): Promise<NameRequestPaymentResponse> {
  const url = `/payments/${nrId}`
  try {
    const response: AxiosResponse = await axios.post(url, data)
    return response.data
  } catch (err) {
    await handleApiError(err, 'Could not create Name Request payment')
  }
}

export async function getNameRequestPayment (nrId, paymentId, params): Promise<NameRequestPaymentResponse> {
  const url = `/payments/${nrId}/payment/${paymentId}`
  try {
    const response: AxiosResponse = await axios.get(url, params)
    return response.data
  } catch (err) {
    await handleApiError(err, 'Could not retrieve Name Request payment')
  }
}

export async function getPayment (paymentId, params): Promise<any> {
  const url = `/payments/${paymentId}`
  try {
    const response: AxiosResponse = await axios.get(url, params)
    return response.data
  } catch (err) {
    await handleApiError(err, 'Could not create Service BC payment')
  }
}

export async function getPaymentFees (params): Promise<any> {
  const url = `/payments/fees`
  try {
    const response: AxiosResponse = await axios.post(url, params)
    return response.data
  } catch (err) {
    await handleApiError(err, 'Could not retrieve Name Request payment fees')
  }
}

export async function getInvoiceRequest (paymentId, params): Promise<any> {
  const url = `/payments/${paymentId}/invoice`
  try {
    const response: AxiosResponse = await axios.get(url, params)
    return response.data
  } catch (err) {
    await handleApiError(err, 'Could not retrieve Name Request payment invoice')
  }
}

export async function getInvoicesRequest (paymentId, params): Promise<any> {
  const url = `/payments/${paymentId}/invoices`
  try {
    const response: AxiosResponse = await axios.get(url, params)
    return response.data
  } catch (err) {
    await handleApiError(err, 'Could not retrieve Name Request payment invoices')
  }
}

export async function getReceiptRequest (paymentId, invoiceId, data): Promise<any> {
  const params = { responseType: 'blob' } as AxiosRequestConfig
  const url = `/payments/${paymentId}/receipt`
  try {
    const response: AxiosResponse = await axios.post(url, data, params)
    return response.data
  } catch (err) {
    await handleApiError(err, 'Could not retrieve Name Request payment receipt')
  }
}
