import * as actions from './actions'
import getters from './getters'
import mutations from './mutations'

import * as filingTypes from '@/modules/payment/filing-types'
// import * as corpTypes from '@/modules/payment/corp-types'
import * as jurisdictions from '@/modules/payment/jurisdictions'

export const STATE_KEY = 'payment'

const state = {
  [STATE_KEY]: {
    isPaymentVisible: false,
    isReceiptVisible: false,
    isProcessing: false,
    paymentTimeoutTimer: undefined,
    filingTypeCode: filingTypes.NM606,
    // entity_type_cd: corpTypes.CR,
    entity_type_cd: null,
    filingDescription: '',
    waiveFees: false,
    priority: false,
    futureEffective: false,
    fees: {
      filing_fees: 0.0,
      filing_type: '',
      filing_type_code: undefined,
      future_effective_fees: 0.0,
      priority_fees: 0.0,
      processing_fees: 0.0,
      service_fees: 0.0,
      tax: [],
      total: 131.5
    },
    request: {},
    payment: {},
    invoice: {
      reference_number: null,
      created_name: null,
      created_by: '',
      created_on: null,
      updated_name: '',
      updated_on: null,
      paid: 0.00,
      refund: null,
      service_fees: 0.00,
      total: 0.00,
      // The payment reference
      references: [
        {
          id: '',
          invoice_number: '',
          reference_number: '',
          status_code: ''
        }
      ],
      status_code: ''
    },
    receipt: {}
  }
}

export default {
  state,
  actions,
  getters,
  mutations
}
