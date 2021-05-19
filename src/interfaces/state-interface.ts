import { NewRequestIF } from '@/interfaces/new-request-interface'
import { StaffPaymentIF } from '@/interfaces'

export interface StateIF {
  stateModel: StateModelIF
}

export interface StateModelIF {
  common: {
    currentJsDate: Date,
    keycloakRoles: Array<string>
  }
  newRequestModel: NewRequestIF
  staffPayment: StaffPaymentIF
  errorModel?: {}
  paymentModel?: {}
}
