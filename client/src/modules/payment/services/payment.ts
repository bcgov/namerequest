import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'

// import ConfigHelper from 'sbc-common-components/src/util/config-helper'
// import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'
// import { addAxiosInterceptors } from 'sbc-common-components/src/util/interceptors'

const PAYMENT_API_URL = 'localhost:5000/payments'

export async function createPaymentRequest (params): Promise<AxiosResponse<any>> {
  const url = `${PAYMENT_API_URL}/payment`
  return axios.post(url, { params })
}

/**
 * const requestBody = {
    "payment_info": {
      "method_of_payment": "string"
    },
    "business_info": {
      "business_identifier": "string",
      "business_name": "string",
      "contact_info": {
        "first_name": "string",
        "last_name": "string",
        "address": "string",
        "city": "string",
        "province": "string",
        "postal_code": "string"
      }
    },
    "filing_info": {
      "corp_type": "string",
      "date": "string",
      "filing_types": [
        {
          "filing_type_code": "string",
          "priority": true,
          "filing_description": "string"
        }
      ]
    }
  }
 * @param params
 */
export async function getPaymentFees (params): Promise<AxiosResponse<any>> {
  const url = `${PAYMENT_API_URL}/fees`
  return axios.post(url, { params })
}

export async function getInvoiceRequest (paymentId, params): Promise<AxiosResponse<any>> {
  const url = `${PAYMENT_API_URL}/${paymentId}/invoice`
  return axios.get(url, { params })
}

export async function getInvoicesRequest (paymentId, params): Promise<AxiosResponse<any>> {
  const url = `${PAYMENT_API_URL}/${paymentId}/invoices`
  return axios.get(url, { params })
}

export async function getReceiptRequest (paymentId, params): Promise<AxiosResponse<any>> {
  const url = `${PAYMENT_API_URL}/${paymentId}/receipt`
  return axios.get(url, { params })
}
