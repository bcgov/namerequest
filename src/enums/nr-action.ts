/** Enum for NR Action codes. Not to be confused with Request (action) codes. */
export enum NrAction {
  CANCEL = 'CANCEL',
  EDIT = 'EDIT',
  REAPPLY = 'REAPPLY',
  RECEIPTS = 'RECEIPT',
  REQUEST_REFUND = 'REQUEST_REFUND',
  RESEND = 'RESEND', // FUTURE: will be removed
  RESUBMIT = 'RESUBMIT',
  RESULT = 'RESULT', // FUTURE: will be implemented
  UPGRADE = 'UPGRADE',
  INCORPORATE = 'INCORPORATE',
  RETRY_PAYMENT = 'RETRY_PAYMENT'
}
