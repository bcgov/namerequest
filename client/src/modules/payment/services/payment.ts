import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { NameRequestPaymentResponse } from '@/modules/payment/models'

function isAxiosError (err: AxiosError | Error): err is AxiosError {
  return (err as AxiosError).isAxiosError !== undefined
}

/**
 * Throws an error with error message extracted and formatted.
 * @param err error object from the catch statement
 * @param defaultMessage optional fallback message
 */
async function handleApiError (err: any, defaultMessage = ''): Promise<string> {
  if (isAxiosError(err)) {
    let message = ''
    const responseData = err?.response?.data
    const hasResponseData = !!responseData

    if (hasResponseData && responseData instanceof Blob) {
      // Handle any cases where the API error response is a Blob (eg, request for PDF receipt fails).
      const errorText = await responseData.text()
      const errorJson = JSON.parse(errorText)
      if (errorJson?.message) {
        message = `${err.toString()} (${errorJson.message})`
      }
    } else if (hasResponseData && responseData instanceof String) {
      // Handle any cases where the API error response is a String.
      message = `${err.toString()} (${responseData.toString()})`
    } else if (hasResponseData && responseData.message) {
      // Handle any cases where the API error response in an object (eg, { message: 'Ipsum lorem dolor' }).
      message += responseData.message
      message = `${err.toString()} (${responseData.message})`
    } else if (defaultMessage) {
      // Handle any other cases.
      message = `${err.toString()} (${defaultMessage})`
    } else {
      return err.toString()
    }

    // Replace line breaks with HTML line breaks.
    return message.replace(/(?:\r\n|\r|\n)/g, '<br>')
  } else {
    // Handle non-axios error (ie, probably a JS error).
    return (err?.toString() || defaultMessage)
  }
}

export async function createPaymentRequest (nrId, action, data): Promise<NameRequestPaymentResponse> {
  const url = `/payments/${nrId}/${action}`
  try {
    const response = await axios.post(url, data)
    return response.data
  } catch (err) {
    const msg = await handleApiError(err, 'Could not create payment request')
    console.error('createPaymentRequest() =', msg) // eslint-disable-line no-console
    throw new Error(msg)
  }
}

export async function getNameRequestPayment (nrId, paymentId, params): Promise<NameRequestPaymentResponse> {
  const url = `/payments/${nrId}/payment/${paymentId}`
  try {
    const response = await axios.get(url, params)
    return response.data
  } catch (err) {
    const msg = await handleApiError(err, 'Could not get name request payment')
    console.error('getNameRequestPayment() =', msg) // eslint-disable-line no-console
    throw new Error(msg)
  }
}

export async function getNameRequestPayments (nrId, params): Promise<NameRequestPaymentResponse[]> {
  const url = `/payments/${nrId}`
  try {
    const response = await axios.get(url, params)
    return response.data
  } catch (err) {
    const msg = await handleApiError(err, 'Could not get name request payments')
    console.error('getNameRequestPayments() =', msg) // eslint-disable-line no-console
    throw new Error(msg)
  }
}

export async function getPaymentFees (params): Promise<any> {
  const url = '/payments/fees'
  try {
    const response = await axios.post(url, params)
    return response.data
  } catch (err) {
    const msg = await handleApiError(err, 'Could not get payment fees')
    console.error('getPaymentFees() =', msg) // eslint-disable-line no-console
    throw new Error(msg)
  }
}

export async function generateReceiptRequest (paymentId): Promise<any> {
  const params = { responseType: 'arraybuffer' } as AxiosRequestConfig
  const url = `/payments/${paymentId}/receipt`
  try {
    const response = await axios.post(url, {}, params)
    return response.data
  } catch (err) {
    const msg = await handleApiError(err, 'Could not generate payment receipt')
    console.error('generateReceiptRequest() =', msg) // eslint-disable-line no-console
    throw new Error(msg)
  }
}
