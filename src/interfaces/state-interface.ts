import { NewRequestIF } from '@/interfaces/new-request-interface'

export interface StateIF {
  stateModel: StateModelIF
}

export interface StateModelIF {
  newRequestModel: NewRequestIF
  errorModel?: {},
  paymentModel?: {}
}
