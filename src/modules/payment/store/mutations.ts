import * as types from './types'

import { STATE_KEY } from '@/modules/payment/store'

export default {
  [types.TOGGLE_PAYMENT_MODAL]: (state, isVisible: boolean) => {
    state[STATE_KEY].isPaymentVisible = isVisible || false
  },
  [types.TOGGLE_PAYMENT_HISTORY_MODAL]: (state, isVisible: boolean) => {
    state[STATE_KEY].isPaymentHistoryVisible = isVisible || false
  },
  [types.TOGGLE_REFUND_MODAL]: (state, isVisible: boolean) => {
    state[STATE_KEY].isRefundVisible = isVisible || false
  },
  [types.TOGGLE_CANCEL_MODAL]: (state, isVisible: boolean) => {
    state[STATE_KEY].isCancelVisible = isVisible || false
  },
  [types.TOGGLE_UPGRADE_MODAL]: (state, isVisible: boolean) => {
    state[STATE_KEY].isUpgradeVisible = isVisible || false
  },
  [types.TOGGLE_REAPPLY_MODAL]: (state, isVisible: boolean) => {
    state[STATE_KEY].isReapplyVisible = isVisible || false
  },
  [types.SET_PAYMENT_FEES]: (state, fees: any) => {
    if (fees) {
      state[STATE_KEY].fees = fees
    }
  },
  [types.SET_PAYMENT_REQUEST]: (state, req: any) => {
    state[STATE_KEY].request = req || {}
    sessionStorage.setItem('paymentRequest', JSON.stringify(req))
  },
  [types.SET_PAYMENT_IS_PROCESSING]: (state, isProcessing: boolean) => {
    state[STATE_KEY].isProcessing = isProcessing || false
  },
  [types.SET_PAYMENT]: (state, payment: any) => {
    state[STATE_KEY].payment = payment || {}
  },
  [types.SET_SBC_PAYMENT]: (state, sbcPayment: any) => {
    state[STATE_KEY].sbcPayment = sbcPayment || {}
  },
  [types.TOGGLE_PAYMENT_COMPLETE_MODAL]: (state, isVisible: boolean) => {
    state[STATE_KEY].isPaymentCompleteVisible = isVisible || false
  },
  [types.SET_PAYMENT_RECEIPT]: (state, receipt: any) => {
    state[STATE_KEY].receipt = receipt || {}
  },
  [types.SET_PAYMENT_RECEIPT]: (state, receipt: any) => {
    state[STATE_KEY].receipt = receipt || {}
  },
  [types.SET_PAYMENTS]: (state, payments: any[]) => {
    state[STATE_KEY].payments = payments || []
  }
}
