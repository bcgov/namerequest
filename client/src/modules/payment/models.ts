import { ErrorI } from '@/modules/error/store/actions'

export interface NameRequestPaymentResponse {
  id: number
  nrId: string
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
