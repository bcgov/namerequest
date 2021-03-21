import { NewRequestIF } from '@/interfaces/new-request-interface'

export interface StateIF {
  stateModel: StateModelIF
}

export interface StateModelIF {
  common: {
    currentJsDate: Date
  },
  newRequestModel: NewRequestIF
  errorModel?: {},
  paymentModel?: {}
}
