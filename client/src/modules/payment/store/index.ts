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
      filingFees: 20.00,
      processingFees: 0.00,
      serviceFees: 0.00,
      tax: [
        { gst: null, pst: null }
      ]
    },
    request: {},
    payment: {},
    invoice: {
      accountId: null,
      createdBy: null,
      createdOn: null,
      id: null,
      lineItems: null,
      links: [],
      paid: 0.00,
      paymentDate: null,
      paymentId: null,
      referenceNumber: null,
      statusCode: null
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
