import * as types from './types'

export const togglePaymentModal = ({ commit }, isVisible: boolean) => {
  commit(types.TOGGLE_PAYMENT_MODAL, isVisible)
}

export const togglePaymentHistoryModal = ({ commit }, isVisible: boolean) => {
  commit(types.TOGGLE_PAYMENT_HISTORY_MODAL, isVisible)
}

export const toggleRefundModal = ({ commit }, isVisible: boolean) => {
  commit(types.TOGGLE_REFUND_MODAL, isVisible)
}

export const toggleUpgradeModal = ({ commit }, isVisible: boolean) => {
  commit(types.TOGGLE_UPGRADE_MODAL, isVisible)
}

export const toggleReapplyModal = ({ commit }, isVisible: boolean) => {
  commit(types.TOGGLE_REAPPLY_MODAL, isVisible)
}

export const setPaymentFees = ({ commit }, fees: any) => {
  commit(types.SET_PAYMENT_FEES, fees)
}

export const setPaymentIsProcessing = ({ commit }, isProcessing: boolean) => {
  commit(types.SET_PAYMENT_IS_PROCESSING, isProcessing)
}

export const toggleReceiptModal = ({ commit }, isVisible: boolean) => {
  commit(types.TOGGLE_PAYMENT_COMPLETE_MODAL, isVisible)
}

export const setPaymentRequest = ({ commit }, req: any) => {
  commit(types.SET_PAYMENT_REQUEST, req)
}

export const setSbcPayment = ({ commit }, payment: any) => {
  commit(types.SET_SBC_PAYMENT, payment)
}

export const setPayment = ({ commit }, payment: any) => {
  commit(types.SET_PAYMENT, payment)
}

export const setPaymentReceipt = ({ commit }, receipt: any) => {
  commit(types.SET_PAYMENT_RECEIPT, receipt)
}

export const setPayments = ({ commit }, payments: any[]) => {
  commit(types.SET_PAYMENTS, payments)
}

export const startPaymentTimeoutTimer = ({ commit }) => {
  commit(types.START_PAYMENT_TIMEOUT_TIMER)
}

export const clearPaymentTimeoutTimer = ({ commit }) => {
  commit(types.CLEAR_PAYMENT_TIMEOUT_TIMER)
}
