import * as actions from './actions'
import getters from './getters'
import mutations from './mutations'

import * as filingTypes from '@/modules/payment/filing-types'

export const STATE_KEY = 'payment'

const state = {
  [STATE_KEY]: {
    // The payment reference
    references: [
      {
        id: '',
        receiptNumber: '',
        statusCode: ''
      }
    ],
    isPaymentVisible: false,
    isPaymentHistoryVisible: false,
    isUpgradeVisible: false,
    isReapplyVisible: false,
    isPaymentCompleteVisible: false,
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
      filingFees: 0.0,
      filingType: '',
      filingTypeCode: undefined,
      futureEffectiveFees: 0.0,
      priorityFees: 0.0,
      processingFees: 0.0,
      serviceFees: 0.0,
      tax: {},
      total: 0.0
    },
    request: {},
    payment: {},
    sbcPayment: {},
    payments: [],
    receipt: {
      id: undefined,
      receiptAmount: 0.00,
      receiptDate: '',
      receiptNumber: ''
    },
    receipts: []
  }
}

export default {
  state,
  actions,
  getters,
  mutations
}
