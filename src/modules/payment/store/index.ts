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
    isConfirmNrVisible: false,
    isPaymentHistoryVisible: false,
    isRefundVisible: false,
    isCancelVisible: false,
    isUpgradeVisible: false,
    isResubmitVisible: false,
    isRetryVisible: false,
    isRenewVisible: false,
    isPaymentCompleteVisible: false,
    isProcessing: false,
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
    sbcPayment: {
      paymentStatus: ''
    },
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
