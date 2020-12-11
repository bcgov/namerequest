import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { NameRequestPaymentResponse } from '@/modules/payment/models'

export class PaymentApiError extends Error {}

function isAxiosError (err: AxiosError | Error): err is AxiosError {
  return (err as AxiosError).isAxiosError !== undefined
}

/**
 * Throws an error with error message extracted and formatted.
 * @param err error object from the catch statement
 * @param defaultMessage optional fallback message
 */
async function handleApiError (err, defaultMessage = '') {
  if (isAxiosError(err)) {
    let message = ''
    const responseData = err?.response?.data
    const hasResponseData = !!responseData
    if (hasResponseData && responseData instanceof Blob) {
      // Handle any cases where the API error response is a Blob (eg. request for PDF receipt fails)
      const errorText = await responseData.text()
      const errorJson = JSON.parse(errorText)
      if (errorJson && errorJson.message) {
        message = errorJson.message
      }
    } else if (hasResponseData && responseData instanceof String) {
      message = responseData.toString()
      // Handle any cases where the API error response is a string
    } else if (hasResponseData && responseData.message) {
      // Handle API errors, they will be supplied as an object { message: 'Ipsum lorem dolor' }
      message = responseData.message
    } else {
      message = defaultMessage
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

export async function createPaymentRequest (nrId, action, data): Promise<NameRequestPaymentResponse> {
  const url = `/payments/${nrId}/${action}`
  try {
    const response = await axios.post(url, data)
    return response.data
  } catch (err) {
    console.error('createPaymentRequest() =', err) // eslint-disable-line no-console
    await handleApiError(err, 'Could not create Name Request payment')
  }
}

export async function getNameRequestPayment (nrId, paymentId, params): Promise<NameRequestPaymentResponse> {
  const url = `/payments/${nrId}/payment/${paymentId}`
  try {
    const response = await axios.get(url, params)
    return response.data
  } catch (err) {
    console.error('getNameRequestPayment() =', err) // eslint-disable-line no-console
    await handleApiError(err, 'Could not retrieve Name Request payment')
  }
}

export async function getNameRequestPayments (nrId, params): Promise<NameRequestPaymentResponse[]> {
  const url = `/payments/${nrId}`
  try {
    const response = await axios.get(url, params)
    return response.data
  } catch (err) {
    console.error('getNameRequestPayments() =', err) // eslint-disable-line no-console
    await handleApiError(err, 'Could not retrieve Name Request payments')
  }
}

export async function getPaymentFees (params): Promise<any> {
  const url = '/payments/fees'
  try {
    const response = await axios.post(url, params)
    return response.data
  } catch (err) {
    console.error('getPaymentFees() =', err) // eslint-disable-line no-console
    await handleApiError(err, 'Could not retrieve Name Request payment fees')
  }
}

/**
 * @param paymentId
 */
export async function getReceiptRequest (paymentId): Promise<any> {
  const params = { responseType: 'blob' } as AxiosRequestConfig
  const url = `/payments/${paymentId}/receipt`
  try {
    const response = await axios.get(url, params)
    return response.data
  } catch (err) {
    console.error('getReceiptRequest() =', err) // eslint-disable-line no-console
    await handleApiError(err, 'Could not retrieve Name Request payment receipt')
  }
}

/**
 * @param paymentId
 */
export async function generateReceiptRequest (paymentId): Promise<any> {
  const params = { responseType: 'arraybuffer' } as AxiosRequestConfig
  const url = `/payments/${paymentId}/receipt`
  try {
    const response = await axios.post(url, {}, params)
    return response.data
  } catch (err) {
    console.error('generateReceiptRequest() =', err) // eslint-disable-line no-console
    await handleApiError(err, 'Could not retrieve Name Request payment receipt')
  }
}
