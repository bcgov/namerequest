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
      filingFees: 20,
      processing_fees: 0,
      service_fees: 0,
      tax: [
        { gst: null, pst: null },
        { gst: null, pst: null }
      ]
    },
    request: {},
    invoice: {},
    receipt: {}
  }
}

export default {
  state,
  actions,
  getters,
  mutations
}
