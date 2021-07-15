import * as types from './types'

import { STATE_KEY } from '@/modules/payment/store'

export default {
  [types.CONFIRM_NR_MODAL_IS_VISIBLE]: state => state[STATE_KEY].isConfirmNrVisible,
  [types.PAYMENT_HISTORY_MODAL_IS_VISIBLE]: state => state[STATE_KEY].isPaymentHistoryVisible,
  [types.REFUND_MODAL_IS_VISIBLE]: state => state[STATE_KEY].isRefundVisible,
  [types.CANCEL_MODAL_IS_VISIBLE]: state => state[STATE_KEY].isCancelVisible,
  [types.UPGRADE_MODAL_IS_VISIBLE]: state => state[STATE_KEY].isUpgradeVisible,
  [types.RESUBMIT_MODAL_IS_VISIBLE]: state => state[STATE_KEY].isResubmitVisible,
  [types.RETRY_MODAL_IS_VISIBLE]: state => state[STATE_KEY].isRetryVisible,
  [types.RENEW_MODAL_IS_VISIBLE]: state => state[STATE_KEY].isRenewVisible,
  [types.PAYMENT_COMPLETE_MODAL_IS_VISIBLE]: state => state[STATE_KEY].isPaymentCompleteVisible,
  [types.PAYMENT_IS_IN_PROGRESS]: state => state[STATE_KEY].isProcessing,
  [types.GET_SBC_PAYMENT]: state => state[STATE_KEY].sbcPayment,
  [types.GET_SBC_PAYMENT_STATUS]: state => (state[STATE_KEY].sbcPayment)
    ? state[STATE_KEY].sbcPayment.statusCode
    : undefined,
  [types.GET_PAYMENT]: state => state[STATE_KEY].payment,
  [types.GET_PAYMENT_ID]: state => state[STATE_KEY].payment.id,
  [types.GET_PAYMENT_TOKEN]: state => state[STATE_KEY].payment.payment_token,
  [types.GET_PAYMENT_STATUS]: state =>
    state[STATE_KEY].sbcPayment.paymentStatus || state[STATE_KEY].payment.payment_status_code,
  [types.GET_PAYMENT_DATE]: state => state[STATE_KEY].payment.payment_status_code,
  [types.GET_PAYMENT_FEES]: state => state[STATE_KEY].fees,
  [types.GET_PAYMENT_DETAILS]: state => {
    // FUTURE: delete these state properties if obsolete
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
    let paymentRequestState
    if ((!state[STATE_KEY].request || Object.keys(state[STATE_KEY].request).length === 0) &&
      sessionStorage.getItem('paymentRequest')) {
      paymentRequestState = JSON.parse(sessionStorage.getItem('paymentRequest'))
    } else {
      paymentRequestState = state[STATE_KEY].request
    }

    return paymentRequestState
  },
  [types.GET_PAYMENT_RECEIPT]: state => state[STATE_KEY].receipt,
  [types.GET_PAYMENTS]: state => state[STATE_KEY].payments
}
