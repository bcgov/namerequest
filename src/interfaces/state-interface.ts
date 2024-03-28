import { NewRequestIF } from '@/interfaces/new-request-interface'
import { NameCheckModelIF, StaffPaymentIF, RefundParamsIF } from '@/interfaces'

export interface StateModelIF {
  common: {
    currentJsDate: Date,
    keycloakRoles: Array<string>
  }
  newRequestModel: NewRequestIF
  staffPayment: StaffPaymentIF
  errorModel?: object
  paymentModel?: object
  nameCheckModel: NameCheckModelIF
  refundParams: RefundParamsIF
  windowWidth: number
}

export interface StateIF {
  stateModel: StateModelIF
}
