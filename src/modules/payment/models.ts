import { ErrorI } from '@/modules/error/store/actions'
import { FilingTypes } from '@/modules/payment/filing-types'
import { Jurisdictions } from '@/enums'

export interface NameRequestPaymentResponse {
  id: number
  nrId: string
  nrNum: string
  token: number
  statusCode: string
  completionDate: string
  payment: any
  sbcPayment: any
}

export interface NameRequestPayment {
  payment?: any
  paymentSuccess: boolean
  paymentErrors?: ErrorI[]
  statusCode?: string
  httpStatusCode?: string
}

export interface NameRequestReceipt {
  id?: any
  receiptAmount?: number
  receiptDate?: string
  receiptNumber?: string
}

export interface CreatePaymentParams {
  // TODO: We could use a type or something for the action...
  action: string
  nrId: number
  filingType: string
  priorityRequest: boolean
}

export interface FetchFeesParams {
  filingType: FilingTypes
  jurisdiction: Jurisdictions
  priorityRequest: boolean
}
