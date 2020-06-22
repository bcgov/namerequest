import * as types from './types'

import { STATE_KEY } from '@/modules/payment/store'

export default {
  [types.PAYMENT_MODAL_IS_VISIBLE]: state => state[STATE_KEY].isPaymentVisible,
  [types.RECEIPT_MODAL_IS_VISIBLE]: state => state[STATE_KEY].isReceiptVisible,
  [types.PAYMENT_IS_IN_PROGRESS]: state => state[STATE_KEY].isProcessing,
  [types.GET_PAYMENT_FEES]: state => state[STATE_KEY].fees,
  [types.GET_PAYMENT_DETAILS]: state => {
    const {
      filingTypeCode,
      entityType,
      filingDescription,
      waiveFees,
      priority,
      futureEffective
    } = state[STATE_KEY]

    return {
      filingTypeCode,
      entityType,
      filingDescription,
      waiveFees,
      priority,
      futureEffective
    }
  },
  [types.GET_PAYMENT_REQUEST]: state => state[STATE_KEY].request,
  [types.GET_PAYMENT_INVOICE]: state => state[STATE_KEY].invoice,
  [types.GET_PAYMENT_RECEIPT]: state => state[STATE_KEY].receipt
}
