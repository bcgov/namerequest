import * as types from './types'

export const togglePaymentModal = ({ commit }, isVisible: boolean) => {
  commit(types.TOGGLE_PAYMENT_MODAL, isVisible)
}

export const setPaymentFees = ({ commit }, fees: any) => {
  commit(types.SET_PAYMENT_FEES, fees)
}

export const setPaymentIsProcessing = ({ commit }, isProcessing: boolean) => {
  commit(types.SET_PAYMENT_IS_PROCESSING, isProcessing)
}

export const setPayment = ({ commit }, payment: any) => {
  commit(types.SET_PAYMENT, payment)
}

export const toggleReceiptModal = ({ commit }, isVisible: boolean) => {
  commit(types.TOGGLE_RECEIPT_MODAL, isVisible)
}

export const setPaymentInvoice = ({ commit }, invoice: any) => {
  commit(types.SET_PAYMENT_INVOICE, invoice)
}

export const setPaymentReceipt = ({ commit }, receipt: any) => {
  commit(types.SET_PAYMENT_RECEIPT, receipt)
}

export const startPaymentTimeoutTimer = ({ commit }) => {
  commit(types.START_PAYMENT_TIMEOUT_TIMER)
}

export const clearPaymentTimeoutTimer = ({ commit }) => {
  commit(types.CLEAR_PAYMENT_TIMEOUT_TIMER)
}
