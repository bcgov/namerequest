import * as types from './types'

export const toggleConfirmNrModal = ({ commit }, isVisible: boolean) => {
  commit(types.TOGGLE_CONFIRM_NR_MODAL, isVisible)
}

export const togglePaymentHistoryModal = ({ commit }, isVisible: boolean) => {
  commit(types.TOGGLE_PAYMENT_HISTORY_MODAL, isVisible)
}

export const toggleRefundModal = ({ commit }, isVisible: boolean) => {
  commit(types.TOGGLE_REFUND_MODAL, isVisible)
}

export const toggleCancelModal = ({ commit }, isVisible: boolean) => {
  commit(types.TOGGLE_CANCEL_MODAL, isVisible)
}

export const toggleUpgradeModal = ({ commit }, isVisible: boolean) => {
  commit(types.TOGGLE_UPGRADE_MODAL, isVisible)
}

export const toggleResubmitModal = ({ commit }, isVisible: boolean) => {
  commit(types.TOGGLE_RESUBMIT_MODAL, isVisible)
}

export const toggleRenewModal = ({ commit }, isVisible: boolean) => {
  commit(types.TOGGLE_RENEW_MODAL, isVisible)
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
