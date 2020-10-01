import * as types from './types'

import { STATE_KEY } from '@/modules/payment/store'

export default {
  [types.PAYMENT_MODAL_IS_VISIBLE]: state => state[STATE_KEY].isPaymentVisible,
  [types.PAYMENT_HISTORY_MODAL_IS_VISIBLE]: state => state[STATE_KEY].isPaymentHistoryVisible,
  [types.UPGRADE_MODAL_IS_VISIBLE]: state => state[STATE_KEY].isUpgradeVisible,
  [types.REAPPLY_MODAL_IS_VISIBLE]: state => state[STATE_KEY].isReapplyVisible,
  [types.PAYMENT_COMPLETE_MODAL_IS_VISIBLE]: state => state[STATE_KEY].isPaymentCompleteVisible,
  [types.PAYMENT_IS_IN_PROGRESS]: state => state[STATE_KEY].isProcessing,
  [types.GET_PAYMENT]: state => state[STATE_KEY].payment,
  [types.GET_PAYMENT_ID]: state => state[STATE_KEY].payment.id,
  [types.GET_PAYMENT_TOKEN]: state => state[STATE_KEY].payment.payment_token,
  [types.GET_PAYMENT_FEES]: state => state[STATE_KEY].fees,
  [types.GET_PAYMENT_DETAILS]: state => {
    const {
      filingTypeCode,
      entity_type_cd,
      filingDescription,
      waiveFees,
      priority,
      futureEffective
    } = state[STATE_KEY]

    return {
      filingTypeCode,
      entity_type_cd,
      filingDescription,
      waiveFees,
      priority,
      futureEffective
    }
  },
  [types.GET_PAYMENT_REQUEST]: state => {
    // TODO: Zap the payment request when timer expires?
    let paymentRequestState
    if ((!state[STATE_KEY].request || Object.keys(state[STATE_KEY].request).length === 0) &&
      sessionStorage.getItem('paymentRequest')) {
      paymentRequestState = JSON.parse(sessionStorage.getItem('paymentRequest'))
    } else {
      paymentRequestState = state[STATE_KEY].request
    }

    return paymentRequestState
  },
  [types.GET_PAYMENT_INVOICE]: state => state[STATE_KEY].invoice,
  [types.GET_PAYMENT_RECEIPT]: state => state[STATE_KEY].receipt,
  [types.GET_PAYMENTS]: state => state[STATE_KEY].payments
}
