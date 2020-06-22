import * as actions from './actions'
import getters from './getters'
import mutations from './mutations'

import * as filingTypes from '@/modules/payment/filing-types'
import * as corpTypes from '@/modules/payment/corp-types'
import * as jurisdictions from '@/modules/payment/jurisdictions'

export const STATE_KEY = 'payment'

const state = {
  [STATE_KEY]: {
    isPaymentVisible: false,
    isReceiptVisible: false,
    isProcessing: false,
    paymentTimeoutTimer: undefined,
    filingTypeCode: filingTypes.NM606,
    entityType: corpTypes.CR,
    filingDescription: '',
    waiveFees: false,
    priority: false,
    futureEffective: false,
    fees: {
      filing_fees: 20.00,
      processing_fees: 0.00,
      service_fees: 0.00,
      tax: [
        { gst: null, pst: null }
      ]
    },
    request: {},
    payment: {},
    invoice: {
      account_id: null,
      created_by: null,
      created_on: null,
      id: null,
      line_items: null,
      links: [],
      paid: 0.00,
      payment_date: null,
      payment_id: null,
      reference_number: null,
      status_code: null
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
